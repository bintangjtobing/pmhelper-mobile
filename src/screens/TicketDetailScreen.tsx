import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Pill } from '../components/Pill';
import { Loading } from '../components/Loading';
import { Avatar } from '../components/Avatar';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { Divider } from '../components/Divider';
import { createComment, fetchComments, fetchStatuses, fetchTicket, moveTicket } from '../api/endpoints';
import type { Ticket, TicketComment, TicketStatus } from '../types/api';
import { colors, spacing, radius } from '../theme/colors';
import { fonts } from '../theme/typography';
import { AppStackParamList } from '../navigation/AppNavigator';
import { fmtDate, fmtRelative, priorityColor } from '../lib/format';
import { extractError } from '../api/client';
import { useKanbanRealtime } from '../hooks/useKanbanRealtime';
import { useAuth } from '../auth/AuthContext';

type Nav = NativeStackNavigationProp<AppStackParamList, 'TicketDetail'>;
type Route = RouteProp<AppStackParamList, 'TicketDetail'>;

export function TicketDetailScreen() {
  const nav = useNavigation<Nav>();
  const { ticketId } = useRoute<Route>().params;
  const { state } = useAuth();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [comments, setComments] = useState<TicketComment[] | null>(null);
  const [statuses, setStatuses] = useState<TicketStatus[] | null>(null);
  const [commentText, setCommentText] = useState('');
  const [posting, setPosting] = useState(false);
  const [moving, setMoving] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [statusPickerOpen, setStatusPickerOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const t = await fetchTicket(ticketId);
      setTicket(t);
      const [c, s] = await Promise.all([
        fetchComments(ticketId),
        fetchStatuses(t.project?.id),
      ]);
      setComments(c);
      setStatuses(s);
    } catch (e) {
      console.error(e);
    }
  }, [ticketId]);

  useEffect(() => {
    load();
  }, [load]);

  // If someone else moves *this* ticket while viewing it, refresh silently.
  useKanbanRealtime(ticket?.project?.id, state.user?.id, async (payload) => {
    if (payload.ticket_id === ticketId) {
      const t = await fetchTicket(ticketId);
      setTicket(t);
    }
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const onMove = async (status: TicketStatus) => {
    if (!ticket) return;
    setStatusPickerOpen(false);
    setMoving(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const updated = await moveTicket(ticket.id, status.id, 0);
      setTicket(updated);
    } catch (e) {
      Alert.alert('Cannot move', extractError(e));
    } finally {
      setMoving(false);
    }
  };

  const onPostComment = async () => {
    if (!commentText.trim() || !ticket) return;
    setPosting(true);
    try {
      const created = await createComment(ticket.id, commentText.trim());
      setComments((c) => [...(c ?? []), created]);
      setCommentText('');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert('Couldn\'t post', extractError(e));
    } finally {
      setPosting(false);
    }
  };

  if (!ticket) {
    return (
      <Screen scroll={false}>
        <Loading />
      </Screen>
    );
  }

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
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
            fontSize: 12,
            letterSpacing: 1,
          }}
        >
          {ticket.code}
        </Text>
      </View>

      <Text variant="h1" style={{ marginTop: spacing.lg }}>
        {ticket.name}
      </Text>

      {/* Metadata row */}
      <View style={styles.metaRow}>
        <Pressable
          onPress={() => setStatusPickerOpen((v) => !v)}
          disabled={moving}
          style={styles.statusChip}
        >
          {ticket.status && <View style={[styles.statusDot, { backgroundColor: ticket.status.color }]} />}
          <Text variant="smallMedium">{ticket.status?.name ?? 'No status'}</Text>
          <Text variant="small" dim>
            ▾
          </Text>
        </Pressable>
        {ticket.priority && (
          <Pill label={ticket.priority.name} color={priorityColor(ticket.priority.name)} />
        )}
      </View>

      {/* Status picker */}
      {statusPickerOpen && statuses && (
        <View style={styles.statusPicker}>
          {statuses.map((s) => (
            <Pressable key={s.id} onPress={() => onMove(s)} style={styles.statusPickerRow}>
              <View style={[styles.statusDot, { backgroundColor: s.color }]} />
              <Text variant="body">{s.name}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Description */}
      {!!ticket.content && (
        <View style={styles.section}>
          <Text variant="label" color={colors.textSecondary} style={{ marginBottom: spacing.sm }}>
            — Description
          </Text>
          <Text variant="body" muted>
            {ticket.content.replace(/<[^>]+>/g, '')}
          </Text>
        </View>
      )}

      {/* Properties grid */}
      <View style={styles.propsGrid}>
        <PropCell label="Project" value={ticket.project?.name} />
        <PropCell label="Type" value={ticket.type?.name} />
        <PropCell label="Owner" value={ticket.owner?.name} />
        <PropCell label="Assigned" value={ticket.responsible?.name ?? '—'} />
        <PropCell label="Due" value={fmtDate(ticket.due_date)} />
        <PropCell label="Estimation" value={ticket.estimation ? `${ticket.estimation}h` : '—'} />
      </View>

      <Divider style={{ marginVertical: spacing.xl }} />

      {/* Comments */}
      <View>
        <Text variant="label" color={colors.textSecondary} style={{ marginBottom: spacing.md }}>
          — Discussion · {comments?.length ?? 0}
        </Text>
        {comments?.map((c) => (
          <View key={c.id} style={styles.comment}>
            <Avatar uri={c.user?.avatar_url} name={c.user?.name ?? '?'} size={32} />
            <View style={{ flex: 1 }}>
              <View style={styles.commentHeader}>
                <Text variant="smallMedium">{c.user?.name}</Text>
                <Text variant="small" dim>
                  {fmtRelative(c.created_at)}
                </Text>
              </View>
              <Text variant="body" style={{ marginTop: 2 }}>
                {c.content.replace(/<[^>]+>/g, '')}
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.composer}>
          <TextField
            placeholder="Add a comment…"
            value={commentText}
            onChangeText={setCommentText}
            multiline
            rows={3}
          />
          <Button label="Post comment" onPress={onPostComment} loading={posting} disabled={!commentText.trim()} />
        </View>
      </View>
    </Screen>
  );
}

function PropCell({ label, value }: { label: string; value?: string | null }) {
  return (
    <View style={styles.propCell}>
      <Text variant="label" color={colors.textMuted}>
        {label}
      </Text>
      <Text variant="smallMedium" style={{ marginTop: 4 }} numberOfLines={1}>
        {value ?? '—'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  metaRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', marginTop: spacing.lg },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusPicker: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  statusPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  section: { marginTop: spacing.xl },
  propsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  propCell: {
    width: '50%',
    paddingVertical: spacing.md,
    paddingRight: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  comment: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  composer: { marginTop: spacing.lg },
});
