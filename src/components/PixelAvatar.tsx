// ============================================================
// PixelAvatar — 像素化身纯展示组件
// 仅负责渲染 avatarUrl base64 图片，不做生成
// 企业端不生成化身，移动端候选人完成挑战后自动生成
// ============================================================

import { COLORS, FONTS, RADIUS } from './design/tokens'

export type PixelAvatarSize = 36 | 40 | 48 | 56 | 64 | 80 | 88

interface PixelAvatarProps {
  avatarUrl?: string
  fallbackChar?: string     // 无 avatarUrl 时展示的单字
  size?: PixelAvatarSize    // 默认 48
  style?: React.CSSProperties
}

export default function PixelAvatar({
  avatarUrl,
  fallbackChar = '?',
  size = 48,
  style,
}: PixelAvatarProps) {
  if (avatarUrl) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: RADIUS.avatar,
          overflow: 'hidden',
          flexShrink: 0,
          ...style,
        }}
      >
        <img
          src={avatarUrl}
          alt="pixel avatar"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            imageRendering: 'pixelated',
          }}
        />
      </div>
    )
  }

  // 降级：纯黑底 + 单字占位
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: RADIUS.avatar,
        background: COLORS.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONTS.mono,
        fontSize: Math.round(size * 0.35),
        fontWeight: 700,
        color: COLORS.textOnDark,
        flexShrink: 0,
        ...style,
      }}
    >
      {fallbackChar}
    </div>
  )
}
