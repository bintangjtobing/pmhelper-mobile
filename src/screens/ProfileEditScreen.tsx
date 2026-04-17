import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../components/Screen';
import { Text } from '../components/Text';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
import { colors, spacing } from '../theme/colors';
import { useAuth } from '../auth/AuthContext';
import { updateProfile } from '../api/endpoints';
import { extractError } from '../api/client';
import { AppStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<AppStackParamList, 'ProfileEdit'>;

export function ProfileEditScreen() {
  const nav = useNavigation<Nav>();
  const { state, refresh } = useAuth();

  if (state.status !== 'authenticated') return null;
  const user = state.user;

  const [name, setName] = useState(user.name);
  const [statusMessage, setStatusMessage] = useState(user.status_message ?? '');
  const [saving, setSaving] = useState(false);

  const dirty =
    name.trim() !== user.name ||
    statusMessage.trim() !== (user.status_message ?? '');

  const onSave = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please enter your name.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        status_message: statusMessage.trim() || null,
      });
      await refresh();
      nav.goBack();
    } catch (e) {
      Alert.alert('Could not save', extractError(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <View style={styles.backRow}>
        <Pressable onPress={() => nav.goBack()}>
          <Text variant="small" color={colors.accent}>← Cancel</Text>
        </Pressable>
      </View>

      <Text variant="label" color={colors.textSecondary} style={{ marginTop: spacing.lg }}>
        — Edit profile
      </Text>
      <Text variant="h1" style={{ marginTop: spacing.xs }}>
        You
      </Text>

      <View style={styles.avatarBlock}>
        <Avatar uri={user.avatar_url} name={user.name} size={88} />
        <Text variant="small" dim style={{ marginTop: spacing.sm }}>
          Avatar can be changed on the web dashboard.
        </Text>
      </View>

      <View style={{ marginTop: spacing.xl }}>
        <TextField label="Name" value={name} onChangeText={setName} autoCapitalize="words" />
        <TextField
          label="Status message"
          value={statusMessage}
          onChangeText={setStatusMessage}
          placeholder="What are you working on?"
          multiline
          rows={3}
        />
      </View>

      <View style={styles.readOnlyList}>
        <Row label="Username" value={user.username ?? '—'} />
        <Row label="Email" value={user.email} />
      </View>

      <Button
        label="Save changes"
        onPress={onSave}
        loading={saving}
        disabled={!dirty}
        size="lg"
        fullWidth
        style={{ marginTop: spacing.xl }}
      />
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

const styles = StyleSheet.create({
  backRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  avatarBlock: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
  },
  readOnlyList: {
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  row: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
});
