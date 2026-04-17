import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { SectionHeader } from '../components/SectionHeader';
import { fetchDailyReports, fetchWeeklyReports } from '../api/endpoints';
import type { DailyReport, WeeklyReport } from '../types/api';
import { colors, spacing, radius } from '../theme/colors';
import { AppStackParamList } from '../navigation/AppNavigator';
import { fmtDate, fmtWeek, stripRichText } from '../lib/format';

type Nav = NativeStackNavigationProp<AppStackParamList>;

type Tab = 'daily' | 'weekly';

export function ReportsScreen() {
  const nav = useNavigation<Nav>();
  const [tab, setTab] = useState<Tab>('daily');
  const [dailies, setDailies] = useState<DailyReport[] | null>(null);
  const [weeklies, setWeeklies] = useState<WeeklyReport[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      if (tab === 'daily') {
        const r = await fetchDailyReports({ mine: true });
        setDailies(r.data);
      } else {
        const r = await fetchWeeklyReports({ mine: true });
        setWeeklies(r.data);
      }
    } catch (e) {
      console.error(e);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const submittedCount =
    tab === 'daily'
      ? dailies?.filter((r) => r.status === 'submitted').length ?? 0
      : weeklies?.filter((r) => r.status === 'submitted').length ?? 0;
  const totalCount = (tab === 'daily' ? dailies?.length : weeklies?.length) ?? 0;

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
      <View style={styles.header}>
        <Text variant="label" color={colors.textSecondary}>
          — Journal
        </Text>
        <Text variant="h1" style={{ marginTop: spacing.xs }}>
          Reports
        </Text>
        <Text variant="body" muted style={{ marginTop: spacing.sm }}>
          Your log. Keep it tight, keep it honest.
        </Text>
      </View>

      <View style={styles.tabs}>
        {(['daily', 'weekly'] as const).map((key) => (
          <Pressable
            key={key}
            onPress={() => setTab(key)}
            style={[
              styles.tab,
              tab === key && { backgroundColor: colors.accent, borderColor: colors.accent },
            ]}
          >
            <Text
              variant="smallMedium"
              color={tab === key ? colors.text : colors.textSecondary}
              style={{ textTransform: 'capitalize' }}
            >
              {key}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBlock}>
          <Text variant="stat">{totalCount}</Text>
          <Text variant="label" color={colors.textSecondary}>
            Total
          </Text>
        </View>
        <View style={styles.vRule} />
        <View style={styles.statBlock}>
          <Text variant="stat">{submittedCount}</Text>
          <Text variant="label" color={colors.textSecondary}>
            Submitted
          </Text>
        </View>
      </View>

      <SectionHeader
        eyebrow="Recent"
        title={tab === 'daily' ? 'Daily check-ins' : 'Weekly summaries'}
        action={
          <Pressable
            onPress={() =>
              tab === 'daily'
                ? nav.navigate('DailyReportForm', {})
                : nav.navigate('WeeklyReportForm', {})
            }
            style={styles.addBtn}
          >
            <Text variant="label" color={colors.accent}>
              + Write
            </Text>
          </Pressable>
        }
      />

      {tab === 'daily' ? (
        dailies === null ? (
          <Loading />
        ) : dailies.length === 0 ? (
          <EmptyState title="No entries" subtitle="Start your first daily check-in." />
        ) : (
          <View style={{ gap: spacing.md }}>
            {dailies.map((r) => (
              <Card key={r.id} onPress={() => nav.navigate('DailyReportView', { id: r.id })}>
                <View style={styles.cardTop}>
                  <Text variant="label" color={colors.textSecondary}>
                    {fmtDate(r.report_date, 'EEE · MMM d')}
                  </Text>
                  <Pill
                    label={r.status}
                    color={r.status === 'submitted' ? colors.success : colors.textMuted}
                    square
                  />
                </View>
                {r.project && (
                  <Text variant="small" muted style={{ marginTop: 4 }}>
                    {r.project.name}
                  </Text>
                )}
                {!!r.accomplished && (
                  <Text variant="body" style={{ marginTop: spacing.sm }} numberOfLines={3}>
                    {stripRichText(r.accomplished)}
                  </Text>
                )}
              </Card>
            ))}
          </View>
        )
      ) : weeklies === null ? (
        <Loading />
      ) : weeklies.length === 0 ? (
        <EmptyState title="No entries" subtitle="Start your first weekly summary." />
      ) : (
        <View style={{ gap: spacing.md }}>
          {weeklies.map((r) => (
            <Card key={r.id} onPress={() => nav.navigate('WeeklyReportView', { id: r.id })}>
              <View style={styles.cardTop}>
                <Text variant="label" color={colors.textSecondary}>
                  {fmtWeek(r.week_start, r.week_end)}
                </Text>
                <Pill
                  label={r.status}
                  color={r.status === 'submitted' ? colors.success : colors.textMuted}
                  square
                />
              </View>
              {r.project && (
                <Text variant="small" muted style={{ marginTop: 4 }}>
                  {r.project.name}
                </Text>
              )}
              {!!r.content && (
                <Text variant="body" style={{ marginTop: spacing.sm }} numberOfLines={3}>
                  {stripRichText(r.content)}
                </Text>
              )}
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.sm, marginBottom: spacing.lg },
  tabs: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  statBlock: { flex: 1 },
  vRule: { width: 1, height: 48, backgroundColor: colors.border },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.accent + '66',
  },
});
