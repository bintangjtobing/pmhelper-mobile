import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import { Text } from './Text';
import { Avatar } from './Avatar';
import { colors, spacing, radius } from '../theme/colors';
import { fonts } from '../theme/typography';
import { fmtRelative, stripRichText } from '../lib/format';
import type { ActivityItem } from '../types/api';
import { AppStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<AppStackParamList>;

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  const nav = useNavigation<Nav>();

  if (!items.length) {
    return (
      <View style={styles.empty}>
        <Text variant="body" dim center>Nothing has happened yet.</Text>
      </View>
    );
  }

  return (
    <View>
      {items.map((item, idx) => (
        <ActivityRow
          key={item.id}
          item={item}
          last={idx === items.length - 1}
          onPress={() => handlePress(nav, item)}
        />
      ))}
    </View>
  );
}

function handlePress(nav: Nav, item: ActivityItem) {
  const t = item.target;
  if (!t) return;
  switch (t.type) {
    case 'ticket':
      nav.navigate('TicketDetail', { ticketId: t.id });
      break;
    case 'daily_report':
      nav.navigate('DailyReportView', { id: t.id });
      break;
    case 'weekly_report':
      nav.navigate('WeeklyReportView', { id: t.id });
      break;
  }
}

function ActivityRow({
  item,
  last,
  onPress,
}: {
  item: ActivityItem;
  last: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [pressed && { opacity: 0.7 }]}>
      <View style={styles.row}>
        <View style={styles.left}>
          <KindIcon kind={item.kind} />
          {!last && <View style={styles.thread} />}
        </View>
        <View style={styles.content}>
          <View style={styles.header}>
            {item.actor && (
              <Avatar uri={item.actor.avatar_url} name={item.actor.name} size={22} />
            )}
            <Text variant="smallMedium" style={{ flexShrink: 1 }} numberOfLines={1}>
              {item.actor?.name ?? 'Someone'}{' '}
              <Text variant="small" muted>{item.summary}</Text>
            </Text>
          </View>
          {item.target && (
            <View style={styles.targetRow}>
              {item.target.code && (
                <Text
                  style={{
                    fontFamily: fonts.mono,
                    fontSize: 10,
                    color: colors.textMuted,
                    letterSpacing: 0.5,
                  }}
                >
                  {item.target.code}
                </Text>
              )}
              <Text variant="small" numberOfLines={1} style={{ flex: 1 }}>
                {item.target.title}
              </Text>
            </View>
          )}
          {item.excerpt && (
            <Text variant="small" muted numberOfLines={2} style={{ marginTop: 2 }}>
              "{stripRichText(item.excerpt)}"
            </Text>
          )}
          <Text variant="small" dim style={{ marginTop: 4 }}>
            {fmtRelative(item.at)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

function KindIcon({ kind }: { kind: ActivityItem['kind'] }) {
  const color = kindColor(kind);
  return (
    <View style={[styles.iconBubble, { borderColor: color + '55' }]}>
      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
        {kind === 'ticket.status_changed' && (
          <>
            <Line x1={4} y1={12} x2={20} y2={12} stroke={color} strokeWidth={2} strokeLinecap="round" />
            <Path d="M14 6l6 6-6 6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
        {kind === 'ticket.commented' && (
          <Path
            d="M4 5h16v11H7l-3 3V5z"
            stroke={color}
            strokeWidth={2}
            strokeLinejoin="round"
          />
        )}
        {(kind === 'daily_report.submitted' || kind === 'weekly_report.submitted') && (
          <>
            <Path d="M6 3h10l4 4v14H6V3z" stroke={color} strokeWidth={2} strokeLinejoin="round" />
            <Path d="M9 12l2 2 4-4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </>
        )}
      </Svg>
    </View>
  );
}

function kindColor(kind: ActivityItem['kind']): string {
  switch (kind) {
    case 'ticket.status_changed':
      return colors.accent;
    case 'ticket.commented':
      return colors.warning;
    case 'daily_report.submitted':
    case 'weekly_report.submitted':
      return colors.success;
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: spacing.md,
  },
  left: { alignItems: 'center', marginRight: spacing.md, width: 28 },
  iconBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thread: { flex: 1, width: 1, backgroundColor: colors.border, marginTop: 4 },
  content: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  empty: {
    paddingVertical: spacing.xl,
  },
});
