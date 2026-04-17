import { TextStyle } from 'react-native';

/**
 * Editorial type system.
 * Fraunces (display serif, optical size variable) for headings + hero numbers.
 * DM Sans (body) for UI text.
 * JetBrains Mono for ticket codes, stats, and any numeric readouts.
 */

// Font family names match what's loaded in expo-font
export const fonts = {
  display: 'Fraunces_700Bold',
  displayItalic: 'Fraunces_500Medium_Italic',
  displayRegular: 'Fraunces_400Regular',
  body: 'DMSans_400Regular',
  bodyMedium: 'DMSans_500Medium',
  bodyBold: 'DMSans_700Bold',
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
};

export const type = {
  // Hero — giant editorial numbers & page titles
  hero: {
    fontFamily: fonts.display,
    fontSize: 44,
    lineHeight: 48,
    letterSpacing: -1.2,
  } satisfies TextStyle,

  // H1 — page title serif
  h1: {
    fontFamily: fonts.display,
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -0.6,
  } satisfies TextStyle,

  // H2 — section serif
  h2: {
    fontFamily: fonts.display,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.3,
  } satisfies TextStyle,

  // H3 — card titles, smaller serif
  h3: {
    fontFamily: fonts.display,
    fontSize: 19,
    lineHeight: 24,
    letterSpacing: -0.2,
  } satisfies TextStyle,

  // Body
  body: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  } satisfies TextStyle,

  bodyMedium: {
    fontFamily: fonts.bodyMedium,
    fontSize: 15,
    lineHeight: 22,
  } satisfies TextStyle,

  bodyBold: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    lineHeight: 22,
  } satisfies TextStyle,

  small: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
  } satisfies TextStyle,

  smallMedium: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
  } satisfies TextStyle,

  // Labels — small-caps, letter-spaced category markers
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  } satisfies TextStyle,

  // Mono
  code: {
    fontFamily: fonts.mono,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
  } satisfies TextStyle,

  codeLarge: {
    fontFamily: fonts.monoMedium,
    fontSize: 14,
    lineHeight: 18,
  } satisfies TextStyle,

  // Giant stat readout
  stat: {
    fontFamily: fonts.display,
    fontSize: 52,
    lineHeight: 52,
    letterSpacing: -2,
  } satisfies TextStyle,
};
