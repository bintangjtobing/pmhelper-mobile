import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { SectionHeader } from '../components/SectionHeader';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { BarChart } from '../components/BarChart';
import { Avatar } from '../components/Avatar';
import { ActivityFeed } from '../components/ActivityFeed';
import {
  fetchActivities,
  fetchDailyReports,
  fetchProjects,
  fetchWeeklyReports,
} from '../api/endpoints';
import type { ActivityItem, DailyReport, Project, WeeklyReport } from '../types/api';
import { colors, spacing, radius } from '../theme/colors';
import { fonts } from '../theme/typography';
import { useAuth } from '../auth/AuthContext';
import { AppStackParamList } from '../navigation/AppNavigator';
import { fmtRelative, stripRichText } from '../lib/format';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export function ProjectsScreen() {
  const nav = useNavigation<Nav>();
  const { state } = useAuth();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [activities, setActivities] = useState<ActivityItem[] | null>(null);
  const [dailies, setDailies] = useState<DailyReport[] | null>(null);
  const [weeklies, setWeeklies] = useState<WeeklyReport[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, a, d, w] = await Promise.all([
        fetchProjects(),
        fetchActivities(10),
        fetchDailyReports({ mine: true }),
        fetchWeeklyReports({ mine: true }),
      ]);
      setProjects(p);
      setActivities(a);
      setDailies(d.data);
      setWeeklies(w.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  // "This week" window — used by the Reports overview widget
  const reportsThisWeek = useMemo(() => {
    const now = new Date();
    const day = now.getDay() || 7;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - day + 1);
    weekStart.setHours(0, 0, 0, 0);

    const daily = (dailies ?? []).filter((r) => {
      const d = new Date(r.report_date);
      return d >= weekStart;
    });
    const weekly = (weeklies ?? []).filter((r) => {
      const d = new Date(r.week_start);
      return d >= weekStart;
    });

    const todayISO = now.toISOString().slice(0, 10);
    const hasToday = daily.some((r) => r.report_date.startsWith(todayISO));

    return {
      dailySubmitted: daily.filter((r) => r.status === 'submitted').length,
      dailyDraft: daily.filter((r) => r.status === 'draft').length,
      weeklySubmitted: weekly.filter((r) => r.status === 'submitted').length,
      weeklyDraft: weekly.filter((r) => r.status === 'draft').length,
      hasToday,
    };
  }, [dailies, weeklies]);

  const firstName = state.user?.name.split(' ')[0] ?? '';
  const totalTickets = projects?.reduce((sum, p) => sum + (p.tickets_count ?? 0), 0) ?? 0;
  const activeCount = projects?.length ?? 0;

  const chartData =
    projects
      ?.slice(0, 6)
      .map((p) => ({
        label: p.name,
        value: p.tickets_count ?? 0,
        color: p.status?.color ?? colors.accent,
      })) ?? [];

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
      {/* Header with avatar → Settings */}
      <View style={styles.topBar}>
        <View style={{ flex: 1 }}>
          <Text variant="label" color={colors.textSecondary}>
            — Studio
          </Text>
          <Text variant="h1" style={{ marginTop: spacing.xs }}>
            Hello, {firstName || 'friend'}.
          </Text>
          <Text variant="body" muted style={{ marginTop: spacing.sm }}>
            A quiet look at what's moving today.
          </Text>
        </View>
        {state.user && (
          <Pressable
            onPress={() => nav.navigate('Settings')}
            hitSlop={12}
            style={({ pressed }) => [styles.avatarBtn, pressed && { opacity: 0.7 }]}
          >
            <Avatar uri={state.user.avatar_url} name={state.user.name} size={40} />
          </Pressable>
        )}
      </View>

      {/* Stats — giant editorial numbers */}
      <View style={styles.statsRow}>
        <View style={styles.statCell}>
          <Text variant="stat">{activeCount}</Text>
          <Text variant="label" color={colors.textSecondary} style={styles.statLabel}>
            Projects
          </Text>
        </View>
        <View style={styles.vRule} />
        <View style={styles.statCell}>
          <Text variant="stat">{totalTickets}</Text>
          <Text variant="label" color={colors.textSecondary} style={styles.statLabel}>
            Tickets
          </Text>
        </View>
      </View>

      {/* Chart */}
      {chartData.length > 0 && (
        <View style={styles.chartCard}>
          <Text variant="label" color={colors.textSecondary} style={{ marginBottom: spacing.md }}>
            — Ticket distribution
          </Text>
          <BarChart data={chartData} height={160} />
        </View>
      )}

      {/* Reports overview widget */}
      <SectionHeader eyebrow="This week" title="Your reports" />
      <View style={styles.reportWidget}>
        <View style={styles.reportCounters}>
          <View style={styles.reportCell}>
            <Text
              style={{
                fontFamily: fonts.display,
                fontSize: 34,
                color: colors.text,
                letterSpacing: -0.6,
              }}
            >
              {reportsThisWeek.dailySubmitted}
              <Text variant="small" color={colors.textMuted}> · {reportsThisWeek.dailyDraft}d</Text>
            </Text>
            <Text variant="label" color={colors.textSecondary}>Daily</Text>
          </View>
          <View style={styles.vRuleTight} />
          <View style={styles.reportCell}>
            <Text
              style={{
                fontFamily: fonts.display,
                fontSize: 34,
                color: colors.text,
                letterSpacing: -0.6,
              }}
            >
              {reportsThisWeek.weeklySubmitted}
              <Text variant="small" color={colors.textMuted}> · {reportsThisWeek.weeklyDraft}d</Text>
            </Text>
            <Text variant="label" color={colors.textSecondary}>Weekly</Text>
          </View>
        </View>
        {!reportsThisWeek.hasToday && (
          <Pressable
            onPress={() => nav.navigate('DailyReportForm', {})}
            style={({ pressed }) => [styles.reportCTA, pressed && { opacity: 0.85 }]}
          >
            <Text variant="smallMedium" color={colors.accent}>Write today's check-in →</Text>
          </Pressable>
        )}
      </View>

      {/* Recent activity widget */}
      <SectionHeader eyebrow="Latest" title="Recent activity" />
      {activities === null ? (
        <Loading />
      ) : (
        <View style={styles.activityWidget}>
          <ActivityFeed items={activities} />
        </View>
      )}

      <SectionHeader eyebrow={`${activeCount} in rotation`} title="Projects" />

      {projects === null ? (
        <Loading />
      ) : projects.length === 0 ? (
        <EmptyState title="No projects yet" subtitle="Projects you're part of will show up here." />
      ) : (
        <View style={{ gap: spacing.md }}>
          {projects.map((p) => (
            <Card key={p.id} onPress={() => nav.navigate('ProjectDetail', { projectId: p.id })}>
              <View style={styles.cardHeader}>
                <Text
                  style={{
                    fontFamily: fonts.mono,
                    color: colors.textMuted,
                    fontSize: 11,
                    letterSpacing: 1.2,
                  }}
                >
                  {p.ticket_prefix}
                </Text>
                {p.status && (
                  <Pill label={p.status.name} color={p.status.color} square />
                )}
              </View>
              <Text variant="h3" style={{ marginTop: spacing.sm }}>
                {p.name}
              </Text>
              {!!p.description && (
                <Text
                  variant="small"
                  muted
                  numberOfLines={2}
                  style={{ marginTop: spacing.xs }}
                >
                  {stripRichText(p.description)}
                </Text>
              )}
              <View style={styles.cardFooter}>
                <View style={styles.footerStat}>
                  <Text
                    style={{
                      fontFamily: fonts.monoMedium,
                      color: colors.text,
                      fontSize: 20,
                    }}
                  >
                    {p.tickets_count ?? 0}
                  </Text>
                  <Text variant="label" color={colors.textMuted}>
                    Tickets
                  </Text>
                </View>
                <View style={styles.footerStat}>
                  <Text
                    style={{
                      fontFamily: fonts.monoMedium,
                      color: colors.text,
                      fontSize: 20,
                    }}
                  >
                    {p.members_count ?? 0}
                  </Text>
                  <Text variant="label" color={colors.textMuted}>
                    Members
                  </Text>
                </View>
                <View style={[styles.footerStat, { alignItems: 'flex-end' }]}>
                  <Text variant="small" dim>
                    Updated
                  </Text>
                  <Text variant="small" muted>
                    {fmtRelative(p.updated_at)}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  avatarBtn: { marginTop: spacing.xs },
  reportWidget: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  reportCounters: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  reportCell: { flex: 1 },
  vRuleTight: { width: 1, height: 44, backgroundColor: colors.border },
  reportCTA: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    backgroundColor: colors.accentMuted,
  },
  activityWidget: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  header: { marginTop: spacing.sm, marginBottom: spacing.xxl },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  statCell: { flex: 1, alignItems: 'flex-start' },
  statLabel: { marginTop: spacing.xs },
  vRule: { width: 1, height: 48, backgroundColor: colors.border },
  chartCard: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardFooter: {
    flexDirection: 'row',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    gap: spacing.lg,
  },
  footerStat: { flex: 1 },
});
