import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react'
import type { AppState, AppAction, Talent, Challenge, Review, Interview, Message, EnterpriseInfo } from '../types'
import { CAREER_LABELS, CareerType } from '../types'

// ============================================================
// 企业认证初始状态
// ============================================================
const initialEnterprise: EnterpriseInfo = {
  companyName: '',
  creditCode: '',
  legalRepresentative: '',
  licenseImage: '',
  authLetterImage: '',
  hrName: '',
  hrIdNumber: '',
  hrPhone: '',
  hrBadgeImage: '',
  verifyStatus: 'unverified',
  submittedAt: '',
  reviewNote: '',
}

// ============================================================
// 辅助工具
// ============================================================
function getDifficultyLabel(d: number): string {
  return d === 1 ? '简单' : d === 2 ? '中等' : '较难'
}

// 评估维度 — 对齐5维核心技能
function getDimensionsForRole(role: string): { id: string; label: string; weight: number }[] {
  const map: Record<string, { id: string; label: string; weight: number }[]> = {
    '产品经理': [
      { id: 'product', label: '产品设计', weight: 40 },
      { id: 'research', label: '用户研究', weight: 25 },
      { id: 'prototype', label: '原型设计', weight: 20 },
      { id: 'data', label: '数据分析', weight: 15 },
    ],
    'UI设计师': [
      { id: 'visual', label: '视觉设计', weight: 40 },
      { id: 'prototype', label: '原型设计', weight: 30 },
      { id: 'research', label: '用户研究', weight: 30 },
    ],
    '前端开发': [
      { id: 'visual', label: '视觉设计', weight: 50 },
      { id: 'prototype', label: '原型设计', weight: 50 },
    ],
    '后端开发': [
      { id: 'data', label: '数据分析', weight: 100 },
    ],
    '数据分析师': [
      { id: 'data', label: '数据分析', weight: 60 },
      { id: 'prototype', label: '原型设计', weight: 40 },
    ],
  }
  return map[role] || map['产品经理']
}

