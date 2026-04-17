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
import { fetchDiscussions } from '../api/endpoints';
import type { Discussion } from '../types/api';
import { colors, spacing, radius } from '../theme/colors';
import { fonts } from '../theme/typography';
import { AppStackParamList } from '../navigation/AppNavigator';
import { fmtRelative } from '../lib/format';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export function DiscussionsScreen() {
  const nav = useNavigation<Nav>();
  const [discussions, setDiscussions] = useState<Discussion[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

  const load = useCallback(async () => {
    try {
      const r = await fetchDiscussions(filter !== 'all' ? { status: filter } : undefined);
      setDiscussions(r.data);
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
          — Conversations
        </Text>
        <Text variant="h1" style={{ marginTop: spacing.xs }}>
          Discussions
        </Text>
        <Text variant="body" muted style={{ marginTop: spacing.sm }}>
          Decisions, debates, and open questions.
        </Text>
      </View>

      <View style={styles.filterRow}>
        {(['all', 'open', 'resolved'] as const).map((k) => (
          <Pressable
            key={k}
            onPress={() => setFilter(k)}
            style={[
              styles.filterTab,
              filter === k && { backgroundColor: colors.surfaceElevated, borderColor: colors.accent },
            ]}
          >
            <Text
              variant="smallMedium"
              color={filter === k ? colors.text : colors.textSecondary}
              style={{ textTransform: 'capitalize' }}
            >
              {k}
            </Text>
          </Pressable>
        ))}
      </View>

      <SectionHeader eyebrow="Latest" title="Threads" />

      {discussions === null ? (
        <Loading />
      ) : discussions.length === 0 ? (
        <EmptyState title="Quiet in here" subtitle="No discussions match your filter." />
      ) : (
        <View style={{ gap: spacing.md }}>
          {discussions.map((d) => (
            <Card key={d.id} onPress={() => nav.navigate('DiscussionDetail', { id: d.id })}>
              <View style={styles.cardTop}>
                <Text variant="label" color={colors.textSecondary}>
                  {d.project?.name ?? '—'}
                </Text>
                <Pill
                  label={d.status}
                  color={d.status === 'resolved' ? colors.success : colors.accent}
                  square
                />
              </View>
              <Text variant="h3" style={{ marginTop: spacing.sm }}>
                {d.title}
              </Text>
              <Text
                variant="body"
                muted
                numberOfLines={2}
                style={{ marginTop: spacing.xs }}
              >
                {d.content.replace(/<[^>]+>/g, '')}
              </Text>
              <View style={styles.cardFooter}>
                <Text variant="small" dim>
                  {d.user?.name} · {fmtRelative(d.created_at)}
                </Text>
                <View style={styles.replyPill}>
                  <Text
                    style={{
                      fontFamily: fonts.monoMedium,
                      fontSize: 11,
                      color: colors.text,
                    }}
                  >
                    {d.replies_count ?? 0}
                  </Text>
                  <Text variant="label" color={colors.textSecondary}>
                    Replies
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
  header: { marginTop: spacing.sm, marginBottom: spacing.lg },
  filterRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  replyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
