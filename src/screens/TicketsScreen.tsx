import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Pill } from '../components/Pill';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { SectionHeader } from '../components/SectionHeader';
import { fetchProjects, fetchProjectTickets } from '../api/endpoints';
import type { Ticket } from '../types/api';
import { colors, spacing, radius } from '../theme/colors';
import { fonts } from '../theme/typography';
import { AppStackParamList } from '../navigation/AppNavigator';
import { priorityColor } from '../lib/format';

type Nav = NativeStackNavigationProp<AppStackParamList>;

/**
 * "My Tickets" — quick inbox-style overview of tickets assigned to the user
 * across all their projects.
 */
export function TicketsScreen() {
  const nav = useNavigation<Nav>();
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'mine' | 'all'>('mine');

  const load = useCallback(async () => {
    try {
      const projects = await fetchProjects();
      const results = await Promise.all(
        projects.map((p) =>
          fetchProjectTickets(p.id, { mine: filter === 'mine', sortBy: 'updated_at', perPage: 20 })
        )
      );
      const merged = results.flatMap((r) => r.data);
      merged.sort((a, b) => (b.updated_at ?? '').localeCompare(a.updated_at ?? ''));
      setTickets(merged);
    } catch (e) {
      console.error(e);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
      <View style={styles.header}>
        <Text variant="label" color={colors.textSecondary}>
          — Feed
        </Text>
        <Text variant="h1" style={{ marginTop: spacing.xs }}>
          Tickets
        </Text>
      </View>

      <View style={styles.filterRow}>
        {([
          ['mine', 'Assigned to me'],
          ['all', 'All'],
        ] as const).map(([key, label]) => (
          <Pressable
            key={key}
            onPress={() => setFilter(key)}
            style={[
              styles.filterTab,
              filter === key && { backgroundColor: colors.surfaceElevated, borderColor: colors.accent },
            ]}
          >
            <Text
              variant="smallMedium"
              color={filter === key ? colors.text : colors.textSecondary}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <SectionHeader
        eyebrow={tickets ? `${tickets.length} items` : ''}
        title="Recent activity"
      />

      {tickets === null ? (
        <Loading />
      ) : tickets.length === 0 ? (
        <EmptyState
          title="Clean slate"
          subtitle={filter === 'mine' ? 'Nothing is assigned to you right now.' : 'No tickets match.'}
        />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {tickets.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => nav.navigate('TicketDetail', { ticketId: t.id })}
              style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
            >
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
                  <Text
                    style={{
                      fontFamily: fonts.mono,
                      color: colors.textMuted,
                      fontSize: 11,
                      letterSpacing: 0.8,
                    }}
                  >
                    {t.code}
                  </Text>
                  {t.project && (
                    <Text variant="small" dim>
                      · {t.project.name}
                    </Text>
                  )}
                </View>
                <Text variant="bodyMedium" numberOfLines={2} style={{ marginTop: 2 }}>
                  {t.name}
                </Text>
                <View style={styles.meta}>
                  {t.status && (
                    <View style={styles.statusMini}>
                      <View style={[styles.dot, { backgroundColor: t.status.color }]} />
                      <Text variant="small" muted>
                        {t.status.name}
                      </Text>
                    </View>
                  )}
                  {t.priority && (
                    <Pill label={t.priority.name} color={priorityColor(t.priority.name)} square />
                  )}
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.sm, marginBottom: spacing.lg },
  filterRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  row: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  meta: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.sm },
  statusMini: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
