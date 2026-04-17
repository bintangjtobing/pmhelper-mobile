import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { colors, radius } from '../theme/colors';
import { fonts } from '../theme/typography';
import { Text } from './Text';
import { WEB_BASE_URL } from '../api/client';

type Props = {
  uri?: string | null;
  name: string;
  size?: number;
};

function resolveUri(uri?: string | null): string | null {
  if (!uri) return null;
  if (uri.startsWith('http')) return uri;
  if (uri.startsWith('/')) return WEB_BASE_URL + uri;
  return uri;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? '').join('');
}

export function Avatar({ uri, name, size = 36 }: Props) {
  const resolved = resolveUri(uri);
  const style = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };
  if (resolved) {
    return <Image source={{ uri: resolved }} style={[style, styles.image]} />;
  }
  return (
    <View style={[style, styles.placeholder]}>
      <Text
        style={{
          fontFamily: fonts.bodyMedium,
          fontSize: size * 0.38,
          color: colors.text,
          letterSpacing: 0.5,
        }}
      >
        {initials(name)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: colors.surface },
  placeholder: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
