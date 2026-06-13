import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { COLORS, FONTS, SHADOWS, BORDERS, RADIUS } from '../components/design/tokens'
import Modal from '../components/Modal'
import PixelAvatar from '../components/PixelAvatar'
import { calcCapabilityIndex, scoreToGrade, scoreToValue } from '../types'
import type { Talent, Challenge, InterviewType } from '../types'

type ViewModeVal = 'card' | 'list' | 'compare'

const s = {
  container: { animation: 'fadeIn 0.3s ease-out' } as React.CSSProperties,
  sectionLabel: { fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: COLORS.primary, opacity: 0.45, letterSpacing: '0.15em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 } as React.CSSProperties,
  searchBar: { background: COLORS.surface, border: BORDERS.standard, borderRadius: RADIUS.card, boxShadow: SHADOWS.card, padding: 4, display: 'flex', marginBottom: 20 } as React.CSSProperties,
  searchInput: { flex: 1, padding: '12px 16px', fontFamily: FONTS.chinese, fontSize: 14, color: COLORS.primary, background: 'transparent', border: 'none', outline: 'none' } as React.CSSProperties,
  filterBar: { display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' as const } as React.CSSProperties,
  filterTag: (active: boolean): React.CSSProperties => ({ padding: '8px 16px', fontFamily: FONTS.mono, fontSize: 11, fontWeight: 700, color: active ? COLORS.textOnDark : COLORS.primary, background: active ? COLORS.accent : COLORS.surface, border: active ? BORDERS.accent : BORDERS.standard, borderRadius: 4, cursor: 'pointer', outline: 'none', letterSpacing: '0.05em', transition: 'all 0.2s' }),
  challengeFilterBar: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' as const, alignItems: 'center' } as React.CSSProperties,
  challengeFilterLabel: { fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: COLORS.muted, letterSpacing: '0.1em', marginRight: 4 } as React.CSSProperties,
  challengeFilterTag: (active: boolean): React.CSSProperties => ({ padding: '6px 14px', fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: active ? COLORS.textOnDark : COLORS.primary, background: active ? COLORS.accent : COLORS.bg, border: active ? BORDERS.accent : BORDERS.thick, borderRadius: RADIUS.tag, cursor: 'pointer', outline: 'none', letterSpacing: '0.04em', transition: 'all 0.15s' }),
  levelTag: (active: boolean): React.CSSProperties => ({ padding: '6px 12px', fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: active ? COLORS.textOnDark : COLORS.primary, background: active ? COLORS.accent : COLORS.surface, border: active ? `1.5px solid ${COLORS.accent}` : `1.5px solid ${COLORS.divider}`, borderRadius: RADIUS.tag, cursor: 'pointer', outline: 'none', letterSpacing: '0.05em', transition: 'all 0.2s' }),
  levelBar: { display: 'flex', gap: 8, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' as const } as React.CSSProperties,
  levelLabel: { fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: COLORS.primary, letterSpacing: '0.1em', marginRight: 4 } as React.CSSProperties,
  sortBar: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' as const } as React.CSSProperties,
  sortLabel: { fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: COLORS.primary, letterSpacing: '0.1em' } as React.CSSProperties,
  sortSelect: { padding: '6px 12px', fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: COLORS.primary, background: COLORS.surface, border: BORDERS.standard, borderRadius: 4, cursor: 'pointer', outline: 'none' } as React.CSSProperties,
  talentGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 } as React.CSSProperties,
  talentCard: { background: COLORS.surface, border: BORDERS.standard, borderRadius: RADIUS.card, boxShadow: SHADOWS.card, padding: 20, cursor: 'pointer', transition: 'all 0.2s' } as React.CSSProperties,
  talentHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 } as React.CSSProperties,
  score: { fontFamily: FONTS.mono, fontSize: 18, fontWeight: 700, color: COLORS.accent } as React.CSSProperties,
  name: { fontFamily: FONTS.chinese, fontSize: 16, fontWeight: 700, color: COLORS.primary, marginBottom: 4 } as React.CSSProperties,
  role: { fontFamily: FONTS.chinese, fontSize: 12, color: COLORS.muted, marginBottom: 12 } as React.CSSProperties,
  skillTag: { display: 'inline-block', border: BORDERS.thick, borderRadius: RADIUS.tag, padding: '3px 6px', background: COLORS.bg, fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, letterSpacing: '0.02em', marginRight: 4, marginBottom: 4 } as React.CSSProperties,
  verifiedBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', background: COLORS.primary, color: COLORS.textOnDark, fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, borderRadius: RADIUS.tag, letterSpacing: '0.05em' } as React.CSSProperties,
  emptyState: { textAlign: 'center' as const, padding: '60px 20px', background: COLORS.surface, border: BORDERS.standard, borderRadius: RADIUS.card, boxShadow: SHADOWS.card } as React.CSSProperties,
  listView: { background: COLORS.surface, border: BORDERS.standard, borderRadius: RADIUS.card, boxShadow: SHADOWS.card, overflowX: 'auto' as const } as React.CSSProperties,
  compareView: { background: COLORS.surface, border: BORDERS.standard, borderRadius: RADIUS.card, boxShadow: SHADOWS.card, padding: 20 } as React.CSSProperties,
  matchBadge: { display: 'inline-block', padding: '2px 8px', background: COLORS.accent, color: COLORS.textOnDark, fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, borderRadius: RADIUS.tag, marginLeft: 8 } as React.CSSProperties,
  interviewBtn: { width: '100%', marginTop: 12, padding: '8px 0', background: COLORS.accent, border: BORDERS.standard, borderRadius: RADIUS.button, color: COLORS.textOnDark, fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.08), 2px 2px 0px #1A1A1A', transition: 'transform 0.1s, box-shadow 0.1s' } as React.CSSProperties,
}

const careerFilters = ['全部', '产品经理', '设计师', '数据分析', '技术开发']
const levelFilters = ['全部等级', 'S', 'A+', 'A', 'B+', 'B', 'C+', 'C']

function calcMatchScore(talent: Talent, challenge: Challenge): number {
  if (!challenge.dimensions || challenge.dimensions.length === 0) return 0
  let totalScore = 0; let totalWeight = 0
  challenge.dimensions.forEach(dim => {
    const weight = dim.weight; totalWeight += weight
    const talentScore = talent.currentSkills[dim.label]
    totalScore += weight * (talentScore !== undefined ? talentScore / 100 : 0.7)
  })
  return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) : 0
}

