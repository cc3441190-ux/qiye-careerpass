// ============================================================
// CareerPass Design Token System
// 来源: DESIGN_SYSTEM.md — 档案感 / 工业印刷 / 硬核数据 / 可验证
// ============================================================

export const COLORS = {
  bg: '#FAF9F6',
  primary: '#1A1A1A',
  accent: '#FF4D00',
  surface: '#FFFFFF',
  muted: '#8C8C8C',
  divider: '#E5E5E5',
  textOnDark: '#FAF9F6',
  textOnDarkMuted: 'rgba(250, 249, 246, 0.55)',
  success: '#388E3C',
  warning: '#F57C00',
  error: '#E64A19',
} as const

export const FONTS = {
  chinese: "'PingFang SC', 'Noto Sans SC', 'Hiragino Sans GB', sans-serif",
  mono: "'IBM Plex Mono', monospace",
} as const

export const FONT_SIZES = {
  display: 48,
  h1: 22,
  h2: 17,
  body: 14,
  bodySm: 12,
  caption: 10,
  captionSm: 9,
  monoData: 16,
} as const

export const SHADOWS = {
  card: '0 1px 2px rgba(0,0,0,0.06), 3px 3px 0px #1A1A1A',
  button: '0 2px 4px rgba(0,0,0,0.08), 3px 3px 0px #1A1A1A',
  buttonPressed: '0 0px 2px rgba(0,0,0,0.08), 1px 1px 0px #1A1A1A',
  darkCard: '0 1px 2px rgba(0,0,0,0.06), 3px 3px 0px #1A1A1A, 3px 3px 0px #FF4D00',
  toast: '0 2px 4px rgba(0,0,0,0.08), 3px 3px 0px #1A1A1A',
  hover: '0 4px 8px rgba(0,0,0,0.12), 5px 5px 0px #1A1A1A',
} as const

export const BORDERS = {
  standard: '2px solid #1A1A1A',
  light: '1px solid #E5E5E5',
  medium: '1.5px solid #E5E5E5',
  thick: '1.5px solid #1A1A1A',
  accent: '2px solid #FF4D00',
} as const

export const RADIUS = {
  card: 6,
  button: 8,
  tag: 2,
  input: 6,
  modal: 6,
  avatar: 4,
  badge: 2,
} as const

export const SPACING = {
  page: 40,
  cardGap: 16,
  cardPadding: 20,
  elementGap: 8,
  smallGap: 6,
  sectionGap: 32,
} as const

export const SECTION_LABEL_STYLE: React.CSSProperties = {
  fontFamily: FONTS.mono,
  fontSize: 10,
  fontWeight: 700,
  color: COLORS.primary,
  opacity: 0.45,
  letterSpacing: '0.15em',
  marginBottom: 8,
  display: 'flex',
  alignItems: 'center',
  gap: 8,
}

export const STANDARD_CARD_STYLE: React.CSSProperties = {
  background: COLORS.surface,
  border: BORDERS.standard,
  borderRadius: RADIUS.card,
  boxShadow: SHADOWS.card,
}

export const STYLE_CONSTANTS = {
  buttonPress: {
    transition: 'transform 0.1s, box-shadow 0.1s',
  },
} as const
