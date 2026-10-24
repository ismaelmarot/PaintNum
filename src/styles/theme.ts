/**
 * PaintNum — core visual theme.
 *
 * Single source of truth for colors, typography, spacing, radii,
 * shadows and motion. Apple-inspired: neutral palette, generous
 * white space, subtle borders, soft shadows. Tokens only — no
 * architectural complexity.
 */

const color = {
  /** Neutral surfaces */
  background: '#ffffff',
  surface: '#f7f7f8',
  surfaceMuted: '#f2f2f4',

  /** Text */
  text: '#1d1d1f',
  textSecondary: '#6e6e73',
  textTertiary: '#aeaeb2',

  /** Separators and borders */
  border: '#e5e5e7',
  borderStrong: '#d2d2d7',

  /** Discrete accent (subtle blue, never saturated) */
  accent: '#0a84ff',
  accentHover: '#0071e3',

  /** States */
  danger: '#d70015',
  success: '#34c759',

  /** Overlays */
  overlayScrim: 'rgba(0, 0, 0, 0.25)',
} as const

const typography = {
  family:
    '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", "Segoe UI", Roboto, Arial, sans-serif',
  mono: 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace',

  size: {
    largeTitle: '2.5rem',
    title1: '1.75rem',
    title2: '1.25rem',
    title3: '1rem',
    body: '1rem',
    callout: '0.9375rem',
    footnote: '0.8125rem',
    caption: '0.6875rem',
  },
  lineHeight: {
    tight: 1.1,
    title: 1.2,
    body: 1.47,
    caption: 1.35,
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  letterSpacing: {
    display: '-0.02em',
    none: '0',
    caption: '0.01em',
  },
} as const

const spacing = {
  xxs: '4px',
  xs: '8px',
  s: '12px',
  m: '16px',
  l: '24px',
  xl: '32px',
  xxl: '48px',
  xxxl: '72px',
} as const

const radius = {
  small: '6px',
  medium: '10px',
  large: '14px',
  round: '9999px',
} as const

const border = {
  width: '1px',
  subtle: `${'1px'} solid ${color.border}`,
  strong: `${'1px'} solid ${color.borderStrong}`,
} as const

const shadow = {
  /** Use sparingly — only to convey depth, never for decoration. */
  subtle: '0 1px 2px rgba(0, 0, 0, 0.04), 0 4px 12px rgba(0, 0, 0, 0.04)',
  card: '0 2px 6px rgba(0, 0, 0, 0.05), 0 8px 24px rgba(0, 0, 0, 0.06)',
} as const

const ease = {
  standard: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
} as const

const motion = {
  fast: '120ms',
  base: '180ms',
  slow: '250ms',
} as const

export const theme = {
  color,
  typography,
  spacing,
  radius,
  border,
  shadow,
  ease,
  motion,
} as const

export type AppTheme = typeof theme
