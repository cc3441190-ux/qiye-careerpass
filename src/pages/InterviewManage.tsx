import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { COLORS, FONTS, SHADOWS, BORDERS, RADIUS } from '../components/design/tokens'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import type { InterviewStatus, InterviewType } from '../types'
import { calcCapabilityIndex, scoreToGrade } from '../types'

const statusColors: Record<InterviewStatus, { bg: string; color: string; border: string }> = {
  '待确认': { bg: '#FFF8E1', color: '#F57C00', border: '#F57C00' },
  '已确认': { bg: '#E3F2FD', color: '#1976D2', border: '#1976D2' },
  '已完成': { bg: '#E8F5E9', color: '#388E3C', border: '#388E3C' },
  '待反馈': { bg: '#FFF3E0', color: '#E64A19', border: '#E64A19' },
  '已取消': { bg: '#FAFAFA', color: '#9E9E9E', border: '#9E9E9E' },
}

const s = {
  container: { animation: 'fadeIn 0.3s ease-out' } as React.CSSProperties,
  sectionLabel: {
    fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: COLORS.primary,
    opacity: 0.45, letterSpacing: '0.15em', marginBottom: 8,
    display: 'flex', alignItems: 'center', gap: 8,
  } as React.CSSProperties,
  header: { marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } as React.CSSProperties,
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 } as React.CSSProperties,
  statCard: {
    background: COLORS.surface, border: BORDERS.standard, borderRadius: RADIUS.card,
    boxShadow: SHADOWS.card, padding: '16px 20px',
  } as React.CSSProperties,
  statLabel: {
    fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, color: COLORS.muted,
    letterSpacing: '0.1em', marginBottom: 8,
  } as React.CSSProperties,
  statValue: {
    fontFamily: FONTS.mono, fontSize: 28, fontWeight: 700, color: COLORS.primary,
  } as React.CSSProperties,
  filterBar: { display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' as const } as React.CSSProperties,
  filterTag: (active: boolean): React.CSSProperties => ({
    padding: '8px 16px', fontFamily: FONTS.mono, fontSize: 11, fontWeight: 700,
    color: active ? COLORS.textOnDark : COLORS.primary,
    background: active ? COLORS.accent : COLORS.surface,
    border: active ? BORDERS.accent : BORDERS.standard,
    borderRadius: 4, cursor: 'pointer', outline: 'none',
    letterSpacing: '0.05em', transition: 'all 0.2s',
  }),
  interviewCard: {
    background: COLORS.surface, border: BORDERS.standard, borderRadius: RADIUS.card,
    boxShadow: SHADOWS.card, padding: 20, marginBottom: 16,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  } as React.CSSProperties,
  name: {
    fontFamily: FONTS.chinese, fontSize: 16, fontWeight: 700, color: COLORS.primary, marginBottom: 4,
  } as React.CSSProperties,
  meta: {
    fontFamily: FONTS.mono, fontSize: 11, color: COLORS.muted, display: 'flex', gap: 16, alignItems: 'center',
  } as React.CSSProperties,
  statusBadge: (status: InterviewStatus): React.CSSProperties => {
    const c = statusColors[status]
    return {
      display: 'inline-block', padding: '4px 10px',
      fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700,
      letterSpacing: '0.05em', borderRadius: RADIUS.tag,
      border: `1.5px solid ${c.border}`, background: c.bg, color: c.color,
    }
  },
  btn: (primary: boolean, accent?: boolean): React.CSSProperties => ({
    padding: '8px 16px', fontFamily: FONTS.mono, fontSize: 11, fontWeight: 700,
    border: `2px solid ${accent ? COLORS.accent : COLORS.primary}`,
    borderRadius: 4, cursor: 'pointer', letterSpacing: '0.05em',
    background: primary ? (accent ? COLORS.accent : COLORS.primary) : COLORS.surface,
    color: primary ? COLORS.textOnDark : COLORS.primary,
    transition: 'all 0.2s',
  }),
  formGroup: { marginBottom: 16 } as React.CSSProperties,
  formLabel: {
    fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, color: COLORS.primary,
    opacity: 0.6, letterSpacing: '0.1em', marginBottom: 6, display: 'block',
  } as React.CSSProperties,
  formInput: {
    width: '100%', padding: '10px 14px', fontFamily: FONTS.chinese, fontSize: 13,
    color: COLORS.primary, background: COLORS.bg, border: BORDERS.standard,
    borderRadius: 4, outline: 'none', boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  formSelect: {
    width: '100%', padding: '10px 14px', fontFamily: FONTS.chinese, fontSize: 13,
    color: COLORS.primary, background: COLORS.bg, border: BORDERS.standard,
    borderRadius: 4, outline: 'none', cursor: 'pointer', boxSizing: 'border-box' as const,
  } as React.CSSProperties,
}

const filters: InterviewStatus[] = ['全部' as any, '待确认', '已确认', '已完成', '待反馈', '已取消']

export default function InterviewManage() {
  const navigate = useNavigate()
  const { state, dispatch, addToast } = useApp()
  const [activeFilter, setActiveFilter] = useState<string>('全部')
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [targetInterviewId, setTargetInterviewId] = useState<string | null>(null)

  // Schedule form
  const [scheduleForm, setScheduleForm] = useState({
    candidate: '', role: '', type: '视频面试' as InterviewType,
    date: '', time: '', interviewer: '', challengeId: '', notes: '',
  })
  // Feedback form
  const [feedbackForm, setFeedbackForm] = useState({
    overallRating: '', recommendation: 'hire', comments: '',
  })

  const filtered = activeFilter === '全部'
    ? state.interviews
    : state.interviews.filter(i => i.status === activeFilter)

  const stats = {
    pending: state.interviews.filter(i => i.status === '待确认').length,
    thisWeek: state.interviews.filter(i => ['待确认', '已确认'].includes(i.status)).length,
    feedback: state.interviews.filter(i => i.status === '待反馈').length,
    completed: state.interviews.filter(i => i.status === '已完成').length,
  }

  const handleSchedule = () => {
    if (!scheduleForm.candidate || !scheduleForm.date || !scheduleForm.interviewer) return
    const talent = state.talents.find(t => t.name === scheduleForm.candidate) ||
                   state.talents.find(t => t.id === scheduleForm.candidate.split(' ')[0])
    dispatch({
      type: 'ADD_INTERVIEW',
      payload: {
        candidate: scheduleForm.candidate,
        candidateId: talent?.id || scheduleForm.candidate,
        talentId: talent?.id || scheduleForm.candidate,
        role: scheduleForm.role || talent?.careerLabel || '',
        date: scheduleForm.date,
        time: scheduleForm.time || '待定',
        type: scheduleForm.type,
        interviewer: scheduleForm.interviewer,
        status: '待确认',
        challengeId: scheduleForm.challengeId || undefined,
        challengeTitle: scheduleForm.challengeId
          ? state.challenges.find(c => c.id === scheduleForm.challengeId)?.title : undefined,
        notes: scheduleForm.notes || undefined,
      },
    })
    addToast('面试邀请已发送', 'success')
    setShowScheduleModal(false)
    setScheduleForm({ candidate: '', role: '', type: '视频面试', date: '', time: '', interviewer: '', challengeId: '', notes: '' })
  }

  const handleUpdateStatus = (id: string, status: InterviewStatus) => {
    dispatch({ type: 'UPDATE_INTERVIEW_STATUS', payload: { id, status } })
    addToast(status === '已确认' ? '面试已确认' : status === '已取消' ? '面试已取消' : '状态已更新', 'success')
  }

  const handleFeedback = () => {
    if (!targetInterviewId || !feedbackForm.overallRating) return
    dispatch({
      type: 'ADD_INTERVIEW_FEEDBACK',
      payload: {
        id: targetInterviewId,
        feedback: {
          scores: { '综合': feedbackForm.overallRating },
          overallRating: feedbackForm.overallRating,
          recommendation: feedbackForm.recommendation as any,
          comments: feedbackForm.comments,
        },
      },
    })
    addToast('面试反馈已录入', 'success')
    setShowFeedbackModal(false)
    setFeedbackForm({ overallRating: '', recommendation: 'hire', comments: '' })
  }

  const openFeedback = (id: string) => {
    setTargetInterviewId(id)
    setShowFeedbackModal(true)
  }

  const openCancelConfirm = (id: string) => {
    setTargetInterviewId(id)
    setShowCancelConfirm(true)
  }

  return (
    <div style={s.container}>
      {/* 标题 */}
      <div style={s.header}>
        <div>
          <div style={s.sectionLabel}>面试管理<div style={{ flex: 1, height: 1, background: COLORS.divider }} /></div>
          <h1 style={{ fontFamily: FONTS.mono, fontSize: 32, fontWeight: 700, color: COLORS.primary, marginBottom: 8 }}>面试管理</h1>
          <p style={{ fontFamily: FONTS.chinese, fontSize: 14, color: COLORS.muted }}>管理和跟踪所有候选人面试安排</p>
        </div>
        <button style={s.btn(true, true)} onClick={() => setShowScheduleModal(true)}>+ 安排面试</button>
      </div>

      {/* 统计 */}
      <div style={s.statsGrid}>
        {[
          { label: '待安排', value: stats.pending },
          { label: '本周面试', value: stats.thisWeek },
          { label: '待反馈', value: stats.feedback, accent: true },
          { label: '已完成', value: stats.completed },
        ].map((st, i) => (
          <div key={i} style={s.statCard}>
            <div style={s.statLabel}>{st.label}</div>
            <div style={{ ...s.statValue, ...(st.accent ? { color: COLORS.accent } : {}) }}>{st.value}</div>
          </div>
        ))}
      </div>

      {/* 筛选 */}
      <div style={s.filterBar}>
        {filters.map((f) => (
          <span key={f} onClick={() => setActiveFilter(f)} style={s.filterTag(activeFilter === f)}>{f}</span>
        ))}
      </div>

      {/* 面试列表 */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px 20px', background: COLORS.surface,
          border: BORDERS.standard, borderRadius: RADIUS.card, boxShadow: SHADOWS.card,
        }}>
          <div style={{ fontSize: 72, marginBottom: 16, opacity: 0.15 }}>——</div>
          <div style={{ fontFamily: FONTS.chinese, fontSize: 18, fontWeight: 700, color: COLORS.primary, marginBottom: 8 }}>暂无面试安排</div>
          <div style={{ fontFamily: FONTS.chinese, fontSize: 14, color: COLORS.muted, marginBottom: 20 }}>从人才库筛选候选人并安排面试</div>
          <button style={s.btn(true, true)} onClick={() => navigate('/talent')}>去人才库</button>
        </div>
      ) : filtered.map((iv) => (
        <div key={iv.id} style={s.interviewCard}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={s.name}>{iv.candidate}</span>
              {/* 等级标签 */}
              {(() => {
                const t = state.talents.find(t => t.id === iv.candidateId || t.id === iv.talentId)
                const grade = t ? scoreToGrade(calcCapabilityIndex(t.currentSkills)) : ''
                if (!grade) return null
                const isHigh = grade === 'S' || grade.startsWith('A')
                return (
                  <span style={{
                    display: 'inline-block', padding: '2px 6px',
                    border: `1.5px solid ${isHigh ? COLORS.accent : COLORS.muted}`,
                    borderRadius: 2,
                    fontFamily: FONTS.mono, fontSize: 8, fontWeight: 700,
                    background: isHigh ? COLORS.accent : 'transparent',
                    color: isHigh ? COLORS.textOnDark : COLORS.muted,
                    letterSpacing: '0.05em',
                  }}>
                    {grade}
                  </span>
                )
              })()}
            </div>
            <div style={s.meta}>
              <span>{iv.role}</span><span>•</span>
              <span>{iv.date} {iv.time}</span><span>•</span>
              <span>{iv.type}</span><span>•</span>
              <span>面试官: {iv.interviewer}</span>
              {iv.challengeTitle && <><span>•</span><span>{iv.challengeTitle}</span></>}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={s.statusBadge(iv.status)}>{iv.status}</span>
            {iv.status === '待确认' && (
              <>
                <button style={s.btn(false)} onClick={() => handleUpdateStatus(iv.id, '已确认')}>确认</button>
                <button style={s.btn(false)} onClick={() => openCancelConfirm(iv.id)}>取消</button>
              </>
            )}
            {iv.status === '已确认' && (
              <button style={s.btn(false)} onClick={() => handleUpdateStatus(iv.id, '已完成')}>完成</button>
            )}
            {iv.status === '待反馈' && (
              <button style={s.btn(true, true)} onClick={() => openFeedback(iv.id)}>录入反馈</button>
            )}
            {iv.status === '已完成' && (
              <button style={s.btn(false)} onClick={() => navigate(`/interview/${iv.id}/feedback`)}>查看反馈</button>
            )}
          </div>
        </div>
      ))}

      {/* ===== 安排面试 Modal ===== */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="安排面试"
        width={560}
        footer={
          <>
            <button style={s.btn(false)} onClick={() => setShowScheduleModal(false)}>取消</button>
            <button style={s.btn(true, true)} onClick={handleSchedule}>发送邀请</button>
          </>
        }
      >
        <div style={s.formGroup}>
          <label style={s.formLabel}>候选人 *（按挑战分组）</label>
          <select style={s.formSelect} value={scheduleForm.candidate}
            onChange={(e) => {
              const t = state.talents.find(t => t.id === e.target.value)
              setScheduleForm({ ...scheduleForm, candidate: t ? `${t.name} (${t.id})` : e.target.value, role: t?.role || '' })
            }}>
            <option value="">选择候选人</option>
            {state.challenges.filter(c => c.status === 'open').map(ch => {
              const linked = state.reviews
                .filter(r => r.challengeId === ch.id)
                .map(r => state.talents.find(t => t.id === r.candidateId))
                .filter(Boolean)
              if (linked.length === 0) return null
              return (
                <optgroup key={ch.id} label={`LINKED ${ch.id} · ${ch.title.slice(0, 30)}`}>
                  {linked.map(t => t! && (
                    <option key={t.id} value={t.id}>{t.name} · {t.careerLabel} · {scoreToGrade(calcCapabilityIndex(t.currentSkills))}</option>
                  ))}
                </optgroup>
              )
            })}
            <optgroup label="LIST 其他候选人">
              {state.talents.filter(t => {
                const linkedIds = new Set(state.reviews.map(r => r.candidateId))
                return !linkedIds.has(t.id)
              }).map(t => (
                <option key={t.id} value={t.id}>{t.name} · {t.role} · {t.grade}</option>
              ))}
            </optgroup>
          </select>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={s.formGroup}>
            <label style={s.formLabel}>关联挑战（可选）</label>
            <select style={s.formSelect} value={scheduleForm.challengeId}
              onChange={(e) => setScheduleForm({ ...scheduleForm, challengeId: e.target.value })}>
              <option value="">不关联</option>
              {state.challenges.filter(c => c.status === 'open').map(c => (
                <option key={c.id} value={c.id}>{c.id} · {c.title}</option>
              ))}
            </select>
          </div>
          <div style={s.formGroup}>
            <label style={s.formLabel}>面试类型</label>
            <select style={s.formSelect} value={scheduleForm.type}
              onChange={(e) => setScheduleForm({ ...scheduleForm, type: e.target.value as InterviewType })}>
              <option>视频面试</option><option>现场面试</option><option>电话面试</option>
            </select>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={s.formGroup}>
            <label style={s.formLabel}>日期 *</label>
            <input type="date" style={s.formInput} value={scheduleForm.date}
              onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })} />
          </div>
          <div style={s.formGroup}>
            <label style={s.formLabel}>时间段</label>
            <input type="time" style={s.formInput} value={scheduleForm.time}
              onChange={(e) => setScheduleForm({ ...scheduleForm, time: e.target.value })} />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={s.formGroup}>
            <label style={s.formLabel}>面试官 *</label>
            <input style={s.formInput} placeholder="例如：李经理" value={scheduleForm.interviewer}
              onChange={(e) => setScheduleForm({ ...scheduleForm, interviewer: e.target.value })} />
          </div>
        </div>
        <div style={s.formGroup}>
          <label style={s.formLabel}>备注</label>
          <textarea style={{ ...s.formInput, minHeight: 60, resize: 'vertical' }} placeholder="面试要点、注意事项..."
            value={scheduleForm.notes}
            onChange={(e) => setScheduleForm({ ...scheduleForm, notes: e.target.value })} />
        </div>
      </Modal>

      {/* ===== 反馈 Modal ===== */}
      <Modal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        title="录入面试反馈"
        width={500}
        footer={
          <>
            <button style={s.btn(false)} onClick={() => setShowFeedbackModal(false)}>取消</button>
            <button style={s.btn(true, true)} onClick={handleFeedback}>提交反馈</button>
          </>
        }
      >
        <div style={s.formGroup}>
          <label style={s.formLabel}>综合评分 *</label>
          <select style={s.formSelect} value={feedbackForm.overallRating}
            onChange={(e) => setFeedbackForm({ ...feedbackForm, overallRating: e.target.value })}>
            <option value="">选择评分</option>
            <option>S</option><option>A+</option><option>A</option><option>B+</option><option>B</option><option>C</option>
          </select>
        </div>
        <div style={s.formGroup}>
          <label style={s.formLabel}>录用建议</label>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { v: 'strong_hire', l: '强烈建议录用', c: '#388E3C' },
              { v: 'hire', l: '建议录用', c: '#1976D2' },
              { v: 'weak_hire', l: '保留意见', c: '#F57C00' },
              { v: 'no_hire', l: '不建议录用', c: '#E64A19' },
            ].map(opt => (
              <label key={opt.v} style={{
                flex: 1, textAlign: 'center', padding: '8px 4px',
                border: feedbackForm.recommendation === opt.v ? `2px solid ${opt.c}` : BORDERS.medium,
                borderRadius: 4, cursor: 'pointer',
                fontFamily: FONTS.chinese, fontSize: 11, color: COLORS.primary,
              }}>
                <input type="radio" name="recommendation" value={opt.v} checked={feedbackForm.recommendation === opt.v}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, recommendation: e.target.value })}
                  style={{ marginRight: 4 }} />
                {opt.l}
              </label>
            ))}
          </div>
        </div>
        <div style={s.formGroup}>
          <label style={s.formLabel}>综合评价</label>
          <textarea style={{ ...s.formInput, minHeight: 80, resize: 'vertical' }}
            placeholder="候选人的优势、不足和综合评价..."
            value={feedbackForm.comments}
            onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })} />
        </div>
      </Modal>

      {/* ===== 取消确认 ===== */}
      <ConfirmDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={() => {
          if (targetInterviewId) handleUpdateStatus(targetInterviewId, '已取消')
          setShowCancelConfirm(false)
        }}
        title="取消面试"
        message="确认取消这场面试安排？取消后候选人将收到通知。"
        confirmLabel="确认取消"
      />

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )
}
