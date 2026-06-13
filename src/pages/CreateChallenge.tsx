import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { COLORS, FONTS, SHADOWS, BORDERS, RADIUS } from '../components/design/tokens'
import type { ChallengeType, DifficultyLevel, AbilityDimension } from '../types'

const allDimensions: Omit<AbilityDimension, 'weight'>[] = [
  { id: 'product', label: '产品设计' },
  { id: 'research', label: '用户研究' },
  { id: 'data', label: '数据分析' },
  { id: 'innovation', label: '创新思维' },
  { id: 'logic', label: '逻辑分析' },
  { id: 'communication', label: '沟通协作' },
  { id: 'tech', label: '技术实现' },
  { id: 'management', label: '项目管理' },
]

const PRESETS: { label: string; type: ChallengeType; dims: string[]; weights: Record<string, number>; desc: string }[] = [
  { label: '产品岗', type: '产品设计', dims: ['product','research','data','innovation','logic','communication'], weights: { product:40, research:20, data:15, innovation:10, logic:10, communication:5 }, desc: '产品·研究·数据为主' },
  { label: '技术岗', type: '前端开发', dims: ['tech','logic','management','innovation'], weights: { tech:50, logic:25, management:15, innovation:10 }, desc: '技术·逻辑·管理为主' },
  { label: '设计岗', type: 'UI/UX 设计', dims: ['innovation','research','product','communication'], weights: { innovation:35, research:25, product:25, communication:15 }, desc: '创新·研究·产品为主' },
  { label: '数据岗', type: '数据分析', dims: ['data','logic','tech','product'], weights: { data:45, logic:25, tech:20, product:10 }, desc: '数据·逻辑·技术为主' },
]

const defaultWeights: Record<string, number> = { product:40, research:20, data:15, innovation:10, logic:10, communication:5, tech:0, management:0 }
const challengeTypes: ChallengeType[] = ['产品设计','用户研究','数据分析','前端开发','后端开发','UI/UX 设计']
const difficultyLevels: DifficultyLevel[] = ['初级','中级','高级']
const DRAFT_KEY = 'careerpass_challenge_draft'

// ============================================================
const ps = COLORS.primary
const ms = COLORS.muted
const ws = COLORS.textOnDark

