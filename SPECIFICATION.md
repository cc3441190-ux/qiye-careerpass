# CareerPass 移动端 规范文档

> 供 PC 端联调参考 | 基于实际代码导出 | 更新日期：2026-06-13

---

## 一、数据模型规范

### 1.1 用户数据（UserCareerState）

```typescript
interface UserCareerState {
  userId: string;                        // 用户唯一标识，格式 "user-{timestamp}" 或 "GUEST-{year}-{6位随机}"
  name: string;                          // 姓名
  gender: string;                        // "female" | "male"
  visualTraits?: VisualTraits;           // AI 推断的外观特征（用于生图 Prompt）
  avatarUrl?: string;                    // 像素化身图片 base64 URL（缓存用，避免重复调用生图 API）
  primaryCareer: string;                 // 主职业方向："product" | "design" | "data" | "tech"
  secondaryCareer: string | null;        // 副职业方向
  baselineSkills: Record<string, number>;    // 简历解析出的基线分数（不变）
  currentSkills: Record<string, number>;     // 当前分数 = 基线 + 挑战累积增长
  challengeHistory: ChallengeGrowth[];       // 挑战历史
  achievements: string[];                    // 成就列表
  personalityTags: string[];                 // 个性标签（最多3个，如["逻辑强","用户敏感","北京"]）
  experience: ExperienceEntry[];             // 工作/项目经历
  summary: string;                           // 一句话职业概述
  totalChallenges: number;                   // 总挑战次数
  rank: string;                              // 排名："TOP 10%" | "TOP 23%" | "TOP 50%" | "TOP 75%"
  unlockedEquips: string[];                  // 已解锁装备 ID 列表，如 ["bronze_prototype_board", "silver_research_lens"]
  nextUnlock: {                              // 下一个可解锁装备
    skill: string;                           //   所需技能名
    targetScore: number;                     //   目标分数
    equip: string;                           //   装备 ID
  } | null;
}
```

#### 子类型

```typescript
interface VisualTraits {
  hairstyle?: string;    // "short" | "medium" | "long" | "ponytail" | "bun" | "buzzcut"
  glasses?: boolean;
  vibe?: string;         // "business formal" | "casual techie" | "artistic" | "sporty" | "academic" | "streetwear"
  outfitStyle?: string;  // "suit blazer" | "hoodie" | "creative layers" | "varsity jacket" | "lab coat" | "minimalist"
  expression?: string;   // "confident smile" | "calm" | "focused" | "playful"
  accessory?: string;    // "watch" | "earrings" | "headphones" | "necklace" | "none"
}

interface ExperienceEntry {
  company: string;
  role: string;
  duration: string;      // "2024.03-2025.06"
  highlights: string[];  // ["负责XX功能，DAU提升30%"]
}

interface ChallengeGrowth {
  challengeId: string;
  date: string;          // "2026-06-13"
  growth: Record<string, number>; // {"产品设计": 7, "用户研究": 3}
}

interface SkillEntry {
  name: string;          // 技能名（归纳融合后的大项）
  score: number;         // 0-100
  evidence?: string;     // 简历原文引用
}
```

#### 核心5维技能

技能 key 固定为以下 5 项（`Record<string, number>` 的 key）：

| Key | 中文名称 | 默认分数 |
|-----|---------|---------|
| `产品设计` | 产品设计能力 | 60 |
| `用户研究` | 用户研究能力 | 55 |
| `原型设计` | 原型设计能力 | 58 |
| `视觉设计` | 视觉设计能力 | 50 |
| `数据分析` | 数据分析能力 | 45 |

#### 技能等级 → 字母映射

| 分数区间 | 等级 | 颜色 | 装备等级 |
|---------|------|------|---------|
| ≥ 95 | S | `#FFD700` 金色 | 传说 |
| 85-94 | A+ | `#C0C0C0` 银色 | 史诗 |
| 78-84 | A | `#C0C0C0` 银色 | 精良 |
| 70-77 | B+ | `#CD7F32` 铜色 | 优秀 |
| 60-69 | B | `#808080` 灰色 | 普通 |
| 55-59 | C+ | `#808080` 灰色 | 基础 |
| < 55 | C | `#808080` 灰色 | 待强化 |

