import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Pill } from '../components/Pill';
import { Loading } from '../components/Loading';
import { Avatar } from '../components/Avatar';
import { RichContent } from '../components/RichContent';
import { fetchDailyReport } from '../api/endpoints';
import type { DailyReport } from '../types/api';
import { colors, spacing, radius } from '../theme/colors';
import { fmtDate, fmtRelative } from '../lib/format';
import { AppStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../auth/AuthContext';

type Nav = NativeStackNavigationProp<AppStackParamList, 'DailyReportView'>;
type Route = RouteProp<AppStackParamList, 'DailyReportView'>;

export function DailyReportViewScreen() {
  const nav = useNavigation<Nav>();
  const { id } = useRoute<Route>().params;
  const { state } = useAuth();
  const [r, setR] = useState<DailyReport | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      setR(await fetchDailyReport(id));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  if (!r) return <Screen scroll={false}><Loading /></Screen>;

  const canEdit = state.user?.id === r.user?.id;

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
      <View style={styles.backRow}>
        <Pressable onPress={() => nav.goBack()}>
          <Text variant="small" color={colors.accent}>← Back</Text>
        </Pressable>
        {canEdit && (
          <Pressable
            onPress={() => nav.navigate('DailyReportForm', { id: r.id })}
            style={styles.editBtn}
          >
            <Text variant="label" color={colors.accent}>Edit</Text>
          </Pressable>
        )}
      </View>

      <Text variant="label" color={colors.textSecondary} style={{ marginTop: spacing.lg }}>
        — Daily check-in
      </Text>
      <Text variant="h1" style={{ marginTop: spacing.xs }}>
        {fmtDate(r.report_date, 'EEEE, MMM d')}
      </Text>

      <View style={styles.metaRow}>
        <Pill
          label={r.status}
          color={r.status === 'submitted' ? colors.success : colors.textMuted}
          square
        />
        {r.submitted_at && (
          <Text variant="small" dim>
            Submitted {fmtRelative(r.submitted_at)}
          </Text>
        )}
      </View>

      {r.user && (
        <View style={styles.author}>
          <Avatar uri={r.user.avatar_url} name={r.user.name} size={32} />
          <View>
            <Text variant="smallMedium">{r.user.name}</Text>
            {r.project && <Text variant="small" dim>{r.project.name}</Text>}
          </View>
        </View>
      )}

      <Section label="Accomplished" body={r.accomplished} />
      <Section label="Plans" body={r.plans} />
      <Section label="Blockers" body={r.blockers} />

      {r.acknowledged_by && (
        <View style={styles.ackBox}>
          <Text variant="label" color={colors.success}>Acknowledged</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm }}>
            <Avatar uri={r.acknowledged_by.avatar_url} name={r.acknowledged_by.name} size={24} />
            <Text variant="smallMedium">{r.acknowledged_by.name}</Text>
            <Text variant="small" dim>· {fmtRelative(r.acknowledged_at)}</Text>
          </View>
        </View>
      )}
    </Screen>
  );
}

function Section({ label, body }: { label: string; body?: string | null }) {
  return (
    <View style={{ marginTop: spacing.xl }}>
      <Text variant="label" color={colors.textSecondary} style={{ marginBottom: spacing.sm }}>
        — {label}
      </Text>
      <RichContent body={body} placeholder="None noted." />
    </View>
  );
}

const styles = StyleSheet.create({
  backRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  editBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.accent + '66',
  },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.md, flexWrap: 'wrap' },
  author: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },
  ackBox: {
    marginTop: spacing.xxl,
    padding: spacing.lg,
    backgroundColor: colors.successMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.success + '44',
  },
});
