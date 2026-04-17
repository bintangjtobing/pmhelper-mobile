import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Card } from '../components/Card';
import { Pill } from '../components/Pill';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { SectionHeader } from '../components/SectionHeader';
import { Avatar } from '../components/Avatar';
import { fetchProject, fetchProjectTickets, fetchStatuses } from '../api/endpoints';
import type { Project, Ticket, TicketStatus } from '../types/api';
import { colors, spacing, radius } from '../theme/colors';
import { fonts } from '../theme/typography';
import { AppStackParamList } from '../navigation/AppNavigator';
import { priorityColor } from '../lib/format';
import { useKanbanRealtime } from '../hooks/useKanbanRealtime';
import { useAuth } from '../auth/AuthContext';

type Nav = NativeStackNavigationProp<AppStackParamList, 'ProjectDetail'>;
type Route = RouteProp<AppStackParamList, 'ProjectDetail'>;

export function ProjectDetailScreen() {
  const nav = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { projectId } = route.params;
  const { state } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [statuses, setStatuses] = useState<TicketStatus[] | null>(null);
  const [activeStatusId, setActiveStatusId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [p, t, s] = await Promise.all([
        fetchProject(projectId),
        fetchProjectTickets(projectId, { perPage: 100, sortBy: 'order' }),
        fetchStatuses(projectId),
      ]);
      setProject(p);
      setTickets(t.data);
      setStatuses(s);
      if (s.length && activeStatusId == null) setActiveStatusId(s[0].id);
    } catch (e) {
      console.error(e);
    }
  }, [projectId, activeStatusId]);

  useEffect(() => {
    load();
  }, [load]);

  // Subscribe to kanban realtime — when another user moves a ticket, refresh
  // the list quietly and show a short flash notice so the user knows why
  // the board shifted under them.
  useKanbanRealtime(projectId, state.user?.id, async () => {
    const t = await fetchProjectTickets(projectId, { perPage: 100, sortBy: 'order' });
    setTickets(t.data);
    setFlash('Board updated');
    setTimeout(() => setFlash(null), 2200);
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const filtered = useMemo(() => {
    if (!tickets || activeStatusId == null) return tickets ?? [];
    return tickets.filter((t) => t.status?.id === activeStatusId);
  }, [tickets, activeStatusId]);

  const countByStatus = useMemo(() => {
    if (!tickets) return {} as Record<number, number>;
    return tickets.reduce((acc, t) => {
      const id = t.status?.id;
      if (id) acc[id] = (acc[id] ?? 0) + 1;
      return acc;
    }, {} as Record<number, number>);
  }, [tickets]);

  if (!project) {
    return (
      <Screen scroll={false}>
        <Loading />
      </Screen>
    );
  }

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
      {/* Realtime flash — appears briefly when another user moves a ticket */}
      {flash && (
        <View style={styles.flash}>
          <View style={styles.flashDot} />
          <Text variant="smallMedium">{flash}</Text>
        </View>
      )}

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.backRow}>
          <Pressable onPress={() => nav.goBack()}>
            <Text variant="small" color={colors.accent}>
              ← Back
            </Text>
          </Pressable>
          <Text
            style={{
              fontFamily: fonts.mono,
              color: colors.textMuted,
              fontSize: 11,
              letterSpacing: 1.2,
            }}
          >
            {project.ticket_prefix}
          </Text>
        </View>
        <Text variant="h1" style={{ marginTop: spacing.lg }}>
          {project.name}
        </Text>
        {!!project.description && (
          <Text variant="body" muted style={{ marginTop: spacing.sm }}>
            {project.description.replace(/<[^>]+>/g, '').slice(0, 200)}
          </Text>
        )}

        {project.owner && (
          <View style={styles.ownerRow}>
            <Avatar uri={project.owner.avatar_url} name={project.owner.name} size={28} />
            <Text variant="small" muted>
              Owned by <Text color={colors.text}>{project.owner.name}</Text>
            </Text>
          </View>
        )}
      </View>

      {/* Status tabs — horizontally scrollable */}
      {statuses && statuses.length > 0 && (
        <View style={styles.statusTabs}>
          {statuses.map((s) => {
            const active = s.id === activeStatusId;
            const count = countByStatus[s.id] ?? 0;
            return (
              <Pressable
                key={s.id}
                onPress={() => setActiveStatusId(s.id)}
                style={[
                  styles.statusTab,
                  active && { backgroundColor: colors.surfaceElevated, borderColor: s.color },
                ]}
              >
                <View style={[styles.statusDot, { backgroundColor: s.color }]} />
                <Text
                  variant="smallMedium"
                  color={active ? colors.text : colors.textSecondary}
                >
                  {s.name}
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 11,
                    color: active ? colors.text : colors.textMuted,
                  }}
                >
                  {count}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <SectionHeader
        eyebrow="Tickets"
        title={
          activeStatusId
            ? statuses?.find((s) => s.id === activeStatusId)?.name ?? 'All'
            : 'All'
        }
        action={
          <Pressable
            onPress={() => nav.navigate('TicketCreate', { projectId })}
            style={styles.addBtn}
          >
            <Text variant="label" color={colors.accent}>
              + Add
            </Text>
          </Pressable>
        }
      />

      {tickets === null ? (
        <Loading />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No tickets here"
          subtitle="Switch a status tab above or create a new ticket."
        />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {filtered.map((t) => (
            <TicketRow key={t.id} ticket={t} onPress={() => nav.navigate('TicketDetail', { ticketId: t.id })} />
          ))}
        </View>
      )}
    </Screen>
  );
}

function TicketRow({ ticket, onPress }: { ticket: Ticket; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.ticketRow, pressed && { opacity: 0.7 }]}>
      <View style={styles.ticketLeft}>
        <Text
          style={{
            fontFamily: fonts.mono,
            fontSize: 11,
            color: colors.textMuted,
            letterSpacing: 0.5,
          }}
        >
          {ticket.code}
        </Text>
        <Text variant="bodyMedium" numberOfLines={2} style={{ marginTop: 2 }}>
          {ticket.name}
        </Text>
        <View style={styles.ticketMeta}>
          {ticket.priority && (
            <Pill
              label={ticket.priority.name}
              color={priorityColor(ticket.priority.name)}
              square
            />
          )}
          {ticket.responsible && (
            <Text variant="small" muted>
              @ {ticket.responsible.name.split(' ')[0]}
            </Text>
          )}
        </View>
      </View>
      {ticket.status && (
        <View style={[styles.ticketStatus, { backgroundColor: ticket.status.color }]} />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hero: { marginTop: spacing.md, marginBottom: spacing.xl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border },
  backRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ownerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },
  statusTabs: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statusTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  addBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.accent + '66',
  },
  ticketRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  ticketLeft: { flex: 1 },
  ticketMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  ticketStatus: { width: 4, borderRadius: 2, alignSelf: 'stretch' },
  flash: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    backgroundColor: colors.accent + '22',
    borderColor: colors.accent,
    borderWidth: 1,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
  flashDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.accent },
});