---

### 1.2 挑战数据结构（Challenge & EvaluateResult）

```typescript
interface Challenge {
  id: string;              // "ch-001"
  company: string;         // "字节跳动" | "腾讯" | "阿里巴巴" | "美团"
  role: string;            // "产品经理" | "UI设计师" | "前端开发" | "后端开发" | "数据分析师"
  title: string;           // "模拟面试挑战" | "暑期实习挑战" | "秋招挑战" | "春招挑战"
  duration: string;        // "60分钟" | "75分钟" | "90分钟" | "120分钟"
  difficulty: number;      // 1=简单 2=中等 3=较难
  difficultyLabel: string; // "简单" | "中等" | "较难"
  tags: string[];          // ["产品设计", "竞品分析"]
  status: "open" | "closing" | "closed";
}

// 角色 → 所需技能映射
const ROLE_SKILL_MAP: Record<string, string[]> = {
  "产品经理":  ["产品设计", "用户研究", "原型设计", "数据分析"],
  "UI设计师":  ["视觉设计", "原型设计", "用户研究"],
  "前端开发":  ["视觉设计", "原型设计"],
  "后端开发":  ["数据分析"],
  "数据分析师": ["数据分析", "原型设计"],
};
```

#### AI 评分结果

```typescript
interface EvaluateResult {
  overallScore: number;                                    // 综合得分 0-100
  skillGrowth: Record<string, SkillGrowthEntry>;           // 各技能变化
  capabilities: CapabilityScore[];                          // 能力维度评分
  strengths: string[];                                      // 优势列表
  improvements: string[];                                    // 提升建议
  nextChallenge: string;                                     // 推荐下一个挑战
  rankChange: { before: string; after: string };            // 排名变化
}

interface SkillGrowthEntry {
  before: number;   // 挑战前分数
  after: number;    // 挑战后分数
  change: string;   // 变化量字符串，如 "+7"
}

interface CapabilityScore {
  id: string;           // "product_design"
  name: string;         // "产品设计"
  score: number;        // 0-100
  feedback: string;     // "需求拆解清晰，但交互细节考虑不足"
  unlockEquip: string | null;  // "golden_prototype_board" | "bronze_research_lens" | ... | null
}
```

#### 匹配度计算

```
匹配率 = max(30, min(95, ⌊用户相关技能均值 − (难度−1)×5⌋))

≥ 80% → "高度匹配 · 推荐挑战" (绿色)
≥ 65% → "匹配良好" (橙色)
< 65% → "建议先训练" (红色)
```

---

### 1.3 化身数据结构（Avatar/Equipment/Badge）

#### 职业信息

```typescript
type CareerType = "product" | "design" | "data" | "tech";

const CAREER_INFO = {
  product: { label: "产品经理", color: "#FF6B35", equipment: "原型板", emoji: "📋" },
  design:  { label: "设计师",   color: "#9B59B6", equipment: "画笔",   emoji: "🎨" },
  data:    { label: "数据分析", color: "#3498DB", equipment: "报表",   emoji: "📊" },
  tech:    { label: "技术开发", color: "#2ECC71", equipment: "代码",   emoji: "💻" },
};
```

#### 装备系统

```typescript
interface EquipmentInfo {
  id: string;         // "prototype_board" | "research_lens"
  name: string;       // "原型板" | "研究透镜"
  emoji: string;      // "🎒" | "🔍"
  skillName: string;  // 关联技能："产品设计" | "用户研究"
  skillKey: string;   // currentSkills 中的 key
  description: string; // 装备说明文案
  threshold: number;  // 最低触发分数 70
  tiers: { score: number; label: string; color: string }[];
}
```