// ============================================================
// Mock 候选人数据 (对齐 SPECIFICATION.md Talent 模型)
// ============================================================
const initialTalents: Talent[] = [
  {
    id: 'CP-2026-3847',
    cpCode: '#CP-2026-3847',
    name: '张三',
    gender: 'male',
    primaryCareer: 'product' as CareerType,
    careerLabel: CAREER_LABELS.product,
    avatarUrl: '',
    avatar: '张',
    currentSkills: { '产品设计': 88, '用户研究': 78, '原型设计': 74, '视觉设计': 62, '数据分析': 71 },
    summary: '具有3年产品设计经验的互联网产品经理，擅长从0到1构建产品',
    personalityTags: ['逻辑强', '用户敏感'],
    rank: 'TOP 5%',
    totalChallenges: 2,
    achievements: ['TOP 5% 排名', '产品设计 A+'],
    challengeHistory: [
      { challengeId: 'ch-001', date: '2024-06-10', title: '产品设计挑战', growth: { '产品设计': 8, '用户研究': 3 } },
      { challengeId: 'ch-002', date: '2024-06-08', title: '用户研究挑战', growth: { '用户研究': 5, '数据分析': 2 } },
    ],
    verified: true,
    date: '2024-06-01',
    verifyDate: '2024-06-10',
  },
  {
    id: 'CP-2026-5192',
    cpCode: '#CP-2026-5192',
    name: '李四',
    gender: 'female',
    primaryCareer: 'design' as CareerType,
    careerLabel: CAREER_LABELS.design,
    avatarUrl: '',
    avatar: '李',
    currentSkills: { '产品设计': 65, '用户研究': 72, '原型设计': 78, '视觉设计': 85, '数据分析': 58 },
    summary: '专注UI/UX设计的视觉设计师，拥有丰富的移动端设计经验',
    personalityTags: ['审美在线', '完美主义'],
    rank: 'TOP 10%',
    totalChallenges: 2,
    achievements: ['视觉设计 A+', 'TOP 10% 排名'],
    challengeHistory: [
      { challengeId: 'ch-002', date: '2024-06-09', title: '用户研究挑战', growth: { '用户研究': 4, '原型设计': 3 } },
      { challengeId: 'ch-001', date: '2024-06-07', title: '产品设计挑战', growth: { '产品设计': 3, '原型设计': 5 } },
    ],
    verified: true,
    date: '2024-05-28',
    verifyDate: '2024-06-09',
  },
  {
    id: 'CP-2026-2038',
    cpCode: '#CP-2026-2038',
    name: '王五',
    gender: 'male',
    primaryCareer: 'tech' as CareerType,
    careerLabel: CAREER_LABELS.tech,
    avatarUrl: '',
    avatar: '王',
    currentSkills: { '产品设计': 52, '用户研究': 48, '原型设计': 80, '视觉设计': 88, '数据分析': 65 },
    summary: '全栈前端开发工程师，精通 React/TypeScript 技术栈',
    personalityTags: ['代码洁癖', '效率至上'],
    rank: 'TOP 3%',
    totalChallenges: 1,
    achievements: ['视觉设计 A+', '原型设计 A'],
    challengeHistory: [
      { challengeId: 'ch-004', date: '2024-06-08', title: '前端开发挑战', growth: { '视觉设计': 8, '原型设计': 5 } },
    ],
    verified: true,
    date: '2024-05-25',
    verifyDate: '2024-06-08',
  },
  {
    id: 'CP-2026-6741',
    cpCode: '#CP-2026-6741',
    name: '赵六',
    gender: 'female',
    primaryCareer: 'data' as CareerType,
    careerLabel: CAREER_LABELS.data,
    avatarUrl: '',
    avatar: '赵',
    currentSkills: { '产品设计': 55, '用户研究': 60, '原型设计': 52, '视觉设计': 45, '数据分析': 72 },
    summary: '数据驱动型分析师，擅长从复杂数据中提炼业务洞察',
    personalityTags: ['数据敏感', '逻辑严谨'],
    rank: 'TOP 30%',
    totalChallenges: 1,
    achievements: [],
    challengeHistory: [
      { challengeId: 'ch-003', date: '2024-06-07', title: '数据分析挑战', growth: { '数据分析': 6, '产品设计': 3 } },
    ],
    verified: false,
    date: '2024-05-20',
  },
  {
    id: 'CP-2026-9015',
    cpCode: '#CP-2026-9015',
    name: '孙七',
    gender: 'male',
    primaryCareer: 'tech' as CareerType,
    careerLabel: CAREER_LABELS.tech,
    avatarUrl: '',
    avatar: '孙',
    currentSkills: { '产品设计': 48, '用户研究': 42, '原型设计': 58, '视觉设计': 52, '数据分析': 78 },
    summary: '后端开发工程师，专注于高并发系统设计与性能优化',
    personalityTags: ['深度思考', '系统思维'],
    rank: 'TOP 10%',
    totalChallenges: 1,
    achievements: ['数据分析 A'],
    challengeHistory: [
      { challengeId: 'ch-003', date: '2024-06-06', title: '数据分析挑战', growth: { '数据分析': 7 } },
    ],
    verified: false,
    date: '2024-05-18',
  },
  {
    id: 'CP-2026-1283',
    cpCode: '#CP-2026-1283',
    name: '周八',
    gender: 'male',
    primaryCareer: 'product' as CareerType,
    careerLabel: CAREER_LABELS.product,
    avatarUrl: '',
    avatar: '周',
    currentSkills: { '产品设计': 95, '用户研究': 88, '原型设计': 82, '视觉设计': 60, '数据分析': 85 },
    summary: '资深产品经理，具备从战略到执行的全链路能力',
    personalityTags: ['创新驱动', '商业敏锐'],
    rank: 'TOP 1%',
    totalChallenges: 2,
    achievements: ['产品设计 S', 'TOP 1% 排名'],
    challengeHistory: [
      { challengeId: 'ch-001', date: '2024-06-05', title: '产品设计挑战', growth: { '产品设计': 7, '用户研究': 3 } },
      { challengeId: 'ch-003', date: '2024-06-03', title: '数据分析挑战', growth: { '数据分析': 5, '产品设计': 3 } },
    ],
    verified: true,
    date: '2024-05-15',
    verifyDate: '2024-06-05',
  },
]

