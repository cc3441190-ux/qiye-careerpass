import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { COLORS, FONTS, SHADOWS, BORDERS, RADIUS } from '../components/design/tokens'
import { getApiKey, setApiKey, testConnection } from '../api/deepseek'

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
    opacity: 0.6, letterSpacing: '0.1em', marginBottom: 20, paddingBottom: 12,
    borderBottom: `1px solid ${COLORS.divider}`,
  } as React.CSSProperties,
  formRow: {
    display: 'flex', alignItems: 'center', marginBottom: 16, gap: 16,
  } as React.CSSProperties,
  formLabel: {
    fontFamily: FONTS.chinese, fontSize: 13, fontWeight: 600, color: COLORS.primary,
    width: 100, flexShrink: 0,
  } as React.CSSProperties,
  formValue: {
    flex: 1, maxWidth: 400, fontFamily: FONTS.mono, fontSize: 12,
    color: COLORS.primary, padding: '10px 14px', background: COLORS.bg,
    borderRadius: 4, border: `1px solid transparent`,
  } as React.CSSProperties,
  formInput: {
    flex: 1, maxWidth: 400, padding: '10px 14px', fontFamily: FONTS.chinese, fontSize: 13,
    color: COLORS.primary, background: COLORS.surface, border: BORDERS.standard,
    borderRadius: 4, outline: 'none', boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  formTextarea: {
    flex: 1, maxWidth: 400, padding: '10px 14px', fontFamily: FONTS.chinese, fontSize: 13,
    color: COLORS.primary, background: COLORS.surface, border: BORDERS.standard,
    borderRadius: 4, outline: 'none', resize: 'vertical' as const, minHeight: 80, boxSizing: 'border-box' as const,
  } as React.CSSProperties,
  statusBadge: (verified: boolean): React.CSSProperties => ({
    display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px',
    fontFamily: FONTS.mono, fontSize: 11, fontWeight: 700, borderRadius: RADIUS.badge,
    letterSpacing: '0.05em',
    background: verified ? COLORS.primary : COLORS.accent,
    color: COLORS.textOnDark,
  }),
  btn: (variant: 'primary' | 'secondary'): React.CSSProperties => ({
    padding: '10px 24px', fontFamily: FONTS.mono, fontSize: 12, fontWeight: 700,
    color: variant === 'primary' ? COLORS.textOnDark : COLORS.primary,
    background: variant === 'primary' ? COLORS.primary : COLORS.bg,
    border: BORDERS.standard, borderRadius: 4, cursor: 'pointer',
    letterSpacing: '0.05em', boxShadow: SHADOWS.button,
    transition: 'all 0.1s',
  }),
  planCard: {
    background: COLORS.bg, border: BORDERS.standard, borderRadius: RADIUS.card,
    padding: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
  } as React.CSSProperties,
  planName: {
    fontFamily: FONTS.mono, fontSize: 16, fontWeight: 700, color: COLORS.primary,
  } as React.CSSProperties,
  planPrice: {
    fontFamily: FONTS.mono, fontSize: 24, fontWeight: 700, color: COLORS.primary,
  } as React.CSSProperties,
  usageBar: {
    background: COLORS.divider, height: 8, borderRadius: 2, overflow: 'hidden', margin: '8px 0',
  } as React.CSSProperties,
  usageFill: (pct: number, color: string): React.CSSProperties => ({
    width: `${pct}%`, height: '100%', borderRadius: 2, transition: 'width 0.3s', background: color,
  }),
  apiKeyInput: {
    flex: 1,
    padding: '10px 14px',
    fontFamily: FONTS.mono,
    fontSize: 12,
    color: COLORS.primary,
    background: COLORS.bg,
    border: BORDERS.standard,
    borderRadius: 4,
    outline: 'none',
    letterSpacing: '0.02em',
    boxSizing: 'border-box' as const,
  } as React.CSSProperties,
}

const currentPlan = {
  name: '专业版', price: '¥2,999', period: '/年',
  features: ['无限人才搜索', '50个活跃挑战', '优先审核', 'API 接口'],
  usage: {
    challenges: { used: 12, total: 50 },
    searches: { used: 186, total: 500 },
    api: { used: 3240, total: 10000 },
  },
}

