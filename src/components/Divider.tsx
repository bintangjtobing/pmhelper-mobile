import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing } from '../theme/colors';

export function Divider({ style }: { style?: ViewStyle }) {
  return <View style={[styles.line, style]} />;
}

export function SoftDivider({ style }: { style?: ViewStyle }) {
  return <View style={[styles.soft, style]} />;
}

const styles = StyleSheet.create({
  line: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  soft: { height: 1, backgroundColor: colors.divider, marginVertical: spacing.sm },
});