// ============================================================
// Mock 挑战数据 (对齐 SPECIFICATION.md Challenge 模型)
// ============================================================
const initialChallenges: Challenge[] = [
  {
    id: 'ch-001',
    company: '字节跳动',
    role: '产品经理',
    title: 'PRODUCT DESIGN / 产品设计挑战',
    description: '设计一款校园招聘产品，包含职位发布、简历筛选、面试安排等核心功能。需完成产品方案文档和交互原型。',
    difficulty: 2,
    difficultyLabel: getDifficultyLabel(2),
    tags: ['产品设计', '用户研究', '原型设计'],
    dimensions: getDimensionsForRole('产品经理'),
    deadline: '2024-07-01',
    status: 'open',
    maxParticipants: null,
    participants: 128,
    completionRate: '73%',
    avgScore: 'A',
    createdAt: '2024-06-01',
    estimatedHours: 6,
    duration: '360分钟',
  },
  {
    id: 'ch-002',
    company: '腾讯',
    role: 'UI设计师',
    title: 'UX RESEARCH / 用户研究挑战',
    description: '针对企业招聘流程进行用户研究，输出研究报告和改进建议。需完成用户访谈计划和体验优化方案。',
    difficulty: 1,
    difficultyLabel: getDifficultyLabel(1),
    tags: ['用户研究', '原型设计', '数据分析'],
    dimensions: getDimensionsForRole('UI设计师'),
    deadline: '2024-07-10',
    status: 'open',
    maxParticipants: 50,
    participants: 86,
    completionRate: '81%',
    avgScore: 'A',
    createdAt: '2024-06-05',
    estimatedHours: 4,
    duration: '240分钟',
  },
  {
    id: 'ch-003',
    company: '阿里巴巴',
    role: '数据分析师',
    title: 'DATA ANALYSIS / 数据分析挑战',
    description: '分析招聘数据，识别人才趋势，提供数据驱动的招聘策略建议。需完成数据分析报告和可视化看板。',
    difficulty: 3,
    difficultyLabel: getDifficultyLabel(3),
    tags: ['数据分析', '产品设计'],
    dimensions: getDimensionsForRole('数据分析师'),
    deadline: '2024-07-15',
    status: 'closing',
    maxParticipants: 30,
    participants: 45,
    completionRate: '68%',
    avgScore: 'B+',
    createdAt: '2024-06-10',
    estimatedHours: 8,
    duration: '480分钟',
  },
  {
    id: 'ch-004',
    company: '美团',
    role: '前端开发',
    title: 'FRONTEND DEV / 前端开发挑战',
    description: '开发一个招聘管理系统的前端界面，要求响应式设计和高性能。需完成组件库搭建和性能优化。',
    difficulty: 2,
    difficultyLabel: getDifficultyLabel(2),
    tags: ['视觉设计', '原型设计'],
    dimensions: getDimensionsForRole('前端开发'),
    deadline: '2024-07-05',
    status: 'open',
    maxParticipants: 100,
    participants: 95,
    completionRate: '68%',
    avgScore: 'B+',
    createdAt: '2024-06-03',
    estimatedHours: 8,
    duration: '480分钟',
  },
]

// ============================================================
// Mock 审核数据
// ============================================================
const initialReviews: Review[] = [
  {
    id: 'RV-001',
    challengeId: 'ch-001',
    challengeTitle: '产品设计挑战',
    candidate: '张三',
    candidateId: 'CP-2026-3847',
    status: 'pending',
    submittedAt: '2024-06-10 14:30',
    scores: { '产品设计': 'A+', '用户研究': 'A', '原型设计': 'B+' },
    overallGrade: 'A+',
  },
  {
    id: 'RV-002',
    challengeId: 'ch-002',
    challengeTitle: '用户研究挑战',
    candidate: '李四',
    candidateId: 'CP-2026-5192',
    status: 'pending',
    submittedAt: '2024-06-10 16:20',
    scores: { '用户研究': 'A', '原型设计': 'A', '视觉设计': 'A+' },
    overallGrade: 'A',
  },
  {
    id: 'RV-003',
    challengeId: 'ch-004',
    challengeTitle: '前端开发挑战',
    candidate: '王五',
    candidateId: 'CP-2026-2038',
    status: 'approved',
    submittedAt: '2024-06-09 10:15',
    scores: { '视觉设计': 'A+', '原型设计': 'A' },
    overallGrade: 'A+',
  },
  {
    id: 'RV-004',
    challengeId: 'ch-001',
    challengeTitle: '产品设计挑战',
    candidate: '赵六',
    candidateId: 'CP-2026-6741',
    status: 'rejected',
    submittedAt: '2024-06-08 09:45',
    scores: { '产品设计': 'C+', '用户研究': 'B', '数据分析': 'B+' },
    overallGrade: 'B',
    rejectReason: '能力不匹配',
    rejectFeedback: '产品设计维度得分偏低，建议加强基础能力后再参与挑战。',
  },
]

