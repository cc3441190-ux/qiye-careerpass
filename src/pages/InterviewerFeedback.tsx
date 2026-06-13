import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { COLORS, FONTS, SHADOWS, BORDERS, RADIUS } from '../components/design/tokens'
// InterviewFeedback type used in state dispatch

const s = {
  container: { animation: 'fadeIn 0.3s ease-out' } as React.CSSProperties,
  sectionLabel: {
    fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: COLORS.primary,
    opacity: 0.45, letterSpacing: '0.15em', marginBottom: 8,
    display: 'flex', alignItems: 'center', gap: 8,
  } as React.CSSProperties,
  card: {
    background: COLORS.surface, border: BORDERS.standard, borderRadius: RADIUS.card,
    boxShadow: SHADOWS.card, padding: 24, marginBottom: 20,
  } as React.CSSProperties,
  cardHeader: {
    fontFamily: FONTS.mono, fontSize: 11, fontWeight: 700, color: COLORS.primary,
    letterSpacing: '0.1em', marginBottom: 20, paddingBottom: 12,
    borderBottom: `1px solid ${COLORS.divider}`,
  } as React.CSSProperties,
  infoRow: {
    display: 'flex', justifyContent: 'space-between', padding: '8px 0',
    borderBottom: `1px solid ${COLORS.divider}`,
  } as React.CSSProperties,
  infoLabel: {
    fontFamily: FONTS.mono, fontSize: 10, color: COLORS.muted, letterSpacing: '0.1em',
  } as React.CSSProperties,
  infoValue: {
    fontFamily: FONTS.chinese, fontSize: 13, fontWeight: 600, color: COLORS.primary,
  } as React.CSSProperties,
  formGroup: { marginBottom: 20 } as React.CSSProperties,
  formLabel: {
    fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, color: COLORS.primary,
    opacity: 0.6, letterSpacing: '0.01em', marginBottom: 6, display: 'block',
  } as React.CSSProperties,
  formSelect: {
    width: '100%', padding: '10px 14px', fontFamily: FONTS.chinese, fontSize: 13,
    color: COLORS.primary, background: COLORS.bg, border: BORDERS.standard,
    borderRadius: 4, outline: 'none', cursor: 'pointer', boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  formTextarea: {
    width: '100%', padding: '10px 14px', fontFamily: FONTS.chinese, fontSize: 13,
    color: COLORS.primary, background: COLORS.bg, border: BORDERS.standard,
    borderRadius: 4, outline: 'none', resize: 'vertical' as const, minHeight: 100, boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  scoreGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 } as React.CSSProperties,
  recommendBtn: (selected: boolean, color: string): React.CSSProperties => ({
    flex: 1, textAlign: 'center' as const, padding: '10px 8px',
    border: selected ? `2px solid ${color}` : BORDERS.medium, borderRadius: 4, cursor: 'pointer',
    fontFamily: FONTS.chinese, fontSize: 12, fontWeight: selected ? 700 : 400,
    color: selected ? color : COLORS.primary, background: selected ? `${color}10` : COLORS.surface,
    transition: 'all 0.2s',
  }),
  btn: (primary: boolean): React.CSSProperties => ({
    padding: '12px 32px', fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700,
    color: primary ? COLORS.textOnDark : COLORS.primary,
    background: primary ? COLORS.accent : COLORS.bg,
    border: BORDERS.standard, borderRadius: RADIUS.button, cursor: 'pointer',
    letterSpacing: '0.05em', boxShadow: SHADOWS.button,
    transition: 'all 0.1s',
  }),
}

const scoreOptions = ['S', 'A+', 'A', 'B+', 'B', 'C']
const recommendOptions = [
  { v: 'strong_hire', l: '强烈建议录用', c: '#388E3C' },
  { v: 'hire', l: '建议录用', c: '#1976D2' },
  { v: 'weak_hire', l: '保留意见', c: '#F57C00' },
  { v: 'no_hire', l: '不建议录用', c: '#E64A19' },
]

export default function InterviewerFeedback() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, dispatch, addToast } = useApp()

  const interview = state.interviews.find(i => i.id === id)
  const talent = interview ? state.talents.find(t => t.id === interview.talentId) : null

  const [overallRating, setOverallRating] = useState(interview?.feedback?.overallRating || '')
  const [recommendation, setRecommendation] = useState(interview?.feedback?.recommendation || 'hire')
  const [comments, setComments] = useState(interview?.feedback?.comments || '')

  if (!interview || !talent) {
    return (
      <div style={{ padding: 40, textAlign: 'center', fontFamily: FONTS.chinese }}>
        <div style={{ fontSize: 72, marginBottom: 16, opacity: 0.15 }}>——</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.primary, marginBottom: 8 }}>未找到该面试记录</div>
        <button onClick={() => navigate('/interview')} style={{
          fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, color: COLORS.accent,
          background: 'transparent', border: 'none', cursor: 'pointer',
        }}>返回面试管理</button>
      </div>
    )
  }

  const handleSubmit = () => {
    if (!overallRating) return
    dispatch({
      type: 'ADD_INTERVIEW_FEEDBACK',
      payload: {
        id: interview.id,
        feedback: { scores: { '综合': overallRating }, overallRating, recommendation, comments },
      },
    })
    dispatch({
      type: 'ADD_MESSAGE',
      payload: {
        title: '面试反馈已提交',
        body: `${interview.candidate} 的面试反馈已录入，综合评分 ${overallRating}。`,
        time: '刚刚', unread: true, type: 'interview', actionType: 'interview', actionTarget: interview.id,
      },
    })
    addToast('面试反馈已提交', 'success')
    navigate('/interview')
  }

  return (
    <div style={s.container}>
      <div style={{ marginBottom: 32 }}>
        <div style={s.sectionLabel}>面试反馈<div style={{ flex: 1, height: 1, background: COLORS.divider }} /></div>
        <h1 style={{ fontFamily: FONTS.mono, fontSize: 32, fontWeight: 700, color: COLORS.primary, marginBottom: 8 }}>面试反馈</h1>
        <p style={{ fontFamily: FONTS.chinese, fontSize: 14, color: COLORS.muted }}>
          {interview.id} · {interview.candidate} · {interview.role}
        </p>
      </div>

      <div style={{ maxWidth: 800 }}>

      {/* 候选人能力画像 */}
      <div style={s.card}>
        <div style={s.cardHeader}>候选人能力画像</div>
        <div style={s.infoRow}><span style={s.infoLabel}>姓名</span><span style={s.infoValue}>{talent.name}</span></div>
        <div style={s.infoRow}><span style={s.infoLabel}>岗位</span><span style={s.infoValue}>{talent.role}</span></div>
        <div style={s.infoRow}><span style={s.infoLabel}>通行证等级</span><span style={{ ...s.infoValue, color: COLORS.accent, fontFamily: FONTS.mono }}>{talent.grade}</span></div>
        <div style={s.infoRow}><span style={s.infoLabel}>认证状态</span><span style={s.infoValue}>{talent.verified ? '已认证' : '待认证'}</span></div>
        <div style={s.infoRow}><span style={s.infoLabel}>关联挑战</span><span style={s.infoValue}>{interview.challengeTitle || '-'}</span></div>
        <div style={{ marginTop: 12 }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: 9, color: COLORS.muted, letterSpacing: '0.1em' }}>技能标签</span>
          <div style={{ marginTop: 6 }}>
            {Object.keys(talent.currentSkills).map(sk => (
              <span key={sk} style={{
                display: 'inline-block', border: BORDERS.thick, borderRadius: RADIUS.tag,
                padding: '4px 8px', background: COLORS.surface,
                fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700,
                letterSpacing: '0.02em', marginRight: 6, marginBottom: 6,
              }}>{sk}</span>
            ))}
          </div>
        </div>
      </div>

      {/* 面试反馈表单 */}
      <div style={s.card}>
        <div style={s.cardHeader}>面试反馈</div>

        {interview.feedback ? (
          /* 已有反馈 — 只读展示 */
          <>
            <div style={{ ...s.infoRow, borderBottom: 'none' }}>
              <span style={s.infoLabel}>综合评分</span>
              <span style={{ fontFamily: FONTS.mono, fontSize: 18, fontWeight: 700, color: COLORS.accent }}>{interview.feedback.overallRating}</span>
            </div>
            <div style={{ ...s.infoRow, borderBottom: 'none' }}>
              <span style={s.infoLabel}>录用建议</span>
              <span style={{ fontFamily: FONTS.chinese, fontSize: 13, fontWeight: 600, color: COLORS.primary }}>
                {recommendOptions.find(o => o.v === interview.feedback?.recommendation)?.l || interview.feedback.recommendation}
              </span>
            </div>
            <div style={{ marginTop: 12 }}>
              <span style={s.formLabel}>综合评价</span>
              <p style={{ fontFamily: FONTS.chinese, fontSize: 13, color: COLORS.primary, lineHeight: 1.8 }}>{interview.feedback.comments}</p>
            </div>
          </>
        ) : (
          /* 填写反馈 */
          <>
            <div style={s.formGroup}>
              <label style={s.formLabel}>综合评分 *</label>
              <div style={s.scoreGrid}>
                {scoreOptions.map(score => (
                  <label key={score} style={{
                    textAlign: 'center', padding: '10px',
                    border: overallRating === score ? BORDERS.accent : BORDERS.medium,
                    borderRadius: 4, cursor: 'pointer',
                    fontFamily: FONTS.mono, fontSize: 14, fontWeight: 700,
                    color: overallRating === score ? COLORS.accent : COLORS.primary,
                    background: overallRating === score ? 'rgba(255,77,0,0.05)' : COLORS.surface,
                  }}>
                    <input type="radio" name="rating" value={score} checked={overallRating === score}
                      onChange={(e) => setOverallRating(e.target.value)} style={{ marginRight: 6 }} />
                    {score}
                  </label>
                ))}
              </div>
            </div>

            <div style={s.formGroup}>
              <label style={s.formLabel}>录用建议</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {recommendOptions.map(opt => (
                  <div key={opt.v} style={s.recommendBtn(recommendation === opt.v, opt.c)}
                    onClick={() => setRecommendation(opt.v)}>
                    {opt.l}
                  </div>
                ))}
              </div>
            </div>

            <div style={s.formGroup}>
              <label style={s.formLabel}>综合评价</label>
              <textarea style={s.formTextarea} placeholder="候选人的面试表现、优势、不足和综合评价..."
                value={comments} onChange={(e) => setComments(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button style={s.btn(false)} onClick={() => navigate('/interview')}>取消</button>
              <button style={s.btn(true)}
                onClick={handleSubmit}
                onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = SHADOWS.buttonPressed }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = SHADOWS.button }}
              >提交反馈</button>
            </div>
          </>
        )}
      </div>

      </div>{/* end maxWidth wrapper */}

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )
}
