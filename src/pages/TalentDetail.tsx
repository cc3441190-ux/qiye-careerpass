import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { COLORS, FONTS, SHADOWS, BORDERS, RADIUS } from '../components/design/tokens'
import Modal from '../components/Modal'
import PixelAvatar from '../components/PixelAvatar'
import { calcCapabilityIndex, scoreToGrade } from '../types'
import type { InterviewType } from '../types'

const s = {
  container: { animation: 'fadeIn 0.3s ease-out' } as React.CSSProperties,
  sectionLabel: { fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: COLORS.primary, opacity: 0.45, letterSpacing: '0.15em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 } as React.CSSProperties,
  profileHeader: { background: COLORS.primary, border: BORDERS.standard, borderRadius: RADIUS.card, boxShadow: SHADOWS.darkCard, padding: 40, marginBottom: 24, display: 'flex', gap: 48, alignItems: 'flex-start' } as React.CSSProperties,
  profileName: { fontFamily: FONTS.chinese, fontSize: 28, fontWeight: 700, color: COLORS.textOnDark, marginBottom: 4 } as React.CSSProperties,
  profileMeta: { fontFamily: FONTS.mono, fontSize: 11, color: COLORS.textOnDarkMuted, letterSpacing: '0.1em', marginBottom: 12 } as React.CSSProperties,
  profileRole: { fontFamily: FONTS.chinese, fontSize: 15, color: COLORS.textOnDark, opacity: 0.8, marginBottom: 16 } as React.CSSProperties,
  scoreBadge: { display: 'inline-block', background: COLORS.accent, color: COLORS.textOnDark, border: `1.5px solid ${COLORS.accent}`, borderRadius: RADIUS.tag, padding: '8px 14px', fontFamily: FONTS.mono, fontSize: 15, fontWeight: 700, letterSpacing: '0.05em' } as React.CSSProperties,
  personalityTag: { display: 'inline-block', border: '1.5px solid rgba(250,249,246,0.3)', borderRadius: RADIUS.tag, padding: '4px 8px', fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, color: COLORS.textOnDark, opacity: 0.7, marginRight: 6, marginBottom: 6 } as React.CSSProperties,
  grid2Col: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 } as React.CSSProperties,
  card: { background: COLORS.surface, border: BORDERS.standard, borderRadius: RADIUS.card, boxShadow: SHADOWS.card, padding: 20 } as React.CSSProperties,
  cardHeader: { fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: COLORS.primary, letterSpacing: '0.1em', marginBottom: 16, paddingBottom: 10, borderBottom: BORDERS.medium } as React.CSSProperties,
  skillTag: { display: 'inline-block', border: BORDERS.thick, borderRadius: RADIUS.tag, padding: '4px 8px', background: COLORS.surface, fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.02em', marginRight: 6, marginBottom: 6 } as React.CSSProperties,
  scoreRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${COLORS.divider}` } as React.CSSProperties,
  scoreLabel: { fontFamily: FONTS.chinese, fontSize: 12, color: COLORS.primary } as React.CSSProperties,
  scoreValue: (high: boolean): React.CSSProperties => ({ fontFamily: FONTS.mono, fontSize: 14, fontWeight: 700, color: high ? COLORS.accent : COLORS.primary }),
  timeline: { position: 'relative' as const, paddingLeft: 20 } as React.CSSProperties,
  timelineItem: { position: 'relative' as const, paddingBottom: 20, paddingLeft: 20, borderLeft: `1.5px solid ${COLORS.divider}` } as React.CSSProperties,
  timelineDot: (active: boolean): React.CSSProperties => ({ position: 'absolute' as const, left: -5, top: 4, width: 8, height: 8, borderRadius: '50%', background: active ? COLORS.accent : COLORS.primary, border: `1.5px solid ${active ? COLORS.accent : COLORS.primary}` }),
  timelineDate: { fontFamily: FONTS.mono, fontSize: 9, color: COLORS.muted, letterSpacing: '0.05em', marginBottom: 4 } as React.CSSProperties,
  timelineTitle: { fontFamily: FONTS.chinese, fontSize: 12, fontWeight: 700, color: COLORS.primary, marginBottom: 2 } as React.CSSProperties,
  timelineDesc: { fontFamily: FONTS.chinese, fontSize: 11, color: COLORS.muted } as React.CSSProperties,
  btnGroup: { display: 'flex', gap: 12, marginTop: 24 } as React.CSSProperties,
  btn: (variant: 'primary' | 'secondary' | 'outline'): React.CSSProperties => {
    const isPrimary = variant === 'primary'; const isOutline = variant === 'outline'
    return { flex: 1, height: 52, background: isPrimary ? COLORS.accent : isOutline ? COLORS.bg : COLORS.primary, border: BORDERS.standard, borderRadius: RADIUS.button, color: isOutline ? COLORS.primary : COLORS.textOnDark, fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, letterSpacing: '0.1em', cursor: 'pointer', boxShadow: SHADOWS.button, transition: 'transform 0.1s, box-shadow 0.1s' }
  },
  radarCard: { background: COLORS.primary, border: BORDERS.standard, borderRadius: RADIUS.card, boxShadow: SHADOWS.darkCard, padding: 20, display: 'flex', justifyContent: 'center', alignItems: 'center' } as React.CSSProperties,
  summaryText: { fontFamily: FONTS.chinese, fontSize: 12, color: COLORS.muted, marginTop: 12, lineHeight: 1.6 } as React.CSSProperties,
}

function RadarChart({ scores, size = 260 }: { scores: Record<string, number>, size?: number }) {
  const center = size / 2; const radius = size * 0.32; const dimensions = Object.keys(scores); const count = dimensions.length
  const getPoint = (index: number, value: number) => { const angle = (Math.PI * 2 * index) / count - Math.PI / 2; const r = (value / 100) * radius; return { x: center + r * Math.cos(angle), y: center + r * Math.sin(angle) } }
  const gridPolygons = [1, 2, 3, 4].map(level => Array.from({ length: count }, (_, i) => { const p = getPoint(i, (level / 4) * 100); return `${p.x},${p.y}` }).join(' '))
  const dataPoints = dimensions.map((dim, i) => getPoint(i, scores[dim]))
  const dataPolygon = dataPoints.map(p => `${p.x},${p.y}`).join(' ')
  return (<svg width={size} height={size} style={{ overflow: 'visible' }}>
    {gridPolygons.map((pts, i) => (<polygon key={i} points={pts} fill="none" stroke="#333" strokeWidth="1" />))}
    {dimensions.map((_dim, i) => { const p = getPoint(i, 100); return <line key={`axis-${i}`} x1={center} y1={center} x2={p.x} y2={p.y} stroke="#333" strokeWidth="1" /> })}
    <polygon points={dataPolygon} fill={COLORS.accent} fillOpacity="0.3" stroke={COLORS.accent} strokeWidth="2" style={{ transformOrigin: `${center}px ${center}px`, animation: 'radarIn 0.6s ease-out both' }} />
    {dataPoints.map((p, i) => (<g key={`dp-${i}`}><circle cx={p.x} cy={p.y} r="3.5" fill={COLORS.accent} /><title>{dimensions[i]}: {scores[dimensions[i]]}分</title></g>))}
    {dimensions.map((dim, i) => { const p = getPoint(i, 118); return (<text key={`lbl-${i}`} x={p.x} y={p.y} fill={COLORS.textOnDark} fontSize="9" fontFamily="IBM Plex Mono" textAnchor="middle" dominantBaseline="middle">{dim}</text>) })}
  </svg>)
}

export default function TalentDetail() {
  const { id } = useParams(); const navigate = useNavigate(); const { state, dispatch, addToast } = useApp(); const talent = state.talents.find(t => t.id === id)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduleForm, setScheduleForm] = useState({ date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '14:00', interviewer: '', type: '视频面试' as InterviewType, challengeId: '' })

  const handleQuickSchedule = () => {
    if (!talent || !scheduleForm.date || !scheduleForm.interviewer) return
    dispatch({ type: 'ADD_INTERVIEW', payload: { candidate: `${talent.name} (${talent.id})`, candidateId: talent.id, talentId: talent.id, role: talent.careerLabel, date: scheduleForm.date, time: scheduleForm.time || '待定', type: scheduleForm.type, interviewer: scheduleForm.interviewer, status: '待确认', challengeId: scheduleForm.challengeId || undefined, challengeTitle: scheduleForm.challengeId ? state.challenges.find(c => c.id === scheduleForm.challengeId)?.title : undefined } })
    addToast(`已向 ${talent.name} 发送面试邀请`, 'success'); setScheduleOpen(false)
  }

  if (!talent) return (<div style={{ padding: 40, fontFamily: FONTS.chinese, textAlign: 'center' }}><div style={{ fontSize: 72, marginBottom: 16, opacity: 0.15 }}>——</div><div style={{ fontSize: 18, fontWeight: 700, color: COLORS.primary, marginBottom: 8 }}>未找到该人才</div><button onClick={() => navigate('/talent')} style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, color: COLORS.accent, background: 'transparent', border: 'none', cursor: 'pointer' }}>返回人才库</button></div>)

  const capIdx = calcCapabilityIndex(talent.currentSkills); const grade = scoreToGrade(capIdx); const skillTags = Object.keys(talent.currentSkills)

  return (<div style={s.container}>
    <div style={{ marginBottom: 32 }}><div style={s.sectionLabel}>人才详情<div style={{ flex: 1, height: 1, background: COLORS.divider }} /><span style={{ fontFamily: FONTS.mono, fontSize: 9, color: COLORS.muted, letterSpacing: '0.1em' }}>{talent.cpCode}</span></div></div>
    <div style={s.profileHeader}>
      <PixelAvatar avatarUrl={talent.avatarUrl} fallbackChar={talent.avatar} size={88} />
      <div style={{ flex: 1 }}>
        <div style={s.profileName}>{talent.name}</div>
        <div style={s.profileMeta}>{talent.cpCode} · {talent.verified ? '已认证' : '待认证'}{talent.verifyDate && ` · 验证日期 ${talent.verifyDate}`}{talent.rank && ` · ${talent.rank}`}</div>
        <div style={s.profileRole}>{talent.careerLabel} · 完成 {talent.totalChallenges} 次挑战</div>
        {talent.personalityTags.length > 0 && (<div style={{ marginBottom: 16 }}>{talent.personalityTags.map(tag => (<span key={tag} style={s.personalityTag}>{tag}</span>))}</div>)}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}><span style={s.scoreBadge}>能力指数 {capIdx}</span><span style={{ fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: COLORS.textOnDarkMuted, letterSpacing: '0.05em' }}>通行证 · {grade}</span></div>
        {talent.summary && <div style={s.summaryText}>{talent.summary}</div>}
      </div>
      <div style={s.radarCard}><RadarChart scores={talent.currentSkills} /></div>
    </div>
    <div style={s.grid2Col}>
      <div><div style={s.card}><div style={s.cardHeader}>技能评估 / SKILLS</div>
        <div style={{ marginBottom: 16 }}>{skillTags.map(sk => (<span key={sk} style={s.skillTag}>{sk}</span>))}</div>
        {Object.entries(talent.currentSkills).map(([skill, score]) => (<div key={skill} style={s.scoreRow}><span style={s.scoreLabel}>{skill}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 120, height: 6, background: COLORS.divider, borderRadius: 3, overflow: 'hidden' }}><div style={{ width: `${score}%`, height: '100%', background: score >= 85 ? COLORS.accent : COLORS.primary, borderRadius: 3, transition: 'width 0.5s ease' }} /></div><span style={s.scoreValue(score >= 85)}>{score} · {scoreToGrade(score)}</span></div></div>))}
      </div></div>
      <div><div style={s.card}><div style={s.cardHeader}>成长历程 / HISTORY</div><div style={s.timeline}>
        {talent.challengeHistory.map((item, i) => (<div key={i} style={s.timelineItem}><div style={s.timelineDot(true)} /><div style={s.timelineDate}>{item.date}</div><div style={s.timelineTitle}>{item.title}</div>
          {Object.keys(item.growth).length > 0 && <div style={s.timelineDesc}>{Object.entries(item.growth).map(([k, v]) => `${k} +${v}`).join(' · ')}</div>}</div>))}
      </div></div></div>
    </div>
    {talent.verified && (<div style={{ ...s.card, background: COLORS.primary, color: COLORS.textOnDark, marginBottom: 24 }}><div style={{ ...s.cardHeader, color: COLORS.textOnDark, borderBottomColor: '#333' }}>能力通行证 / CAREER PASS</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}><span style={{ fontFamily: FONTS.mono, fontSize: 18, fontWeight: 700, color: COLORS.accent, letterSpacing: '0.1em' }}>{talent.cpCode}</span><span style={{ fontFamily: FONTS.mono, fontSize: 9, color: COLORS.textOnDarkMuted, letterSpacing: '0.05em' }}>AI 能力通行证 · 基于 {talent.totalChallenges} 次真实挑战评测</span></div></div>)}
    <div style={s.btnGroup}>
      <button style={s.btn('outline')} onClick={() => navigate('/talent')} onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = SHADOWS.buttonPressed }} onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = SHADOWS.button }}>返回列表</button>
      <button style={s.btn('secondary')} onClick={() => setScheduleOpen(true)} onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = SHADOWS.buttonPressed }} onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = SHADOWS.button }}>安排面试</button>
      <button style={s.btn('primary')} onClick={() => alert('Offer 发放流程即将上线')} onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = SHADOWS.buttonPressed }} onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = SHADOWS.button }}>发放 Offer</button>
    </div>
    <Modal isOpen={scheduleOpen} onClose={() => setScheduleOpen(false)} title={talent ? `安排面试 — ${talent.name}` : '安排面试'} width={500} footer={<><button onClick={() => setScheduleOpen(false)} style={{ padding: '10px 20px', fontFamily: FONTS.mono, fontSize: 11, fontWeight: 700, border: BORDERS.standard, borderRadius: 4, cursor: 'pointer', background: COLORS.bg, color: COLORS.primary, letterSpacing: '0.05em' }}>取消</button><button onClick={handleQuickSchedule} style={{ padding: '10px 20px', fontFamily: FONTS.mono, fontSize: 11, fontWeight: 700, border: `2px solid ${COLORS.accent}`, borderRadius: 4, cursor: 'pointer', background: COLORS.accent, color: COLORS.textOnDark, letterSpacing: '0.05em' }}>发送面试邀请</button></>}>
      {talent && (<><div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: 12, background: COLORS.bg, borderRadius: 4, border: BORDERS.standard }}><PixelAvatar avatarUrl={talent.avatarUrl} fallbackChar={talent.avatar} size={36} /><div><div style={{ fontFamily: FONTS.chinese, fontSize: 14, fontWeight: 700, color: COLORS.primary }}>{talent.name}</div><div style={{ fontFamily: FONTS.mono, fontSize: 10, color: COLORS.muted }}>{talent.careerLabel} · 通行证 {grade}</div></div></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div><label style={{ fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, color: COLORS.primary, opacity: 0.6, letterSpacing: '0.1em', marginBottom: 6, display: 'block' }}>面试类型</label><select style={{ width: '100%', padding: '10px 14px', fontFamily: FONTS.chinese, fontSize: 13, color: COLORS.primary, background: COLORS.bg, border: BORDERS.standard, borderRadius: 4, outline: 'none', cursor: 'pointer' }} value={scheduleForm.type} onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value as InterviewType })}><option>视频面试</option><option>现场面试</option><option>电话面试</option></select></div>
          <div><label style={{ fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, color: COLORS.primary, opacity: 0.6, letterSpacing: '0.1em', marginBottom: 6, display: 'block' }}>关联挑战</label><select style={{ width: '100%', padding: '10px 14px', fontFamily: FONTS.chinese, fontSize: 13, color: COLORS.primary, background: COLORS.bg, border: BORDERS.standard, borderRadius: 4, outline: 'none', cursor: 'pointer' }} value={scheduleForm.challengeId} onChange={(e) => setScheduleForm({ ...scheduleForm, challengeId: e.target.value })}><option value="">不关联挑战</option>{state.challenges.filter(c => c.status === 'open').map(c => (<option key={c.id} value={c.id}>{c.id} · {c.title.slice(0, 30)}</option>))}</select></div></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}><div><label style={{ fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, color: COLORS.primary, opacity: 0.6, letterSpacing: '0.1em', marginBottom: 6, display: 'block' }}>日期 *</label><input type="date" style={{ width: '100%', padding: '10px 14px', fontFamily: FONTS.chinese, fontSize: 13, color: COLORS.primary, background: COLORS.bg, border: BORDERS.standard, borderRadius: 4, outline: 'none' }} value={scheduleForm.date} onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })} /></div>
          <div><label style={{ fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, color: COLORS.primary, opacity: 0.6, letterSpacing: '0.1em', marginBottom: 6, display: 'block' }}>时间</label><input type="time" style={{ width: '100%', padding: '10px 14px', fontFamily: FONTS.chinese, fontSize: 13, color: COLORS.primary, background: COLORS.bg, border: BORDERS.standard, borderRadius: 4, outline: 'none' }} value={scheduleForm.time} onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })} /></div></div>
        <div style={{ marginBottom: 16 }}><label style={{ fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, color: COLORS.primary, opacity: 0.6, letterSpacing: '0.1em', marginBottom: 6, display: 'block' }}>面试官 *</label><input style={{ width: '100%', padding: '10px 14px', fontFamily: FONTS.chinese, fontSize: 13, color: COLORS.primary, background: COLORS.bg, border: BORDERS.standard, borderRadius: 4, outline: 'none' }} placeholder="例如：李经理" value={scheduleForm.interviewer} onChange={(e) => setScheduleForm({ ...scheduleForm, interviewer: e.target.value })} /></div></>)}
    </Modal>
    <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes radarIn{from{opacity:0;transform:scale(0)}to{opacity:1;transform:scale(1)}}`}</style>
  </div>)
}
