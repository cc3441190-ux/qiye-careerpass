import { useState, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { COLORS, FONTS, SHADOWS, BORDERS, RADIUS } from '../components/design/tokens'

// ============================================================
// 企业身份认证 — 参考 Boss直聘 / 智联招聘 认证模式
// 流程：企业信息 → 营业执照 → HR授权 → 提交审核
// ============================================================

type VerifyStep = 1 | 2 | 3 | 4

const STEPS = [
  { n: 1 as VerifyStep, label: '企业信息', en: 'COMPANY INFO', desc: '填写企业基本工商信息' },
  { n: 2 as VerifyStep, label: '营业执照', en: 'LICENSE', desc: '上传营业执照照片' },
  { n: 3 as VerifyStep, label: 'HR 授权', en: 'AUTHORIZATION', desc: 'HR 身份授权认证' },
  { n: 4 as VerifyStep, label: '提交确认', en: 'CONFIRM', desc: '确认信息并提交审核' },
]

// 图片上传组件
function ImageUploader({ image, onImage, label, hint }: {
  image: string
  onImage: (b64: string) => void
  label: string
  hint: string
}) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => onImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div>
      <label style={formLabel}>{label}</label>
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]) }}
        style={{
          width: '100%', height: 180, cursor: 'pointer',
          background: dragOver ? 'rgba(255,77,0,0.06)' : COLORS.bg,
          border: image ? `2px solid ${COLORS.accent}` : dragOver ? BORDERS.accent : `1.5px dashed ${COLORS.divider}`,
          borderRadius: RADIUS.card,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.2s', overflow: 'hidden', position: 'relative',
        }}
      >
        {image ? (
          <>
            <img src={image} alt={label} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            <div style={{
              position: 'absolute', bottom: 8, right: 8,
              background: 'rgba(0,0,0,0.7)', color: '#fff', borderRadius: 4,
              padding: '2px 8px', fontFamily: FONTS.mono, fontSize: 9,
            }}>
              点击更换
            </div>
          </>
        ) : (
          <>
            <span style={{ fontSize: 40, marginBottom: 8, opacity: 0.2 }}>--</span>
            <span style={{ fontFamily: FONTS.chinese, fontSize: 13, color: COLORS.primary, fontWeight: 600 }}>{label}</span>
            <span style={{ fontFamily: FONTS.mono, fontSize: 10, color: COLORS.muted, marginTop: 4 }}>{hint}</span>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={(e) => { e.target.files?.[0] && handleFile(e.target.files[0]) }} />
    </div>
  )
}

