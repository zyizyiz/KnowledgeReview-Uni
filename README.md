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


### z-paging 封装（ZPagingWrapper）
- 位置：components/common/ZPagingWrapper.vue
- 功能：统一下拉刷新、上拉加载、空/错误状态与加载反馈；支持 iOS 风格文案与交互
- 基本用法：
```
<template>
  <ZPagingWrapper :fetcher="fetchList" :page-size="20" @loaded="onLoaded">
    <template #default="{ list }">
      <view v-for="(item, idx) in list" :key="idx" class="cell">
        <text class="title">{{ item.title }}</text>
        <uni-icons type="forward" color="#C7C7CC" size="18" />
      </view>
    </template>
  </ZPagingWrapper>
</template>
<script setup lang="ts">
import ZPagingWrapper from '@/components/common/ZPagingWrapper.vue'
import { listGenerations } from '@/api/generation'
const fetchList = async ({ page, pageSize }: { page: number; pageSize: number }) => listGenerations({ page, pageSize })
function onLoaded(res:any){ /* 可记录埋点 */ }
</script>
```
- Props：
  - fetcher(params): Promise<{ list:any[]; total:number }>
  - pageSize（默认 10）、auto（默认 true）、enableRefresh（默认 true）、enableLoadMore（默认 true）
  - extraParams、emptyText、errorText
- 事件：loaded、error

### API 请求封装
- 位置：api/request.ts、api/auth.ts、api/generation.ts；工具：utils/token.ts
- 基本用法：
```
import { http, API_BASE_URL } from '@/api/request'
const data = await http.get('/auth/me')
const loginRes = await http.post('/auth/login', { email, password })
```
- 特性：
  - 统一请求/响应拦截：自动注入 Content-Type、Authorization、x-request-id
  - 自动解包后端统一响应结构 { success, data, requestId, timestamp }
  - 401 自动刷新：携带 refreshToken 调用 /auth/refresh，成功后重试一次原请求；失败清空 token 并跳转登录
  - 超时与网络错误：统一 toast 降级提示
- 环境变量：
  - VITE_API_BASE_URL（默认 http://localhost:3000/api/v1）

### uni-ui 组件使用规范（iOS 风格）
- 导航栏：使用 uni-nav-bar 配合大标题样式；返回按钮置左，操作按钮置右
- 列表：使用 uni-list/uni-list-item；分隔线保持 1px 发丝线效果
- 图标：统一使用 uni-icons，箭头使用 forward，颜色 #C7C7CC
- 弹窗/操作表：使用 uni-popup / uni-action-sheet；按钮主色 #007AFF
- Loading：使用 uni-load-more 或 uni-loading-icon，遵循 iOS 简洁风格

### iOS 风格设计规范摘要
- 主题色：#007AFF（系统蓝）；灰阶文本：#8E8E93 次级、#3C3C43 主文本（不透明度按需）
- 字体：SF Pro 系列（平台自动映射），字号与行高遵循 iOS HIG
- 交互：
  - 返回手势优先；点击态透明度降低；列表滑动具备轻微回弹
  - 异常/空状态文案简洁克制，允许点击重试

### 与后端 Swagger 对齐
- 后端文档地址：http://localhost:3000/api/docs
- 前端 API 模块按域拆分：api/auth.ts、api/generation.ts（可扩展 review/stats/media 等）
- 分页参数：约定 page、pageSize；服务端返回 { list, total } 并封装在 data 中


### API 模块（对齐 Swagger，模块化导出）
- 位置：src/api/
- 统一导出：
```
import { AuthApi, GenerationApi, ReviewApi, QuestionApi, StatsApi, MediaApi } from '@/api'
const me = await AuthApi.me()
const list = await GenerationApi.listGenerations({ page:1, pageSize:20 })
```
- 复习模块（示例）：
```
const plan = await ReviewApi.getReviewPlan({ date: '2025-01-01' })
await ReviewApi.submitReviewFeedback({ cardId:'id', quality:4 })
```
- 题库模块（示例）：
```
const qs = await QuestionApi.listQuestions({ page:1, pageSize:20, tag:'math' })
const detail = await QuestionApi.getQuestion('qid')
const res = await QuestionApi.submitAnswer({ questionId:'qid', answer:['A'] })
```
- 统计模块（示例）：
```
const overview = await StatsApi.getOverview()
const trend = await StatsApi.getReviewTrend({ range:'7d' })
```
- 媒体模块（示例）：
```
const media = await MediaApi.listMedia({ page:1, pageSize:20, type:'audio' })
```

### 全局样式变量（iOS 主题）
- 位置：src/uni.scss（已全局引入）
- 变量：
  - 颜色：$primary-color、$text-primary、$text-secondary、$bg-primary、$bg-secondary、$separator
  - 字体：$font-size-large、$font-size-normal、$font-size-small、$line-height-normal
  - 间距：$spacing-xs、$spacing-sm、$spacing-md、$spacing-lg
  - 外观：$border-radius、$box-shadow
- 使用示例：
```
.view { color: $text-primary; background: $bg-secondary; box-shadow: $box-shadow; }
.button { background: $primary-color; border-radius: $border-radius; }
```

### 登录流程与路由守卫
- 页面：src/pages/login/login.vue（注册：src/pages/register/register.vue）
- 路由：已在 src/pages.json 注册 /pages/login/login、/pages/register/register
- 全局守卫：src/utils/auth-guard.ts，通过 uni.addInterceptor 拦截跳转
  - 白名单：/pages/login/login、/pages/register/register、/pages/index/index
  - 非白名单且未登录：自动重定向至登录页
- 流程：
  1) 登录页调用 AuthApi.login → 自动存储 token
  2) 受保护页面正常访问；401 时自动刷新 token，失败则重定向登录
  3) 登出：调用 AuthApi.logout → 清空 token 并返回登录页