| 装备 ID | 名称 | 关联技能 | 金质 (≥90) | 银质 (≥80) | 铜质 (≥70) | 未解锁 (<70) |
|---------|------|---------|-----------|-----------|-----------|-------------|
| `prototype_board` | 原型板 🎒 | 产品设计 | `#FFD700` | `#C0C0C0` | `#CD7F32` | 灰色·待强化 |
| `research_lens` | 研究透镜 🔍 | 用户研究 | `#FFD700` | `#C0C0C0` | `#CD7F32` | 灰色·待强化 |

装备解锁 ID 命名规则：`{tier}_{equipmentId}`，如 `golden_prototype_board`、`bronze_research_lens`。

#### 成长阶段

| 等级区间 | 标签 | 装备数量 | 发光 |
|---------|------|---------|------|
| Lv.1-20 | 新手 | 1 | 无 |
| Lv.21-40 | 学徒 | 2 | 无 |
| Lv.41-70 | 专家 | 3 | 有 |
| Lv.71-999 | 大师 | 4 | 有 |

等级计算公式：`level = max(1, totalChallenges × 2 + 1)`

#### 徽章系统

- 数量：`Math.floor(level / 10) + 1`（最多 3 个）
- Canvas 像素叠加绘制，颜色：金→银→橙

---

### 1.4 岗位数据（Job）

```typescript
interface Job {
  id: string;        // "job-001"
  company: string;   // 企业名
  logo: string;      // 企业简称首字
  title: string;     // 岗位名称
  salary: string;    // "15-25K"
  city: string;      // "北京" | "杭州"
  type: string;      // "实习" | "校招"
  tags: string[];    // ["产品设计", "用户研究", "数据分析"]
  requirements: {
    skill: string;      // 能力名称
    minGrade: string;   // 最低要求等级 "A"|"B+"|"B"
    userGrade: string;  // 用户当前等级
    match: boolean;     // 是否达标
  }[];
  verified: boolean; // 是否认证企业
  hot: boolean;       // 是否热门
}
```

---

## 二、API 接口规范

### 2.1 DeepSeek API — 简历解析

```
POST https://api.deepseek.com/v1/chat/completions
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `model` | `string` | `"deepseek-chat"` |
| `temperature` | `number` | `0.3` |
| `max_tokens` | `number` | `2048` |
| `messages` | `array` | system: "只输出 JSON" + user: 简历文本（截取前 3000 字） |

**返回**（JSON）：
```json
{
  "name": "陈孟秋",
  "gender": "female",
  "primaryCareer": "product",
  "secondaryCareer": null,
  "skills": [
    { "name": "产品设计", "score": 88, "evidence": "XX项目负责原型设计" }
  ],
  "experience": [
    { "company": "字节跳动", "role": "产品实习生", "duration": "2024.03-2025.06", "highlights": ["..." ] }
  ],
  "achievements": ["..."],
  "summary": "具有3年产品设计经验的互联网产品经理",
  "personalityTags": ["逻辑强", "用户敏感"],
  "visualTraits": {
    "hairstyle": "medium",
    "glasses": true,
    "vibe": "casual techie",
    "outfitStyle": "hoodie",
    "expression": "focused",
    "accessory": "headphones"
  }
}
```

### 2.2 DeepSeek API — 挑战评分

```
POST https://api.deepseek.com/v1/chat/completions
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `model` | `string` | `"deepseek-chat"` |
| `temperature` | `number` | `0.5` |
| `max_tokens` | `number` | `2048` |
| `messages` | `array` | 题目 + 答案 + 相关技能维度 |

**返回**（EvaluateResult）：
```json
{
  "overallScore": 85,
  "skillGrowth": {
    "产品设计": { "before": 78, "after": 85, "change": "+7" },
    "用户研究": { "before": 72, "after": 75, "change": "+3" }
  },
  "capabilities": [
    {
      "id": "product_design",
      "name": "产品设计",
      "score": 85,
      "feedback": "需求拆解清晰，但交互细节考虑不足",
      "unlockEquip": "golden_prototype_board"
    }
  ],
  "strengths": ["逻辑框架完整", "数据支撑充分"],
  "improvements": ["用户场景覆盖不够全面"],
  "nextChallenge": "用户研究专项训练",
  "rankChange": { "before": "TOP 23%", "after": "TOP 19%" }
}
```

