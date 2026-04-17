import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';
import { Text } from './Text';

type Props = {
  label: string;
  color?: string;
  bg?: string;
  subtle?: boolean;
  square?: boolean;
  style?: ViewStyle;
};

export function Pill({ label, color, bg, subtle = true, square, style }: Props) {
  const textColor = color ?? colors.textSecondary;
  const bgColor =
    bg ?? (subtle && color ? color + '22' : subtle ? colors.surfaceElevated : color);
  return (
    <View
      style={[
        styles.base,
        square && styles.square,
        { backgroundColor: bgColor, borderColor: color ? color + '44' : colors.border },
        style,
      ]}
    >
      <Text variant="label" style={{ color: textColor, fontSize: 10, letterSpacing: 1.4 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  square: {
    borderRadius: radius.xs,
  },
});
