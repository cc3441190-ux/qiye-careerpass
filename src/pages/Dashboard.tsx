import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { ChallengeIcon, FilterIcon, CalendarIcon, FeedbackIcon } from '../components/Icons'
import { COLORS, FONTS, SHADOWS, BORDERS, RADIUS } from '../components/design/tokens'
import { calcCapabilityIndex, scoreToGrade } from '../types'

const qualityTrend = [45, 48, 52, 55, 58, 62, 60, 65, 68, 72, 70, 75, 78, 80, 76, 82, 85, 88, 84, 90, 87, 92, 89, 94, 91, 95, 93, 96, 94, 98]

function btnPress(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.transform = 'translateY(2px)'
  e.currentTarget.style.boxShadow = SHADOWS.buttonPressed
}
function btnRelease(e: React.MouseEvent<HTMLButtonElement>) {
  e.currentTarget.style.transform = 'translateY(0)'
  e.currentTarget.style.boxShadow = SHADOWS.button
}

const SectionLabel = ({ en, zh }: { en: string; zh: string }) => (
  <div style={{
    fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700,
    color: COLORS.primary, opacity: 0.45, letterSpacing: '0.15em',
    marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8,
  }}>
    {en} / {zh}
    <div style={{ flex: 1, height: 1, background: COLORS.divider }} />
  </div>
)

type LoopStageIcon = 'challenge' | 'filter' | 'calendar' | 'feedback'

interface LoopStage { n: number; label: string; sub: string; path: string; icon: LoopStageIcon; done: boolean; color: string }

