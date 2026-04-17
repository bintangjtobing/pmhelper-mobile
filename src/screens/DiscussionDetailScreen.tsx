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
import { RichContent } from '../components/RichContent';
import { fetchDiscussion, replyToDiscussion } from '../api/endpoints';
import type { Discussion } from '../types/api';
import { colors, spacing } from '../theme/colors';
import { AppStackParamList } from '../navigation/AppNavigator';
import { fmtRelative } from '../lib/format';
import { extractError } from '../api/client';

type Nav = NativeStackNavigationProp<AppStackParamList, 'DiscussionDetail'>;
type Route = RouteProp<AppStackParamList, 'DiscussionDetail'>;

export function DiscussionDetailScreen() {
  const nav = useNavigation<Nav>();
  const { id } = useRoute<Route>().params;

  const [d, setD] = useState<Discussion | null>(null);
  const [reply, setReply] = useState('');
  const [posting, setPosting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setD(await fetchDiscussion(id));
    } catch (e) {
      console.error(e);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const onReply = async () => {
    if (!reply.trim()) return;
    setPosting(true);
    try {
      await replyToDiscussion(id, reply.trim());
      setReply('');
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await load();
    } catch (e) {
      Alert.alert('Could not reply', extractError(e));
    } finally {
      setPosting(false);
    }
  };

  if (!d) return <Screen scroll={false}><Loading /></Screen>;

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
      <Pressable onPress={() => nav.goBack()} style={{ marginTop: spacing.sm }}>
        <Text variant="small" color={colors.accent}>
          ← Back
        </Text>
      </Pressable>

      <View style={{ marginTop: spacing.lg, flexDirection: 'row', gap: spacing.sm, alignItems: 'center', flexWrap: 'wrap' }}>
        <Pill
          label={d.status}
          color={d.status === 'resolved' ? colors.success : colors.accent}
          square
        />
        {d.priority && <Pill label={d.priority} color={colors.warning} square />}
        <Text variant="small" dim>
          {d.project?.name}
        </Text>
      </View>

      <Text variant="h1" style={{ marginTop: spacing.md }}>
        {d.title}
      </Text>

      <View style={styles.author}>
        <Avatar uri={d.user?.avatar_url} name={d.user?.name ?? '?'} size={32} />
        <View>
          <Text variant="smallMedium">{d.user?.name}</Text>
          <Text variant="small" dim>
            started {fmtRelative(d.created_at)}
          </Text>
        </View>
      </View>

      <View style={styles.bodyBox}>
        <RichContent body={d.content} />
      </View>

      <Text variant="label" color={colors.textSecondary} style={{ marginTop: spacing.xxl, marginBottom: spacing.md }}>
        — Replies · {d.replies?.length ?? 0}
      </Text>

      {(d.replies ?? []).map((r) => (
        <View key={r.id} style={styles.reply}>
          <Avatar uri={r.user?.avatar_url} name={r.user?.name ?? '?'} size={28} />
          <View style={{ flex: 1 }}>
            <View style={styles.replyHeader}>
              <Text variant="smallMedium">{r.user?.name}</Text>
              <Text variant="small" dim>
                {fmtRelative(r.created_at)}
              </Text>
            </View>
            <View style={{ marginTop: 2 }}>
              <RichContent body={r.content} />
            </View>
          </View>
        </View>
      ))}

      <View style={{ marginTop: spacing.xl }}>
        <TextField
          placeholder="Write a reply…"
          value={reply}
          onChangeText={setReply}
          multiline
          rows={3}
        />
        <Button label="Reply" onPress={onReply} loading={posting} disabled={!reply.trim()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  author: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', marginTop: spacing.md },
  bodyBox: {
    marginTop: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reply: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  replyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
