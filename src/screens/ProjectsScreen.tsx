import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
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
import { fetchProjects } from '../api/endpoints';
import type { Project } from '../types/api';
import { colors, spacing } from '../theme/colors';
import { fonts } from '../theme/typography';
import { useAuth } from '../auth/AuthContext';
import { AppStackParamList } from '../navigation/AppNavigator';
import { fmtRelative } from '../lib/format';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export function ProjectsScreen() {
  const nav = useNavigation<Nav>();
  const { state } = useAuth();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setProjects(await fetchProjects());
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
      {/* Header */}
      <View style={styles.header}>
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
                  {p.description.replace(/<[^>]+>/g, '')}
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
