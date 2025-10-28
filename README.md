## KnowledgeReview-Uni

### 简介
前端应用，基于 UniApp（Vue3 + TypeScript）。提供背题模式（卡片上滑+音频自动播放）与问答模式，并对接后端 API 与 AI 能力（经抽象接口）。

### 本地运行
- 依赖：Node.js ≥ 18，npm ≥ 9
- 安装依赖与开发预览（H5）：
  1) npm install
  2) npm run dev:h5
- 其他平台（示例，见 package.json 脚本）：
  - npm run dev:app-android / dev:app-ios / dev:mp-weixin 等
- 构建（示例）：
  - npm run build:h5

### 目录结构（简要）
- src/ 业务代码（页面、组件、服务）
- vite.config.ts / tsconfig.json 基础配置

### 文档链接
- 需求说明：../docs/requirements.md
- 原始需求：../docs/需求.md
- 根 README：../README.md
