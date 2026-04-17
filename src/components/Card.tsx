import React from 'react';
import { Pressable, View, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, radius, spacing } from '../theme/colors';

type Props = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  flat?: boolean;
  padded?: boolean;
};

export function Card({ children, onPress, style, flat, padded = true }: Props) {
  const handlePress = async () => {
    if (!onPress) return;
    try {
      await Haptics.selectionAsync();
    } catch {}
    onPress();
  };

  const content = (
    <View
      style={[
        styles.base,
        flat && styles.flat,
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={handlePress} style={({ pressed }) => pressed && { opacity: 0.85 }}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  flat: {
    backgroundColor: 'transparent',
    borderColor: colors.divider,
    borderRadius: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  padded: { padding: spacing.lg },
});
