import React from 'react';
import { Pressable, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing } from '../theme/colors';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type Props = {
  label: string;
  onPress?: () => void | Promise<void>;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  fullWidth,
  style,
  iconLeft,
  iconRight,
}: Props) {
  const isDisabled = disabled || loading;

  const handlePress = async () => {
    if (!onPress || isDisabled) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {}
    await onPress();
  };

  const variantStyle = {
    primary: { backgroundColor: colors.accent },
    secondary: { backgroundColor: colors.surfaceElevated, borderWidth: 1, borderColor: colors.border },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: colors.danger },
  }[variant];

  const pressedStyle = {
    primary: { backgroundColor: colors.accentPressed },
    secondary: { backgroundColor: colors.surfacePressed },
    ghost: { backgroundColor: colors.surface },
    danger: { backgroundColor: '#a52332' },
  }[variant];

  const sizeStyle = {
    sm: { paddingVertical: 8, paddingHorizontal: spacing.md, minHeight: 34 },
    md: { paddingVertical: 11, paddingHorizontal: spacing.lg, minHeight: 44 },
    lg: { paddingVertical: 15, paddingHorizontal: spacing.xl, minHeight: 52 },
  }[size];

  const textColor = variant === 'primary' || variant === 'danger' ? colors.text : colors.text;
  const labelVariant = size === 'sm' ? 'smallMedium' : 'bodyMedium';

  return (
    <Pressable
      onPress={handlePress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyle,
        sizeStyle,
        fullWidth && { alignSelf: 'stretch' },
        pressed && !isDisabled && pressedStyle,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {iconLeft}
          <Text variant={labelVariant} color={textColor}>
            {label}
          </Text>
          {iconRight}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    gap: spacing.sm,
  },
  disabled: { opacity: 0.5 },
});