### 2.3 豆包 API — 像素化身文生图

```
POST https://ark.cn-beijing.volces.com/api/v3/images/generations
```

| 参数 | 类型 | 说明 |
|------|------|------|
| `model` | `string` | `"doubao-seedream-4-5-251128"` |
| `prompt` | `string` | 见下方 Prompt 模板 |
| `size` | `string` | `"2048x2048"` |
| `n` | `number` | `1` |
| `response_format` | `string` | `"b64_json"` |

**返回**：
```json
{
  "data": [{
    "b64_json": "base64编码的PNG图片",
    "revised_prompt": "豆包改写后的prompt"
  }]
}
```

**超时**：20 秒（主模型失败自动降级到备用模型）
**降级**：主模型失败 → 使用备用 API Key + 简化 Prompt 重试

### 2.4 PC 端需要调用的接口（推荐 RESTful 风格）

> 以下为 **建议接口**，当前移动端是纯前端 Demo，PC 端对接时建议实现：

#### 获取候选人列表

```
GET /api/enterprise/candidates
```

| Query 参数 | 类型 | 说明 |
|-----------|------|------|
| `career` | `string` | 筛选职业方向："product"\|"design"\|"data"\|"tech" |
| `minLevel` | `number` | 最低等级 |
| `minScore` | `number` | 最低能力指数 |
| `equipFilter` | `string` | 装备筛选："golden_prototype_board" |
| `sortBy` | `string` | 排序："level"\|"capability"\|"totalChallenges" |
| `page` | `number` | 页码 |
| `pageSize` | `number` | 每页条数 |

**返回**：
```json
{
  "total": 128,
  "page": 1,
  "pageSize": 20,
  "candidates": [
    {
      "userId": "GUEST-2026-A3F8K1",
      "name": "陈孟秋",
      "gender": "female",
      "primaryCareer": "product",
      "level": 12,
      "avatarUrl": "data:image/png;base64,...",
      "capabilityIndex": 78,
      "rank": "TOP 23%",
      "totalChallenges": 7,
      "topSkills": [
        { "name": "产品设计", "score": 88, "grade": "A+" },
        { "name": "用户研究", "score": 72, "grade": "B+" }
      ],
      "unlockedEquips": ["bronze_prototype_board", "bronze_research_lens"],
      "personalityTags": ["逻辑强", "用户敏感"]
    }
  ]
}
```

#### 获取候选人详情

```
GET /api/enterprise/candidates/:userId
```

**返回**：完整的 `UserCareerState` 对象（见 1.1 节）

#### 提交面试反馈（授予企业认证徽章）

```
POST /api/enterprise/candidates/:userId/badges
```

| Body 参数 | 类型 | 说明 |
|----------|------|------|
| `badgeName` | `string` | 徽章名称，如 "字节跳动认证" |
| `challengeId` | `string` | 关联的挑战 ID |
| `feedback` | `string` | 面试评语 |

#### 获取能力通行证

```
GET /api/candidates/:userId/pass
```

**返回**：
```json
{
  "userId": "GUEST-2026-A3F8K1",
  "name": "陈孟秋",
  "capabilityIndex": 78,
  "rank": "TOP 23%",
  "scores": [
    { "label": "产品设计", "grade": "A+", "score": 94 },
    { "label": "用户研究", "grade": "B+", "score": 78 }
  ],
  "history": [
    { "company": "字节跳动", "challengeTitle": "PM模拟面试", "grade": "A+", "date": "2026.06" }
  ],
  "cpCode": "#CP-2026-3847",
  "generatedAt": "2026-06-13T12:00:00Z"
}
```

---

## 三、术语话术规范

### 3.1 核心术语定义

