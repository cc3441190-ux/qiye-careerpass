const strokeProps = {
  fill: 'none',
  strokeWidth: 1.5,
  strokeLinecap: 'square' as const,
  strokeLinejoin: 'miter' as const,
}

export function DashboardIcon({ color = '#1A1A1A' }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke={color} {...strokeProps} />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke={color} {...strokeProps} />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke={color} {...strokeProps} />
      <rect x="14" y="14" width="7" height="7" rx="1" stroke={color} {...strokeProps} />
    </svg>
  )
}

export function SearchIcon({ color = '#1A1A1A' }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" stroke={color} {...strokeProps} />
      <line x1="16" y1="16" x2="21" y2="21" stroke={color} {...strokeProps} />
    </svg>
  )
}

export function TargetIcon({ color = '#1A1A1A' }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke={color} {...strokeProps} />
      <circle cx="12" cy="12" r="5" stroke={color} {...strokeProps} />
      <circle cx="12" cy="12" r="1.5" stroke={color} {...strokeProps} />
      <line x1="12" y1="1" x2="12" y2="3" stroke={color} {...strokeProps} />
      <line x1="12" y1="21" x2="12" y2="23" stroke={color} {...strokeProps} />
      <line x1="1" y1="12" x2="3" y2="12" stroke={color} {...strokeProps} />
      <line x1="21" y1="12" x2="23" y2="12" stroke={color} {...strokeProps} />
    </svg>
  )
}

export function VerifyIcon({ color = '#1A1A1A' }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <rect x="4" y="2" width="16" height="20" rx="1" stroke={color} {...strokeProps} />
      <polyline points="8,12 11,15 16,9" stroke={color} {...strokeProps} />
      <line x1="6" y1="19" x2="18" y2="19" stroke={color} {...strokeProps} />
      <line x1="6" y1="5" x2="18" y2="5" stroke={color} {...strokeProps} />
    </svg>
  )
}

export function MailIcon({ color = '#1A1A1A' }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <rect x="2" y="4" width="20" height="16" rx="1" stroke={color} {...strokeProps} />
      <polyline points="2,4 12,13 22,4" stroke={color} {...strokeProps} />
    </svg>
  )
}

export function SettingsIcon({ color = '#1A1A1A' }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="3" stroke={color} {...strokeProps} />
      <line x1="12" y1="1" x2="12" y2="4" stroke={color} {...strokeProps} />
      <line x1="12" y1="20" x2="12" y2="23" stroke={color} {...strokeProps} />
      <line x1="1" y1="12" x2="4" y2="12" stroke={color} {...strokeProps} />
      <line x1="20" y1="12" x2="23" y2="12" stroke={color} {...strokeProps} />
      <line x1="4.2" y1="4.2" x2="6.3" y2="6.3" stroke={color} {...strokeProps} />
      <line x1="17.7" y1="17.7" x2="19.8" y2="19.8" stroke={color} {...strokeProps} />
      <line x1="4.2" y1="19.8" x2="6.3" y2="17.7" stroke={color} {...strokeProps} />
      <line x1="17.7" y1="6.3" x2="19.8" y2="4.2" stroke={color} {...strokeProps} />
    </svg>
  )
}

export function InterviewIcon({ color = '#1A1A1A' }: { color?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <rect x="3" y="4" width="18" height="16" rx="1" stroke={color} {...strokeProps} />
      <line x1="8" y1="2" x2="8" y2="4" stroke={color} {...strokeProps} />
      <line x1="16" y1="2" x2="16" y2="4" stroke={color} {...strokeProps} />
      <line x1="12" y1="10" x2="12" y2="14" stroke={color} {...strokeProps} />
      <line x1="10" y1="12" x2="14" y2="12" stroke={color} {...strokeProps} />
    </svg>
  )
}

// ── 闭环阶段图标（Neo-Brutalism 几何线框风格）──

/** Stage 1: 发布挑战 — 十字靶心 + 向上箭头 */
export function ChallengeIcon({ color = '#1A1A1A' }: { color?: string }) {
  return (
    <svg width="42" height="42" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke={color} {...strokeProps} />
      <line x1="12" y1="1" x2="12" y2="4" stroke={color} {...strokeProps} />
      <line x1="12" y1="20" x2="12" y2="23" stroke={color} {...strokeProps} />
      <polyline points="4,12 7,12 9,8 11,8" stroke={color} {...strokeProps} />
      <line x1="11" y1="6" x2="11" y2="10" stroke={color} {...strokeProps} />
    </svg>
  )
}

/** Stage 2: 能力筛选 — 漏斗/过滤 */
export function FilterIcon({ color = '#1A1A1A' }: { color?: string }) {
  return (
    <svg width="42" height="42" viewBox="0 0 24 24">
      <polygon points="2,5 10,13 10,21 14,19 14,13 22,5" stroke={color} {...strokeProps} />
      <line x1="7" y1="13" x2="17" y2="13" stroke={color} {...strokeProps} />
    </svg>
  )
}

/** Stage 3: 面试安排 — 日历 + 时钟 */
export function CalendarIcon({ color = '#1A1A1A' }: { color?: string }) {
  return (
    <svg width="42" height="42" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="17" rx="1" stroke={color} {...strokeProps} />
      <line x1="3" y1="10" x2="21" y2="10" stroke={color} {...strokeProps} />
      <line x1="8" y1="2" x2="8" y2="5" stroke={color} {...strokeProps} />
      <line x1="16" y1="2" x2="16" y2="5" stroke={color} {...strokeProps} />
      <circle cx="12" cy="15.5" r="1.5" stroke={color} {...strokeProps} />
      <line x1="12" y1="12" x2="12" y2="15.5" stroke={color} {...strokeProps} />
    </svg>
  )
}

/** Stage 4: 反馈入档 — 文档 + 归档 */
export function FeedbackIcon({ color = '#1A1A1A' }: { color?: string }) {
  return (
    <svg width="42" height="42" viewBox="0 0 24 24">
      <rect x="5" y="3" width="14" height="18" rx="1" stroke={color} {...strokeProps} />
      <line x1="9" y1="7" x2="15" y2="7" stroke={color} {...strokeProps} />
      <line x1="9" y1="11" x2="15" y2="11" stroke={color} {...strokeProps} />
      <line x1="9" y1="15" x2="13" y2="15" stroke={color} {...strokeProps} />
      <polyline points="7,20 12,17 17,20" stroke={color} {...strokeProps} />
    </svg>
  )
}

/** 通用：带编号的圆环 */
export function NumberedIcon({ color = '#1A1A1A' }: { color?: string }) {
  return (
    <svg width="42" height="42" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" stroke={color} {...strokeProps} />
    </svg>
  )
}