// ============================================================
// Mock 面试数据
// ============================================================
const initialInterviews: Interview[] = [
  {
    id: 'INT-001', candidate: '张三', candidateId: 'CP-2026-3847', talentId: 'CP-2026-3847',
    role: '产品经理', date: '2024-06-12', time: '14:00-15:00',
    type: '视频面试', interviewer: '李经理', status: '待确认',
    challengeId: 'ch-001', challengeTitle: '产品设计挑战',
  },
  {
    id: 'INT-002', candidate: '李四', candidateId: 'CP-2026-5192', talentId: 'CP-2026-5192',
    role: 'UI设计师', date: '2024-06-12', time: '16:00-17:00',
    type: '现场面试', interviewer: '王总监', status: '已确认',
    challengeId: 'ch-002', challengeTitle: '用户研究挑战',
  },
  {
    id: 'INT-003', candidate: '王五', candidateId: 'CP-2026-2038', talentId: 'CP-2026-2038',
    role: '前端开发', date: '2024-06-13', time: '10:00-11:00',
    type: '视频面试', interviewer: '赵主管', status: '已完成',
    challengeId: 'ch-004', challengeTitle: '前端开发挑战',
    feedback: {
      scores: { '视觉设计': 'A+', '原型设计': 'A' },
      overallRating: 'A',
      recommendation: 'strong_hire',
      comments: '技术能力突出，沟通流畅。',
    },
  },
  {
    id: 'INT-004', candidate: '赵六', candidateId: 'CP-2026-6741', talentId: 'CP-2026-6741',
    role: '数据分析师', date: '2024-06-14', time: '14:00-15:00',
    type: '视频面试', interviewer: '李经理', status: '待反馈',
    challengeId: 'ch-001', challengeTitle: '产品设计挑战',
  },
  {
    id: 'INT-005', candidate: '孙七', candidateId: 'CP-2026-9015', talentId: 'CP-2026-9015',
    role: '后端开发', date: '2024-06-15', time: '11:00-12:00',
    type: '现场面试', interviewer: '王总监', status: '已取消',
  },
]

// ============================================================
// Mock 消息数据
// ============================================================
const initialMessages: Message[] = [
  { id: 'MSG-001', title: '新挑战提交待审核', body: '张三 完成了「产品设计挑战」，评分 A+，请尽快审核。', time: '5分钟前', unread: true, type: 'review', actionType: 'review', actionTarget: 'RV-001' },
  { id: 'MSG-002', title: '新人才通过认证', body: '李四 获得能力通行证，综合评分 A，核心技能：视觉设计、原型设计。', time: '1小时前', unread: true, type: 'verify' },
  { id: 'MSG-003', title: '挑战即将截止', body: '「数据分析挑战」即将截止，当前完成率 68%，请关注。', time: '2小时前', unread: false, type: 'notice', actionType: 'notice', actionTarget: 'ch-003' },
  { id: 'MSG-004', title: '面试邀请已发送', body: '已向王五发送面试邀请，等待确认中。', time: '3小时前', unread: false, type: 'interview', actionType: 'interview', actionTarget: 'INT-003' },
  { id: 'MSG-005', title: '系统通知', body: 'CareerPass 系统将于本周六 02:00-04:00 进行维护升级。', time: '1天前', unread: false, type: 'system' },
]

