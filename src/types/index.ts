// ============================================================
// CareerPass 企业端 — 全局类型定义 (v2.0 对齐 SPECIFICATION.md)
// ============================================================

// ============================================================
// 职业与技能常量
// ============================================================

export type CareerType = 'product' | 'design' | 'data' | 'tech'

export const CAREER_INFO: Record<CareerType, { label: string; color: string; equipment: string }> = {
  product: { label: '产品经理', color: '#FF6B35', equipment: '原型板' },
  design:  { label: '设计师',   color: '#9B59B6', equipment: '画笔' },
  data:    { label: '数据分析', color: '#3498DB', equipment: '报表' },
  tech:    { label: '技术开发', color: '#2ECC71', equipment: '代码' },
}

export const CAREER_LABELS: Record<CareerType, string> = {
  product: '产品经理',
  design: '设计师',
  data: '数据分析',
  tech: '技术开发',
}

/** 核心5维技能 */
export const CORE_SKILLS = ['产品设计', '用户研究', '原型设计', '视觉设计', '数据分析'] as const

/** 角色 → 所需技能映射 */
export const ROLE_SKILL_MAP: Record<string, string[]> = {
  '产品经理':  ['产品设计', '用户研究', '原型设计', '数据分析'],
  'UI设计师':  ['视觉设计', '原型设计', '用户研究'],
  '前端开发':  ['视觉设计', '原型设计'],
  '后端开发':  ['数据分析'],
  '数据分析师': ['数据分析', '原型设计'],
}

// ============================================================
// 等级映射
// ============================================================

/** 分数 → 等级映射 (对齐 SPECIFICATION.md) */
export function scoreToGrade(score: number): string {
  if (score >= 95) return 'S'
  if (score >= 85) return 'A+'
  if (score >= 78) return 'A'
  if (score >= 70) return 'B+'
  if (score >= 60) return 'B'
  if (score >= 55) return 'C+'
  return 'C'
}

/** 等级 → 分数映射 (用于排序/比较) */
export function scoreToValue(score: string): number {
  const map: Record<string, number> = {
    'S': 95, 'A+': 85, 'A': 78, 'A-': 74,
    'B+': 70, 'B': 60, 'B-': 57, 'C+': 55, 'C': 40,
  }
  return map[score] ?? 50
}

/** 计算能力指数 (技能分数的加权平均) */
export function calcCapabilityIndex(skills: Record<string, number>): number {
  const scores = Object.values(skills)
  if (scores.length === 0) return 0
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
}

// ============================================================
// CP 编码生成
// ============================================================

/** 根据 userId 生成 CP 编码 */
export function generateCpCode(userId: string): string {
  const hash = userId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const num = 1000 + (hash % 9000)
  return `#CP-2026-${num}`
}

// ============================================================
// 候选人 Talent (企业端视角)
// ============================================================

export interface ChallengeGrowth {
  challengeId: string
  date: string
  title: string
  growth: Record<string, number>
}

export interface Talent {
  id: string                          // "CP-2026-3847" (user-facing ID = cpCode without #)
  cpCode: string                      // "#CP-2026-3847"
  name: string
  gender?: string                     // "female" | "male"
  primaryCareer: CareerType           // 枚举，替代旧 `role: string`
  careerLabel: string                 // 中文展示标签
  avatarUrl?: string                  // base64 像素化身图片
  avatar: string                      // 降级单字显示
  currentSkills: Record<string, number>  // 5维核心技能：数字分数
  summary?: string                    // 一句话职业概述
  personalityTags: string[]           // 个性标签
  rank?: string                       // "TOP 23%"
  totalChallenges: number
  achievements: string[]
  challengeHistory: ChallengeGrowth[] // 替代旧 `timeline`
  verified: boolean
  date: string                        // 注册 / 首次评估日期
  verifyDate?: string                 // 最近验证日期
}

// ============================================================
// 挑战 Challenge
// ============================================================

export interface AbilityDimension {
  id: string
  label: string
  weight: number
}

export type ChallengeStatus = 'open' | 'closing' | 'closed'

export interface Challenge {
  id: string                    // "ch-001"
  company: string               // 企业名称
  title: string
  description: string
  role: string                  // 目标岗位 "产品经理" 等
  difficulty: number            // 1=简单 2=中等 3=较难
  difficultyLabel: string       // "简单" | "中等" | "较难"
  tags: string[]                // 替代旧 `skills`
  duration: string              // "60分钟" 替代旧 `estimatedHours: number`
  dimensions: AbilityDimension[]
  deadline: string
  status: ChallengeStatus       // "open" | "closing" | "closed"
  // 企业端特有
  estimatedHours?: number       // 兼容旧字段
  maxParticipants: number | null
  participants: number
  completionRate: string
  avgScore: string
  createdAt: string
}

