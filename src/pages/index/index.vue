<template>
  <view class="page">
    <view class="header">
      <image class="logo" src="@/static/logo.png" mode="aspectFill" />
      <view class="title">KnowledgeReview</view>
      <view class="subtitle">今天待复习 {{ todayCount }}</view>
    </view>

    <uni-grid :column="2" :border="false" class="grid">
      <uni-grid-item v-for="item in entries" :key="item.path" @tap="go(item.path)">
        <view class="card">
          <uni-icons :type="item.icon" color="#007AFF" size="24" />
          <text class="card-title">{{ item.title }}</text>
        </view>
      </uni-grid-item>
    </uni-grid>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ReviewApi } from '@/api'

const todayCount = ref(0)
const entries = ref([
  { title: '背题模式', path: '/pages/study/flashcards', icon: 'sound' },
  { title: '问答模式', path: '/pages/qa/quiz', icon: 'compose' },
  { title: '复习计划', path: '/pages/review/plan', icon: 'calendar' },
  { title: '生成任务', path: '/pages/generate/create', icon: 'upload' },
  { title: '统计总览', path: '/pages/stats/overview', icon: 'list' },
  { title: '个人中心', path: '/pages/me/profile', icon: 'person' },
])

onMounted(async () => {
  try {
    const plan = await ReviewApi.getReviewPlan()
    const sum = (plan?.items || []).reduce((a: number, b: any) => a + (b.count || 0), 0)
    todayCount.value = sum || 0
  } catch {}
})

function go(path: string) { uni.navigateTo({ url: path }) }
</script>

<style scoped lang="scss">
.page { background: $bg-primary; min-height: 100vh; padding: 24rpx; }
.header { display: flex; align-items: center; flex-direction: column; padding: 24rpx 0 16rpx; }
.logo { width: 120rpx; height: 120rpx; border-radius: 24rpx; }
.title { margin-top: 16rpx; font-size: 44rpx; font-weight: 700; color: #1C1C1E; }
.subtitle { margin-top: 8rpx; color: $text-secondary; }
.grid { margin-top: 24rpx; }
.card { background: $bg-secondary; border-radius: 16rpx; padding: 28rpx; margin: 12rpx; display: flex; align-items: center; gap: 12rpx; }
.card-title { color: #000; font-size: 30rpx; }
</style>
