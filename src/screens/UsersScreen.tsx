import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, Pressable, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Loading } from '../components/Loading';
import { EmptyState } from '../components/EmptyState';
import { Avatar } from '../components/Avatar';
import { SectionHeader } from '../components/SectionHeader';
import { fetchUsers } from '../api/endpoints';
import type { User } from '../types/api';
import { colors, spacing, radius } from '../theme/colors';
import { fonts } from '../theme/typography';
import { AppStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export function UsersScreen() {
  const nav = useNavigation<Nav>();
  const [users, setUsers] = useState<User[] | null>(null);
  const [search, setSearch] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (q?: string) => {
    try {
      setUsers(await fetchUsers(q));
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const t = setTimeout(() => load(search || undefined), 300);
    return () => clearTimeout(t);
  }, [search, load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load(search || undefined);
    setRefreshing(false);
  };

  // Group users by first letter for directory feel
  const grouped =
    users?.reduce((acc, u) => {
      const letter = (u.name[0] ?? '?').toUpperCase();
      (acc[letter] ||= []).push(u);
      return acc;
    }, {} as Record<string, User[]>) ?? {};

  return (
    <Screen onRefresh={onRefresh} refreshing={refreshing}>
      <View style={styles.header}>
        <Text variant="label" color={colors.textSecondary}>
          — Directory
        </Text>
        <Text variant="h1" style={{ marginTop: spacing.xs }}>
          Team
        </Text>
      </View>

      <View style={styles.searchBox}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search names…"
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {users === null ? (
        <Loading />
      ) : users.length === 0 ? (
        <EmptyState title="No one found" subtitle="Try a different search." />
      ) : (
        <View style={{ marginTop: spacing.lg }}>
          {Object.keys(grouped)
            .sort()
            .map((letter) => (
              <View key={letter} style={{ marginBottom: spacing.xl }}>
                <View style={styles.letterHeader}>
                  <Text
                    style={{
                      fontFamily: fonts.display,
                      fontSize: 32,
                      color: colors.accent,
                      letterSpacing: -1,
                    }}
                  >
                    {letter}
                  </Text>
                  <View style={styles.letterLine} />
                  <Text variant="label" color={colors.textMuted}>
                    {grouped[letter].length}
                  </Text>
                </View>
                {grouped[letter].map((u) => (
                  <Pressable
                    key={u.id}
                    onPress={() => nav.navigate('UserDetail', { userId: u.id })}
                    style={({ pressed }) => [styles.userRow, pressed && { opacity: 0.7 }]}
                  >
                    <Avatar uri={u.avatar_url} name={u.name} size={44} />
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyMedium">{u.name}</Text>
                      <Text variant="small" muted>
                        {u.position?.name ?? u.department?.name ?? u.email}
                      </Text>
                    </View>
                    {u.status && (
                      <View style={[styles.statusDot, { backgroundColor: statusColor(u.status) }]} />
                    )}
                  </Pressable>
                ))}
              </View>
            ))}
        </View>
      )}
    </Screen>
  );
}

function statusColor(status: string): string {
  switch (status) {
    case 'online':
      return colors.success;
    case 'busy':
    case 'in_meeting':
      return colors.warning;
    case 'on_leave':
      return colors.textMuted;
    default:
      return colors.textMuted;
  }
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.sm, marginBottom: spacing.lg },
  searchBox: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 15,
  },
  letterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  letterLine: { flex: 1, height: 1, backgroundColor: colors.border },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
});
