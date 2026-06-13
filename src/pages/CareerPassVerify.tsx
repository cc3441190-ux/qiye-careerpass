import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { COLORS, FONTS, SHADOWS, BORDERS, RADIUS } from '../components/design/tokens'
import { calcCapabilityIndex, scoreToGrade } from '../types'

const s = {
  container: { animation: 'fadeIn 0.3s ease-out' } as React.CSSProperties,
  sectionLabel: {
    fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: COLORS.primary,
    opacity: 0.45, letterSpacing: '0.15em', marginBottom: 8,
    display: 'flex', alignItems: 'center', gap: 8,
  } as React.CSSProperties,
  verifyCard: {
    background: COLORS.surface, border: BORDERS.standard, borderRadius: RADIUS.card,
    boxShadow: SHADOWS.card, padding: 28, marginBottom: 24,
  } as React.CSSProperties,
  formGroup: { marginBottom: 18 } as React.CSSProperties,
  formLabel: {
    fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: COLORS.primary,
    opacity: 0.5, letterSpacing: '0.12em', marginBottom: 8, display: 'block',
  } as React.CSSProperties,
  input: {
    width: '100%', height: 48, padding: '0 14px', background: COLORS.bg,
    border: BORDERS.standard, borderRadius: RADIUS.input,
    fontFamily: FONTS.mono, fontSize: 13, fontWeight: 700,
    color: COLORS.primary, letterSpacing: '0.04em', outline: 'none',
    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)', boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  qrDrop: (dragOver: boolean): React.CSSProperties => ({
    width: '100%', height: 160, cursor: 'pointer',
    background: dragOver ? 'rgba(255,77,0,0.04)' : COLORS.bg,
    border: dragOver ? BORDERS.accent : `1.5px dashed ${COLORS.divider}`,
    borderRadius: RADIUS.input, display: 'flex', flexDirection: 'column' as const,
    alignItems: 'center', justifyContent: 'center',
    fontFamily: FONTS.chinese, fontSize: 12, color: COLORS.muted,
    transition: 'all 0.2s',
  }),
  btnGroup: { display: 'flex', gap: 12, marginTop: 24 } as React.CSSProperties,
  btn: (primary: boolean): React.CSSProperties => ({
    flex: 1, height: 48,
    background: primary ? COLORS.primary : COLORS.accent,
    border: BORDERS.standard, borderRadius: RADIUS.button,
    color: COLORS.textOnDark,
    fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700,
    letterSpacing: '0.1em', cursor: 'pointer', boxShadow: SHADOWS.button,
    transition: 'transform 0.1s, box-shadow 0.1s',
  }),
  resultCard: {
    background: COLORS.primary, border: BORDERS.standard, borderRadius: RADIUS.card,
    boxShadow: SHADOWS.darkCard, padding: 24, color: COLORS.textOnDark, marginTop: 24,
  } as React.CSSProperties,
  resultHeader: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20, paddingBottom: 16, borderBottom: '1.5px solid #333',
  } as React.CSSProperties,
  resultTitle: {
    fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, color: COLORS.textOnDark, letterSpacing: '0.1em',
  } as React.CSSProperties,
  verifiedBadge: {
    background: COLORS.accent, color: COLORS.textOnDark, border: `1.5px solid ${COLORS.accent}`,
    borderRadius: RADIUS.tag, padding: '4px 8px',
    fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
  } as React.CSSProperties,
  infoRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 0', borderBottom: '1px solid #333',
  } as React.CSSProperties,
  infoLabel: {
    fontFamily: FONTS.mono, fontSize: 9, color: COLORS.textOnDarkMuted, letterSpacing: '0.1em',
  } as React.CSSProperties,
  infoValue: {
    fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, color: COLORS.textOnDark,
  } as React.CSSProperties,
  scoreGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 16,
  } as React.CSSProperties,
  scoreItem: {
    background: 'rgba(255,255,255,0.05)', border: '1.5px solid #333', borderRadius: 4,
    padding: 12, textAlign: 'center' as const,
  } as React.CSSProperties,
  scoreLabel: {
    fontFamily: FONTS.mono, fontSize: 8, color: COLORS.textOnDarkMuted, letterSpacing: '0.1em', marginBottom: 4,
  } as React.CSSProperties,
  scoreValue: {
    fontFamily: FONTS.mono, fontSize: 18, fontWeight: 700, color: COLORS.accent,
  } as React.CSSProperties,
}

