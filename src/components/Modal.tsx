import { useEffect, ReactNode } from 'react'
import { COLORS, FONTS, SHADOWS, BORDERS, RADIUS } from './design/tokens'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  width?: number
}

export default function Modal({ isOpen, onClose, title, children, footer, width = 520 }: ModalProps) {
  // Esc 关闭
  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'overlayIn 0.15s ease-out both',
        background: 'rgba(0, 0, 0, 0.35)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        style={{
          background: COLORS.surface,
          border: BORDERS.standard,
          borderRadius: RADIUS.modal,
          boxShadow: SHADOWS.toast,
          width: '90%',
          maxWidth: width,
          maxHeight: '85vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalIn 0.2s ease-out both',
        }}
      >
        {/* Header */}
        {title && (
          <div style={{
            padding: '16px 24px',
            borderBottom: `1px solid ${COLORS.divider}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: FONTS.mono,
            fontSize: 13,
            fontWeight: 700,
            color: COLORS.primary,
            letterSpacing: '0.05em',
          }}>
            <span>{title}</span>
            <span
              onClick={onClose}
              style={{
                cursor: 'pointer',
                fontSize: 16,
                color: COLORS.muted,
                padding: '0 4px',
                lineHeight: 1,
              }}
            >
              X
            </span>
          </div>
        )}

        {/* Body */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1,
        }}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            padding: '16px 24px',
            borderTop: `1px solid ${COLORS.divider}`,
            display: 'flex',
            gap: 12,
            justifyContent: 'flex-end',
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
