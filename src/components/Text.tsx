import React from 'react';
import { Text as RNText, TextProps, TextStyle, StyleSheet } from 'react-native';
import { type } from '../theme/typography';
import { colors } from '../theme/colors';

type Variant = keyof typeof type;

type Props = TextProps & {
  variant?: Variant;
  color?: string;
  muted?: boolean;
  dim?: boolean;
  center?: boolean;
  italic?: boolean;
  children?: React.ReactNode;
};

export function Text({ variant = 'body', color, muted, dim, center, italic, style, ...rest }: Props) {
  const textStyles: TextStyle[] = [
    type[variant],
    {
      color: color ?? (dim ? colors.textMuted : muted ? colors.textSecondary : colors.text),
    },
  ];
  if (center) textStyles.push({ textAlign: 'center' });
  if (italic) textStyles.push({ fontStyle: 'italic' });
  if (style) textStyles.push(StyleSheet.flatten(style) as TextStyle);
  return <RNText style={textStyles} {...rest} />;
}