// ============================================================
// 初始状态
// ============================================================
const initialState: AppState = {
  enterprise: initialEnterprise,
  talents: initialTalents,
  challenges: initialChallenges,
  reviews: initialReviews,
  interviews: initialInterviews,
  messages: initialMessages,
  toasts: [],
  sidebarCollapsed: false,
  nextIds: { challenge: 5, review: 5, interview: 6 },
}

// ============================================================
// ID 生成器
// ============================================================
let idCounter = { ...initialState.nextIds }

function generateId(prefix: string, key: 'challenge' | 'review' | 'interview'): string {
  const num = String(idCounter[key]).padStart(3, '0')
  idCounter[key]++
  return `${prefix}-${num}`
}

// ============================================================
// Reducer
// ============================================================
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    // --- 挑战 ---
    case 'ADD_CHALLENGE': {
      const id = generateId('ch', 'challenge')
      const challenge: Challenge = {
        ...action.payload,
        id,
        participants: 0,
        completionRate: '-',
        avgScore: '-',
        createdAt: new Date().toISOString().split('T')[0],
      }
      return {
        ...state,
        challenges: [challenge, ...state.challenges],
        nextIds: { ...state.nextIds, challenge: idCounter.challenge },
      }
    }

    case 'UPDATE_CHALLENGE':
      return {
        ...state,
        challenges: state.challenges.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload.updates } : c
        ),
      }

    case 'DELETE_CHALLENGE':
      return {
        ...state,
        challenges: state.challenges.filter(c => c.id !== action.payload.id),
      }

    // --- 审核 ---
    case 'APPROVE_REVIEW': {
      const review = state.reviews.find(r => r.id === action.payload.reviewId)
      if (!review) return state

      const updatedReviews = state.reviews.map(r =>
        r.id === action.payload.reviewId ? { ...r, status: 'approved' as const } : r
      )

      const updatedTalents = state.talents.map(t =>
        t.id === review.candidateId
          ? {
              ...t,
              verified: true,
              verifyDate: new Date().toISOString().split('T')[0],
              challengeHistory: [
                {
                  challengeId: review.challengeId,
                  date: new Date().toISOString().split('T')[0],
                  title: review.challengeTitle,
                  growth: {},
                },
                ...t.challengeHistory,
              ],
            }
          : t
      )

      const message: Message = {
        id: `MSG-${Date.now()}`,
        title: '审核通过',
        body: `${review.candidate} 的能力通行证已发放，综合评分 ${review.overallGrade}。`,
        time: '刚刚',
        unread: true,
        type: 'verify',
        actionType: 'verify',
        actionTarget: review.candidateId,
      }

      return {
        ...state,
        reviews: updatedReviews,
        talents: updatedTalents,
        messages: [message, ...state.messages],
      }
    }

    case 'REJECT_REVIEW': {
      const review = state.reviews.find(r => r.id === action.payload.reviewId)
      if (!review) return state

      const updatedReviews = state.reviews.map(r =>
        r.id === action.payload.reviewId
          ? {
              ...r,
              status: 'rejected' as const,
              rejectReason: action.payload.reason,
              rejectFeedback: action.payload.feedback,
            }
          : r
      )

      const message: Message = {
        id: `MSG-${Date.now()}`,
        title: '审核已拒绝',
        body: `${review.candidate} 的「${review.challengeTitle}」审核未通过。原因：${action.payload.reason}`,
        time: '刚刚',
        unread: true,
        type: 'review',
      }

      return {
        ...state,
        reviews: updatedReviews,
        messages: [message, ...state.messages],
      }
    }

    // --- 面试 ---
    case 'ADD_INTERVIEW': {
      const id = generateId('INT', 'interview')
      const interview: Interview = { ...action.payload, id }

      const message: Message = {
        id: `MSG-${Date.now()}`,
        title: '面试邀请已发送',
        body: `已向${action.payload.candidate}发送面试邀请（${action.payload.date} ${action.payload.time}），等待确认中。`,
        time: '刚刚',
        unread: true,
        type: 'interview',
        actionType: 'interview',
        actionTarget: id,
      }

      return {
        ...state,
        interviews: [interview, ...state.interviews],
        messages: [message, ...state.messages],
        nextIds: { ...state.nextIds, interview: idCounter.interview },
      }
    }

    case 'UPDATE_INTERVIEW_STATUS':
      return {
        ...state,
        interviews: state.interviews.map(i =>
          i.id === action.payload.id ? { ...i, status: action.payload.status } : i
        ),
      }

    case 'ADD_INTERVIEW_FEEDBACK': {
      const interview = state.interviews.find(i => i.id === action.payload.id)
      const talentId = interview?.talentId || interview?.candidateId

      return {
        ...state,
        interviews: state.interviews.map(i =>
          i.id === action.payload.id
            ? { ...i, status: '已完成' as const, feedback: action.payload.feedback }
            : i
        ),
        talents: state.talents.map(t =>
          t.id === talentId && interview
            ? {
                ...t,
                challengeHistory: [
                  {
                    challengeId: interview.challengeId || '',
                    date: new Date().toISOString().split('T')[0],
                    title: `面试反馈 · ${action.payload.feedback.overallRating}`,
                    growth: {},
                  },
                  ...t.challengeHistory,
                ],
              }
            : t
        ),
      }
    }

    // --- 消息 ---
    case 'MARK_MESSAGE_READ':
      return {
        ...state,
        messages: state.messages.map(m =>
          m.id === action.payload.id ? { ...m, unread: false } : m
        ),
      }

    case 'MARK_ALL_MESSAGES_READ':
      return {
        ...state,
        messages: state.messages.map(m => ({ ...m, unread: false })),
      }

    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [
          { ...action.payload, id: `MSG-${Date.now()}` },
          ...state.messages,
        ],
      }

    // --- Toast ---
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [
          ...state.toasts,
          { ...action.payload, id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` },
        ],
      }

    case 'DISMISS_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== action.payload.id),
      }

    // --- 侧边栏 ---
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed }

    case 'SET_SIDEBAR_COLLAPSED':
      return { ...state, sidebarCollapsed: action.payload }

    // --- 企业认证 ---
    case 'UPDATE_ENTERPRISE':
      return {
        ...state,
        enterprise: { ...state.enterprise, ...action.payload },
      }

    case 'SUBMIT_ENTERPRISE_VERIFY':
      return {
        ...state,
        enterprise: {
          ...state.enterprise,
          verifyStatus: 'pending',
          submittedAt: new Date().toISOString().split('T')[0],
          reviewNote: '',
        },
        messages: [
          {
            id: `MSG-${Date.now()}`,
            title: '企业认证已提交',
            body: '你的企业认证资料已提交审核，预计 1-3 个工作日内完成。',
            time: '刚刚',
            unread: true,
            type: 'system',
          },
          ...state.messages,
        ],
      }

    case 'APPROVE_ENTERPRISE_VERIFY':
      return {
        ...state,
        enterprise: {
          ...state.enterprise,
          verifyStatus: 'approved',
          reviewNote: action.payload.note || '认证审核已通过',
        },
        messages: [
          {
            id: `MSG-${Date.now()}`,
            title: '企业认证已通过',
            body: `你的企业「${state.enterprise.companyName}」认证审核已通过。${action.payload.note || ''}`,
            time: '刚刚',
            unread: true,
            type: 'system',
          },
          ...state.messages,
        ],
      }

    case 'REJECT_ENTERPRISE_VERIFY':
      return {
        ...state,
        enterprise: {
          ...state.enterprise,
          verifyStatus: 'rejected',
          reviewNote: action.payload.note,
        },
        messages: [
          {
            id: `MSG-${Date.now()}`,
            title: '企业认证未通过',
            body: `认证被拒绝。原因：${action.payload.note}。请修改后重新提交。`,
            time: '刚刚',
            unread: true,
            type: 'system',
          },
          ...state.messages,
        ],
      }

    default:
      return state
  }
}

// ============================================================
// Context
// ============================================================
interface AppContextType {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  unreadCount: number
  markAllRead: () => void
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void
}

const AppContext = createContext<AppContextType>(null!)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)
  const unreadCount = state.messages.filter(m => m.unread).length

  const markAllRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_MESSAGES_READ' })
  }, [])

  const addToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    dispatch({ type: 'ADD_TOAST', payload: { message, type } })
  }, [])

  return (
    <AppContext.Provider value={{ state, dispatch, unreadCount, markAllRead, addToast }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  return useContext(AppContext)
}
