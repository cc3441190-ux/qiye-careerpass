import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { COLORS, FONTS, SHADOWS, BORDERS, RADIUS } from '../components/design/tokens'

const s = {
  container: { animation: 'fadeIn 0.3s ease-out' } as React.CSSProperties,
  sectionLabel: {
    fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: COLORS.primary,
    opacity: 0.45, letterSpacing: '0.15em', marginBottom: 8,
    display: 'flex', alignItems: 'center', gap: 8,
  } as React.CSSProperties,
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 } as React.CSSProperties,
  ctaBtn: (bg: string): React.CSSProperties => ({
    background: bg, border: BORDERS.standard, borderRadius: RADIUS.button,
    padding: '12px 24px', color: COLORS.textOnDark,
    fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700,
    letterSpacing: '0.1em', cursor: 'pointer', boxShadow: SHADOWS.button,
    transition: 'transform 0.1s, box-shadow 0.1s', marginLeft: 12,
  }),
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 16,
  } as React.CSSProperties,
  card: {
    background: COLORS.surface, border: BORDERS.standard, borderRadius: RADIUS.card,
    boxShadow: SHADOWS.card, overflow: 'hidden',
  } as React.CSSProperties,
  cardHeader: {
    background: COLORS.primary, padding: '12px 16px',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  } as React.CSSProperties,
  cardTitle: {
    fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, color: COLORS.textOnDark,
    letterSpacing: '0.05em',
  } as React.CSSProperties,
  statusBadge: (active: boolean): React.CSSProperties => ({
    padding: '4px 8px', borderRadius: RADIUS.tag,
    fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
    border: `1.5px solid ${active ? COLORS.primary : COLORS.divider}`,
    background: active ? COLORS.surface : COLORS.bg,
    color: active ? COLORS.primary : COLORS.muted,
  }),
  cardBody: { padding: 16 } as React.CSSProperties,
  desc: {
    fontFamily: FONTS.chinese, fontSize: 12, color: COLORS.primary, marginBottom: 12, lineHeight: 1.6,
  } as React.CSSProperties,
  meta: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12,
    padding: 12, background: COLORS.bg, borderRadius: 4, border: `1px solid ${COLORS.divider}`,
  } as React.CSSProperties,
  metaItem: {
    fontFamily: FONTS.mono, fontSize: 9, color: COLORS.muted, letterSpacing: '0.05em',
  } as React.CSSProperties,
  metaValue: (color?: string): React.CSSProperties => ({
    display: 'block', fontFamily: FONTS.mono, fontSize: 14, fontWeight: 700,
    color: color || COLORS.primary, marginTop: 4,
  }),
  cardFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 12, borderTop: `1px solid ${COLORS.divider}`,
  } as React.CSSProperties,
  btnGroup: { display: 'flex', gap: 8 } as React.CSSProperties,
  btnSm: (primary: boolean): React.CSSProperties => ({
    background: primary ? COLORS.primary : COLORS.bg,
    border: BORDERS.standard, borderRadius: RADIUS.button,
    padding: '8px 16px', color: primary ? COLORS.textOnDark : COLORS.primary,
    fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
    cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.08), 2px 2px 0px #1A1A1A',
    transition: 'transform 0.1s, box-shadow 0.1s',
  }),
  emptyState: {
    textAlign: 'center' as const, padding: '60px 20px', background: COLORS.surface,
    border: BORDERS.standard, borderRadius: RADIUS.card, boxShadow: SHADOWS.card,
    gridColumn: '1 / -1',
  } as React.CSSProperties,
}

