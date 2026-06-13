import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { COLORS, FONTS, SHADOWS, BORDERS, RADIUS } from '../components/design/tokens'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'

const s = {
  container: { animation: 'fadeIn 0.3s ease-out' } as React.CSSProperties,
  sectionLabel: {
    fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: COLORS.primary,
    opacity: 0.45, letterSpacing: '0.15em', marginBottom: 8,
    display: 'flex', alignItems: 'center', gap: 8,
  } as React.CSSProperties,
  filterBar: { display: 'flex', gap: 8, marginBottom: 24 } as React.CSSProperties,
  filterTag: (active: boolean): React.CSSProperties => ({
    border: active ? BORDERS.accent : BORDERS.thick,
    borderRadius: RADIUS.tag, padding: '6px 12px',
    background: active ? COLORS.accent : COLORS.surface,
    color: active ? COLORS.textOnDark : COLORS.primary,
    fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.02em',
    cursor: 'pointer', outline: 'none', transition: 'all 0.2s',
  }),
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 16,
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
    fontFamily: FONTS.mono, fontSize: 11, fontWeight: 700, color: COLORS.textOnDark, letterSpacing: '0.05em',
  } as React.CSSProperties,
  statusBadge: (color: string, bg: string, border: string): React.CSSProperties => ({
    padding: '3px 8px', borderRadius: RADIUS.tag,
    fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, letterSpacing: '0.05em',
    border: `1.5px solid ${border}`, background: bg, color,
  }),
  cardBody: { padding: 16 } as React.CSSProperties,
  candidateInfo: {
    display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, paddingBottom: 16,
    borderBottom: `1px solid ${COLORS.divider}`,
  } as React.CSSProperties,
  avatar: {
    width: 40, height: 40, borderRadius: RADIUS.avatar, background: COLORS.primary,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: FONTS.mono, fontSize: 14, fontWeight: 700, color: COLORS.textOnDark,
  } as React.CSSProperties,
  name: {
    fontFamily: FONTS.chinese, fontSize: 14, fontWeight: 700, color: COLORS.primary, marginBottom: 2,
  } as React.CSSProperties,
  meta: {
    fontFamily: FONTS.mono, fontSize: 9, color: COLORS.muted, letterSpacing: '0.05em',
  } as React.CSSProperties,
  scoreGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 } as React.CSSProperties,
  scoreItem: {
    background: COLORS.bg, border: `1px solid ${COLORS.divider}`, borderRadius: 4,
    padding: 8, textAlign: 'center' as const,
  } as React.CSSProperties,
  scoreLabel: {
    fontFamily: FONTS.mono, fontSize: 8, color: COLORS.muted, letterSpacing: '0.1em', marginBottom: 4,
  } as React.CSSProperties,
  scoreValue: (accent: boolean): React.CSSProperties => ({
    fontFamily: FONTS.mono, fontSize: 14, fontWeight: 700,
    color: accent ? COLORS.accent : COLORS.primary,
  }),
  btnRow: { display: 'flex', gap: 8, paddingTop: 16, borderTop: `1px solid ${COLORS.divider}` } as React.CSSProperties,
  btn: (variant: 'pass' | 'reject' | 'view'): React.CSSProperties => ({
    flex: 1, height: 40, border: BORDERS.standard, borderRadius: 6,
    fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
    cursor: 'pointer',
    background: variant === 'pass' ? COLORS.accent : variant === 'reject' ? COLORS.bg : COLORS.primary,
    color: variant === 'reject' ? COLORS.primary : COLORS.textOnDark,
    boxShadow: '0 1px 2px rgba(0,0,0,0.08), 2px 2px 0px #1A1A1A',
    transition: 'transform 0.1s, box-shadow 0.1s',
  }),
  formGroup: { marginBottom: 16 } as React.CSSProperties,
  formLabel: {
    fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, color: COLORS.primary,
    opacity: 0.6, letterSpacing: '0.1em', marginBottom: 6, display: 'block',
  } as React.CSSProperties,
  formSelect: {
    width: '100%', padding: '10px 14px', fontFamily: FONTS.chinese, fontSize: 13,
    color: COLORS.primary, background: COLORS.bg, border: BORDERS.standard,
    borderRadius: 4, outline: 'none', cursor: 'pointer', boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  formTextarea: {
    width: '100%', padding: '10px 14px', fontFamily: FONTS.chinese, fontSize: 13,
    color: COLORS.primary, background: COLORS.bg, border: BORDERS.standard,
    borderRadius: 4, outline: 'none', resize: 'vertical' as const, minHeight: 60, boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  emptyState: {
    textAlign: 'center' as const, padding: '60px 20px', background: COLORS.surface,
    border: BORDERS.standard, borderRadius: RADIUS.card, boxShadow: SHADOWS.card,
    gridColumn: '1 / -1',
  } as React.CSSProperties,
}

const filters = ['待审核', '已通过', '已拒绝']

const statusMap: Record<string, { label: string; bg: string; color: string; border: string }> = {
  pending: { label: '待审核', bg: COLORS.bg, color: COLORS.primary, border: COLORS.divider },
  approved: { label: '已通过', bg: COLORS.accent, color: COLORS.textOnDark, border: COLORS.accent },
  rejected: { label: '已拒绝', bg: COLORS.surface, color: COLORS.muted, border: COLORS.divider },
}

const rejectReasons = ['能力不匹配', '完成质量不足', '抄袭嫌疑', '信息不实', '其他']

export default function ChallengeReview() {
  const { state, dispatch, addToast } = useApp()
  const [activeFilter, setActiveFilter] = useState('待审核')
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [showApproveConfirm, setShowApproveConfirm] = useState(false)
  const [targetReviewId, setTargetReviewId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectFeedback, setRejectFeedback] = useState('')

  const pendingCount = state.reviews.filter(r => r.status === 'pending').length

  const filtered = state.reviews.filter(r => {
    if (activeFilter === '待审核') return r.status === 'pending'
    if (activeFilter === '已通过') return r.status === 'approved'
    if (activeFilter === '已拒绝') return r.status === 'rejected'
    return true
  })

  const handleApprove = () => {
    if (!targetReviewId) return
    dispatch({ type: 'APPROVE_REVIEW', payload: { reviewId: targetReviewId } })
    addToast('审核已通过，能力通行证已发放', 'success')
    setShowApproveConfirm(false)
  }

  const handleReject = () => {
    if (!targetReviewId || !rejectReason) return
    dispatch({ type: 'REJECT_REVIEW', payload: { reviewId: targetReviewId, reason: rejectReason, feedback: rejectFeedback } })
    addToast('审核已拒绝', 'info')
    setShowRejectModal(false)
    setRejectReason('')
    setRejectFeedback('')
  }

  return (
    <div style={s.container}>
      {/* 标题 */}
      <div style={{ marginBottom: 32 }}>
        <div style={s.sectionLabel}>挑战审核<div style={{ flex: 1, height: 1, background: COLORS.divider }} /></div>
        <h1 style={{ fontFamily: FONTS.mono, fontSize: 32, fontWeight: 700, color: COLORS.primary, marginBottom: 8 }}>审核中心</h1>
        <p style={{ fontFamily: FONTS.chinese, fontSize: 14, color: COLORS.muted }}>
          审核候选人提交的挑战结果{pendingCount > 0 ? ` — ${pendingCount} 项待处理` : ''}
        </p>
      </div>

      {/* 筛选 */}
      <div style={s.filterBar}>
        {filters.map((f) => {
          const count = f === '待审核' ? state.reviews.filter(r => r.status === 'pending').length :
                        f === '已通过' ? state.reviews.filter(r => r.status === 'approved').length :
                        state.reviews.filter(r => r.status === 'rejected').length
          return (
            <span key={f} onClick={() => setActiveFilter(f)} style={s.filterTag(activeFilter === f)}>
              {f} ({count})
            </span>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div style={s.emptyState}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>CHECK </div>
          <div style={{ fontFamily: FONTS.chinese, fontSize: 18, fontWeight: 700, color: COLORS.primary, marginBottom: 8 }}>
            {activeFilter === '待审核' ? '暂无待审核项' : activeFilter === '已通过' ? '暂无已通过记录' : '暂无已拒绝记录'}
          </div>
          <div style={{ fontFamily: FONTS.chinese, fontSize: 14, color: COLORS.muted }}>
            {activeFilter === '待审核' ? '所有挑战提交均已处理完毕' : ''}
          </div>
        </div>
      ) : (
        <div style={s.grid}>
          {filtered.map((review) => {
            const st = statusMap[review.status]
            return (
              <div key={review.id} style={s.card}>
                <div style={s.cardHeader}>
                  <span style={s.cardTitle}>{review.id}</span>
                  <span style={s.statusBadge(st.color, st.bg, st.border)}>{st.label}</span>
                </div>
                <div style={s.cardBody}>
                  <div style={s.candidateInfo}>
                    <div style={s.avatar}>{review.candidate.charAt(0)}</div>
                    <div>
                      <div style={s.name}>{review.candidate}</div>
                      <div style={s.meta}>{review.candidateId} · {review.challengeTitle}</div>
                    </div>
                  </div>
                  <div style={s.scoreGrid}>
                    {Object.entries(review.scores).map(([skill, score]) => (
                      <div key={skill} style={s.scoreItem}>
                        <div style={s.scoreLabel}>{skill}</div>
                        <div style={s.scoreValue(String(score).startsWith('A') || String(score) === 'S')}>{score}</div>
                      </div>
                    ))}
                    <div style={s.scoreItem}>
                      <div style={s.scoreLabel}>综合</div>
                      <div style={s.scoreValue(review.overallGrade.startsWith('A') || review.overallGrade === 'S')}>{review.overallGrade}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: FONTS.mono, fontSize: 9, color: COLORS.muted, letterSpacing: '0.05em', marginBottom: 16 }}>
                    提交时间: {review.submittedAt}
                  </div>
                  {review.status === 'pending' ? (
                    <div style={s.btnRow}>
                      <button style={s.btn('reject')}
                        onClick={() => { setTargetReviewId(review.id); setShowRejectModal(true) }}
                      >拒绝</button>
                      <button style={s.btn('view')}>查看详情</button>
                      <button style={s.btn('pass')}
                        onClick={() => { setTargetReviewId(review.id); setShowApproveConfirm(true) }}
                      >通过</button>
                    </div>
                  ) : (
                    <div style={{ ...s.btnRow, justifyContent: 'center' }}>
                      <button style={s.btn('view')}>查看详情</button>
                    </div>
                  )}
                  {review.status === 'rejected' && review.rejectReason && (
                    <div style={{ marginTop: 8, padding: '8px 10px', background: COLORS.bg, borderRadius: 4, fontFamily: FONTS.chinese, fontSize: 11, color: COLORS.muted }}>
                      拒绝原因: {review.rejectReason}{review.rejectFeedback ? ` — ${review.rejectFeedback}` : ''}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ===== 通过确认 ===== */}
      <ConfirmDialog
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        onConfirm={handleApprove}
        title="确认通过审核"
        message={`确认通过该候选人的审核？通过后将自动发放能力通行证并通知候选人。`}
        confirmLabel="确认通过"
      />

      {/* ===== 拒绝 Modal ===== */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        title="拒绝审核"
        width={460}
        footer={
          <>
            <button style={s.btn('reject')} onClick={() => setShowRejectModal(false)}>取消</button>
            <button style={s.btn('pass')} onClick={handleReject}
              disabled={!rejectReason}
            >确认拒绝</button>
          </>
        }
      >
        <div style={s.formGroup}>
          <label style={s.formLabel}>拒绝原因 *</label>
          <select style={s.formSelect} value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}>
            <option value="">选择原因...</option>
            {rejectReasons.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div style={s.formGroup}>
          <label style={s.formLabel}>改进建议（选填）</label>
          <textarea style={s.formTextarea} placeholder="可选：给候选人的改进建议..."
            value={rejectFeedback}
            onChange={(e) => setRejectFeedback(e.target.value)} />
        </div>
      </Modal>

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )
}