const StageIcon = ({ icon, color }: { icon: LoopStageIcon; color: string }) => {
  switch (icon) {
    case 'challenge': return <ChallengeIcon color={color} />
    case 'filter': return <FilterIcon color={color} />
    case 'calendar': return <CalendarIcon color={color} />
    case 'feedback': return <FeedbackIcon color={color} />
  }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { state } = useApp()

  const activeChallenges = state.challenges.filter(c => c.status === 'open').length
  const verifiedTalents = state.talents.filter(t => t.verified)
  const totalTalents = verifiedTalents.length
  const pendingReviews = state.reviews.filter(r => r.status === 'pending')
  const pendingFeedback = state.interviews.filter(i => i.status === '待反馈')
  const nearDeadline = state.challenges.filter(c =>
    c.status === 'open' && c.deadline && (new Date(c.deadline).getTime() - Date.now()) < 3 * 86400000
  )
  const totalAlert = pendingReviews.length + pendingFeedback.length + nearDeadline.length
  const isVerified = state.enterprise?.verifyStatus === 'approved'

  const skillToPeople = new Map<string, { name: string; id: string; avatar: string }[]>()
  state.talents.forEach(t => {
    Object.keys(t.currentSkills).forEach(skill => {
      if (!skillToPeople.has(skill)) skillToPeople.set(skill, [])
      skillToPeople.get(skill)!.push({ name: t.name, id: t.id, avatar: t.avatar })
    })
  })
  const topSkills = [...skillToPeople.entries()].sort((a, b) => b[1].length - a[1].length).slice(0, 6)

  const recentTalents = state.talents.slice(0, 6)
  const offeredCount = state.interviews.filter(i => i.status === '已完成' && i.feedback?.recommendation === 'strong_hire').length
  const feedbackCount = state.interviews.filter(i => i.feedback).length

  const loopStages: LoopStage[] = [
    { n: 1, label: '发布挑战', sub: `${activeChallenges} 活跃`, path: '/challenge/create', icon: 'challenge', done: activeChallenges > 0, color: COLORS.primary },
    { n: 2, label: '能力筛选', sub: `${totalTalents} 认证人才`, path: '/talent', icon: 'filter', done: totalTalents > 0, color: COLORS.accent },
    { n: 3, label: '面试安排', sub: `${state.interviews.length} 场面试`, path: '/interview', icon: 'calendar', done: state.interviews.length > 0, color: '#F57C00' },
    { n: 4, label: '反馈入档', sub: `${feedbackCount} 条反馈`, path: '/interview', icon: 'feedback', done: feedbackCount > 0, color: '#388E3C' },
  ]

  const metrics = [
    { label: '招聘周期', before: '21天', after: '7天', improve: '-67%', desc: '挑战替代简历筛选' },
    { label: '无效面试率', before: '62%', after: '18%', improve: '-71%', desc: '能力画像前置匹配' },
    { label: '人岗匹配度', before: '56%', after: '93%', improve: '+66%', desc: '多维度能力量化' },
    { label: '人均招聘成本', before: '¥8,500', after: '¥2,400', improve: '-72%', desc: 'AI 辅助自动化' },
  ]

  const P = COLORS.primary; const A = COLORS.accent; const S = COLORS.surface; const B = COLORS.bg; const M = COLORS.muted; const W = COLORS.textOnDark; const D = COLORS.divider

  const cardHover = (e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = SHADOWS.hover }
  const cardLeave = (e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = SHADOWS.card }
  const darkHover = (e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.12), 5px 5px 0px #1A1A1A, 5px 5px 0px #FF4D00' }
  const darkLeave = (e: React.MouseEvent<HTMLDivElement>) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = SHADOWS.darkCard }

  return (
    <div style={{ animation: 'fadeIn 0.35s ease-out' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, gap: 24 }}>
        <div>
          <SectionLabel en="DASHBOARD" zh="数据概览" />
          <h1 style={{ fontFamily: FONTS.mono, fontSize: 34, fontWeight: 700, color: P, margin: '0 0 6px', lineHeight: 1.15 }}>企业控制台</h1>
          <p style={{ fontFamily: FONTS.chinese, fontSize: 14, color: M, margin: 0 }}>能力数据驱动的全流程招聘闭环 · 挑战 → 筛选 → 面试 → 反馈</p>
        </div>
        <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
          {[
            { label: '发布新挑战', style: 'accent' as const, path: '/challenge/create' },
            { label: '查看人才库', style: 'primary' as const, path: '/talent' },
            { label: '邀请团队', style: 'outline' as const, path: '/settings' },
          ].map((btn, i) => (
            <button key={i} onClick={() => navigate(btn.path)} onMouseDown={btnPress} onMouseUp={btnRelease} onMouseLeave={btnRelease}
              style={{ height: 48, padding: '0 22px', background: btn.style === 'accent' ? A : btn.style === 'primary' ? P : S, border: BORDERS.standard, borderRadius: RADIUS.button, color: btn.style === 'outline' ? P : W, fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer', boxShadow: SHADOWS.button, transition: 'transform 0.1s, box-shadow 0.1s', whiteSpace: 'nowrap' }}
            >{btn.label}</button>
          ))}
        </div>
      </header>

      {!isVerified && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', marginBottom: 20, background: '#FFF8E1', border: `2px solid ${COLORS.warning}`, borderRadius: RADIUS.card }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: COLORS.warning, letterSpacing: '0.08em', flexShrink: 0 }}>! PENDING</span>
          <div style={{ flex: 1 }}><div style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 700, color: COLORS.warning, letterSpacing: '0.05em', marginBottom: 2 }}>ENTERPRISE NOT VERIFIED</div>
            <div style={{ fontFamily: FONTS.chinese, fontSize: 13, color: COLORS.primary }}>你的企业尚未完成身份认证，完成认证后可解锁全部招聘功能</div></div>
          <button onClick={() => navigate('/enterprise-verify')} style={{ height: 36, padding: '0 16px', background: COLORS.warning, border: BORDERS.standard, borderRadius: RADIUS.button, color: W, fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', cursor: 'pointer', whiteSpace: 'nowrap', boxShadow: SHADOWS.button }} onMouseDown={btnPress} onMouseUp={btnRelease} onMouseLeave={btnRelease}>立即认证 →</button>
        </div>
      )}

      {/* 4 阶段闭环 */}
      <div style={{ background: P, border: BORDERS.standard, borderRadius: RADIUS.card, boxShadow: SHADOWS.darkCard, padding: '28px 32px 24px', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <div><div style={{ fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: W, opacity: 0.4, letterSpacing: '0.15em', marginBottom: 6 }}>RECRUITMENT CLOSED LOOP / 全流程闭环</div>
            <div style={{ fontFamily: FONTS.chinese, fontSize: 13, color: W, opacity: 0.55 }}>从挑战发布到反馈入档，形成人才数据持续飞轮</div></div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', border: `1.5px solid ${A}`, borderRadius: RADIUS.tag, fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, color: A }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: A, animation: 'livePulse 2s ease-in-out infinite' }} />LIVE</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 0, borderRadius: RADIUS.card, overflow: 'hidden', border: '1.5px solid #444' }}>
          {loopStages.map((stage, i) => {
            const isLast = i === loopStages.length - 1
            const bg = stage.done ? '#2A2A2A' : '#1E1E1E'
            const bc = stage.done ? stage.color : '#444'
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div onClick={() => navigate(stage.path)} style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 14, padding: '20px 18px', background: bg, borderLeft: i === 0 ? 'none' : `1.5px solid ${bc}`, borderTop: stage.done ? `3px solid ${stage.color}` : '3px solid transparent', cursor: 'pointer', transition: 'all 0.2s', minHeight: 88 }}
                  onMouseEnter={e => { e.currentTarget.style.background = stage.done ? '#333' : '#252525' }} onMouseLeave={e => { e.currentTarget.style.background = bg }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: stage.done ? stage.color : 'transparent', border: stage.done ? `2px solid ${stage.color}` : '2px solid #555' }}>
                    <StageIcon icon={stage.icon} color={stage.done ? '#FAF9F6' : '#666'} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: stage.done ? 'rgba(250,249,246,0.8)' : '#888', letterSpacing: '0.1em', marginBottom: 3 }}>STAGE {String(stage.n).padStart(2, '0')}</div>
                    <div style={{ fontFamily: FONTS.chinese, fontSize: 14, fontWeight: 700, color: stage.done ? 'rgba(250,249,246,0.95)' : '#888', marginBottom: 3 }}>{stage.label}</div>
                    <div style={{ fontFamily: FONTS.mono, fontSize: 10, color: stage.done ? 'rgba(250,249,246,0.45)' : '#666' }}>{stage.sub}</div>
                  </div>
                </div>
                {!isLast && <div style={{ width: 0, height: 0, borderTop: '8px solid transparent', borderBottom: '8px solid transparent', borderLeft: `10px solid ${bc}`, flexShrink: 0, margin: '0 -1px', position: 'relative', zIndex: 1 }} />}
              </div>
            )})}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 16, gap: 10 }}>
          <svg width="20" height="20" viewBox="0 0 20 20"><path d="M16 10c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6c1.8 0 3.4.8 4.5 2" fill="none" stroke={A} strokeWidth="2" /><polyline points="14,5 16,3 18,5" fill="none" stroke={A} strokeWidth="2" /></svg>
          <span style={{ fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, color: A, letterSpacing: '0.08em' }}>面试反馈自动更新人才能力档案 · 下一轮挑战更高精度匹配</span>
        </div>
      </div>

      {/* 效果指标 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {metrics.map((m, i) => (
          <div key={i} style={{ background: S, border: BORDERS.standard, borderRadius: RADIUS.card, boxShadow: SHADOWS.card, padding: '18px 20px', transition: 'all 0.2s', cursor: 'default' }} onMouseEnter={cardHover} onMouseLeave={cardLeave}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, color: M, letterSpacing: '0.1em', marginBottom: 10 }}>{m.label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}><span style={{ fontFamily: FONTS.mono, fontSize: 28, fontWeight: 700, color: P }}>{m.after}</span>
              <span style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, color: '#388E3C', background: '#E8F5E9', padding: '2px 8px', borderRadius: RADIUS.tag }}>{m.improve}</span></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontFamily: FONTS.mono, fontSize: 10, color: M, textDecoration: 'line-through' }}>{m.label} {m.before}</span>
              <span style={{ fontFamily: FONTS.chinese, fontSize: 10, color: A }}>{m.desc}</span></div>
          </div>))}
      </div>

      {totalAlert > 0 && (
        <div style={{ marginBottom: 24, padding: '14px 20px', background: '#FFF7F3', border: BORDERS.accent, borderRadius: RADIUS.card, display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: A, letterSpacing: '0.08em', flexShrink: 0 }}>! PENDING</span>
          <div style={{ display: 'flex', gap: 6, flex: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            {pendingReviews.length > 0 && <span onClick={() => navigate('/challenge/review')} style={alertTag}>{pendingReviews.length} 项待审核</span>}
            {pendingFeedback.length > 0 && <span onClick={() => navigate('/interview')} style={alertTag}>{pendingFeedback.length} 场待反馈</span>}
            {nearDeadline.length > 0 && <span onClick={() => navigate('/challenge')} style={alertTag}>{nearDeadline.length} 个即将截止</span>}
          </div>
          <span style={{ fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, color: A }}>{totalAlert} 项待办</span>
        </div>)}

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'ACTIVE / 活跃挑战', value: activeChallenges, sub: `${state.talents.length} 人参与`, dark: true, path: '/challenge' },
          { label: 'VERIFIED / 已评人才', value: totalTalents, sub: `${state.reviews.length} 次审核`, dark: false, path: '/talent' },
          { label: 'PASSED / 已发通行证', value: totalTalents, sub: 'AI 能力认证', dark: true, path: '/verify' },
          { label: 'OFFER / 发放数量', value: offeredCount, sub: `${activeChallenges} 挑战进行中`, dark: false, path: '/interview' },
        ].map((st, i) => st.dark ? (
          <div key={i} style={{ background: P, border: BORDERS.standard, borderRadius: RADIUS.card, boxShadow: SHADOWS.darkCard, padding: '20px 22px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={darkHover} onMouseLeave={darkLeave} onClick={() => navigate(st.path)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: A, flexShrink: 0 }} /><span style={{ fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, color: W, opacity: 0.5, letterSpacing: '0.15em' }}>{st.label}</span></div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 38, fontWeight: 700, color: W, lineHeight: 1, marginBottom: 6 }}>{st.value}</div>
            <div style={{ fontFamily: FONTS.chinese, fontSize: 12, color: W, opacity: 0.6 }}>{st.sub}</div>
          </div>) : (
          <div key={i} style={{ background: S, border: BORDERS.standard, borderRadius: RADIUS.card, boxShadow: SHADOWS.card, padding: '20px 22px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={cardHover} onMouseLeave={cardLeave} onClick={() => navigate(st.path)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: P, flexShrink: 0 }} /><span style={{ fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, color: M, letterSpacing: '0.15em' }}>{st.label}</span></div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 38, fontWeight: 700, color: P, lineHeight: 1, marginBottom: 6 }}>{st.value}</div>
            <div style={{ fontFamily: FONTS.chinese, fontSize: 12, color: M }}>{st.sub}</div>
          </div>))}
      </div>

      {/* Main grid 3:2 */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: S, border: BORDERS.standard, borderRadius: RADIUS.card, boxShadow: SHADOWS.card }}>
            <div style={{ background: P, padding: '10px 18px', borderBottom: BORDERS.standard, borderRadius: '4px 4px 0 0', fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: W, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}><span>RECENT EVALS / 最近评估</span>
              <span style={{ fontSize: 9, opacity: 0.5, cursor: 'pointer' }} onClick={() => navigate('/talent')}>查看全部 →</span></div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONTS.mono, fontSize: 12 }}>
              <thead><tr>
                <th style={thStyle('#FFF')}>候选人</th><th style={thStyle('#FFF')}>核心技能</th><th style={{ ...thStyle('#FFF'), textAlign: 'right' }}>能力指数</th>
              </tr></thead>
              <tbody>
                {recentTalents.map((t, i) => {
                  const capIdx = calcCapabilityIndex(t.currentSkills)
                  const grade = scoreToGrade(capIdx)
                  return (<tr key={t.id} style={{ borderBottom: i < recentTalents.length - 1 ? `1px solid ${D}` : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                    onClick={() => navigate(`/talent/${t.id}`)} onMouseEnter={e => { e.currentTarget.style.background = B }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}>
                    <td style={tdStyle}><div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ width: 32, height: 32, borderRadius: RADIUS.avatar, background: P, color: W, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONTS.mono, fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{t.avatar}</span>
                      <div><div style={{ fontWeight: 700, fontFamily: FONTS.chinese, fontSize: 13, color: P }}>{t.name}</div>
                        <div style={{ fontSize: 10, color: M, fontFamily: FONTS.chinese }}>{t.careerLabel}</div></div>
                    </div></td>
                    <td style={tdStyle}><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {Object.keys(t.currentSkills).slice(0, 3).map(s => (
                        <span key={s} style={{ display: 'inline-block', padding: '2px 8px', border: BORDERS.thick, borderRadius: RADIUS.tag, fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, background: B, color: P }}>{s}</span>))}
                    </div></td>
                    <td style={{ ...tdStyle, textAlign: 'right' }}><span style={{ display: 'inline-block', border: BORDERS.thick, borderRadius: RADIUS.tag, padding: '4px 10px', background: capIdx >= 85 ? A : P, color: W, fontFamily: FONTS.mono, fontSize: 11, fontWeight: 700 }}>{capIdx} · {grade}</span></td>
                  </tr>)
                })}
              </tbody>
            </table>
          </div>
          <div style={{ background: S, border: BORDERS.standard, borderRadius: RADIUS.card, boxShadow: SHADOWS.card, padding: '20px 24px' }}>
            <SectionLabel en="FUNNEL" zh="招聘漏斗" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              {(() => {
                const stages = [{ label: '挑战参与', value: state.talents.length + 200 }, { label: '完成挑战', value: state.reviews.length + 50 }, { label: '筛选通过', value: totalTalents }, { label: '进入面试', value: state.interviews.length }, { label: '发放 Offer', value: offeredCount }, { label: '确认入职', value: Math.round(offeredCount * 0.7) }]
                const maxVal = Math.max(...stages.map(s => s.value), 1)
                const barColors = [P, P, A, '#F57C00', '#388E3C', '#2E7D32']
                return stages.map((item, i) => {
                  const pct = Math.round((item.value / maxVal) * 100)
                  return (<div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 80, flexShrink: 0, fontFamily: FONTS.chinese, fontSize: 12, fontWeight: 600, color: P, textAlign: 'right' }}>{item.label}</div>
                    <div style={{ flex: 1, height: 26, background: D, borderRadius: 2, position: 'relative', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', borderRadius: 2, background: barColors[i], transition: 'width 0.6s cubic-bezier(0.22, 1, 0.36, 1)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: pct > 15 ? 8 : 0 }}>
                        {pct > 15 && <span style={{ fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: W }}>{item.value}</span>}</div>
                      {pct <= 15 && <span style={{ position: 'absolute', left: 'calc(100% + 8px)', top: '50%', transform: 'translateY(-50%)', fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: P }}>{item.value}</span>}
                    </div></div>)
                })})()}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ background: S, border: BORDERS.standard, borderRadius: RADIUS.card, boxShadow: SHADOWS.card, padding: '20px 24px' }}>
            <SectionLabel en="SKILL MAP" zh="技能人才图谱" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              {topSkills.map(([skill, people]) => (
                <div key={skill} style={{ padding: '10px 14px', background: B, border: BORDERS.standard, borderRadius: RADIUS.card, transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = A; e.currentTarget.style.background = '#FFF7F3' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = P; e.currentTarget.style.background = B }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: people.length * 4 + 8, height: 8, background: A, borderRadius: 2, opacity: 0.3 + (people.length / 12) * 0.7 }} />
                      <span style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, color: P }}>{skill}</span></div>
                    <span style={{ fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: M }}>×{people.length}</span></div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {people.slice(0, 5).map(p => (
                      <span key={p.id} onClick={(e) => { e.stopPropagation(); navigate(`/talent/${p.id}`) }} title={p.name}
                        style={{ width: 28, height: 28, borderRadius: 2, background: P, color: W, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, cursor: 'pointer' }}
                        onMouseEnter={e => { e.currentTarget.style.background = A }} onMouseLeave={e => { e.currentTarget.style.background = P }}>{p.avatar}</span>))}
                    {people.length > 5 && <span style={{ width: 28, height: 28, borderRadius: 2, background: D, color: M, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700 }}>+{people.length - 5}</span>}
                  </div></div>))}
            </div>
          </div>
          <div style={{ background: S, border: BORDERS.standard, borderRadius: RADIUS.card, boxShadow: SHADOWS.card, padding: '20px 24px' }}>
            <SectionLabel en="QUALITY TREND" zh="近30天质量趋势" />
            <div style={{ marginTop: 8 }}><div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
              <span style={{ fontFamily: FONTS.mono, fontSize: 36, fontWeight: 700, color: P }}>{qualityTrend[29]}%</span>
              <span style={{ fontFamily: FONTS.mono, fontSize: 11, fontWeight: 700, color: qualityTrend[29] > qualityTrend[0] ? '#4CAF50' : A }}>{qualityTrend[29] > qualityTrend[0] ? '↑' : '↓'} {Math.abs(qualityTrend[29] - qualityTrend[0])}%</span>
              <span style={{ fontFamily: FONTS.chinese, fontSize: 11, color: M }}>vs 30天前</span></div>
              <div style={{ height: 160, display: 'flex', alignItems: 'flex-end', gap: 2, borderBottom: BORDERS.standard, paddingBottom: 4 }}>
                {qualityTrend.map((h, i) => (<div key={i} style={{ flex: 1, height: `${(h / 100) * 100}%`, background: h > 85 ? A : h > 70 ? P : D, borderRadius: '2px 2px 0 0', transition: 'opacity 0.2s', cursor: 'pointer' }} title={`Day ${i + 1}: ${h}%`} onMouseEnter={e => { e.currentTarget.style.opacity = '0.7' }} onMouseLeave={e => { e.currentTarget.style.opacity = '1' }} />))}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontFamily: FONTS.mono, fontSize: 9, color: M }}><span>30 DAYS AGO</span><span>TODAY</span></div>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes livePulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>)
}

const alertTag: React.CSSProperties = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: COLORS.accent, background: COLORS.surface, border: BORDERS.thick, borderRadius: RADIUS.tag, cursor: 'pointer', letterSpacing: '0.04em', transition: 'all 0.15s' }
const thStyle = (color: string): React.CSSProperties => ({ background: COLORS.primary, color, padding: '10px 16px', textAlign: 'left' as const, fontWeight: 700, fontSize: 9, letterSpacing: '0.1em', borderRight: '1px solid #333', fontFamily: FONTS.mono })
const tdStyle: React.CSSProperties = { padding: '12px 16px', fontFamily: FONTS.mono, fontSize: 12, color: COLORS.primary }
