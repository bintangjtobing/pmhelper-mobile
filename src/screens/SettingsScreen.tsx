import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Alert, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { Avatar } from '../components/Avatar';
import { Divider } from '../components/Divider';
import { colors, spacing, radius } from '../theme/colors';
import { useAuth } from '../auth/AuthContext';
import { AppStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<AppStackParamList, 'Settings'>;

export function SettingsScreen() {
  const nav = useNavigation<Nav>();
  const { state, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  if (state.status !== 'authenticated') return null;
  const user = state.user;
  const version = Constants.expoConfig?.version ?? '1.0.0';

  const confirmLogout = () => {
    Alert.alert('Sign out?', 'You\'ll need to log in again to use the app.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          try {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          } catch {}
          setLoggingOut(true);
          try {
            await logout();
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <Screen>
      <View style={styles.backRow}>
        <Pressable onPress={() => nav.goBack()}>
          <Text variant="small" color={colors.accent}>← Back</Text>
        </Pressable>
      </View>

      <Text variant="label" color={colors.textSecondary} style={{ marginTop: spacing.lg }}>
        — Account
      </Text>
      <Text variant="h1" style={{ marginTop: spacing.xs }}>
        Settings
      </Text>

      {/* Profile card */}
      <Pressable
        onPress={() => nav.navigate('ProfileEdit')}
        style={({ pressed }) => [styles.profileCard, pressed && { opacity: 0.8 }]}
      >
        <Avatar uri={user.avatar_url} name={user.name} size={56} />
        <View style={{ flex: 1 }}>
          <Text variant="h3">{user.name}</Text>
          {!!user.username && (
            <Text variant="small" muted>@{user.username}</Text>
          )}
          <Text variant="small" dim style={{ marginTop: 2 }}>
            {user.email}
          </Text>
        </View>
        <Text variant="small" color={colors.accent}>Edit</Text>
      </Pressable>

      {/* Profile meta */}
      {(user.department || user.position) && (
        <View style={styles.metaList}>
          {user.position && (
            <Row label="Position" value={user.position.name} />
          )}
          {user.department && (
            <Row label="Department" value={user.department.name} />
          )}
          {user.status_message && (
            <Row label="Status" value={user.status_message} />
          )}
        </View>
      )}

      <Text variant="label" color={colors.textSecondary} style={styles.groupLabel}>
        — App
      </Text>

      <View style={styles.actionList}>
        <ActionRow
          label="Open API docs"
          hint="pm.digicrats.com/api-docs.html"
          onPress={() => Linking.openURL('https://pm.digicrats.com/api-docs.html')}
        />
        <Divider style={{ margin: 0 }} />
        <ActionRow
          label="Open web dashboard"
          hint="pm.digicrats.com"
          onPress={() => Linking.openURL('https://pm.digicrats.com')}
        />
      </View>

      <Text variant="label" color={colors.textSecondary} style={styles.groupLabel}>
        — Session
      </Text>

      <Pressable
        onPress={confirmLogout}
        disabled={loggingOut}
        style={({ pressed }) => [
          styles.logoutBtn,
          pressed && { backgroundColor: colors.dangerMuted },
          loggingOut && { opacity: 0.5 },
        ]}
      >
        <Text variant="bodyMedium" color={colors.danger}>
          {loggingOut ? 'Signing out…' : 'Sign out'}
        </Text>
      </Pressable>

      <Text variant="small" dim center style={{ marginTop: spacing.xxl }}>
        PMHelper Mobile · v{version}
      </Text>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text variant="label" color={colors.textMuted}>{label}</Text>
      <Text variant="smallMedium" style={{ marginTop: 4 }}>{value}</Text>
    </View>
  );
}

function ActionRow({ label, hint, onPress }: { label: string; hint?: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={async () => {
        try { await Haptics.selectionAsync(); } catch {}
        onPress();
      }}
      style={({ pressed }) => [styles.actionRow, pressed && { backgroundColor: colors.surfacePressed }]}
    >
      <View style={{ flex: 1 }}>
        <Text variant="bodyMedium">{label}</Text>
        {!!hint && <Text variant="small" dim style={{ marginTop: 2 }}>{hint}</Text>}
      </View>
      <Text variant="body" dim>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metaList: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  row: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  groupLabel: { marginTop: spacing.xxl, marginBottom: spacing.sm },
  actionList: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  logoutBtn: {
    marginTop: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.danger + '44',
    alignItems: 'center',
  },
});
