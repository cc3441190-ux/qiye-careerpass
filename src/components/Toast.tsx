import { useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { FONTS, SHADOWS, RADIUS } from './design/tokens'

const toastTypeStyles: Record<string, { bg: string; color: string; border: string }> = {
  success: { bg: '#1A1A1A', color: '#FAF9F6', border: '#1A1A1A' },
  error: { bg: '#FF4D00', color: '#FAF9F6', border: '#FF4D00' },
  info: { bg: '#FFFFFF', color: '#1A1A1A', border: '#1A1A1A' },
}

export default function ToastContainer() {
  const { state, dispatch } = useApp()

  useEffect(() => {
    // 清理过期的 toast
    const timers = state.toasts.map((t) =>
      setTimeout(() => {
        dispatch({ type: 'DISMISS_TOAST', payload: { id: t.id } })
      }, 3000)
    )
    return () => timers.forEach(clearTimeout)
  }, [state.toasts, dispatch])

  if (state.toasts.length === 0) return null

  return (
    <div style={{
      position: 'fixed',
      top: 24,
      right: 24,
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      pointerEvents: 'none',
    }}>
      {state.toasts.map((toast) => {
        const style = toastTypeStyles[toast.type] || toastTypeStyles.info
        return (
          <div
            key={toast.id}
            style={{
              background: style.bg,
              border: `2px solid ${style.border}`,
              borderRadius: RADIUS.card,
              boxShadow: SHADOWS.toast,
              padding: '12px 20px',
              fontFamily: FONTS.mono,
              fontSize: 12,
              fontWeight: 700,
              color: style.color,
              letterSpacing: '0.05em',
              minWidth: 280,
              maxWidth: 420,
              pointerEvents: 'auto',
              cursor: 'pointer',
              animation: 'toastIn 0.3s ease-out both',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
            onClick={() => dispatch({ type: 'DISMISS_TOAST', payload: { id: toast.id } })}
          >
            <span>{toast.message}</span>
            <span style={{ fontSize: 14, opacity: 0.6, cursor: 'pointer' }}>X</span>
          </div>
        )
      })}
    </div>
  )
}