export default function EnterpriseVerify() {
  const { state, dispatch, addToast } = useApp()
  const ent = state.enterprise
  const [step, setStep] = useState<VerifyStep>(ent.verifyStatus === 'approved' ? 4 : 1)

  // 表单状态 (从 context 初始化以支持回填)
  const [companyName, setCompanyName] = useState(ent.companyName)
  const [creditCode, setCreditCode] = useState(ent.creditCode)
  const [legalRep, setLegalRep] = useState(ent.legalRepresentative)
  const [licenseImg, setLicenseImg] = useState(ent.licenseImage)
  const [authLetterImg, setAuthLetterImg] = useState(ent.authLetterImage)
  const [hrName, setHrName] = useState(ent.hrName)
  const [hrId, setHrId] = useState(ent.hrIdNumber)
  const [hrPhone, setHrPhone] = useState(ent.hrPhone)
  const [hrBadge, setHrBadge] = useState(ent.hrBadgeImage)

  // 字段验证
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = (s: VerifyStep): boolean => {
    const e: Record<string, string> = {}
    if (s === 1) {
      if (!companyName.trim()) e.companyName = '请输入企业全称'
      if (!creditCode.trim() || creditCode.length !== 18) e.creditCode = '统一社会信用代码为18位'
      if (!legalRep.trim()) e.legalRep = '请输入法定代表人'
    }
    if (s === 2) {
      if (!licenseImg) e.licenseImg = '请上传营业执照'
    }
    if (s === 3) {
      if (!hrName.trim()) e.hrName = '请输入HR姓名'
      if (!hrId.trim()) e.hrId = '请输入身份证号'
      if (!hrPhone.trim()) e.hrPhone = '请输入手机号'
      if (!authLetterImg) e.authLetterImg = '请上传企业授权书'
      if (!hrBadge) e.hrBadge = '请上传工牌或名片'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      // 保存当前步骤数据到 context
      if (step === 1) dispatch({ type: 'UPDATE_ENTERPRISE', payload: { companyName, creditCode, legalRepresentative: legalRep } })
      if (step === 2) dispatch({ type: 'UPDATE_ENTERPRISE', payload: { licenseImage: licenseImg } })
      if (step === 3) dispatch({ type: 'UPDATE_ENTERPRISE', payload: { hrName, hrIdNumber: hrId, hrPhone, authLetterImage: authLetterImg, hrBadgeImage: hrBadge } })
      setStep((step + 1) as VerifyStep)
    }
  }

  const handleSubmit = () => {
    dispatch({ type: 'SUBMIT_ENTERPRISE_VERIFY' })
    addToast('企业认证资料已提交，预计1-3个工作日审核', 'success')
    setStep(4)
  }

  const isPending = ent.verifyStatus === 'pending'
  const isApproved = ent.verifyStatus === 'approved'
  const isRejected = ent.verifyStatus === 'rejected'

  // 已认证状态
  if (isApproved) {
    return (
      <div style={container}>
        <div style={{ marginBottom: 32 }}>
          <SectionLabel en="ENTERPRISE VERIFY" zh="企业认证" />
          <h1 style={pageTitle}>企业身份认证</h1>
        </div>
        <div style={{
          background: COLORS.surface, border: BORDERS.standard, borderRadius: RADIUS.card,
          boxShadow: SHADOWS.card, padding: 48, textAlign: 'center',
        }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>--</div>
          <div style={{ fontFamily: FONTS.mono, fontSize: 24, fontWeight: 700, color: COLORS.primary, marginBottom: 8 }}>
            ENTERPRISE VERIFIED
          </div>
          <div style={{ fontFamily: FONTS.chinese, fontSize: 18, fontWeight: 700, color: COLORS.success, marginBottom: 16 }}>
            企业认证已通过
          </div>
          <div style={{
            background: COLORS.primary, border: BORDERS.standard, borderRadius: RADIUS.card,
            boxShadow: SHADOWS.darkCard, padding: 24, maxWidth: 500, margin: '0 auto',
            color: COLORS.textOnDark, textAlign: 'left',
          }}>
            {[
              ['企业全称', ent.companyName],
              ['信用代码', ent.creditCode],
              ['法定代表人', ent.legalRepresentative],
              ['认证 HR', ent.hrName],
              ['认证日期', ent.submittedAt],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #333' }}>
                <span style={{ fontFamily: FONTS.mono, fontSize: 9, opacity: 0.55, letterSpacing: '0.1em' }}>{label}</span>
                <span style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={container}>
      {/* 标题 */}
      <div style={{ marginBottom: 32 }}>
        <SectionLabel en="ENTERPRISE VERIFY" zh="企业认证" />
        <h1 style={pageTitle}>企业身份认证</h1>
        <p style={pageDesc}>完成企业认证后可使用全部招聘功能（参考 Boss直聘 / 智联 认证标准）</p>
      </div>

      <div style={{ maxWidth: 860 }}>

      {/* 审核状态横幅 */}
      {isPending && (
        <div style={{
          background: '#FFF8E1', border: `2px solid ${COLORS.warning}`, borderRadius: RADIUS.card,
          padding: '16px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: COLORS.warning }}>!</span>
          <div>
            <div style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, color: COLORS.warning, letterSpacing: '0.05em' }}>
              PENDING / 审核中
            </div>
            <div style={{ fontFamily: FONTS.chinese, fontSize: 13, color: COLORS.primary }}>
              你的企业认证资料正在审核中，预计 1-3 个工作日完成。请耐心等待。
            </div>
          </div>
        </div>
      )}

      {isRejected && (
        <div style={{
          background: '#FFF0ED', border: BORDERS.accent, borderRadius: RADIUS.card,
          padding: '16px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: COLORS.warning }}>!</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700, color: COLORS.accent, letterSpacing: '0.05em' }}>
              REJECTED / 认证未通过
            </div>
            <div style={{ fontFamily: FONTS.chinese, fontSize: 13, color: COLORS.primary }}>
              {ent.reviewNote || '审核未通过，请修改资料后重新提交'}
            </div>
          </div>
          <button style={outlineBtn} onClick={() => setStep(1)}>重新提交</button>
        </div>
      )}

      {/* 步骤导航 */}
      <div style={stepBar}>
        {STEPS.map((s, i) => (
          <div key={s.n} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div
              onClick={() => { if (s.n < step) setStep(s.n) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
                background: s.n === step ? COLORS.primary : s.n < step ? COLORS.surface : COLORS.bg,
                border: s.n === step ? `2px solid ${COLORS.primary}` : s.n < step ? BORDERS.standard : `1.5px solid ${COLORS.divider}`,
                borderRadius: RADIUS.input, cursor: s.n <= step ? 'pointer' : 'default',
                flex: 1, transition: 'all 0.2s',
              }}
            >
              <span style={{
                width: 26, height: 26, borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontFamily: FONTS.mono, fontSize: 11, fontWeight: 700,
                background: s.n < step ? COLORS.accent : s.n === step ? COLORS.accent : COLORS.divider,
                color: s.n <= step ? COLORS.textOnDark : COLORS.muted,
                flexShrink: 0,
              }}>
                {s.n < step ? 'OK ' : s.n}
              </span>
              <div>
                <div style={{
                  fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700,
                  color: s.n === step ? COLORS.textOnDark : s.n <= step ? COLORS.primary : COLORS.muted,
                  letterSpacing: '0.1em', marginBottom: 1,
                }}>
                  {s.en}
                </div>
                <div style={{
                  fontFamily: FONTS.chinese, fontSize: 12, fontWeight: 700,
                  color: s.n === step ? COLORS.textOnDark : s.n <= step ? COLORS.primary : COLORS.muted,
                }}>
                  {s.label}
                </div>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div style={{
                width: 20, height: 2, margin: '0 4px',
                background: s.n < step ? COLORS.accent : COLORS.divider,
                flexShrink: 0,
              }} />
            )}
          </div>
        ))}
      </div>

      {/* ===== Step 1: 企业工商信息 ===== */}
      {step === 1 && (
        <div style={formCard}>
          <div style={cardHeader}>
            <span>STEP 01 — 企业工商信息</span>
            <span style={{ fontFamily: FONTS.chinese, fontSize: 11, fontWeight: 400, color: COLORS.muted, letterSpacing: 0 }}>
              请按照营业执照上的信息如实填写
            </span>
          </div>

          <div style={formGroup}>
            <label style={formLabel}>企业全称 *</label>
            <input style={inputStyle(!!errors.companyName)} placeholder="请与营业执照上的名称完全一致"
              value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            {errors.companyName && <div style={errStyle}>{errors.companyName}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={formGroup}>
              <label style={formLabel}>统一社会信用代码 *</label>
              <input style={inputStyle(!!errors.creditCode)} placeholder="18位信用代码，如 91110000XXXXXXXXXX"
                value={creditCode} maxLength={18}
                onChange={(e) => setCreditCode(e.target.value.replace(/\s/g, ''))} />
              {errors.creditCode && <div style={errStyle}>{errors.creditCode}</div>}
            </div>
            <div style={formGroup}>
              <label style={formLabel}>法定代表人 *</label>
              <input style={inputStyle(!!errors.legalRep)} placeholder="营业执照上的法定代表人姓名"
                value={legalRep} onChange={(e) => setLegalRep(e.target.value)} />
              {errors.legalRep && <div style={errStyle}>{errors.legalRep}</div>}
            </div>
          </div>

          <div style={{
            marginTop: 20, padding: 14, background: COLORS.bg,
            border: `1.5px solid ${COLORS.divider}`, borderRadius: RADIUS.card,
            fontFamily: FONTS.mono, fontSize: 9, color: COLORS.muted, lineHeight: 1.8,
          }}>
            提示：企业工商信息将用于认证核实，您的信息仅用于认证目的，受区块链加密保护。
          </div>
        </div>
      )}

      {/* ===== Step 2: 营业执照上传 ===== */}
      {step === 2 && (
        <div style={formCard}>
          <div style={cardHeader}>
            <span>STEP 02 — 营业执照上传</span>
            <span style={{ fontFamily: FONTS.chinese, fontSize: 11, fontWeight: 400, color: COLORS.muted, letterSpacing: 0 }}>
              请上传清晰可辨的营业执照照片
            </span>
          </div>

          <ImageUploader
            image={licenseImg}
            onImage={setLicenseImg}
            label="营业执照"
            hint="支持 JPG/PNG，请确保文字清晰可辨，大小不超过 5MB"
          />
          {errors.licenseImg && <div style={errStyle}>{errors.licenseImg}</div>}

          <div style={{
            marginTop: 16, padding: 14, background: '#FFF7F3',
            border: `1.5px solid ${COLORS.accent}30`, borderRadius: RADIUS.card,
          }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: COLORS.accent, letterSpacing: '0.05em', marginBottom: 8 }}>
              营业执照要求
            </div>
            <ul style={{ fontFamily: FONTS.chinese, fontSize: 12, color: COLORS.primary, paddingLeft: 18, lineHeight: 2 }}>
              <li>证照边框完整、文字清晰、无遮挡</li>
              <li>统一社会信用代码清晰可见</li>
              <li>企业名称与第一步填写完全一致</li>
              <li>证照在有效期内</li>
            </ul>
          </div>
        </div>
      )}

      {/* ===== Step 3: HR 授权认证 ===== */}
      {step === 3 && (
        <div style={formCard}>
          <div style={cardHeader}>
            <span>STEP 03 — HR 授权认证</span>
            <span style={{ fontFamily: FONTS.chinese, fontSize: 11, fontWeight: 400, color: COLORS.muted, letterSpacing: 0 }}>
              确认你作为企业 HR 的合法身份
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={formGroup}>
              <label style={formLabel}>HR 姓名 *</label>
              <input style={inputStyle(!!errors.hrName)} placeholder="你的真实姓名"
                value={hrName} onChange={(e) => setHrName(e.target.value)} />
              {errors.hrName && <div style={errStyle}>{errors.hrName}</div>}
            </div>
            <div style={formGroup}>
              <label style={formLabel}>身份证号 *</label>
              <input style={inputStyle(!!errors.hrId)} placeholder="18位身份证号码"
                value={hrId} maxLength={18}
                onChange={(e) => setHrId(e.target.value.replace(/\s/g, ''))} />
              {errors.hrId && <div style={errStyle}>{errors.hrId}</div>}
            </div>
          </div>

          <div style={formGroup}>
            <label style={formLabel}>手机号 *</label>
            <input style={inputStyle(!!errors.hrPhone)} placeholder="用于接收审核结果通知"
              value={hrPhone} maxLength={11}
              onChange={(e) => setHrPhone(e.target.value.replace(/\D/g, ''))} />
            {errors.hrPhone && <div style={errStyle}>{errors.hrPhone}</div>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 8 }}>
            <ImageUploader
              image={authLetterImg}
              onImage={setAuthLetterImg}
              label="企业授权书"
              hint="加盖公章的 HR 招聘授权书"
            />
            <ImageUploader
              image={hrBadge}
              onImage={setHrBadge}
              label="工牌 / 名片"
              hint="HR 本人的工牌或名片照片"
            />
          </div>
          {errors.authLetterImg && <div style={errStyle}>{errors.authLetterImg}</div>}
          {errors.hrBadge && <div style={errStyle}>{errors.hrBadge}</div>}
        </div>
      )}

      {/* ===== Step 4: 确认提交 ===== */}
      {step === 4 && !isPending && (
        <div style={formCard}>
          <div style={cardHeader}>
            <span>STEP 04 — 确认提交</span>
          </div>
          <p style={{ fontFamily: FONTS.chinese, fontSize: 13, color: COLORS.muted, marginBottom: 24 }}>
            请确认以下信息无误，提交后将进入 1-3 个工作日的人工审核。
          </p>

          {/* 摘要 */}
          <div style={{
            background: COLORS.bg, border: BORDERS.standard, borderRadius: RADIUS.card,
            padding: 20, marginBottom: 24,
          }}>
            {[
              ['企业全称', companyName],
              ['信用代码', creditCode],
              ['法定代表人', legalRep],
              ['营业执照', licenseImg ? 'OK  已上传' : 'X 未上传'],
              ['HR 姓名', hrName],
              ['身份证号', hrId],
              ['手机号', hrPhone],
              ['授权书', authLetterImg ? 'OK  已上传' : 'X 未上传'],
              ['工牌/名片', hrBadge ? 'OK  已上传' : 'X 未上传'],
            ].map(([label, value]) => (
              <div key={label} style={{
                display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                borderBottom: `1px solid ${COLORS.divider}`,
                fontFamily: FONTS.chinese, fontSize: 13, color: COLORS.primary,
              }}>
                <span style={{ fontWeight: 600 }}>{label}</span>
                <span style={{ color: String(value).startsWith('X') ? COLORS.accent : COLORS.primary, fontWeight: 700 }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div style={{
            padding: 16, background: '#FFF7F3', border: `1.5px solid ${COLORS.accent}30`,
            borderRadius: RADIUS.card, marginBottom: 24,
          }}>
            <div style={{ fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: COLORS.accent, letterSpacing: '0.05em', marginBottom: 6 }}>
              提交即代表你确认：
            </div>
            <ul style={{ fontFamily: FONTS.chinese, fontSize: 12, color: COLORS.primary, paddingLeft: 18, lineHeight: 2 }}>
              <li>以上信息真实有效，如有虚假愿承担法律责任</li>
              <li>上传的营业执照为企业真实有效的证件</li>
              <li>你已获得企业合法授权进行招聘活动</li>
            </ul>
          </div>

          <button style={submitBtn}
            onClick={handleSubmit}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = SHADOWS.buttonPressed }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = SHADOWS.button }}
          >
            提交认证申请
          </button>
        </div>
      )}

      {/* 步骤导航按钮 */}
      {step < 4 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
          {step > 1 && (
            <button style={outlineBtn} onClick={() => setStep((step - 1) as VerifyStep)}>上一步</button>
          )}
          <button style={primaryBtn} onClick={handleNext}>
            {step === 3 ? '预览确认' : '下一步'}
          </button>
        </div>
      )}

      {/* ===== DEV 开发调试：模拟审核 ===== */}
      {isPending && (
        <div style={{
          marginTop: 32, padding: 20, background: COLORS.bg,
          border: `1.5px dashed ${COLORS.divider}`, borderRadius: RADIUS.card,
        }}>
          <div style={{
            fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: COLORS.muted,
            letterSpacing: '0.1em', marginBottom: 12,
          }}>
            DEV TOOLS / 开发调试
          </div>
          <p style={{ fontFamily: FONTS.chinese, fontSize: 12, color: COLORS.muted, marginBottom: 14 }}>
            模拟审核结果（仅用于演示和测试）
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => {
                dispatch({ type: 'APPROVE_ENTERPRISE_VERIFY', payload: { note: '审核已通过，企业信息真实有效。' } })
                addToast('OK  模拟审核通过！', 'success')
              }}
              style={{
                flex: 1, height: 40, background: COLORS.success, border: BORDERS.standard,
                borderRadius: RADIUS.button, color: COLORS.textOnDark,
                fontFamily: FONTS.mono, fontSize: 11, fontWeight: 700,
                letterSpacing: '0.05em', cursor: 'pointer', boxShadow: SHADOWS.button,
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = SHADOWS.buttonPressed }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = SHADOWS.button }}
            >
              OK  模拟审核通过
            </button>
            <button
              onClick={() => {
                dispatch({ type: 'REJECT_ENTERPRISE_VERIFY', payload: { note: '营业执照照片模糊不清，请重新上传清晰照片。' } })
                addToast('FAIL  模拟审核拒绝', 'error')
              }}
              style={{
                flex: 1, height: 40, background: COLORS.accent, border: BORDERS.standard,
                borderRadius: RADIUS.button, color: COLORS.textOnDark,
                fontFamily: FONTS.mono, fontSize: 11, fontWeight: 700,
                letterSpacing: '0.05em', cursor: 'pointer', boxShadow: SHADOWS.button,
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = SHADOWS.buttonPressed }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = SHADOWS.button }}
            >
              FAIL  模拟审核拒绝
            </button>
          </div>
        </div>
      )}

      </div>{/* end maxWidth wrapper */}

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )
}

