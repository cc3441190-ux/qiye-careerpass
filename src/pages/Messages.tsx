import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { COLORS, FONTS, SHADOWS, BORDERS, RADIUS } from '../components/design/tokens'
import type { MessageType } from '../types'

const typeLabels: Record<MessageType, string> = {
  review: '审核', verify: '认证', notice: '提醒', interview: '面试', system: '系统',
}

const typeActions: Record<MessageType, { label: string; getPath: (target?: string) => string } | null> = {
  review: { label: '去审核', getPath: () => `/challenge/review` },
  verify: { label: '查看人才', getPath: (target) => target ? `/talent/${target}` : '/talent' },
  notice: { label: '查看挑战', getPath: () => '/challenge' },
  interview: { label: '查看面试', getPath: () => '/interview' },
  system: null,
}

const s = {
  container: { animation: 'fadeIn 0.3s ease-out' } as React.CSSProperties,
  sectionLabel: {
    fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: COLORS.primary,
    opacity: 0.45, letterSpacing: '0.15em', marginBottom: 8,
    display: 'flex', alignItems: 'center', gap: 8,
  } as React.CSSProperties,
  list: { display: 'flex', flexDirection: 'column' as const, gap: 12 } as React.CSSProperties,
  card: (unread: boolean): React.CSSProperties => ({
    background: unread ? COLORS.bg : COLORS.surface,
    border: BORDERS.standard, borderRadius: RADIUS.card,
    boxShadow: SHADOWS.card, padding: '16px 20px', cursor: 'pointer',
    transition: 'all 0.2s', display: 'flex', alignItems: 'flex-start', gap: 12,
    borderLeft: unread ? `3px solid ${COLORS.accent}` : BORDERS.standard,
  }),
  avatar: {
    width: 40, height: 40, borderRadius: RADIUS.avatar, background: COLORS.primary,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: FONTS.mono, fontSize: 14, fontWeight: 700, color: COLORS.textOnDark,
    flexShrink: 0,
  } as React.CSSProperties,
  content: { flex: 1 } as React.CSSProperties,
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 } as React.CSSProperties,
  title: {
    fontFamily: FONTS.chinese, fontSize: 14, fontWeight: 700, color: COLORS.primary,
  } as React.CSSProperties,
  time: {
    fontFamily: FONTS.mono, fontSize: 9, color: COLORS.muted, letterSpacing: '0.05em',
  } as React.CSSProperties,
  body: {
    fontFamily: FONTS.chinese, fontSize: 12, color: COLORS.muted, lineHeight: 1.6,
  } as React.CSSProperties,
  actionBtn: {
    marginTop: 8, padding: '4px 12px', fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700,
    background: COLORS.accent, color: COLORS.textOnDark,
    border: `1.5px solid ${COLORS.accent}`, borderRadius: RADIUS.tag,
    cursor: 'pointer', letterSpacing: '0.05em',
  } as React.CSSProperties,
  badge: {
    background: COLORS.accent, color: COLORS.textOnDark,
    fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700,
    padding: '2px 6px', borderRadius: RADIUS.badge, marginLeft: 8,
  } as React.CSSProperties,
  emptyState: {
    textAlign: 'center' as const, padding: '60px 20px',
    fontFamily: FONTS.chinese, fontSize: 14, color: COLORS.muted,
  },
}

export default function Messages() {
  const navigate = useNavigate()
  const { state, dispatch } = useApp()

  // 进入消息页清除未读
  useEffect(() => {
    dispatch({ type: 'MARK_ALL_MESSAGES_READ' })
  }, [])

  const handleClick = (msg: typeof state.messages[0]) => {
    dispatch({ type: 'MARK_MESSAGE_READ', payload: { id: msg.id } })
    const action = typeActions[msg.type]
    if (action) {
      navigate(action.getPath(msg.actionTarget))
    }
  }

  const handleAction = (e: React.MouseEvent, msg: typeof state.messages[0]) => {
    e.stopPropagation()
    handleClick(msg)
  }

  return (
    <div style={s.container}>
      <div style={{ marginBottom: 32 }}>
        <div style={s.sectionLabel}>
          消息中心<div style={{ flex: 1, height: 1, background: COLORS.divider }} />
          {state.messages.filter(m => m.unread).length > 0 && (
            <span style={s.badge}>{state.messages.filter(m => m.unread).length} 条未读</span>
          )}
        </div>
        <h1 style={{ fontFamily: FONTS.mono, fontSize: 32, fontWeight: 700, color: COLORS.primary, marginBottom: 8 }}>消息</h1>
        <p style={{ fontFamily: FONTS.chinese, fontSize: 14, color: COLORS.muted }}>查看系统通知和待办事项</p>
      </div>

      {state.messages.length === 0 ? (
        <div style={s.emptyState}>暂无消息</div>
      ) : (
        <div style={s.list}>
          {state.messages.map((msg) => {
            const action = typeActions[msg.type]
            return (
              <div key={msg.id} style={s.card(msg.unread)}
                onClick={() => handleClick(msg)}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = SHADOWS.hover }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = SHADOWS.card }}
              >
                <div style={s.avatar}>{typeLabels[msg.type]}</div>
                <div style={s.content}>
                  <div style={s.header}>
                    <span style={s.title}>
                      {msg.title}
                      {msg.unread && (
                        <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: COLORS.accent, marginLeft: 8, verticalAlign: 'middle' }} />
                      )}
                    </span>
                    <span style={s.time}>{msg.time}</span>
                  </div>
                  <div style={s.body}>{msg.body}</div>
                  {action && (
                    <button style={s.actionBtn} onClick={(e) => handleAction(e, msg)}>
                      {action.label} →
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )
}
