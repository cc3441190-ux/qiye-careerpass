import { COLORS, BORDERS, RADIUS } from './design/tokens'

const shimmerBg = `linear-gradient(90deg, #F0F0F0 25%, #E8E8E8 50%, #F0F0F0 75%)`
const shimmerStyle: React.CSSProperties = {
  background: shimmerBg,
  backgroundSize: '200px 100%',
  animation: 'shimmer 1.5s ease-in-out infinite',
  borderRadius: RADIUS.tag,
}

export function SkeletonLine({ width = '100%', height = 14 }: { width?: string | number; height?: number }) {
  return <div style={{ ...shimmerStyle, width, height }} />
}

export function SkeletonCard() {
  return (
    <div style={{
      background: COLORS.surface,
      border: BORDERS.standard,
      borderRadius: RADIUS.card,
      padding: 20,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ ...shimmerStyle, width: 40, height: 40, borderRadius: RADIUS.avatar }} />
        <div style={{ ...shimmerStyle, width: 50, height: 20 }} />
      </div>
      <SkeletonLine width="60%" height={16} />
      <div style={{ height: 8 }} />
      <SkeletonLine width="40%" height={12} />
      <div style={{ height: 12 }} />
      <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
        <div style={{ ...shimmerStyle, width: 60, height: 22 }} />
        <div style={{ ...shimmerStyle, width: 60, height: 22 }} />
        <div style={{ ...shimmerStyle, width: 60, height: 22 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ ...shimmerStyle, width: 80, height: 20 }} />
        <div style={{ ...shimmerStyle, width: 60, height: 12 }} />
      </div>
    </div>
  )
}

export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          style={{
            background: COLORS.surface,
            border: BORDERS.standard,
            borderRadius: RADIUS.card,
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div style={{ ...shimmerStyle, width: 40, height: 40, borderRadius: RADIUS.avatar, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <SkeletonLine width="50%" height={16} />
            <div style={{ height: 6 }} />
            <SkeletonLine width="70%" height={12} />
          </div>
          <div style={{ ...shimmerStyle, width: 60, height: 24 }} />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 4, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div style={{
      background: COLORS.surface,
      border: BORDERS.standard,
      borderRadius: RADIUS.card,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        background: COLORS.primary,
        padding: '10px 12px',
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 12,
      }}>
        {Array.from({ length: cols }, (_, i) => (
          <div key={i} style={{ ...shimmerStyle, height: 10, background: 'rgba(255,255,255,0.15)' }} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          style={{
            padding: '10px 12px',
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 12,
            borderBottom: `1px solid ${COLORS.divider}`,
          }}
        >
          {Array.from({ length: cols }, (_, j) => (
            <div key={j} style={{ ...shimmerStyle, height: 14 }} />
          ))}
        </div>
      ))}
    </div>
  )
}