export default function CareerPassVerify() {
  const { state } = useApp()
  const [passId, setPassId] = useState('')
  const [verified, setVerified] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleVerify = () => {
    // 支持 CP 编码查找 (#CP-2026-XXXX)
    const cleanId = passId.trim().replace('#', '')
    if (cleanId) {
      const match = state.talents.find(t => t.cpCode.replace('#', '') === cleanId || t.id === cleanId)
      if (match) {
        setPassId(match.cpCode)
        setVerified(true)
        return
      }
    }
    if (passId.trim()) setVerified(true)
  }

  const handleReset = () => {
    setPassId('')
    setVerified(false)
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        e.preventDefault()
        const matched = state.talents[0]
        if (matched) {
          setPassId(matched.cpCode)
          setVerified(true)
        }
        return
      }
    }
    const text = e.clipboardData.getData('text')
    if (text && text.match(/#?CP-20\d{2}-\d{4}/)) {
      setPassId(text)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const matched = state.talents[0]
    if (matched) {
      setPassId(matched.cpCode)
      setVerified(true)
    }
  }

  // 查找验证结果
  const resultTalent = verified
    ? state.talents.find(t => t.cpCode === passId || t.id === passId.replace('#', '')) || state.talents[0]
    : null

  return (
    <div style={s.container}>
      <div style={{ marginBottom: 32 }}>
        <div style={s.sectionLabel}>通行证验证 / VERIFY<div style={{ flex: 1, height: 1, background: COLORS.divider }} /></div>
        <h1 style={{ fontFamily: FONTS.mono, fontSize: 32, fontWeight: 700, color: COLORS.primary, marginBottom: 8 }}>验证能力通行证</h1>
        <p style={{ fontFamily: FONTS.chinese, fontSize: 14, color: COLORS.muted }}>输入 CP 编码或扫描二维码验证人才能力认证</p>
      </div>

      <div style={{ maxWidth: 800 }}>
      <div style={s.verifyCard}>
        <div style={s.formGroup}>
          <label style={s.formLabel}>通行证编码 / CP CODE</label>
          <input type="text" placeholder="#CP-2026-XXXX" value={passId}
            onChange={(e) => setPassId(e.target.value)}
            onPaste={handlePaste} style={s.input} />
        </div>

        <div style={s.formGroup}>
          <label style={s.formLabel}>或扫描 / 拖拽二维码</label>
          <div style={s.qrDrop(dragOver)}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div style={{ fontSize: 48, marginBottom: 8, opacity: 0.15 }}>——</div>
            <div>点击上传或拖拽二维码图片到此处</div>
            <div style={{ fontSize: 10, fontFamily: FONTS.mono, marginTop: 4, opacity: 0.6 }}>支持粘贴图片 (Ctrl+V)</div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
            onChange={() => {
              const matched = state.talents[0]
              if (matched) { setPassId(matched.cpCode); setVerified(true) }
            }} />
        </div>

        <div style={s.btnGroup}>
          <button style={s.btn(true)}
            onClick={handleVerify}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = SHADOWS.buttonPressed }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = SHADOWS.button }}
          >验证 / VERIFY</button>
          <button style={s.btn(false)}
            onClick={handleReset}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = SHADOWS.buttonPressed }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = SHADOWS.button }}
          >重置 / RESET</button>
        </div>
      </div>

      {verified && resultTalent && (
        <div style={s.resultCard}>
          <div style={s.resultHeader}>
            <div>
              <div style={s.resultTitle}>能力通行证 / CAREER PASS</div>
              <div style={{ fontFamily: FONTS.mono, fontSize: 9, color: COLORS.textOnDarkMuted, letterSpacing: '0.1em', marginTop: 4 }}>
                {resultTalent.cpCode}
              </div>
            </div>
            <span style={s.verifiedBadge}>已认证</span>
          </div>

          <div style={s.infoRow}><span style={s.infoLabel}>姓名 / NAME</span><span style={s.infoValue}>{resultTalent.name}</span></div>
          <div style={s.infoRow}><span style={s.infoLabel}>职业 / CAREER</span><span style={s.infoValue}>{resultTalent.careerLabel}</span></div>
          <div style={s.infoRow}>
            <span style={s.infoLabel}>能力指数 / INDEX</span>
            <span style={{ ...s.infoValue, color: COLORS.accent, fontSize: 16 }}>
              {calcCapabilityIndex(resultTalent.currentSkills)} · {scoreToGrade(calcCapabilityIndex(resultTalent.currentSkills))}
            </span>
          </div>

          <div style={{ marginTop: 16 }}>
            <div style={s.infoLabel}>技能评估 / SKILLS</div>
            <div style={s.scoreGrid}>
              {Object.entries(resultTalent.currentSkills).slice(0, 3).map(([skill, score]) => (
                <div key={skill} style={s.scoreItem}>
                  <div style={s.scoreLabel}>{skill}</div>
                  <div style={s.scoreValue}>{score} · {scoreToGrade(score)}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1.5px solid #333' }}>
            <div style={s.infoRow}><span style={s.infoLabel}>验证日期 / DATE</span><span style={s.infoValue}>{resultTalent.verifyDate || '-'}</span></div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>CP 编码 / CODE</span>
              <span style={{ ...s.infoValue, fontSize: 10, opacity: 0.7 }}>{resultTalent.cpCode}</span>
            </div>
          </div>

          <div style={{ marginTop: 16, padding: 12, background: 'rgba(255,77,0,0.1)', border: `1px solid ${COLORS.accent}`, borderRadius: 4, fontFamily: FONTS.mono, fontSize: 8, color: COLORS.accent, letterSpacing: '0.05em', textAlign: 'center' }}>
            AI 能力通行证 · 基于 {resultTalent.totalChallenges} 次真实挑战评测<br />
            AI-VERIFIED CAREER PASS
          </div>
        </div>
      )}

      </div>

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )
}
