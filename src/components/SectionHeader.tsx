import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../theme/colors';
import { Text } from './Text';

type Props = {
  eyebrow?: string;
  title: string;
  action?: React.ReactNode;
  tight?: boolean;
  style?: ViewStyle;
};

export function SectionHeader({ eyebrow, title, action, tight, style }: Props) {
  return (
    <View style={[styles.wrap, tight && { marginTop: spacing.lg }, style]}>
      <View style={{ flex: 1 }}>
        {eyebrow && (
          <Text
            variant="label"
            color={colors.accent}
            style={{ marginBottom: spacing.xs }}
          >
            — {eyebrow}
          </Text>
        )}
        <Text variant="h2">{title}</Text>
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
});
