import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../components/Text';
import { TextField } from '../components/TextField';
import { Button } from '../components/Button';
import { colors, spacing } from '../theme/colors';
import { useAuth } from '../auth/AuthContext';
import { extractError } from '../api/client';

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setError(extractError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      {/* Warm gradient bloom in the corner — editorial atmosphere */}
      <LinearGradient
        colors={['rgba(229,87,63,0.12)', 'rgba(229,87,63,0)']}
        start={{ x: 1, y: 0 }}
        end={{ x: 0.3, y: 0.5 }}
        style={styles.bloom}
        pointerEvents="none"
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.markRow}>
              <View style={styles.markDot} />
              <Text variant="label" color={colors.textSecondary}>
                PM · 001
              </Text>
            </View>
            <Text variant="hero" style={styles.title}>
              Return to{'\n'}the studio.
            </Text>
            <Text variant="body" muted style={{ marginTop: spacing.md, maxWidth: 320 }}>
              Sign in with the credentials you use on the web dashboard to manage your projects on the go.
            </Text>
          </View>

          <View style={styles.form}>
            <TextField
              label="Email"
              placeholder="name@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
              returnKeyType="next"
            />
            <TextField
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="password"
              returnKeyType="go"
              onSubmitEditing={onSubmit}
              error={error}
            />
            <Button
              label="Sign in"
              onPress={onSubmit}
              loading={loading}
              disabled={!email || !password}
              size="lg"
              fullWidth
              style={{ marginTop: spacing.md }}
            />
          </View>

          <View style={styles.footer}>
            <Text variant="small" dim center>
              pm.digicrats.com · v1
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  bloom: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 360,
    height: 360,
    borderRadius: 180,
  },
  scroll: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  header: { marginTop: spacing.xxxl },
  markRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.xxl },
  markDot: { width: 8, height: 8, backgroundColor: colors.accent },
  title: { marginTop: spacing.sm },
  form: { marginTop: spacing.xxxl },
  footer: { marginTop: spacing.xxxl },
});
