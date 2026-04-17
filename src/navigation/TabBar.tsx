import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors, spacing, radius } from '../theme/colors';
import { fonts } from '../theme/typography';
import { Text } from '../components/Text';

const ICONS: Record<string, (active: boolean) => React.ReactNode> = {
  Home: (a) => (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 11L12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9z"
        stroke={a ? colors.text : colors.textMuted}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </Svg>
  ),
  Tickets: (a) => (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 7h16M4 12h10M4 17h14"
        stroke={a ? colors.text : colors.textMuted}
        strokeWidth={1.5}
        strokeLinecap="round"
      />
      <Circle cx={19} cy={17} r={2} fill={a ? colors.accent : 'none'} stroke={a ? colors.accent : colors.textMuted} strokeWidth={1.5} />
    </Svg>
  ),
  Reports: (a) => (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Rect x={4} y={3} width={16} height={18} rx={2} stroke={a ? colors.text : colors.textMuted} strokeWidth={1.5} />
      <Path d="M8 8h8M8 12h8M8 16h5" stroke={a ? colors.text : colors.textMuted} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  ),
  Discussions: (a) => (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 12c0 4.418-4.03 8-9 8a9.86 9.86 0 0 1-4.5-1L3 20l1.1-3.3A7.8 7.8 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        stroke={a ? colors.text : colors.textMuted}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </Svg>
  ),
  Team: (a) => (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx={9} cy={8} r={3} stroke={a ? colors.text : colors.textMuted} strokeWidth={1.5} />
      <Path d="M3 20a6 6 0 0 1 12 0" stroke={a ? colors.text : colors.textMuted} strokeWidth={1.5} strokeLinecap="round" />
      <Circle cx={17} cy={9} r={2.5} stroke={a ? colors.text : colors.textMuted} strokeWidth={1.5} />
      <Path d="M15 20a4 4 0 0 1 6-3.5" stroke={a ? colors.text : colors.textMuted} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  ),
};

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <SafeAreaView edges={['bottom']} style={styles.safe}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel ?? options.title ?? route.name;
          const active = state.index === index;

          const onPress = async () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!active && !event.defaultPrevented) {
              await Haptics.selectionAsync();
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={styles.tab}
              hitSlop={8}
            >
              <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
                {ICONS[route.name]?.(active)}
              </View>
              <Text
                style={{
                  fontFamily: fonts.bodyMedium,
                  fontSize: 10,
                  marginTop: 4,
                  letterSpacing: 0.3,
                  color: active ? colors.text : colors.textMuted,
                }}
              >
                {String(label)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: colors.bg, borderTopWidth: 1, borderTopColor: colors.border },
  bar: {
    flexDirection: 'row',
    paddingTop: 8,
    paddingHorizontal: spacing.xs,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  iconWrap: {
    width: 44,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  iconWrapActive: {
    backgroundColor: colors.surfaceElevated,
  },
});
