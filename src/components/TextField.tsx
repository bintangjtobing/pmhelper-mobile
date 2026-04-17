import React, { useState } from 'react';
import { TextInput, TextInputProps, View, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';
import { fonts } from '../theme/typography';
import { Text } from './Text';

type Props = TextInputProps & {
  label?: string;
  error?: string | null;
  multiline?: boolean;
  rows?: number;
};

export function TextField({ label, error, multiline, rows = 4, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={styles.wrap}>
      {label && (
        <Text variant="label" color={colors.textSecondary} style={styles.label}>
          {label}
        </Text>
      )}
      <TextInput
        {...rest}
        multiline={multiline}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          multiline && { minHeight: rows * 22 + 16, textAlignVertical: 'top' },
          focused && styles.inputFocused,
          error && styles.inputError,
          style,
        ]}
      />
      {error && (
        <Text variant="small" color={colors.danger} style={{ marginTop: spacing.xs }}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.md },
  label: { marginBottom: spacing.xs },
  input: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: 11,
    minHeight: 44,
  },
  inputFocused: { borderColor: colors.accent, backgroundColor: colors.surfaceElevated },
  inputError: { borderColor: colors.danger },
});
