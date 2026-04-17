import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { createTicket, fetchPriorities, fetchTypes } from '../api/endpoints';
import type { TicketPriority, TicketType } from '../types/api';
import { colors, spacing, radius } from '../theme/colors';
import { AppStackParamList } from '../navigation/AppNavigator';
import { extractError } from '../api/client';
import { priorityColor } from '../lib/format';

type Nav = NativeStackNavigationProp<AppStackParamList, 'TicketCreate'>;
type Route = RouteProp<AppStackParamList, 'TicketCreate'>;

export function TicketCreateScreen() {
  const nav = useNavigation<Nav>();
  const { projectId } = useRoute<Route>().params;

  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [types, setTypes] = useState<TicketType[]>([]);
  const [priorities, setPriorities] = useState<TicketPriority[]>([]);
  const [typeId, setTypeId] = useState<number | null>(null);
  const [priorityId, setPriorityId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const [t, p] = await Promise.all([fetchTypes(), fetchPriorities()]);
      setTypes(t);
      setPriorities(p);
      setTypeId(t.find((x) => x.is_default)?.id ?? t[0]?.id ?? null);
      setPriorityId(p.find((x) => x.is_default)?.id ?? p[0]?.id ?? null);
    })();
  }, []);

  const onSubmit = async () => {
    setSaving(true);
    try {
      const ticket = await createTicket({
        project_id: projectId,
        name: name.trim(),
        content: content.trim() || 'No description',
        type_id: typeId ?? undefined,
        priority_id: priorityId ?? undefined,
      } as any);
      nav.replace('TicketDetail', { ticketId: ticket.id });
    } catch (e) {
      Alert.alert('Could not create', extractError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <View style={styles.backRow}>
        <Pressable onPress={() => nav.goBack()}>
          <Text variant="small" color={colors.accent}>
            ← Cancel
          </Text>
        </Pressable>
      </View>

      <Text variant="h1" style={{ marginTop: spacing.lg }}>
        New ticket
      </Text>
      <Text variant="body" muted style={{ marginTop: spacing.xs }}>
        Capture the next thing to do. You can refine it later.
      </Text>

      <View style={{ marginTop: spacing.xl }}>
        <TextField
          label="Title"
          placeholder="What needs doing?"
          value={name}
          onChangeText={setName}
          autoFocus
        />
        <TextField
          label="Details"
          placeholder="Any context or acceptance criteria…"
          value={content}
          onChangeText={setContent}
          multiline
          rows={6}
        />

        <Text variant="label" color={colors.textSecondary} style={styles.sectionLabel}>
          Type
        </Text>
        <View style={styles.chipRow}>
          {types.map((t) => (
            <Chip
              key={t.id}
              label={t.name}
              color={t.color}
              active={typeId === t.id}
              onPress={() => setTypeId(t.id)}
            />
          ))}
        </View>

        <Text variant="label" color={colors.textSecondary} style={styles.sectionLabel}>
          Priority
        </Text>
        <View style={styles.chipRow}>
          {priorities.map((p) => (
            <Chip
              key={p.id}
              label={p.name}
              color={priorityColor(p.name)}
              active={priorityId === p.id}
              onPress={() => setPriorityId(p.id)}
            />
          ))}
        </View>
      </View>

      <Button
        label="Create ticket"
        onPress={onSubmit}
        loading={saving}
        disabled={!name.trim()}
        size="lg"
        fullWidth
        style={{ marginTop: spacing.xxl }}
      />
    </Screen>
  );
}

function Chip({
  label,
  color,
  active,
  onPress,
}: {
  label: string;
  color: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        active && { backgroundColor: color + '1f', borderColor: color },
      ]}
    >
      <View style={[styles.chipDot, { backgroundColor: color }]} />
      <Text variant="smallMedium" color={active ? colors.text : colors.textSecondary}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  sectionLabel: { marginTop: spacing.md, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
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
  chipDot: { width: 6, height: 6, borderRadius: 3 },
});