// ── 复用样式 ──
const container: React.CSSProperties = { animation: 'fadeIn 0.3s ease-out' }

const pageTitle: React.CSSProperties = {
  fontFamily: FONTS.mono, fontSize: 32, fontWeight: 700, color: COLORS.primary,
  marginBottom: 8, letterSpacing: '-0.02em',
}

const pageDesc: React.CSSProperties = {
  fontFamily: FONTS.chinese, fontSize: 14, color: COLORS.muted,
}

function SectionLabel({ en, zh }: { en: string; zh: string }) {
  return (
    <div style={{
      fontFamily: FONTS.mono, fontSize: 10, fontWeight: 700, color: COLORS.primary,
      opacity: 0.45, letterSpacing: '0.15em', marginBottom: 8,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      {en} / {zh}
      <div style={{ flex: 1, height: 1, background: COLORS.divider }} />
    </div>
  )
}

const stepBar: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24,
  overflow: 'hidden',
}

const formCard: React.CSSProperties = {
  background: COLORS.surface, border: BORDERS.standard, borderRadius: RADIUS.card,
  boxShadow: SHADOWS.card, padding: 28, marginBottom: 20,
}

const cardHeader: React.CSSProperties = {
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  fontFamily: FONTS.mono, fontSize: 11, fontWeight: 700, color: COLORS.primary,
  letterSpacing: '0.1em', marginBottom: 24, paddingBottom: 14,
  borderBottom: `1.5px solid ${COLORS.divider}`,
}

const formGroup: React.CSSProperties = { marginBottom: 20 }

const formLabel: React.CSSProperties = {
  fontFamily: FONTS.mono, fontSize: 9, fontWeight: 700, color: COLORS.primary,
  opacity: 0.6, letterSpacing: '0.15em', marginBottom: 6, display: 'block',
}

const inputStyle = (error: boolean): React.CSSProperties => ({
  width: '100%', height: 48, padding: '0 14px', background: COLORS.bg,
  border: error ? BORDERS.accent : BORDERS.standard, borderRadius: RADIUS.input,
  fontFamily: FONTS.chinese, fontSize: 14, color: COLORS.primary,
  outline: 'none', boxSizing: 'border-box',
})

const errStyle: React.CSSProperties = {
  fontFamily: FONTS.mono, fontSize: 9, color: COLORS.accent, marginTop: 4,
}

const primaryBtn: React.CSSProperties = {
  height: 48, padding: '0 28px',
  background: COLORS.primary, border: BORDERS.standard, borderRadius: RADIUS.button,
  color: COLORS.textOnDark,
  fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700,
  letterSpacing: '0.1em', cursor: 'pointer',
  boxShadow: SHADOWS.button, transition: 'transform 0.1s, box-shadow 0.1s',
}

const outlineBtn: React.CSSProperties = {
  height: 48, padding: '0 28px',
  background: COLORS.surface, border: BORDERS.standard, borderRadius: RADIUS.button,
  color: COLORS.primary,
  fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700,
  letterSpacing: '0.1em', cursor: 'pointer',
  boxShadow: SHADOWS.button, transition: 'transform 0.1s, box-shadow 0.1s',
}

const submitBtn: React.CSSProperties = {
  width: '100%', height: 52,
  background: COLORS.accent, border: BORDERS.standard, borderRadius: RADIUS.button,
  color: COLORS.textOnDark,
  fontFamily: FONTS.mono, fontSize: 13, fontWeight: 700,
  letterSpacing: '0.1em', cursor: 'pointer',
  boxShadow: SHADOWS.button, transition: 'transform 0.1s, box-shadow 0.1s',
}