| 术语 | 英文 | 定义 | 禁止使用 |
|------|------|------|---------|
| **职业化身** | Career Avatar | 用户能力的像素化视觉表达，每个像素块代表真实数据 | ❌ 职业分身 / Career Twin |
| **挑战** | Challenge | 由企业发布的技能评测任务 | — |
| **通行证** | Career Pass | AI 认证的能力凭证，含评分矩阵 + 挑战历史 | — |
| **装备** | Equipment | 化身携带的能力象征物，颜色反映能力等级 | — |
| **徽章** | Badge | 完成企业挑战后获得的成就标记 | — |
| **能力指数** | Capability Index | 技能分数的加权均值（0-100） | — |
| **化身档案** | Avatar Profile | 职业化身的详细资料页 | ❌ 分身档案 |

**禁止词汇**（全文零出现）：陪伴、助手、宠物、建议、帮你。

### 3.2 界面文案对照表

#### 底部导航

| Tab 键 | 中文 | 英文标签 |
|--------|------|---------|
| `twin` | 化身 | TALENT ARCHIVE / 人才档案 |
| `challenge` | 挑战 | CHALLENGE |
| `pass` | 通行证 | CAREER PASS |
| `me` | 我的 | ME |

#### 登录页

| 场景 | 文案 |
|------|------|
| 页面标题 | 登录 / 注册 |
| 手机号输入框 | 请输入手机号 |
| 验证码输入框 | 请输入验证码 |
| 获取验证码按钮 | 获取验证码 / 60s后重发 |
| 一键体验登录 | 一键体验登录 |
| 切换模式 | 还没有账号？立即注册 / 已有账号？去登录 |
| 微信登录区 | 其他登录方式 |

#### 创建化身页

| 步骤 | 标题 | 描述 |
|------|------|------|
| Step 1 | 创建职业化身 | 上传简历，AI将为你构建专属职业能力画像 |
| — | 上传区域 | 点击上传简历（支持 PDF / Word / 图片 OCR） |
| — | 跳过按钮 | 跳过，稍后完善 |
| Step 2 | 构建职业画像 | 正在根据你的简历生成专属职业化身 · 分析技能 · 预测方向 · 构建能力雷达图 |
| — | 进度项1 | 解析简历内容 |
| — | 进度项2 | 识别核心技能 |
| — | 进度项3 | 生成能力雷达图 |
| — | 进度项4 | 预测职业方向 |
| — | 生成按钮 | 生成职业化身 |
| — | 加载中 | AI 分析中... |
| Step 3 | 职业化身已创建 | 你的能力档案已生成 · 开始探索职业挑战吧 |
| — | 进入按钮 | 进入 CareerPass →

#### 生成仪式（首次创建时）

| Phase | 标题 | 内容 |
|-------|------|------|
| 0 扫描 | 正在读取你的职业数据 | 解析简历文本...识别关键词...构建能力画像... |
| 1 检测 | 检测到核心能力 | 逐项展示技能名称 + 分数 + 进度条 |
| 2 生成 | 你的职业化身正在生成 | 像素粒子汇聚中... |
| 3 揭秘 | ✦ 生成完成 ✦ | 这是你在 CareerPass 的职业化身 · 每一个像素块都代表你的真实数据 |
| 4 说明 | EQUIPMENT MANIFEST | 装备清单 + "为什么长这样？" |

#### 首页

| 元素 | 文案 |
|------|------|
| 动态CTA | 开始你的第一个挑战 |
| 副标题 | 完成挑战获取通行证 · 已有 127 个岗位等你投递 |
| 每日一练 | 每日一练 · 产品分析 5 分钟 |
| 档案标签 | TALENT ARCHIVE / 人才档案 |
| 能力指数 | CAPABILITY INDEX / 能力指数 |
| 排名 | {rank} · 同类人才 |
| 能力画像 | 能力画像 + 查看详情 → |
| 进行中的挑战 | 进行中的挑战 + LIVE |
| 查看档案链接 | 查看职业档案 → |

#### 挑战广场

| 元素 | 文案 |
|------|------|
| 搜索 | 搜索挑战 |
| 筛选 | 全部 / 字节跳动 / 腾讯 / 阿里巴巴 / 美团 |
| 难度 | ⚡ 简单 / ⚡⚡ 中等 / ⚡⚡⚡ 较难 |
| 匹配分析标题 | 化身扫描分析 |
| 全部达标 | ✅ 所有关键能力达标，放心挑战！ |
| 1个短板 | ⚠️ 「{skill}」可能成为瓶颈 |
| 多个短板 | ⚠️ 有 {n} 项能力可能卡关，建议先针对性训练 |
| 进入按钮 | 以当前状态进入 |

