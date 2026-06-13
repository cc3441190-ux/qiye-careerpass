import Modal from './Modal'
import { COLORS, FONTS, BORDERS, RADIUS } from './design/tokens'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  danger?: boolean // 红色确认按钮
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = '确认',
  cancelLabel = '取消',
  danger = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      width={420}
      footer={
        <>
          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              background: COLORS.bg,
              border: BORDERS.standard,
              borderRadius: RADIUS.button,
              fontFamily: FONTS.mono,
              fontSize: 12,
              fontWeight: 700,
              color: COLORS.primary,
              cursor: 'pointer',
              letterSpacing: '0.05em',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            style={{
              padding: '10px 24px',
              background: danger ? COLORS.accent : COLORS.primary,
              border: `2px solid ${danger ? COLORS.accent : COLORS.primary}`,
              borderRadius: RADIUS.button,
              fontFamily: FONTS.mono,
              fontSize: 12,
              fontWeight: 700,
              color: COLORS.textOnDark,
              cursor: 'pointer',
              letterSpacing: '0.05em',
            }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p style={{
        fontFamily: FONTS.chinese,
        fontSize: 14,
        color: COLORS.primary,
        lineHeight: 1.8,
        margin: 0,
      }}>
        {message}
      </p>
    </Modal>
  )
}