// ============================================================
// 审核 Review
// ============================================================

export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export interface Review {
  id: string
  challengeId: string
  challengeTitle: string
  candidate: string
  candidateId: string
  status: ReviewStatus
  submittedAt: string
  scores: Record<string, string>
  overallGrade: string
  rejectReason?: string
  rejectFeedback?: string
}

// ============================================================
// 面试 Interview
// ============================================================

export type InterviewStatus = '待确认' | '已确认' | '已完成' | '待反馈' | '已取消'
export type InterviewType = '视频面试' | '现场面试' | '电话面试'

export interface InterviewFeedback {
  scores: Record<string, string>
  overallRating: string
  recommendation: string // 'strong_hire' | 'hire' | 'weak_hire' | 'no_hire'
  comments: string
}

export interface Interview {
  id: string
  candidate: string
  candidateId: string
  talentId: string
  role: string
  date: string
  time: string
  type: InterviewType
  interviewer: string
  status: InterviewStatus
  challengeId?: string
  challengeTitle?: string
  notes?: string
  feedback?: InterviewFeedback
}

// ============================================================
// 消息 Message
// ============================================================

export type MessageType = 'review' | 'verify' | 'notice' | 'interview' | 'system'

export interface Message {
  id: string
  title: string
  body: string
  time: string
  unread: boolean
  type: MessageType
  actionType?: string
  actionTarget?: string
}

// ============================================================
// Toast
// ============================================================

export type ToastType = 'success' | 'error' | 'info'

export interface ToastItem {
  id: string
  message: string
  type: ToastType
}

// ============================================================
// 企业认证
// ============================================================

export type EnterpriseVerifyStatus = 'unverified' | 'pending' | 'approved' | 'rejected'

export interface EnterpriseInfo {
  companyName: string
  creditCode: string
  legalRepresentative: string
  licenseImage: string
  authLetterImage: string
  hrName: string
  hrIdNumber: string
  hrPhone: string
  hrBadgeImage: string
  verifyStatus: EnterpriseVerifyStatus
  submittedAt: string
  reviewNote: string
}

// ============================================================
// 全局状态
// ============================================================

export interface AppState {
  enterprise: EnterpriseInfo
  talents: Talent[]
  challenges: Challenge[]
  reviews: Review[]
  interviews: Interview[]
  messages: Message[]
  toasts: ToastItem[]
  sidebarCollapsed: boolean
  nextIds: {
    challenge: number
    review: number
    interview: number
  }
}

// ============================================================
// Actions
// ============================================================

export type AppAction =
  | { type: 'ADD_CHALLENGE'; payload: Omit<Challenge, 'id' | 'participants' | 'completionRate' | 'avgScore' | 'createdAt'> }
  | { type: 'UPDATE_CHALLENGE'; payload: { id: string; updates: Partial<Challenge> } }
  | { type: 'DELETE_CHALLENGE'; payload: { id: string } }
  | { type: 'APPROVE_REVIEW'; payload: { reviewId: string } }
  | { type: 'REJECT_REVIEW'; payload: { reviewId: string; reason: string; feedback: string } }
  | { type: 'ADD_INTERVIEW'; payload: Omit<Interview, 'id'> }
  | { type: 'UPDATE_INTERVIEW_STATUS'; payload: { id: string; status: InterviewStatus } }
  | { type: 'ADD_INTERVIEW_FEEDBACK'; payload: { id: string; feedback: InterviewFeedback } }
  | { type: 'MARK_MESSAGE_READ'; payload: { id: string } }
  | { type: 'MARK_ALL_MESSAGES_READ' }
  | { type: 'ADD_MESSAGE'; payload: Omit<Message, 'id'> }
  | { type: 'ADD_TOAST'; payload: Omit<ToastItem, 'id'> }
  | { type: 'DISMISS_TOAST'; payload: { id: string } }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_COLLAPSED'; payload: boolean }
  | { type: 'UPDATE_ENTERPRISE'; payload: Partial<EnterpriseInfo> }
  | { type: 'SUBMIT_ENTERPRISE_VERIFY' }
  | { type: 'APPROVE_ENTERPRISE_VERIFY'; payload: { note?: string } }
  | { type: 'REJECT_ENTERPRISE_VERIFY'; payload: { note: string } }
