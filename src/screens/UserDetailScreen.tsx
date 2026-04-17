import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Avatar } from '../components/Avatar';
import { Loading } from '../components/Loading';
import { Pill } from '../components/Pill';
import { fetchUser } from '../api/endpoints';
import type { User } from '../types/api';
import { colors, spacing } from '../theme/colors';
import { AppStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<AppStackParamList, 'UserDetail'>;
type Route = RouteProp<AppStackParamList, 'UserDetail'>;

export function UserDetailScreen() {
  const nav = useNavigation<Nav>();
  const { userId } = useRoute<Route>().params;

  const [u, setU] = useState<User | null>(null);

  useEffect(() => {
    fetchUser(userId).then(setU).catch(console.error);
  }, [userId]);

  if (!u) return <Screen scroll={false}><Loading /></Screen>;

  return (
    <Screen>
      <Pressable onPress={() => nav.goBack()} style={{ marginTop: spacing.sm }}>
        <Text variant="small" color={colors.accent}>
          ← Back
        </Text>
      </Pressable>

      <View style={styles.hero}>
        <Avatar uri={u.avatar_url} name={u.name} size={96} />
        <Text variant="h1" style={{ marginTop: spacing.lg }}>
          {u.name}
        </Text>
        {!!u.username && (
          <Text variant="body" muted>
            @{u.username}
          </Text>
        )}
        {u.status && (
          <View style={{ marginTop: spacing.md }}>
            <Pill label={u.status} color={colors.success} square />
          </View>
        )}
      </View>

      <View style={styles.props}>
        <PropCell label="Email" value={u.email} />
        {u.department && <PropCell label="Department" value={u.department.name} />}
        {u.position && <PropCell label="Position" value={u.position.name} />}
        {u.status_message && <PropCell label="Status note" value={u.status_message} />}
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
      <Text variant="body" style={{ marginTop: 4 }}>
        {value ?? '—'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginTop: spacing.xxl, marginBottom: spacing.xl },
  props: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: spacing.xl,
  },
  propCell: {
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
});
