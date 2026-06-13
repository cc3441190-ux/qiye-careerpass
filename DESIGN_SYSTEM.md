# CareerPass 设计规范（Design System）

> 本文档用于保持用户端（移动端）与企业端（PC端）视觉风格统一。
> 技术栈：React 18 + TypeScript + Vite，CSS-in-JS（inline style）。

---

## 1. 色彩体系

| Token | 色值 | 用途 |
|-------|------|------|
| **Background** | `#FAF9F6` | 全局页面背景（暖白色，避免纯白刺眼） |
| **Primary** | `#1A1A1A` | 主色调（黑）：文字、边框、深色卡片、按钮 |
| **Accent** | `#FF4D00` | 强调色（亮橙）：高亮数据、活跃状态、TOP标签、重要CTA |
| **Surface** | `#FFFFFF` | 卡片/浮层背景 |
| **Muted** | `#8C8C8C` | 次要文字、辅助信息、占位符 |
| **Divider** | `#E5E5E5` | 分割线、进度条底色 |
| **TextOnDark** | `#FAF9F6` | 深色背景上的文字（偏暖白） |

> 规则：橙色只用于「需要吸引注意力」的数据或交互，不要大面积铺色。

---

## 2. 字体系统

采用**双字体混排**策略：

| 场景 | 字体栈 | 字重 | 特征 |
|------|--------|------|------|
| **中文标题/正文** | `'PingFang SC', 'Noto Sans SC', 'Hiragino Sans GB', sans-serif` | 700 / 400 | 清晰现代 |
| **英文、数字、标签** | `'IBM Plex Mono', monospace` | 700 | 等宽，工业感、档案感 |

### 字号层级（移动端基准，PC端等比放大）

| 层级 | 字号 | 用途 |
|------|------|------|
| **Display** | 48px | 核心数据（能力指数） |
| **H1** | 22px | 通行证姓名、大标题 |
| **H2** | 17px | 卡片内主标题 |
| **Body** | 12-14px | 正文、按钮文字 |
| **Caption** | 9-10px | 标签、时间、辅助说明 |
| **Mono Data** | 16-32px | 等宽数字（排名、分数、倒计时） |

### 标签规范（Section Label）
所有区块标题统一格式：
```
英文大写缩写 / 中文名称
```
样式：
- `fontFamily: "'IBM Plex Mono', monospace"`
- `fontSize: 9-10px`
- `fontWeight: 700`
- `color: #1A1A1A`
- `opacity: 0.45`
- `letterSpacing: "0.15em"`
- 下方或右侧搭配细线分割

---

## 3. 卡片组件规范

### 标准卡片（Standard Card）
所有信息卡片必须统一使用以下样式：
```
background: #FFFFFF
border: 2px solid #1A1A1A
borderRadius: 6px
boxShadow: "0 1px 2px rgba(0,0,0,0.06), 3px 3px 0px #1A1A1A"
```

### 深色卡片（Dark Card）
用于重点数据展示（如能力指数）：
```
background: #1A1A1A
border: 2px solid #1A1A1A
borderRadius: 6px
boxShadow: "0 1px 2px rgba(0,0,0,0.06), 3px 3px 0px #1A1A1A, 3px 3px 0px #FF4D00"
```
> 注意：深色卡片有双重阴影，第二层是橙色偏移，制造「霓虹勾边」效果。

### 卡片头部（Card Header）
若卡片需要标题栏，使用深色头：
```
background: #1A1A1A
padding: 10px 14px
borderBottom: 2px solid #1A1A1A（如果是白卡则保留，深色卡可省略）
```
头部文字使用 `color: #FAF9F6`，配合 `opacity: 0.55` 的辅助文字。

---

## 4. 按钮规范

### 主按钮（Primary Button）
```
background: #1A1A1A
border: 2px solid #1A1A1A
borderRadius: 8px
boxShadow: "0 2px 4px rgba(0,0,0,0.08), 3px 3px 0px #1A1A1A"
color: #FAF9F6
fontFamily: "'IBM Plex Mono', monospace"
fontSize: 12px
fontWeight: 700
letterSpacing: "0.1em"
height: 52px
```

### 次按钮（Secondary Button）
```
background: #FAF9F6
border: 2px solid #1A1A1A
borderRadius: 8px
boxShadow: "0 2px 4px rgba(0,0,0,0.08), 3px 3px 0px #1A1A1A"
color: #1A1A1A
```

### 橙色CTA（Accent CTA）
用于最强行动召唤（如「分享通行证」）：
```
background: #FF4D00
border: 2px solid #1A1A1A
boxShadow: "0 2px 4px rgba(0,0,0,0.08), 3px 3px 0px #1A1A1A"
color: #FAF9F6
```

