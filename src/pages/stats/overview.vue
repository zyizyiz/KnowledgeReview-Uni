<template>
  <view class="page">
    <view class="section">
      <view class="metric">
        <text class="label">今日复习</text>
        <text class="value">{{ overview.reviewsToday ?? 0 }}</text>
      </view>
      <view class="metric">
        <text class="label">总卡片</text>
        <text class="value">{{ overview.cards ?? 0 }}</text>
      </view>
      <view class="metric">
        <text class="label">正确率</text>
        <text class="value">{{ accuracyText() }}</text>
      </view>
    </view>
    <view class="hint">图表将在后续引入图表库后展示</view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { StatsApi } from '@/api'

const overview = ref<any>({})
function accuracyText() {
  const v = overview.value?.accuracy
  if (typeof v === 'number') return Math.round(v * 100) + '%'
  return '—'
}

onMounted(async () => {
  try { overview.value = await StatsApi.getOverview() } catch {}
})
</script>

<style scoped lang="scss">
.page { background: $bg-primary; min-height: 100vh; padding: 24rpx; }
.section { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16rpx; }
.metric { background: $bg-secondary; border-radius: 16rpx; padding: 24rpx; display: flex; flex-direction: column; }
.label { color: $text-secondary; font-size: 26rpx; }
.value { color: #000; font-size: 40rpx; font-weight: 700; margin-top: 8rpx; }
.hint { color: $text-secondary; margin-top: 40rpx; text-align: center; }
</style>

