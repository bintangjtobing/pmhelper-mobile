import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors, spacing } from '../theme/colors';
import { Text } from './Text';

type Props = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
};

export function EmptyState({ title, subtitle, action, icon }: Props) {
  return (
    <View style={styles.wrap}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text variant="h3" center>{title}</Text>
      {subtitle && (
        <Text variant="body" muted center style={{ marginTop: spacing.sm, maxWidth: 280 }}>
          {subtitle}
        </Text>
      )}
      {action && <View style={{ marginTop: spacing.lg }}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl * 2,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