export default function EnterpriseSettings() {
  const navigate = useNavigate()
  const { state } = useApp()
  const ent = state.enterprise
  const entStatus = ent?.verifyStatus || 'unverified'
  const entCompanyName = ent?.companyName || ''
  const entCreditCode = ent?.creditCode || ''
  const entSubmittedAt = ent?.submittedAt || ''
  const entReviewNote = ent?.reviewNote || ''

  const [editMode, setEditMode] = useState(false)
  const [company, setCompany] = useState({ name: '星辰科技有限公司', industry: '互联网 / AI', size: '100-500人', description: '专注于 AI 驱动的人才评估与招聘解决方案。' })

  // API Key
  const [localApiKey, setLocalApiKey] = useState('')
  const [keySaved, setKeySaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'idle' | 'success' | 'fail'>('idle')

  useEffect(() => {
    const existing = getApiKey()
    if (existing) {
      setLocalApiKey(existing)
      setKeySaved(true)
    }
  }, [])

  const handleSaveKey = () => {
    setApiKey(localApiKey.trim())
    setKeySaved(true)
    setTestResult('idle')
  }

  const handleTestKey = async () => {
    setApiKey(localApiKey.trim())
    setTesting(true)
    setTestResult('idle')
    const ok = await testConnection()
    setTestResult(ok ? 'success' : 'fail')
    setTesting(false)
    if (ok) setKeySaved(true)
  }

  return (
    <div style={s.container}>
      <div style={{ marginBottom: 32 }}>
        <div style={s.sectionLabel}>企业设置<div style={{ flex: 1, height: 1, background: COLORS.divider }} /></div>
        <h1 style={{ fontFamily: FONTS.mono, fontSize: 32, fontWeight: 700, color: COLORS.primary, marginBottom: 8 }}>设置</h1>
        <p style={{ fontFamily: FONTS.chinese, fontSize: 14, color: COLORS.muted }}>管理企业信息、API 配置和套餐</p>
      </div>

      {/* ===== DeepSeek AI 密钥配置 ===== */}
      <div style={s.card}>
        <div style={s.cardHeader}>AI 服务配置</div>
        <p style={{ fontFamily: FONTS.chinese, fontSize: 13, color: COLORS.muted, marginBottom: 16 }}>
          CareerPass 的 AI 评分、挑战生成和人才匹配功能由 DeepSeek 大模型驱动。<br />
          <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener" style={{ color: COLORS.accent }}>
            点击这里获取 API 密钥 →
          </a>
        </p>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <input
            type="password"
            placeholder="sk-..."
            value={localApiKey}
            onChange={(e) => { setLocalApiKey(e.target.value); setKeySaved(false); setTestResult('idle') }}
            style={s.apiKeyInput}
          />
          <button style={s.btn('secondary')} onClick={handleSaveKey}>保存密钥</button>
          <button
            style={{ ...s.btn('primary'), opacity: testing ? 0.6 : 1 }}
            onClick={handleTestKey}
            disabled={testing || !localApiKey.trim()}
          >
            {testing ? '测试中...' : '测试连接'}
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
          <span style={{
            display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
            background: testResult === 'success' ? COLORS.success : testResult === 'fail' ? COLORS.accent : COLORS.divider,
          }} />
          <span style={{ fontFamily: FONTS.mono, fontSize: 10, color: COLORS.muted }}>
            {testResult === 'success' ? 'OK  连接成功 — AI 功能已就绪'
              : testResult === 'fail' ? 'FAIL  连接失败 — 请检查密钥是否正确'
              : keySaved ? '密钥已保存' : '请输入并保存你的 DeepSeek API 密钥'}
          </span>
        </div>
        <div style={{ marginTop: 12, fontFamily: FONTS.mono, fontSize: 9, color: COLORS.muted, lineHeight: 1.8 }}>
          INFO 小提示：密钥保存在浏览器中，不会上传到任何第三方服务器。所有 AI 请求直接从你的浏览器发送到 DeepSeek。
        </div>
      </div>

      {/* ===== 企业信息 ===== */}
      <div style={s.card}>
        <div style={{ ...s.cardHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>企业信息</span>
          <button
            onClick={() => setEditMode(!editMode)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: FONTS.mono, fontSize: 10, color: COLORS.accent, letterSpacing: '0.05em' }}
          >
            {editMode ? '取消编辑' : '编辑'}
          </button>
        </div>
        {editMode ? (
          <>
            <div style={s.formRow}>
              <span style={s.formLabel}>企业名称</span>
              <input style={s.formInput} value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} />
            </div>
            <div style={s.formRow}>
              <span style={s.formLabel}>所属行业</span>
              <input style={s.formInput} value={company.industry} onChange={(e) => setCompany({ ...company, industry: e.target.value })} />
            </div>
            <div style={s.formRow}>
              <span style={s.formLabel}>企业规模</span>
              <select style={s.formInput} value={company.size} onChange={(e) => setCompany({ ...company, size: e.target.value })}>
                <option>1-50人</option><option>50-100人</option><option>100-500人</option><option>500-1000人</option><option>1000人以上</option>
              </select>
            </div>
            <div style={s.formRow}>
              <span style={s.formLabel}>企业简介</span>
              <textarea style={s.formTextarea} value={company.description} onChange={(e) => setCompany({ ...company, description: e.target.value })} />
            </div>
            <button
              style={s.btn('primary')}
              onClick={() => setEditMode(false)}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = SHADOWS.buttonPressed }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = SHADOWS.button }}
            >保存修改</button>
          </>
        ) : (
          <>
            <div style={s.formRow}><span style={s.formLabel}>企业名称</span><span style={s.formValue}>{company.name}</span></div>
            <div style={s.formRow}><span style={s.formLabel}>所属行业</span><span style={s.formValue}>{company.industry}</span></div>
            <div style={s.formRow}><span style={s.formLabel}>企业规模</span><span style={s.formValue}>{company.size}</span></div>
            <div style={s.formRow}><span style={s.formLabel}>企业简介</span><span style={{ ...s.formValue, whiteSpace: 'pre-wrap' }}>{company.description}</span></div>
          </>
        )}
      </div>

      {/* ===== 认证状态 ===== */}
      <div style={s.card}>
        <div style={{ ...s.cardHeader, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>认证状态</span>
          {entStatus === 'unverified' && (
            <button
              onClick={() => navigate('/enterprise-verify')}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: FONTS.mono, fontSize: 10, color: COLORS.accent, fontWeight: 700, letterSpacing: '0.05em' }}
            >
              去认证 →
            </button>
          )}
        </div>
        {([
          {
            label: '企业认证',
            ok: entStatus === 'approved',
            statusText: entStatus === 'approved' ? '已认证' : entStatus === 'pending' ? 'PENDING 审核中' : entStatus === 'rejected' ? 'X 已拒绝' : '待认证',
          },
          { label: '实名状态', ok: entStatus === 'approved', statusText: entStatus === 'approved' ? '已认证' : '待认证' },
          { label: '区块链存证', ok: entStatus === 'approved', statusText: entStatus === 'approved' ? '已认证' : '待认证' },
        ] as { label: string; ok: boolean; statusText: string }[]).map(item => (
          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontFamily: FONTS.chinese, fontSize: 13, color: COLORS.primary }}>{item.label}</span>
            <span style={s.statusBadge(item.ok)}>{item.statusText}</span>
          </div>
        ))}
        {entStatus === 'rejected' && (
          <div style={{ marginTop: 12, marginBottom: 16, padding: 12, background: '#FFF0ED', border: `1.5px solid ${COLORS.accent}`, borderRadius: 4, fontFamily: FONTS.chinese, fontSize: 12, color: COLORS.primary }}>
            <strong>拒绝原因：</strong>{entReviewNote || '未提供具体原因'}
          </div>
        )}
        {entStatus === 'approved' && (
          <div style={{ marginTop: 16, padding: 12, background: COLORS.bg, border: `1px solid ${COLORS.divider}`, borderRadius: 4, fontFamily: FONTS.mono, fontSize: 9, color: COLORS.muted, lineHeight: 1.8 }}>
            * 认证数据已上链存证<br />
            * 企业全称：{entCompanyName || '星辰科技有限公司'}<br />
            * 信用代码：{entCreditCode || '91110000XXXXXXXXXX'}<br />
            * 认证日期：{entSubmittedAt || '-'}
          </div>
        )}
      </div>

      {/* ===== 套餐 ===== */}
      <div style={s.card}>
        <div style={s.cardHeader}>套餐管理</div>
        <div style={s.planCard}>
          <div>
            <div style={s.planName}>{currentPlan.name}</div>
            <span style={s.planPrice}>{currentPlan.price}</span>
            <span style={{ fontFamily: FONTS.mono, fontSize: 13, color: COLORS.muted }}>{currentPlan.period}</span>
          </div>
          <button style={s.btn('secondary')}>升级套餐</button>
        </div>
        {[
          { label: '挑战使用量', ...currentPlan.usage.challenges, color: COLORS.primary },
          { label: '搜索次数', ...currentPlan.usage.searches, color: COLORS.accent },
          { label: 'API 调用', ...currentPlan.usage.api, color: COLORS.primary },
        ].map(item => (
          <div key={item.label} style={{ marginTop: 16 }}>
            <div style={{ fontFamily: FONTS.chinese, fontSize: 13, fontWeight: 600, color: COLORS.primary, marginBottom: 6 }}>{item.label}</div>
            <div style={s.usageBar}>
              <div style={s.usageFill((item.used / item.total) * 100, item.color)} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: FONTS.mono, fontSize: 11, color: COLORS.muted }}>
              <span>{item.used} 已用</span><span>{item.total} 总量</span>
            </div>
          </div>
        ))}
      </div>

      {/* ===== 账号安全 ===== */}
      <div style={s.card}>
        <div style={s.cardHeader}>账号安全</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontFamily: FONTS.chinese, fontSize: 13, color: COLORS.primary }}>登录邮箱</span>
          <span style={{ fontFamily: FONTS.mono, fontSize: 12, color: COLORS.primary }}>hr@stellar-tech.com</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontFamily: FONTS.chinese, fontSize: 13, color: COLORS.primary }}>两步验证</span>
          <span style={s.statusBadge(true)}>OK  已开启</span>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
          <button style={s.btn('secondary')}>修改密码</button>
          <button style={s.btn('secondary')}>更换邮箱</button>
        </div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  )
}