const careerToFilter: Record<string, string> = { '产品经理': 'product', '设计师': 'design', '数据分析': 'data', '技术开发': 'tech' }

export default function TalentSearch() {
  const navigate = useNavigate(); const [searchParams] = useSearchParams(); const { state, dispatch, addToast } = useApp()
  const challengeIdFromUrl = searchParams.get('challengeId') || ''
  const [activeFilter, setActiveFilter] = useState('全部')
  const [activeLevel, setActiveLevel] = useState('全部等级')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewModeVal>('card')
  const [sortBy, setSortBy] = useState('capability')
  const [matchChallengeId, setMatchChallengeId] = useState(challengeIdFromUrl)
  const [compareList, setCompareList] = useState<string[]>([])
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [scheduleTarget, setScheduleTarget] = useState<Talent | null>(null)
  const [scheduleForm, setScheduleForm] = useState({ date: '', time: '', interviewer: '', type: '视频面试' as InterviewType, challengeId: challengeIdFromUrl })

  const activeChallenges = state.challenges.filter(c => c.status === 'open')
  const matchChallenge = matchChallengeId ? state.challenges.find(c => c.id === matchChallengeId) : null

  const filtered = useMemo(() => {
    let result = [...state.talents]
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(t => t.name.includes(searchQuery) || t.id.toLowerCase().includes(q) || t.careerLabel.includes(searchQuery) || Object.keys(t.currentSkills).some(s => s.includes(searchQuery)))
    }
    const targetCareer = careerToFilter[activeFilter]
    if (targetCareer) result = result.filter(t => t.primaryCareer === targetCareer)
    if (activeLevel !== '全部等级') result = result.filter(t => scoreToGrade(calcCapabilityIndex(t.currentSkills)) === activeLevel)
    if (matchChallenge) {
      result.forEach(t => { (t as any).matchScore = calcMatchScore(t, matchChallenge) })
      result.sort((a, b) => ((b as any).matchScore || 0) - ((a as any).matchScore || 0))
    } else if (sortBy === 'recent') {
      result.sort((a, b) => b.date.localeCompare(a.date))
    } else {
      result.sort((a, b) => calcCapabilityIndex(b.currentSkills) - calcCapabilityIndex(a.currentSkills))
    }
    return result
  }, [state.talents, searchQuery, activeFilter, activeLevel, sortBy, matchChallengeId, matchChallenge])

  const openScheduleModal = (talent: Talent, e: React.MouseEvent) => {
    e.stopPropagation(); setScheduleTarget(talent)
    setScheduleForm({ date: new Date(Date.now() + 86400000).toISOString().split('T')[0], time: '14:00', interviewer: '', type: '视频面试', challengeId: matchChallengeId })
    setScheduleModalOpen(true)
  }

  const handleQuickSchedule = () => {
    if (!scheduleTarget || !scheduleForm.date || !scheduleForm.interviewer) return
    dispatch({ type: 'ADD_INTERVIEW', payload: { candidate: `${scheduleTarget.name} (${scheduleTarget.id})`, candidateId: scheduleTarget.id, talentId: scheduleTarget.id, role: scheduleTarget.careerLabel, date: scheduleForm.date, time: scheduleForm.time || '待定', type: scheduleForm.type, interviewer: scheduleForm.interviewer, status: '待确认', challengeId: scheduleForm.challengeId || undefined, challengeTitle: scheduleForm.challengeId ? state.challenges.find(c => c.id === scheduleForm.challengeId)?.title : undefined } })
    addToast(`已向 ${scheduleTarget.name} 发送面试邀请`, 'success'); setScheduleModalOpen(false)
  }

  return (<div style={s.container}>
    <div style={{ marginBottom: 32 }}><div style={s.sectionLabel}>人才搜索<div style={{ flex: 1, height: 1, background: COLORS.divider }} /></div>
      <h1 style={{ fontFamily: FONTS.mono, fontSize: 32, fontWeight: 700, color: COLORS.primary, marginBottom: 8 }}>人才库</h1>
      <p style={{ fontFamily: FONTS.chinese, fontSize: 14, color: COLORS.muted }}>{matchChallenge ? `正在按「${matchChallenge.title.slice(0, 30)}」匹配度排序 · ${filtered.length} 位候选人` : '搜索和筛选通过 CareerPass 认证的优秀人才'}</p></div>
    <div style={s.searchBar}><input type="text" placeholder="搜索人才姓名、ID、技能..." style={s.searchInput} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
    {activeChallenges.length > 0 && (<div style={s.challengeFilterBar}><span style={s.challengeFilterLabel}>按挑战筛选：</span>
      <span onClick={() => { setMatchChallengeId(''); navigate('/talent') }} style={s.challengeFilterTag(!matchChallengeId)}>全部人才</span>
      {activeChallenges.map(ch => (<span key={ch.id} onClick={() => setMatchChallengeId(ch.id)} style={s.challengeFilterTag(matchChallengeId === ch.id)}>{ch.id} · {ch.title.length > 24 ? ch.title.slice(0, 24) + '…' : ch.title}</span>))}</div>)}
    <div style={s.filterBar}>{careerFilters.map((f) => (<span key={f} onClick={() => setActiveFilter(f)} style={s.filterTag(activeFilter === f)}>{f}</span>))}</div>
    <div style={s.levelBar}><span style={s.levelLabel}>通行证等级:</span>{levelFilters.map((l) => (<span key={l} onClick={() => setActiveLevel(l)} style={s.levelTag(activeLevel === l)}>{l}</span>))}</div>
    <div style={{ ...s.sortBar, justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><span style={s.sortLabel}>排序方式:</span>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={s.sortSelect}><option value="capability">能力指数</option><option value="recent">最近活跃</option></select></div>
      <div style={{ display: 'flex', gap: 4 }}>{(['card', 'list', 'compare'] as ViewModeVal[]).map(mode => (<button key={mode} onClick={() => setViewMode(mode)} style={{ padding: '6px 12px', fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, border: viewMode === mode ? BORDERS.accent : `1.5px solid ${COLORS.divider}`, borderRadius: RADIUS.tag, background: viewMode === mode ? COLORS.accent : COLORS.surface, color: viewMode === mode ? COLORS.textOnDark : COLORS.primary, cursor: 'pointer', letterSpacing: '0.05em' }}>{mode === 'card' ? '卡片' : mode === 'list' ? '列表' : '对比'}</button>))}</div></div>

    {filtered.length === 0 ? (<div style={s.emptyState}><div style={{ fontSize: 72, marginBottom: 16, opacity: 0.15 }}>——</div><div style={{ fontFamily: FONTS.chinese, fontSize: 18, fontWeight: 700, color: COLORS.primary, marginBottom: 8 }}>未找到匹配的人才</div><div style={{ fontFamily: FONTS.chinese, fontSize: 14, color: COLORS.muted, marginBottom: 20 }}>{state.talents.length === 0 ? '还没有候选人完成挑战？' : '请尝试调整筛选条件或关键词'}</div>{state.talents.length === 0 && <button style={{ padding: '10px 20px', background: COLORS.accent, border: BORDERS.standard, borderRadius: RADIUS.button, color: COLORS.textOnDark, fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.1em' }} onClick={() => navigate('/challenge/create')}>发布第一个挑战</button>}</div>)
      : viewMode === 'card' ? (<div style={s.talentGrid}>{filtered.map((talent) => {
        const capIdx = calcCapabilityIndex(talent.currentSkills); const grade = scoreToGrade(capIdx); const matchScore = (talent as any).matchScore as number | undefined
        return (<div key={talent.id} style={s.talentCard} onClick={() => navigate(`/talent/${talent.id}`)}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = SHADOWS.hover }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = SHADOWS.card }}>
          <div style={s.talentHeader}>
            <PixelAvatar avatarUrl={talent.avatarUrl} fallbackChar={talent.avatar} size={40} />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              {matchScore !== undefined ? (<span style={s.matchBadge}>匹配 {matchScore}%</span>) : (<span style={s.score}>{grade}</span>)}</div></div>
          <div style={s.name}>{talent.name}</div><div style={s.role}>{talent.careerLabel} · {talent.rank}</div>
          <div style={{ marginBottom: 12 }}>{Object.keys(talent.currentSkills).map(sk => (<span key={sk} style={s.skillTag}>{sk}</span>))}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {talent.verified ? (<span style={s.verifiedBadge}>已认证</span>) : (<span style={{ ...s.verifiedBadge, background: COLORS.muted }}>待认证</span>)}
            <span style={{ fontFamily: FONTS.mono, fontSize: 9, color: COLORS.muted }}>{talent.date}</span></div>
          <button style={s.interviewBtn} onClick={(e) => openScheduleModal(talent, e)}
            onMouseDown={(e) => { e.stopPropagation(); e.currentTarget.style.transform = 'translateY(1px)'; e.currentTarget.style.boxShadow = '0 0px 1px rgba(0,0,0,0.08), 1px 1px 0px #1A1A1A' }}
            onMouseUp={(e) => { e.stopPropagation(); e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.08), 2px 2px 0px #1A1A1A' }}>约面试</button>
        </div>)})}</div>)
        : viewMode === 'list' ? (<div style={s.listView}><table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: FONTS.mono, fontSize: 12 }}>
          <thead><tr>{['姓名', '职业', '等级', '核心技能', '日期', '状态', ''].map(h => (<th key={h} style={{ background: COLORS.primary, color: COLORS.textOnDark, padding: '10px 12px', textAlign: 'left', fontWeight: 700, fontSize: 9, letterSpacing: '0.1em' }}>{h}</th>))}</tr></thead>
          <tbody>{filtered.map(talent => {
            const grade = scoreToGrade(calcCapabilityIndex(talent.currentSkills))
            return (<tr key={talent.id} style={{ borderBottom: `1px solid ${COLORS.divider}`, cursor: 'pointer' }} onClick={() => navigate(`/talent/${talent.id}`)}>
              <td style={{ padding: '10px 12px', fontWeight: 700 }}>{talent.name}</td><td style={{ padding: '10px 12px' }}>{talent.careerLabel}</td>
              <td style={{ padding: '10px 12px' }}><span style={{ display: 'inline-block', border: BORDERS.thick, borderRadius: RADIUS.tag, padding: '3px 6px', background: grade.startsWith('A') || grade === 'S' ? COLORS.accent : COLORS.surface, color: grade.startsWith('A') || grade === 'S' ? COLORS.textOnDark : COLORS.primary, fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700 }}>{grade}</span></td>
              <td style={{ padding: '10px 12px' }}>{Object.keys(talent.currentSkills).slice(0, 3).join(', ')}</td>
              <td style={{ padding: '10px 12px', fontFamily: FONTS.mono, fontSize: 10, color: COLORS.muted }}>{talent.date}</td>
              <td style={{ padding: '10px 12px' }}>{talent.verified ? '已认证' : '待认证'}</td>
              <td style={{ padding: '10px 12px' }}><button style={{ padding: '4px 10px', background: COLORS.accent, border: 'none', borderRadius: 2, color: '#fff', fontFamily: FONTS.mono, fontSize: 9, cursor: 'pointer' }} onClick={(e) => openScheduleModal(talent, e)}>约面试</button></td>
            </tr>)})}</tbody></table></div>)
          : (<div style={s.compareView}><div style={{ marginBottom: 16, fontFamily: FONTS.mono, fontSize: 10, color: COLORS.muted }}>已选择 {compareList.length}/3 位候选人进行对比（点击卡片添加）</div>
            <div style={{ display: 'flex', gap: 16 }}>{compareList.map(id => {
              const talent = state.talents.find(t => t.id === id); if (!talent) return null
              return (<div key={id} style={{ flex: 1, border: BORDERS.standard, borderRadius: RADIUS.card, padding: 20 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4, fontFamily: FONTS.chinese }}>{talent.name}</div>
                <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 12, fontFamily: FONTS.chinese }}>{talent.careerLabel}</div>
                <div style={{ fontFamily: FONTS.mono, fontSize: 20, color: COLORS.accent, fontWeight: 700, marginBottom: 12 }}>{scoreToGrade(calcCapabilityIndex(talent.currentSkills))}</div>
                <div style={{ marginBottom: 12 }}>{Object.keys(talent.currentSkills).map(sk => (<span key={sk} style={s.skillTag}>{sk}</span>))}</div>
                {Object.entries(talent.currentSkills).slice(0, 5).map(([dim, score]) => (<div key={dim} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: `1px solid ${COLORS.divider}` }}><span style={{ fontFamily: FONTS.chinese, fontSize: 11 }}>{dim}</span><span style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, color: score >= 85 ? COLORS.accent : COLORS.primary }}>{score} · {scoreToGrade(score)}</span></div>))}
                <button onClick={() => setCompareList(compareList.filter(i => i !== id))} style={{ marginTop: 12, padding: '4px 12px', fontFamily: FONTS.mono, fontSize: 9, background: 'transparent', border: `1px solid ${COLORS.divider}`, borderRadius: 4, cursor: 'pointer', color: COLORS.muted }}>移除</button></div>)})}
              {Array.from({ length: 3 - compareList.length }, (_, i) => (<div key={i} style={{ flex: 1, border: `1.5px dashed ${COLORS.divider}`, borderRadius: RADIUS.card, padding: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.muted, fontSize: 12, fontFamily: FONTS.chinese }}>点击候选人卡片添加对比</div>))}</div></div>)}
    {filtered.length > 0 && (<div style={{ marginTop: 20, textAlign: 'right' }}><button onClick={() => {
      const csv = ['ID,姓名,职业,等级,核心技能,认证状态,日期'].concat(filtered.map(t => `${t.id},${t.name},${t.careerLabel},${scoreToGrade(calcCapabilityIndex(t.currentSkills))},"${Object.keys(t.currentSkills).join('、')}",${t.verified ? '已认证' : '待认证'},${t.date}`)).join('\n')
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `CareerPass_人才库_${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url)
    }} style={{ padding: '6px 14px', fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, background: COLORS.surface, border: BORDERS.standard, borderRadius: 4, cursor: 'pointer', color: COLORS.primary, letterSpacing: '0.05em' }}>导出 CSV</button></div>)}

    <Modal isOpen={scheduleModalOpen} onClose={() => setScheduleModalOpen(false)} title={scheduleTarget ? `安排面试 — ${scheduleTarget.name}` : '安排面试'} width={500} footer={<><button onClick={() => setScheduleModalOpen(false)} style={{ padding: '10px 20px', fontFamily: FONTS.mono, fontSize: 11, fontWeight: 700, border: BORDERS.standard, borderRadius: 4, cursor: 'pointer', background: COLORS.bg, color: COLORS.primary, letterSpacing: '0.05em' }}>取消</button><button onClick={handleQuickSchedule} style={{ padding: '10px 20px', fontFamily: FONTS.mono, fontSize: 11, fontWeight: 700, border: `2px solid ${COLORS.accent}`, borderRadius: 4, cursor: 'pointer', background: COLORS.accent, color: COLORS.textOnDark, letterSpacing: '0.05em' }}>发送面试邀请</button></>}>
      {scheduleTarget && (<><div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, padding: 12, background: COLORS.bg, borderRadius: 4, border: BORDERS.standard }}><PixelAvatar avatarUrl={scheduleTarget.avatarUrl} fallbackChar={scheduleTarget.avatar} size={36} /><div><div style={{ fontFamily: FONTS.chinese, fontSize: 14, fontWeight: 700, color: COLORS.primary }}>{scheduleTarget.name}</div><div style={{ fontFamily: FONTS.mono, fontSize: 10, color: COLORS.muted }}>{scheduleTarget.careerLabel} · {scoreToGrade(calcCapabilityIndex(scheduleTarget.currentSkills))}</div></div></div>
        <div style={fmGroup}><label style={fmLabel}>面试类型</label><select style={fmSelect} value={scheduleForm.type} onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value as InterviewType })}><option>视频面试</option><option>现场面试</option><option>电话面试</option></select></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}><div style={fmGroup}><label style={fmLabel}>日期 *</label><input type="date" style={fmInput} value={scheduleForm.date} onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })} /></div><div style={fmGroup}><label style={fmLabel}>时间</label><input type="time" style={fmInput} value={scheduleForm.time} onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })} /></div></div>
        <div style={fmGroup}><label style={fmLabel}>面试官 *</label><input style={fmInput} placeholder="例如：李经理" value={scheduleForm.interviewer} onChange={(e) => setScheduleForm({ ...scheduleForm, interviewer: e.target.value })} /></div>
        <div style={fmGroup}><label style={fmLabel}>关联挑战</label><select style={fmSelect} value={scheduleForm.challengeId} onChange={(e) => setScheduleForm({ ...scheduleForm, challengeId: e.target.value })}><option value="">不关联挑战</option>{state.challenges.filter(c => c.status === 'open').map(c => (<option key={c.id} value={c.id}>{c.id} · {c.title.slice(0, 30)}</option>))}</select></div></>)}
    </Modal>
    <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
  </div>)
}

const fmGroup: React.CSSProperties = { marginBottom: 16 }
const fmLabel: React.CSSProperties = { fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, color: COLORS.primary, opacity: 0.6, letterSpacing: '0.1em', marginBottom: 6, display: 'block' }
const fmInput: React.CSSProperties = { width: '100%', padding: '10px 14px', fontFamily: FONTS.chinese, fontSize: 13, color: COLORS.primary, background: COLORS.bg, border: BORDERS.standard, borderRadius: 4, outline: 'none', boxSizing: 'border-box' }
const fmSelect: React.CSSProperties = { width: '100%', padding: '10px 14px', fontFamily: FONTS.chinese, fontSize: 13, color: COLORS.primary, background: COLORS.bg, border: BORDERS.standard, borderRadius: 4, outline: 'none', cursor: 'pointer', boxSizing: 'border-box' }
