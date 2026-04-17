/**
 * Warm editorial dark palette — not the cold tech-blue every PM tool uses.
 * Based on paper-and-ink: cream text on warm off-black, terracotta accents.
 */
export const colors = {
  // Backgrounds — warm, like old newsprint in shadow
  bg: '#12100e',
  bgElevated: '#1a1715',
  surface: '#1c1917',
  surfaceElevated: '#24211e',
  surfacePressed: '#2e2a26',

  // Borders — hairlines
  border: '#2e2a26',
  borderStrong: '#3a3633',
  divider: '#231f1c',

  // Text — cream, not sterile white
  text: '#f7f3ec',
  textSecondary: '#a8a199',
  textMuted: '#6b6660',
  textDisabled: '#4a4541',

  // Primary accent — terracotta, editorial warmth
  accent: '#e5573f',
  accentPressed: '#c43f28',
  accentMuted: '#3a2019',

  // Status colors — muted, warm-aligned (not neon)
  success: '#9aa87a', // sage
  successMuted: '#232a1d',
  warning: '#e8a93f', // amber
  warningMuted: '#2e2416',
  danger: '#c62d42', // crimson
  dangerMuted: '#2e1619',
  info: '#7a9aa8', // slate blue
  infoMuted: '#1a2327',

  // Semantic
  overlay: 'rgba(8, 6, 4, 0.7)',
  scrim: 'rgba(0, 0, 0, 0.4)',

  // Priority chip colors (mapped from API priority names)
  priorityBlocker: '#c62d42',
  priorityCritical: '#e5573f',
  priorityHigh: '#e8a93f',
  priorityNormal: '#a8a199',
  priorityLow: '#6b6660',
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const radius = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  pill: 999,
} as const;