export default function CreateChallenge() {
  const navigate = useNavigate()
  const { state, dispatch, addToast } = useApp()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [challengeType, setChallengeType] = useState<ChallengeType>('产品设计')
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('中级')
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>(['product','research'])
  const [weights, setWeights] = useState<Record<string,number>>({ ...defaultWeights })
  const [deadline, setDeadline] = useState('')
  const [estimatedHours, setEstimatedHours] = useState('')
  const [maxParticipants, setMaxParticipants] = useState('')
  const [activePreset, setActivePreset] = useState('')
  const [errors, setErrors] = useState<Record<string,string>>({})
  const weightSum = selectedDimensions.reduce((s,id) => s + (weights[id]||0), 0)
  const isValid = weightSum === 100

  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(DRAFT_KEY)||'{}')
      if (d.title) setTitle(d.title)
      if (d.description) setDescription(d.description)
      if (d.challengeType) setChallengeType(d.challengeType)
      if (d.difficulty) setDifficulty(d.difficulty)
      if (d.skills) setSkills(d.skills)
      if (d.selectedDimensions) { setSelectedDimensions(d.selectedDimensions); setWeights({...defaultWeights}) }
      if (d.weights) setWeights(d.weights)
      if (d.deadline) setDeadline(d.deadline)
      if (d.estimatedHours) setEstimatedHours(d.estimatedHours)
      if (d.maxParticipants) setMaxParticipants(d.maxParticipants)
      addToast('已恢复上次未保存的草稿','info')
    } catch {}
  }, [])

  useEffect(() => {
    const t = setTimeout(() => localStorage.setItem(DRAFT_KEY, JSON.stringify({ title,description,challengeType,difficulty,skills,selectedDimensions,weights,deadline,estimatedHours,maxParticipants })), 3000)
    return () => clearTimeout(t)
  }, [title,description,challengeType,difficulty,skills,selectedDimensions,weights,deadline,estimatedHours,maxParticipants])

  const applyPreset = (p: typeof PRESETS[number]) => {
    setActivePreset(p.label)
    setSelectedDimensions([...p.dims])
    const nw: Record<string,number> = {}; Object.keys(defaultWeights).forEach(k => nw[k]=0)
    Object.entries(p.weights).forEach(([k,v]) => nw[k]=v)
    setWeights(nw)
    setChallengeType(p.type)
    if (errors.dimensions||errors.weights) setErrors({...errors,dimensions:'',weights:''})
  }

  const validate = (): boolean => {
    const e: Record<string,string> = {}
    if (!title.trim()) e.title = '请输入挑战标题'
    if (!description.trim()) e.description = '请输入挑战描述'
    if (selectedDimensions.length===0) e.dimensions = '请至少选择一个评估维度'
    if (weightSum!==100) e.weights = `权重总和必须为100%，当前为${weightSum}%`
    setErrors(e); return Object.keys(e).length===0
  }

  const addSkill = () => { if (skillInput.trim()&&!skills.includes(skillInput.trim())) { setSkills([...skills,skillInput.trim()]); setSkillInput('') } }
  const removeSkill = (s: string) => setSkills(skills.filter(x=>x!==s))

  const build = () => ({
    title: `${challengeType.toUpperCase()} / ${title}`, description, type: challengeType, difficulty, skills,
    dimensions: selectedDimensions.map(id=>({id,label:allDimensions.find(d=>d.id===id)?.label||id,weight:weights[id]})),
    deadline, estimatedHours: Number(estimatedHours)||0, maxParticipants: maxParticipants?Number(maxParticipants):null, status: 'active' as const,
  })

  const handlePublish = () => {
    if (!validate()) return
    const newId = `CHAL-${String(state.nextIds.challenge).padStart(3,'0')}`
    dispatch({ type:'ADD_CHALLENGE', payload: build() })
    localStorage.removeItem(DRAFT_KEY)
    addToast('挑战已发布！去看看匹配的候选人 →','success')
    navigate(`/talent?challengeId=${newId}`)
  }
  const handleDraft = () => { dispatch({ type:'ADD_CHALLENGE', payload: {...build(),status:'draft'} }); localStorage.removeItem(DRAFT_KEY); addToast('草稿已保存','info'); navigate('/challenge') }

  // ── Styles ──
  const lbl: React.CSSProperties = { fontFamily:FONTS.mono, fontSize:9, fontWeight:700, color:ps, opacity:0.6, letterSpacing:'0.15em', marginBottom:8, display:'block' }
  const inp = (err:boolean): React.CSSProperties => ({ width:'100%',height:48,padding:'0 14px',background:COLORS.bg,border:err?BORDERS.accent:BORDERS.standard,borderRadius:RADIUS.input,fontFamily:FONTS.chinese,fontSize:14,color:ps,outline:'none',boxSizing:'border-box' })

  return (
    <div style={{ animation:'fadeIn 0.3s ease-out' }}>
      {/* 标题 */}
      <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:FONTS.mono,fontSize:10,fontWeight:700,color:ps,opacity:0.45,letterSpacing:'0.15em',marginBottom:8,display:'flex',alignItems:'center',gap:8 }}>
          发布挑战<div style={{ flex:1,height:1,background:COLORS.divider }} />
        </div>
        <h1 style={{ fontFamily:FONTS.mono,fontSize:32,fontWeight:700,color:ps,marginBottom:8 }}>创建挑战</h1>
        <p style={{ fontFamily:FONTS.chinese,fontSize:14,color:ms }}>设置 AI 职业挑战，吸引优秀人才参与</p>
      </div>

      {/* ═══ 顶部快捷栏：预设模板 ═══ */}
      <div style={{ background:COLORS.surface,border:BORDERS.standard,borderRadius:RADIUS.card,boxShadow:SHADOWS.card,padding:'16px 22px',marginBottom:20,display:'flex',alignItems:'center',gap:12,flexWrap:'wrap' }}>
        <span style={{ fontFamily:FONTS.mono,fontSize:10,fontWeight:700,color:ms,letterSpacing:'0.1em',flexShrink:0,marginRight:4 }}>
          QUICK START
        </span>
        {PRESETS.map(p => {
          const isActive = activePreset===p.label
          return (
            <span key={p.label}
              onClick={() => applyPreset(p)}
              style={{
                display:'inline-flex',alignItems:'center',gap:6,padding:'8px 18px',
                border:isActive?BORDERS.accent:BORDERS.standard,borderRadius:RADIUS.button,
                cursor:'pointer',outline:'none',background:isActive?'#FFF7F3':COLORS.bg,
                transition:'all 0.15s',
              }}
              onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background='#F0EFEB'}}
              onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background=''}}
            >
              <span style={{ fontFamily:FONTS.mono,fontSize:11,fontWeight:700,color:isActive?COLORS.accent:ps,letterSpacing:'0.04em' }}>
                {p.label}模板
              </span>
              <span style={{ fontFamily:FONTS.chinese,fontSize:11,color:ms }}>{p.desc}</span>
              {isActive && <span style={{ fontFamily:FONTS.mono,fontSize:9,color:COLORS.accent,fontWeight:700 }}>✓</span>}
            </span>
          )
        })}
      </div>

      {/* ═══ 基本信息 ═══ */}
      <div style={{ background:COLORS.surface,border:BORDERS.standard,borderRadius:RADIUS.card,boxShadow:SHADOWS.card,padding:24,marginBottom:20 }}>
        <div style={{ fontFamily:FONTS.mono,fontSize:12,fontWeight:700,color:ps,letterSpacing:'0.1em',marginBottom:20,paddingBottom:12,borderBottom:BORDERS.medium }}>
          基本信息
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:24 }}>
          {/* 左 */}
          <div>
            <div style={{ marginBottom:20 }}>
              <label style={lbl}>挑战标题 *</label>
              <input style={inp(!!errors.title)} placeholder="例如：产品设计挑战" value={title}
                onChange={e=>{setTitle(e.target.value);if(errors.title)setErrors({...errors,title:''})}} />
              {errors.title&&<div style={{ fontFamily:FONTS.mono,fontSize:9,color:COLORS.accent,marginTop:4 }}>{errors.title}</div>}
            </div>
            <div style={{ marginBottom:0 }}>
              <label style={lbl}>挑战描述 *</label>
              <textarea style={{ ...inp(!!errors.description),padding:14,minHeight:140,resize:'vertical' }} placeholder="详细描述挑战内容、目标和评估标准..."
                value={description}
                onChange={e=>{setDescription(e.target.value);if(errors.description)setErrors({...errors,description:''})}} />
              {errors.description&&<div style={{ fontFamily:FONTS.mono,fontSize:9,color:COLORS.accent,marginTop:4 }}>{errors.description}</div>}
            </div>
          </div>
          {/* 右：类型/难度 + 技能 + 设置 */}
          <div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20 }}>
              <div>
                <label style={lbl}>挑战类型</label>
                <select style={inp(false)} value={challengeType} onChange={e=>setChallengeType(e.target.value as ChallengeType)}>
                  {challengeTypes.map(t=><option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={lbl}>难度等级</label>
                <select style={inp(false)} value={difficulty} onChange={e=>setDifficulty(e.target.value as DifficultyLevel)}>
                  {difficultyLevels.map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div style={{ marginBottom:20 }}>
              <label style={lbl}>技能要求</label>
              <div style={{ display:'flex',flexWrap:'wrap',gap:8,padding:12,background:COLORS.bg,border:BORDERS.standard,borderRadius:RADIUS.input,minHeight:48,alignItems:'center' }}>
                {skills.map(s=>(
                  <span key={s} style={{ display:'inline-flex',alignItems:'center',border:BORDERS.thick,borderRadius:RADIUS.tag,padding:'4px 8px',background:COLORS.surface,fontFamily:FONTS.mono,fontSize:10,fontWeight:700,letterSpacing:'0.02em' }}>
                    {s}<span style={{ marginLeft:6,cursor:'pointer',color:ms,fontSize:12 }} onClick={()=>removeSkill(s)}>X</span>
                  </span>
                ))}
                <input style={{ border:'none',outline:'none',background:'transparent',fontFamily:FONTS.mono,fontSize:11,color:ps,flex:1,minWidth:80 }}
                  placeholder="输入技能后回车" value={skillInput}
                  onChange={e=>setSkillInput(e.target.value)}
                  onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addSkill())} />
              </div>
            </div>
            <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16 }}>
              <div>
                <label style={lbl}>截止日期</label>
                <input type="date" style={inp(false)} value={deadline} onChange={e=>setDeadline(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>预估时长(h)</label>
                <input type="number" style={inp(false)} placeholder="例如：4" value={estimatedHours} onChange={e=>setEstimatedHours(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>最大人数</label>
                <input type="number" style={inp(false)} placeholder="不限制" value={maxParticipants} onChange={e=>setMaxParticipants(e.target.value)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 能力模型 ═══ */}
      <div style={{ background:COLORS.surface,border:BORDERS.standard,borderRadius:RADIUS.card,boxShadow:SHADOWS.card,padding:24,marginBottom:20 }}>
        <div style={{ fontFamily:FONTS.mono,fontSize:12,fontWeight:700,color:ps,letterSpacing:'0.1em',marginBottom:20,paddingBottom:12,borderBottom:BORDERS.medium }}>
          能力模型配置
        </div>
        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:24 }}>
          {/* 左：维度勾选 */}
          <div>
            <label style={lbl}>评估维度（至少选择1项）*</label>
            <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
              {allDimensions.map(dim=>(
                <label key={dim.id} style={{ display:'flex',alignItems:'center',gap:6,padding:'8px 12px',border:selectedDimensions.includes(dim.id)?BORDERS.accent:BORDERS.medium,borderRadius:RADIUS.tag,cursor:'pointer',fontFamily:FONTS.chinese,fontSize:12,color:ps }}>
                  <input type="checkbox" checked={selectedDimensions.includes(dim.id)}
                    onChange={e=>{
                      if(e.target.checked) setSelectedDimensions([...selectedDimensions,dim.id])
                      else setSelectedDimensions(selectedDimensions.filter(d=>d!==dim.id))
                      setActivePreset(''); if(errors.dimensions) setErrors({...errors,dimensions:''})
                    }} style={{ cursor:'pointer' }} />
                  {dim.label}
                </label>
              ))}
            </div>
            {errors.dimensions&&<div style={{ fontFamily:FONTS.mono,fontSize:9,color:COLORS.accent,marginTop:4 }}>{errors.dimensions}</div>}
          </div>
          {/* 右：权重 slider */}
          <div>
            <label style={lbl}>维度权重（总和 100%）</label>
            {selectedDimensions.length===0 ? (
              <div style={{ fontFamily:FONTS.chinese,fontSize:12,color:ms,padding:'12px 0' }}>请先在左侧选择评估维度</div>
            ) : (
              <>
                {selectedDimensions.map(dimId=>{
                  const dim = allDimensions.find(d=>d.id===dimId)!
                  return (
                    <div key={dimId} style={{ display:'flex',alignItems:'center',gap:12,marginBottom:8 }}>
                      <span style={{ width:72,fontFamily:FONTS.chinese,fontSize:12 }}>{dim.label}</span>
                      <button onClick={()=>{setWeights({...weights,[dimId]:Math.max(0,(weights[dimId]||0)-5)});setActivePreset('')}}
                        style={{ border:`1px solid ${COLORS.divider}`,background:COLORS.surface,borderRadius:2,cursor:'pointer',width:24,height:24,fontFamily:FONTS.mono,fontSize:12 }}>−</button>
                      <input type="range" min="0" max="100" value={weights[dimId]||0}
                        onChange={e=>{setWeights({...weights,[dimId]:parseInt(e.target.value)});setActivePreset('')}} style={{ flex:1 }} />
                      <button onClick={()=>{setWeights({...weights,[dimId]:Math.min(100,(weights[dimId]||0)+5)});setActivePreset('')}}
                        style={{ border:`1px solid ${COLORS.divider}`,background:COLORS.surface,borderRadius:2,cursor:'pointer',width:24,height:24,fontFamily:FONTS.mono,fontSize:12 }}>+</button>
                      <span style={{ width:36,fontFamily:FONTS.mono,fontSize:11,textAlign:'right' }}>{weights[dimId]||0}%</span>
                    </div>
                  )
                })}
              </>
            )}
            <div style={{ marginTop:8,fontFamily:FONTS.mono,fontSize:10,color:isValid?COLORS.success:COLORS.accent,fontWeight:700 }}>
              权重总和: {weightSum}% {!isValid&&`（剩余 ${100-weightSum}%）`}
            </div>
            {errors.weights&&<div style={{ fontFamily:FONTS.mono,fontSize:9,color:COLORS.accent,marginTop:4 }}>{errors.weights}</div>}
          </div>
        </div>
      </div>

      {/* ═══ 提交 ═══ */}
      <div style={{ display:'flex',justifyContent:'flex-end',gap:12 }}>
        <button onClick={handleDraft}
          onMouseDown={e=>{e.currentTarget.style.transform='translateY(2px)';e.currentTarget.style.boxShadow=SHADOWS.buttonPressed}}
          onMouseUp={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow=SHADOWS.button}}
          style={{ height:52,padding:'0 32px',background:COLORS.bg,border:BORDERS.standard,borderRadius:RADIUS.button,color:ps,fontFamily:FONTS.mono,fontSize:12,fontWeight:700,letterSpacing:'0.1em',cursor:'pointer',boxShadow:SHADOWS.button,transition:'transform 0.1s, box-shadow 0.1s' }}
        >存为草稿</button>
        <button disabled={!(isValid&&title.trim())} onClick={isValid&&title.trim()?handlePublish:undefined}
          onMouseDown={e=>{if(!(isValid&&title.trim()))return;e.currentTarget.style.transform='translateY(2px)';e.currentTarget.style.boxShadow=SHADOWS.buttonPressed}}
          onMouseUp={e=>{if(!(isValid&&title.trim()))return;e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow=SHADOWS.button}}
          style={{ height:52,padding:'0 44px',background:isValid&&title.trim()?COLORS.accent:COLORS.divider,border:isValid&&title.trim()?BORDERS.standard:BORDERS.medium,borderRadius:RADIUS.button,color:isValid&&title.trim()?ws:ms,fontFamily:FONTS.mono,fontSize:12,fontWeight:700,letterSpacing:'0.1em',cursor:isValid&&title.trim()?'pointer':'not-allowed',boxShadow:isValid&&title.trim()?SHADOWS.button:'none',transition:'transform 0.1s, box-shadow 0.1s' }}
        >发布挑战</button>
      </div>

      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
