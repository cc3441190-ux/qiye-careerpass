// ============================================================
// DeepSeek AI API 接入层 (v2.0 对齐 SPECIFICATION.md)
// 密钥配置在项目根目录的 .env 文件中
// 获取密钥: https://platform.deepseek.com/api_keys
// ============================================================

const API_BASE = 'https://api.deepseek.com/v1'

let apiKey: string = ''

/** 设置 API 密钥（从 .env 或手动设置） */
export function setApiKey(key: string) {
  apiKey = key
}

/** 获取当前密钥 */
export function getApiKey(): string {
  return apiKey || import.meta.env.VITE_DEEPSEEK_API_KEY || ''
}

/**
 * 调用 DeepSeek Chat API
 * @param systemPrompt - 系统提示词
 * @param userMessage  - 用户输入
 * @param temperature  - 温度参数 (0.3 分析 / 0.5 评分 / 0.7 生成)
 * @returns AI 返回的文本
 */
export async function chat(
  systemPrompt: string,
  userMessage: string,
  temperature: number = 0.5
): Promise<string> {
  const key = getApiKey()
  if (!key) throw new Error('请先在设置页面配置 DeepSeek API 密钥')

  const res = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature,
      max_tokens: 2048,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }))
    throw new Error(err.error?.message || `API 请求失败 (${res.status})`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

// ============================================================
// AI 能力评分（用于审核辅助）
// 评分维度统一为核心5维
// ============================================================
const SCORE_SYSTEM_PROMPT = `你是一个专业的招聘能力评估专家。你会根据候选人的挑战表现，输出标准化的能力评分。

评分维度固定为以下 5 项（与 CareerPass 标准对齐）：
- 产品设计（产品需求分析、功能设计、方案规划）
- 用户研究（用户洞察、调研方法、体验分析）
- 原型设计（交互原型、信息架构、流程设计）
- 视觉设计（视觉表现、设计规范、审美判断）
- 数据分析（数据驱动决策、指标拆解、量化评估）

每个维度给出 S、A+、A、B+、B、C+、C 七个等级之一。
评分标准：S≥95, A+85-94, A78-84, B+70-77, B60-69, C+55-59, C<55

你的回答必须是严格的 JSON 格式，不要包含任何其他文字：
{
  "overallGrade": "A+",
  "scores": {
    "产品设计": "A+",
    "用户研究": "A",
    "数据分析": "B+"
  },
  "summary": "一句话总结候选人的优势和不足"
}`

export interface AIScoreResult {
  overallGrade: string
  scores: Record<string, string>
  summary: string
}

/** AI 辅助评分：根据挑战描述和候选人表现，自动给出评分建议 */
export async function aiScoreReview(
  challengeDescription: string,
  candidatePerformance: string
): Promise<AIScoreResult> {
  const response = await chat(
    SCORE_SYSTEM_PROMPT,
    `挑战内容：${challengeDescription}\n\n候选人表现：${candidatePerformance}`,
    0.5
  )
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
    return JSON.parse(response)
  } catch {
    throw new Error('AI 返回格式异常，请重试')
  }
}

// ============================================================
// AI 挑战描述生成
// ============================================================
const CHALLENGE_PROMPT = `你是一个资深的技术面试官和岗位设计专家。你需要帮HR设计专业的AI职业挑战题目。

要求：
1. 挑战描述要模拟真实工作场景
2. 包含明确的任务目标和交付物要求
3. 难度适合目标等级
4. 字数控制在200-400字

你的回答直接就是挑战描述文本，不需要JSON格式。`

/** AI 生成挑战描述 */
export async function aiGenerateChallenge(
  roleType: string,
  difficulty: string,
  keywords: string
): Promise<string> {
  return chat(
    CHALLENGE_PROMPT,
    `岗位类型：${roleType}\n难度等级：${difficulty}\n关键要求：${keywords || '请自由发挥'}`,
    0.7
  )
}

// ============================================================
// AI 人才匹配
// ============================================================
const MATCH_PROMPT = `你是一个招聘匹配专家。根据岗位挑战的能力要求，评估候选人能力画像的匹配度。
CareerPass 核心5维技能：产品设计、用户研究、原型设计、视觉设计、数据分析。
给出一个0-100的匹配度分数和一句话理由。

必须返回严格的JSON：
{ "matchScore": 85, "reason": "候选人产品设计能力突出，与岗位核心要求高度匹配" }`

export interface AIMatchResult {
  matchScore: number
  reason: string
}

/** AI 计算候选人与挑战的匹配度 */
export async function aiCalculateMatch(
  challengeDesc: string,
  candidateProfile: string
): Promise<AIMatchResult> {
  const response = await chat(
    MATCH_PROMPT,
    `岗位挑战：${challengeDesc}\n\n候选人能力画像：${candidateProfile}`,
    0.5
  )
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) return JSON.parse(jsonMatch[0])
    return JSON.parse(response)
  } catch {
    return { matchScore: 70, reason: 'AI 匹配计算中...' }
  }
}

// ============================================================
// 健康检查
// ============================================================
/** 测试 API 密钥是否有效 */
export async function testConnection(): Promise<boolean> {
  try {
    await chat('你是一个助手', '回复"OK"', 0.3)
    return true
  } catch {
    return false
  }
}
