import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { COLORS, FONTS, SHADOWS, BORDERS, RADIUS } from './design/tokens'

const pathMap: Record<string, string> = {
  '/dashboard': '企业控制台',
  '/talent': '人才库',
  '/challenge': '挑战管理',
  '/challenge/create': '创建挑战',
  '/challenge/review': '审核中心',
  '/verify': '通行证验证',
  '/messages': '消息中心',
  '/interview': '面试管理',
  '/settings': '企业设置',
}

function getTalentDetailLabel(path: string): string | null {
  const match = path.match(/^\/talent\/(CP-\d{4}-\d{3})$/)
  return match ? '人才详情' : null
}

function getInterviewFeedbackLabel(path: string): string | null {
  const match = path.match(/^\/interview\/(INT-\d{3})\/feedback$/)
  return match ? '面试反馈' : null
}

export default function Breadcrumb() {
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname

  // 键盘快捷键：Backspace / Alt+← 返回上一页
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === 'Backspace' &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement) &&
        !(e.target instanceof HTMLSelectElement)
      ) {
        e.preventDefault()
        navigate(-1)
      }
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault()
        navigate(-1)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [navigate])

  // 不是 Dashboard 才显示返回按钮（Dashboard 是首页，没必要返回）
  const isDashboard = path === '/dashboard'
  const isSubPage = path !== '/dashboard'

  // 解析路径段
  const segments: { label: string; path: string }[] = []
  const parts = path.split('/').filter(Boolean)

  if (parts.length === 1) {
    const label = pathMap[`/${parts[0]}`]
    if (label && path !== '/dashboard') {
      segments.push({ label, path: `/${parts[0]}` })
    }
  } else if (parts.length === 2) {
    const parentPath = `/${parts[0]}`
    const parentLabel = pathMap[parentPath]
    if (parentLabel) segments.push({ label: parentLabel, path: parentPath })

    const detailLabel = getTalentDetailLabel(path) || getInterviewFeedbackLabel(path)
    if (detailLabel) {
      segments.push({ label: detailLabel, path })
    } else {
      const childLabel = pathMap[path]
      if (childLabel) segments.push({ label: childLabel, path })
    }
  }

  // ===== Styles =====
  const backBtnStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 14px',
    background: COLORS.surface,
    border: BORDERS.standard,
    borderRadius: RADIUS.card,
    cursor: 'pointer',
    fontFamily: FONTS.mono,
    fontSize: 11,
    fontWeight: 700,
    color: COLORS.primary,
    letterSpacing: '0.05em',
    boxShadow: SHADOWS.card,
    transition: 'transform 0.1s, box-shadow 0.1s',
    marginRight: 16,
    flexShrink: 0,
  }

  const crumbStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontFamily: FONTS.mono,
    fontSize: 10,
    color: COLORS.muted,
    letterSpacing: '0.05em',
  }

  const crumbLinkStyle: React.CSSProperties = {
    cursor: 'pointer',
    fontWeight: 700,
    color: COLORS.muted,
    transition: 'color 0.15s',
  }

  const crumbCurrentStyle: React.CSSProperties = {
    fontWeight: 700,
    color: COLORS.primary,
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      marginBottom: 24,
      minHeight: 36,
    }}>
      {/* ===== 返回按钮（Dashboard 首页不显示） ===== */}
      {isSubPage && (
        <button
          style={backBtnStyle}
          onClick={() => navigate(-1)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)'
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.12), 4px 4px 0px #1A1A1A'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = SHADOWS.card
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'translateY(2px)'
            e.currentTarget.style.boxShadow = '0 0px 2px rgba(0,0,0,0.08), 1px 1px 0px #1A1A1A'
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = SHADOWS.card
          }}
          title="返回上一页 (Backspace)"
        >
          <span style={{ fontSize: 14, lineHeight: 1 }}>←</span>
          返回
        </button>
      )}

      {/* ===== 面包屑路径 ===== */}
      {isDashboard ? (
        <span style={{ ...crumbStyle, fontSize: 10 }}>
          <span style={{ fontWeight: 700, color: COLORS.primary, textTransform: 'uppercase' }}>CareerPass</span>
        </span>
      ) : segments.length > 0 ? (
        <div style={crumbStyle}>
          <span
            onClick={() => navigate('/dashboard')}
            style={crumbLinkStyle}
            onMouseEnter={(e) => { e.currentTarget.style.color = COLORS.primary }}
            onMouseLeave={(e) => { e.currentTarget.style.color = COLORS.muted }}
          >
            CareerPass
          </span>
          {segments.map((seg, i) => (
            <span key={seg.path} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ opacity: 0.4 }}>›</span>
              <span
                onClick={() => i < segments.length - 1 ? navigate(seg.path) : null}
                style={i === segments.length - 1 ? crumbCurrentStyle : crumbLinkStyle}
                onMouseEnter={(e) => {
                  if (i < segments.length - 1) e.currentTarget.style.color = COLORS.primary
                }}
                onMouseLeave={(e) => {
                  if (i < segments.length - 1) e.currentTarget.style.color = COLORS.muted
                }}
              >
                {seg.label}
              </span>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  )
}