### 按钮按压态（Press State）
必须实现物理按压反馈：
```
// 按下时
transform: "translateY(2px)"
boxShadow: "0 0px 2px rgba(0,0,0,0.08), 1px 1px 0px #1A1A1A"

// 松开/离开恢复
transform: "translateY(0)"
boxShadow: "0 2px 4px rgba(0,0,0,0.08), 3px 3px 0px #1A1A1A"
```
通过 `onMouseDown / onMouseUp / onMouseLeave` 实现。

---

## 5. 标签/Tag 规范

```
border: 1.5px solid #1A1A1A
borderRadius: 2px
padding: 3px 6px
background: #FFFFFF
fontFamily: "'IBM Plex Mono', monospace"
fontSize: 9px
fontWeight: 700
letterSpacing: "0.02em"
```

---

## 6. 图标风格

- **全部使用 SVG 线条图标**，禁止使用填充图标库
- 线条属性统一：
  - `strokeWidth: 1.5`
  - `strokeLinecap: "square"`
  - `strokeLinejoin: "miter"`
- 箭头类图标统一方向：右箭头表示「进入/下一步」，左箭头表示「返回」
- 颜色跟随上下文：深色背景用 `#FAF9F6`，浅色背景用 `#1A1A1A` 或 `#FF4D00`

---

## 7. 阴影与层次

系统只有**一种阴影语言**：硬偏移阴影（Neo-Brutalism 风格）。

| 元素 | 阴影值 |
|------|--------|
| 标准卡片 | `0 1px 2px rgba(0,0,0,0.06), 3px 3px 0px #1A1A1A` |
| 按钮 | `0 2px 4px rgba(0,0,0,0.08), 3px 3px 0px #1A1A1A` |
| 深色卡片 | `0 1px 2px rgba(0,0,0,0.06), 3px 3px 0px #1A1A1A, 3px 3px 0px #FF4D00` |
| Toast 弹窗 | `0 2px 4px rgba(0,0,0,0.08), 3px 3px 0px #1A1A1A` |

> 没有弥散阴影、没有毛玻璃。阴影是「实体块状偏移」，营造档案/证件的印刷质感。

---

## 8. 间距与布局

- 页面边距：`20px`
- 卡片内边距：`12-16px`
- 卡片间距：`16px`
- 元素间小间隙：`6-10px`
- 分割线：`1px solid #E5E5E5`（细）或 `1.5px solid #1A1A1A`（粗，用于数据网格）

---

## 9. 动效规范

- **极简动效**：系统整体保持静态、沉稳的「档案感」，不要花哨动画
- 允许的基础动效：
  - 按钮按压：`transform 0.1s, box-shadow 0.1s`
  - Toast 进入：`animation: toastIn 0.3s ease-out both`
  - 数字跳动：计数器动画
  - Live 指示灯：`animation: livePulse 2s ease-in-out infinite`

---

## 10. 核心视觉关键词

把这四个词交给设计师/AI，作为所有决策的判据：

> **档案感、工业印刷、硬核数据、可验证**

- **档案感**：像翻阅一份人事档案或证件，不是社交媒体 App
- **工业印刷**：等宽字体、粗黑边框、硬阴影，像激光打印的输出件
- **硬核数据**：能力指数、评分、排名是视觉重心，装饰性元素极少
- **可验证**：通行证、二维码、序列号、防伪纹理等元素强化「真实可信」

---

## 11. 企业端适配建议（PC端）

企业端不是简单放大，需注意：

| 移动端 | PC端调整 |
|--------|----------|
| 单列堆叠 | 改为**双栏/三栏网格**布局，左侧导航 + 右侧内容 |
| 底部Tab导航 | 改为**左侧垂直导航栏**，选中态用橙色左边框 |
| 卡片宽度100% | 卡片固定宽度或网格排列，保持阴影风格 |
| 20px边距 | 增大到 `40px` 或居中容器 `maxWidth: 1200px` |
| 12px按钮字 | 14-16px，按钮高度 `48-56px` |
| 小数据卡片 | 增加**数据表格**形态，表头用深色 `#1A1A1A`，行分隔用 `#E5E5E5` |

PC端请保持：
- 同样的色彩、字体、阴影语言
- 同样的按钮按压交互
- 同样的标签格式（英文大写 / 中文）
- 不要引入圆角过大（> 8px）或渐变色背景

---

## 12. 文件位置参考

当前用户端代码位于：
- `src/app/components/*.tsx` —— 所有页面组件
- `src/app/components/Toast.tsx` —— Toast 全局组件
- `src/app/App.tsx` —— 路由与页面壳

企业端建议新建独立目录，如 `src/enterprise/` 或单独仓库，避免混用。
