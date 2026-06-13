import { useEffect, useState } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { DashboardIcon, SearchIcon, TargetIcon, VerifyIcon, MailIcon, SettingsIcon, InterviewIcon } from './Icons'
import ToastContainer from './Toast'
import SearchOverlay from './SearchOverlay'
import Breadcrumb from './Breadcrumb'
import { COLORS, FONTS, BORDERS, RADIUS } from './design/tokens'

// 侧边栏宽度常量
const SIDEBAR_EXPANDED = 220
const SIDEBAR_COLLAPSED = 56

// 响应式断点
const BREAKPOINT_NARROW = 1366

export default function EnterpriseLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { state, dispatch, unreadCount, markAllRead } = useApp()
  const collapsed = state.sidebarCollapsed
  const [tooltip, setTooltip] = useState<string | null>(null)
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 })
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)

  // 监听窗口宽度变化
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // 响应式侧边栏宽度：窄屏时自动缩小
  const effectiveSidebarWidth = collapsed
    ? SIDEBAR_COLLAPSED
    : windowWidth <= BREAKPOINT_NARROW ? 180 : SIDEBAR_EXPANDED

  // 内容区 padding：窄屏时减小
  const contentPadding = windowWidth <= BREAKPOINT_NARROW ? 24 : 40

  // Ctrl+K / Ctrl+N 快捷键
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        navigate('/challenge/create')
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [navigate])

  // =====================
  // Styles（内联以保证和设计 Token 一致性）
  // =====================
  const S = {
    // 整体布局容器：铺满视口
    layout: {
      display: 'flex',
      minHeight: '100vh',
      background: COLORS.bg,
    } as React.CSSProperties,

    // 侧边栏：固定定位，始终在左边
    sidebar: {
      position: 'fixed' as const,
      left: 0,
      top: 0,
      bottom: 0,
      width: effectiveSidebarWidth,
      background: COLORS.surface,
      borderRight: BORDERS.standard,
      display: 'flex',
      flexDirection: 'column' as const,
      zIndex: 100,
      transition: 'width 0.25s ease',
      overflow: 'hidden',
    },

    // 折叠/展开小圆按钮
    collapseBtn: {
      position: 'absolute' as const,
      right: -14,
      top: 68,
      width: 28,
      height: 28,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: COLORS.surface,
      border: BORDERS.standard,
      borderRadius: '50%',
      cursor: 'pointer',
      zIndex: 101,
      fontFamily: FONTS.mono,
      fontSize: 11,
      fontWeight: 700,
      color: COLORS.primary,
      lineHeight: 1,
      boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
    },

    // Logo 区域
    logo: {
      padding: collapsed ? '20px 16px' : '20px 18px',
      borderBottom: BORDERS.standard,
      fontFamily: FONTS.mono,
      fontSize: collapsed ? 12 : 13,
      fontWeight: 700,
      color: COLORS.primary,
      letterSpacing: '0.1em',
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      lineHeight: 1.4,
    },

    // 导航区域
    nav: {
      flex: 1,
      padding: '12px 0',
      overflowY: 'auto' as const,
      overflowX: 'hidden' as const,
    },

    // 导航项基础样式
    navItem: (active: boolean): React.CSSProperties => ({
      display: 'flex',
      alignItems: 'center',
      height: 44,
      padding: collapsed ? '0 16px' : '0 18px',
      fontFamily: FONTS.mono,
      fontSize: 12,
      fontWeight: 700,
      color: active ? COLORS.accent : COLORS.primary,
      textDecoration: 'none',
      borderLeft: `3px solid ${active ? COLORS.accent : 'transparent'}`,
      background: active ? 'rgba(255, 77, 0, 0.05)' : 'transparent',
      transition: 'all 0.2s',
      cursor: 'pointer',
      letterSpacing: '0.05em',
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
    }),

    navIcon: {
      marginRight: collapsed ? 0 : 10,
      width: 20,
      height: 20,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
    },

    badge: {
      background: COLORS.accent,
      color: COLORS.textOnDark,
      fontFamily: FONTS.mono,
      fontSize: 9,
      fontWeight: 700,
      padding: '1px 5px',
      borderRadius: RADIUS.badge,
      marginLeft: 'auto',
      lineHeight: '16px',
      flexShrink: 0,
    },

    // 主内容区域
    main: {
      flex: 1,
      marginLeft: effectiveSidebarWidth,
      padding: contentPadding,
      // 不设 maxWidth！让内容充分利用剩余空间
      minHeight: '100vh',
      transition: 'margin-left 0.25s ease, padding 0.25s ease',
    } as React.CSSProperties,

    // 侧边栏底部
    footer: {
      padding: '14px 18px',
      borderTop: BORDERS.standard,
    },

    // Tooltip
    tooltip: (top: number, left: number): React.CSSProperties => ({
      position: 'fixed',
      top,
      left,
      background: COLORS.primary,
      color: COLORS.textOnDark,
      fontFamily: FONTS.mono,
      fontSize: 11,
      fontWeight: 700,
      padding: '6px 10px',
      borderRadius: RADIUS.tag,
      zIndex: 200,
      pointerEvents: 'none',
      whiteSpace: 'nowrap',
      letterSpacing: '0.05em',
    }),
  }

  const isVerified = state.enterprise?.verifyStatus === 'approved'

  const menuItems = [
    { path: '/dashboard', label: '仪表盘', Icon: DashboardIcon },
    { path: '/talent', label: '人才搜索', Icon: SearchIcon },
    { path: '/challenge', label: '挑战管理', Icon: TargetIcon },
    { path: '/interview', label: '面试管理', Icon: InterviewIcon },
    { path: '/verify', label: '通行证验证', Icon: VerifyIcon },
    { path: '/messages', label: '消息', Icon: MailIcon, showBadge: true },
    ...(isVerified ? [] : [{ path: '/enterprise-verify', label: '企业认证', Icon: SettingsIcon, showBadge: true }]),
  ]

  return (
    <div style={S.layout}>
      {/* ==================== 左侧固定侧边栏 ==================== */}
      <aside style={S.sidebar}>
        {/* 折叠按钮 */}
        <button
          style={S.collapseBtn}
          onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })}
          title={collapsed ? '展开菜单 (快捷键: Ctrl+K 搜索)' : '折叠菜单'}
        >
          {collapsed ? '»' : '«'}
        </button>

        {/* Logo */}
        <div style={S.logo}>
          {collapsed ? 'CP' : <>CareerPass<br /><span style={{ fontSize: 10, opacity: 0.55 }}>企业端</span></>}
        </div>

        {/* 导航菜单 */}
        <nav style={S.nav}>
          {menuItems.map((item) => {
            const isActive =
              item.path === '/dashboard'
                ? location.pathname === '/dashboard'
                : location.pathname.startsWith(item.path)

            const active = isActive
            const showBadge = item.showBadge && unreadCount > 0

            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={S.navItem(active)}
                onMouseEnter={(e) => {
                  if (collapsed) {
                    const rect = e.currentTarget.getBoundingClientRect()
                    setTooltip(item.label)
                    setTooltipPos({ top: rect.top, left: rect.right + 8 })
                  }
                }}
                onMouseLeave={() => setTooltip(null)}
                onClick={() => {
                  if (item.path === '/messages') markAllRead()
                }}
              >
                <span style={S.navIcon}>
                  <item.Icon color={active ? COLORS.accent : COLORS.primary} />
                </span>
                {!collapsed && item.label}
                {!collapsed && showBadge && (
                  <span style={S.badge}>{unreadCount}</span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* 底部：设置 + 版本 */}
        <div style={S.footer}>
          <div style={S.navItem(location.pathname === '/settings')}>
            <NavLink
              to="/settings"
              style={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: location.pathname === '/settings' ? COLORS.accent : COLORS.muted,
                fontFamily: FONTS.mono,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              <span style={S.navIcon}>
                <SettingsIcon color={location.pathname === '/settings' ? COLORS.accent : COLORS.muted} />
              </span>
              {!collapsed && '设置'}
            </NavLink>
          </div>
          {!collapsed && (
            <div style={{
              fontFamily: FONTS.mono,
              fontSize: 9,
              color: COLORS.muted,
              opacity: 0.6,
              letterSpacing: '0.1em',
              marginTop: 8,
              paddingLeft: 4,
            }}>
              v1.0 · Enterprise
            </div>
          )}
        </div>
      </aside>

      {/* ==================== 折叠态 Tooltip ==================== */}
      {collapsed && tooltip && (
        <div style={S.tooltip(tooltipPos.top, tooltipPos.left)}>{tooltip}</div>
      )}

      {/* ==================== 右侧主内容区（流体宽度，不设 maxWidth） ==================== */}
      <main style={S.main}>
        <Breadcrumb />
        <Outlet />
      </main>

      {/* ==================== 全局浮层 ==================== */}
      <ToastContainer />
      <SearchOverlay />
    </div>
  )
}
