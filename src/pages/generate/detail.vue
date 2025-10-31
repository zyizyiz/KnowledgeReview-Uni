<template>
  <view class="page">
    <view v-if="detail" class="container">
      <view class="header">
        <view class="title">{{ detail.title || ('任务 ' + detail.id.slice(-6)) }}</view>
        <uni-tag :text="statusText(detail.status)" :type="statusType(detail.status)" size="small" />
      </view>
      <view class="meta">
        <text>创建时间：{{ formatTime(detail.createdAt) }}</text>
        <text v-if="detail.finishedAt"> · 完成时间：{{ formatTime(detail.finishedAt) }}</text>
      </view>

      <view v-if="detail.error" class="error">错误：{{ detail.error }}</view>

      <view class="section">
        <view class="section-title">来源</view>
        <view class="source">
          <template v-if="detail.url">
            <text class="src-label">链接：</text>
            <text class="src-url" @tap="copy(detail.url)">{{ detail.url }}</text>
            <button class="link-btn" @tap="openUrl(detail.url)">打开</button>
          </template>
          <template v-else-if="detail.imageName">
            <text class="src-label">图片：</text>
            <text class="src-img">{{ detail.imageName }}</text>
          </template>
          <template v-else>
            <text class="src-none">无</text>
          </template>
        </view>
      </view>

      <view class="section">
        <view class="section-title">步骤</view>
        <view v-if="detail.steps && detail.steps.length">
          <view v-for="(s, i) in detail.steps" :key="i" class="step">
            <text class="step-name">{{ s.name }}</text>
            <uni-tag :text="statusText(s.status)" :type="statusType(s.status)" size="small" />
            <text v-if="s.durationMs" class="duration">{{ (s.durationMs/1000).toFixed(1) }}s</text>
            <text v-if="s.error" class="s-error"> · {{ s.error }}</text>
          </view>
        </view>
        <view v-else class="empty">暂无步骤信息</view>
      </view>
    </view>

    <view v-else class="empty">加载中...</view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { GenerationApi } from '@/api'

const detail = ref<any>(null)

onLoad(async (opts: any) => {
  const id = opts?.id
  if (!id) { uni.showToast({ title: '缺少任务ID', icon: 'none' }); return }
  try { detail.value = await GenerationApi.getGenerationDetail(id) } catch (e) { detail.value = null }
})

function statusText(s: any) {
  if (s === 'processing') return '进行中'
  if (s === 'completed') return '已完成'
  if (s === 'failed') return '失败'
  if (s === 'skipped') return '跳过'
  return '待处理'
}
function statusType(s: any) {
  if (s === 'processing') return 'primary'
  if (s === 'completed') return 'success'
  if (s === 'failed') return 'error'
  return 'default'
}
function formatTime(s: string) { try { return new Date(s).toLocaleString() } catch { return s } }

function copy(text: string) {
  if (!text) return
  uni.setClipboardData({ data: text, success: () => uni.showToast({ title: '已复制', icon: 'none' }) })
}
function openUrl(url: string) {
  try {
    if (typeof window !== 'undefined' && url) {
      window.open(url, '_blank')
      return
    }
  } catch {}
  copy(url)
}
</script>

<style scoped lang="scss">
.page { background: $bg-primary; min-height: 100vh; padding: 24rpx; }
.container { display: flex; flex-direction: column; gap: 16rpx; }
.header { display: flex; align-items: center; justify-content: space-between; }
.title { color: #000; font-size: 34rpx; font-weight: 700; }
.meta { color: $text-secondary; font-size: 24rpx; }
.section { margin-top: 16rpx; }
.section-title { color: #000; font-size: 28rpx; font-weight: 600; margin-bottom: 12rpx; }
.source { color: $text-secondary; font-size: 24rpx; display: flex; align-items: center; gap: 12rpx; flex-wrap: wrap; }
.src-label { color: $text-secondary; }
.src-url { color: $primary-color; word-break: break-all; }
.src-img { color: $text-secondary; }
.src-none { color: $text-secondary; }
.link-btn { height: 60rpx; line-height: 60rpx; padding: 0 16rpx; border: 2rpx solid $primary-color; background: transparent; color: $primary-color; border-radius: 12rpx; font-size: 24rpx; }
.step { display: flex; align-items: center; gap: 12rpx; padding: 14rpx 0; border-bottom: 1rpx solid $separator; }
.step-name { color: #1C1C1E; font-size: 28rpx; flex: 1; }
.duration { color: $text-secondary; font-size: 24rpx; }
.s-error { color: #ff3b30; font-size: 24rpx; }
.empty { text-align: center; color: $text-secondary; padding: 80rpx 0; }
.error { color: #ff3b30; background: #ffecec; padding: 16rpx; border-radius: 12rpx; }
</style>