export default function ChallengeManage() {
  const navigate = useNavigate()
  const { state, dispatch } = useApp()

  const challenges = state.challenges
  const pendingReviewCount = state.reviews.filter(r => r.status === 'pending').length

  return (
    <div style={s.container}>
      <div style={{ marginBottom: 32 }}>
        <div style={s.sectionLabel}>挑战管理 / CHALLENGE<div style={{ flex: 1, height: 1, background: COLORS.divider }} /></div>
        <div style={s.header}>
          <div>
            <h1 style={{ fontFamily: FONTS.mono, fontSize: 32, fontWeight: 700, color: COLORS.primary, marginBottom: 8 }}>挑战管理</h1>
            <p style={{ fontFamily: FONTS.chinese, fontSize: 14, color: COLORS.muted }}>创建和管理 AI 职业挑战</p>
          </div>
          <div style={{ display: 'flex' }}>
            <button style={s.ctaBtn(COLORS.accent)} onClick={() => navigate('/challenge/create')}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = SHADOWS.buttonPressed; undefined }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = SHADOWS.button; undefined }}
              onMouseLeave={() => undefined}
            >创建挑战</button>
            <button style={s.ctaBtn(COLORS.primary)} onClick={() => navigate('/challenge/review')}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = SHADOWS.buttonPressed; undefined }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = SHADOWS.button; undefined }}
              onMouseLeave={() => undefined}
            >
              审核中心{pendingReviewCount > 0 ? ` (${pendingReviewCount})` : ''}
            </button>
          </div>
        </div>
      </div>

      {challenges.length === 0 ? (
        <div style={s.emptyState}>
          <div style={{ fontSize: 72, marginBottom: 16, opacity: 0.15 }}>——</div>
          <div style={{ fontFamily: FONTS.chinese, fontSize: 18, fontWeight: 700, color: COLORS.primary, marginBottom: 8 }}>还没有挑战</div>
          <div style={{ fontFamily: FONTS.chinese, fontSize: 14, color: COLORS.muted, marginBottom: 20 }}>创建第一个 AI 职业挑战，开始筛选优秀人才</div>
          <button style={s.ctaBtn(COLORS.accent)} onClick={() => navigate('/challenge/create')}>创建挑战</button>
        </div>
      ) : (
        <div style={s.grid}>
          {challenges.map((ch) => (
            <div key={ch.id} style={s.card}>
              <div style={s.cardHeader}>
                <span style={s.cardTitle}>{ch.id}</span>
                <span style={s.statusBadge(ch.status === 'open')}>
                  {ch.status === 'open' ? '进行中' : ch.status === 'closing' ? '即将截止' : '已关闭'}
                </span>
              </div>
              <div style={s.cardBody}>
                <div style={{
                  fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, color: COLORS.primary,
                  marginBottom: 8, letterSpacing: '0.02em',
                }}>
                  {ch.title}
                </div>
                <p style={s.desc}>{ch.description}</p>
                <div style={s.meta}>
                  <div style={s.metaItem}>参与人数<span style={s.metaValue()}>{ch.participants}</span></div>
                  <div style={s.metaItem}>完成率<span style={s.metaValue()}>{ch.completionRate}</span></div>
                  <div style={s.metaItem}>平均评分<span style={s.metaValue(ch.avgScore.startsWith('A') ? COLORS.accent : undefined)}>{ch.avgScore}</span></div>
                  <div style={s.metaItem}>创建日期<span style={s.metaValue()}>{ch.createdAt}</span></div>
                </div>
                <div style={s.cardFooter}>
                  <span style={{ fontFamily: FONTS.mono, fontSize: 9, color: COLORS.muted, letterSpacing: '0.05em' }}>
                    {ch.dimensions.slice(0, 3).map(d => d.label).join(' · ')}
                  </span>
                  <div style={s.btnGroup}>
                    {ch.status === 'open' && (
                      <button style={s.btnSm(false)}
                        onClick={() => navigate(`/talent?challengeId=${ch.id}`)}
                      >查看参与者</button>
                    )}
                    <button style={s.btnSm(false)}
                      onClick={() => {
                        if (ch.status === 'closing') {
                          dispatch({ type: 'UPDATE_CHALLENGE', payload: { id: ch.id, updates: { status: 'open' } } })
                        }
                      }}
                    >{ch.status === 'closing' ? '发布' : '编辑'}</button>
                    <button style={s.btnSm(true)} onClick={() => navigate('/challenge')}>查看</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )
}