#### 挑战进行中

| 元素 | 文案 |
|------|------|
| 协作者标签 | DEV 后端负责人 / DES 设计总监 |
| 草稿区 | 草稿箱 · 你的思考记录 |
| 输入框 | 输入你的回答... |
| 资料标签 | 可引用 |

#### 挑战评估加载

| 状态 | 文案 |
|------|------|
| 标题 | AI EVALUATION |
| 正常 | AI 正在评估你的表现 · 请稍等，结果马上出来 |
| 异常 | AI 评估异常 · 已使用基准评分，结果可能不准确 |
| 步骤1 | 分析回答逻辑结构... |
| 步骤2 | 对比标准答案维度... |
| 步骤3 | 评估表达完整性... |
| 步骤4 | 计算能力指数更新... |
| 步骤5 | 生成评估报告... |

#### 挑战成功结算

| 元素 | 文案 |
|------|------|
| 标题 | CHALLENGE COMPLETE |
| 主标题 | 挑战完成 |
| 副标题 | 全部环节通过 · 能力已更新 |
| 装备升级 | EQUIPMENT UPGRADE / EQUIPMENT CHANGE |
| 技能成长 | SKILL GROWTH |
| 战利品 | 综合得分 / 排名变化 / 解锁徽章 |
| 档案更新 | 化身档案已更新 |
| 按钮 | 继续挑战 → / 查看详细报告 / 查看能力通行证 / 分享成绩 |

#### 能力通行证

| 元素 | 文案 |
|------|------|
| 标题 | CAREER PASS / 能力通行证 |
| 证书标签 | AI 能力通行证 · 基于{totalChallenges}次真实挑战评测 |
| 验证码 | #CP-2026-{4位数字} |
| 评分矩阵标题 | AI 多维评估 |
| 历史记录 | 认证来源 |
| 按钮 | 验证此通行证 / 寻找新机会 / 认证企业 / 分享通行证 |

#### 空状态

| 场景 | 文案 |
|------|------|
| 无挑战记录 | 还没有挑战记录 · 浏览挑战广场 |
| 无简历 | 暂无装备数据，上传简历或完成挑战后自动生成 |

---

## 四、像素化身规范

### 4.1 生成流程

```
┌──────────────────────────────────────────────────────────────┐
│  1. 豆包 API 文生图（2048×2048）                              │
│     ↓                                                        │
│  2. Canvas 硬缩放至 128×128（imageSmoothingEnabled=false）    │
│     ↓                                                        │
│  3. 去除白色/近白色背景（RGB > 220 → alpha=0）               │
│     ↓                                                        │
│  4. Canvas 叠加装备图标（根据 career + gradeColor）           │
│     ↓                                                        │
│  5. Canvas 叠加徽章（根据 level/10+1 计算数量）               │
│     ↓                                                        │
│  6. 可选：发光特效（shadowColor + shadowBlur）                │
│     ↓                                                        │
│  7. 输出 128×128 PNG base64，存入 avatarCache + avatarUrl    │
└──────────────────────────────────────────────────────────────┘
```

**降级链路**：
1. 主模型成功 → 直接使用
2. 主模型失败 → 备用 API Key + 简化 Prompt 重试
3. 备用也失败 → `drawFallback()` 代码绘制像素人（基于 userId seed 随机生成发型/颜色）

### 4.2 Prompt 模板

#### 文生图（主 Prompt）

```
pixel art, 16-bit RPG character, {girl/boy} chibi {product manager/designer/data analyst/developer}
holding {wireframe tablet and marker/paintbrush and palette/data report board/laptop computer},
{hairstyle} hair, {wearing glasses?}, dressed in {outfitStyle}, with {accessory},
{expression}, {vibe} vibe,
{golden armor, cape, halo, shiny gold gear / ...},
isometric view, full body, front facing,
{orange and gold/purple and magenta/blue and cyan/green and lime} color scheme,
pure white background, no shadow,
flat colors, limited palette 16 colors, sharp pixel edges, blocky,
retro game sprite, 128x128 resolution style, low detail,
big head small body, simple clean design
```

