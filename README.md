# CareerPass 企业端

基于 AI 职业挑战与能力通行证的新一代招聘平台 - 企业管理后台

## 核心画风

**档案感、工业印刷、硬核数据、可验证**

## 技术栈

- React 18 + TypeScript
- Vite
- CSS-in-JS (inline style)
- React Router DOM

## 设计规范

本项目的设计规范严格遵循 `DESIGN_SYSTEM.md` 中的要求：

### 色彩体系

- **Background**: `#FAF9F6` - 全局页面背景（暖白色）
- **Primary**: `#1A1A1A` - 主色调（黑）
- **Accent**: `#FF4D00` - 强调色（亮橙）
- **Surface**: `#FFFFFF` - 卡片/浮层背景
- **Muted**: `#8C8C8C` - 次要文字
- **Divider**: `#E5E5E5` - 分割线

### 字体系统

- **中文标题/正文**: `'PingFang SC', 'Noto Sans SC', 'Hiragino Sans GB', sans-serif`
- **英文、数字、标签**: `'IBM Plex Mono', monospace`

### 核心特征

- **硬偏移阴影**（Neo-Brutalism 风格）
- **双字体混排**策略
- **按钮按压反馈**交互
- **极简动效**，保持静态、沉稳的「档案感」

## 项目结构

```
careerpass-enterprise/
├── src/
│   ├── components/
│   │   └── EnterpriseLayout.tsx    # 企业端布局（左侧导航）
│   ├── pages/
│   │   ├── Dashboard.tsx           # 仪表盘
│   │   ├── TalentSearch.tsx        # 人才搜索
│   │   ├── ChallengeManage.tsx      # 挑战管理
│   │   └── CareerPassVerify.tsx    # 通行证验证
│   ├── App.tsx                     # 主应用组件
│   ├── main.tsx                    # 入口文件
│   ├── index.css                   # 全局样式
│   └── vite-env.d.ts              # 类型声明
├── DESIGN_SYSTEM.md                # 设计规范文档
├── PRODUCT_DOCUMENT.md             # 产品说明文档
├── package.json
├── tsconfig.json
├── vite.config.ts
└── index.html
```

## 功能模块

### 1. 仪表盘 (Dashboard)

- 数据概览统计卡片
- 最近评估人才列表
- 技能分布标签云
- 实时数据指示器

### 2. 人才搜索 (Talent Search)

- 人才库搜索与筛选
- 多维度筛选标签
- 人才卡片网格展示
- 能力评分与技能标签

### 3. 挑战管理 (Challenge Manage)

- AI 职业挑战创建与管理
- 挑战状态跟踪
- 参与者数据统计
- 完成率与平均评分

### 4. 通行证验证 (Career Pass Verify)

- 能力通行证验证
- 区块链认证信息
- 技能评估详情
- 二维码扫描支持

## 安装与运行

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

开发服务器将在 `http://localhost:3000` 启动。

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 设计亮点

### 1. 档案感设计

- 深色卡片配合橙色霓虹勾边
- 等宽字体营造工业印刷感
- 硬阴影制造「实体块状偏移」效果

### 2. 数据可视化

- 核心数据使用大字号等宽数字
- 统计卡片采用深色背景突出数据
- Live 指示灯动画强调实时性

### 3. 交互反馈

- 按钮按压物理反馈（translateY + 阴影变化）
- 卡片悬停效果
- 极简动效保持沉稳感

### 4. 可验证性

- 区块链哈希显示
- 通行证 ID 标准化
- 验证状态明确标识

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 相关文档

- `DESIGN_SYSTEM.md` - 完整设计规范
- `PRODUCT_DOCUMENT.md` - 产品说明文档
- `CareerPass.pdf` - 原始产品文档

## 授权

Copyright © 2024 CareerPass. All rights reserved.