#### 装备词（TIER_CONFIG — 基于技能等级注入）

| 等级 | Prompt 片段 |
|------|------------|
| A+ | `golden armor, cape, halo, shiny gold gear` |
| A | `silver armor, cape` |
| B+ | `bronze armor, shoulder guards` |
| B | `gray iron armor` |
| C+ | `wooden simple gear` |
| C | `wooden simple gear` |
| D | `torn cloth armor` |

#### 图生图 Prompt

```
pixel art version of photo, {girl/boy} chibi {role} holding {tool},
keep original hairstyle and glasses, same face structure,
16-bit RPG sprite, flat colors, limited palette 16 colors,
blocky edges, pure white background, simple clean design,
128x128 resolution style, low detail, retro game character
```

### 4.3 图片规格

| 规格 | 像素 | 用途 |
|------|------|------|
| **API 生成** | 2048×2048 | 豆包文生图原始输出 |
| **标准头像** | 128×128 | 首页、档案页、通行证 |
| **大号头像** | 140×140 | 职业档案详情页（带头像发光） |
| **创建预览** | 120×120 | 创建化身页预览 |
| **迷你头像** | 80×80 | 挑战成功结算页 |
| **极小头像** | 56×56 | 能力详情页 |
| **状态窗** | 48×48 | 挑战进行中右下角状态动画 |

**Canvas 配置**：
- 内部分辨率：128×128 固定
- 像素缩放：128 / 32 = 4px 每格（装备叠加使用 32×32 逻辑网格）
- `imageSmoothingEnabled`：全部路径设为 `false`（共 6 处）
- CSS 渲染：`image-rendering: pixelated`

### 4.4 装备 Canvas 叠加规则

所有装备在前端通过 Canvas `fillGrid()` 以 4px 网格绘制，覆盖在 AI 生成的像素人之上。

| 职业 | 装备 | 位置 | 绘制方式 |
|------|------|------|---------|
| `product` | 原型板 | 右下角 (22-27, 8-12) | 等级颜色矩形 + 白色十字高亮 |
| `design` | 画笔 | 右侧 (22, 8-15) | 棕色竖杆 + 等级色笔尖 + 职业色斜线 |
| `data` | 数据报表 | 左上角 (5-9, 8-12) | 米白底表格 + 等级色数据高亮格 |
| `tech` | 代码终端 | 右下角 (22-27, 8-11) | 等级色底键盘面 + 绿/橙 LED 灯 |

**颜色来源**：取 `skills` 中最高分技能的等级对应的 `GRADE_COLORS`（S=金/A=银/B=铜/C=灰/D=黑）。

### 4.5 化身状态动画（挑战进行中）

| 状态 | 触发条件 | 动画 |
|------|---------|------|
| `idle` | 默认，无输入 | 呼吸缩放 1→1.04，2s循环 |
| `thinking` | 输入框有内容 | 轻微摇晃旋转 ±1deg，1.2s循环 |
| `stuck` | 倒计时 <300s 且无输入 | 左右颤抖 + 橙色 drop-shadow，0.4s循环 |
| `attacking` | 提交答案 | 上跳放大 1→1.2→1.05，Y: 0→-8px，0.4s一次 |

---

## 附录：CP 编码生成规则

```typescript
const hash = userId.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
const num = 1000 + (hash % 9000);
const cpCode = `#CP-2026-${num}`;  // 如 #CP-2026-3847
```

---

*本文档基于 `src/app/store/userCareerStore.ts`、`src/app/config/avatarConfig.ts`、`src/app/config/equipmentMapping.ts`、`src/app/services/doubaoApi.ts`、`src/app/services/deepseekApi.ts`、`src/app/components/*.tsx` 实际代码导出。*
