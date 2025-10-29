<template>
  <view class="page">
    <swiper class="swiper" vertical :current="currentIndex" @change="onChange">
      <swiper-item v-for="(card, idx) in cards" :key="card.id">
        <view class="card">
          <view class="title">{{ card.title }}</view>
          <view class="meta" v-if="card.nextReviewAt">下次复习：{{ formatTime(card.nextReviewAt) }}</view>
          <view class="actions">
            <button class="btn neutral" @tap.stop="feedback(0)">生疏</button>
            <button class="btn" @tap.stop="feedback(3)">犹豫</button>
            <button class="btn primary" @tap.stop="feedback(5)">顺利</button>
          </view>
        </view>
      </swiper-item>
    </swiper>
    <view v-if="loading" class="loading"><uni-load-more status="loading" /></view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ReviewApi } from '@/api'

const cards = ref<any[]>([])
const currentIndex = ref(0)
const loading = ref(false)

async function load() {
  loading.value = true
  try {
    const res = await ReviewApi.listReviewSchedule({ page: 1, pageSize: 10 })
    cards.value = res.list || []
  } finally {
    loading.value = false
  }
}

function onChange(e: any) {
  currentIndex.value = e?.detail?.current || 0
  // TODO: 若存在音频地址 card.audioUrl，则在 500ms 后自动播放
}

function formatTime(s: string) { try { return new Date(s).toLocaleString() } catch { return s } }

async function feedback(quality: 0 | 3 | 5) {
  const cur = cards.value[currentIndex.value]
  if (!cur) return
  try {
    await ReviewApi.submitReviewFeedback({ cardId: cur.id, quality })
    uni.showToast({ title: '已记录', icon: 'success' })
  } catch (e) {
    uni.showToast({ title: '提交失败', icon: 'none' })
  }
}

onMounted(load)
</script>

<style scoped lang="scss">
.page { background: $bg-primary; min-height: 100vh; }
.swiper { height: 100vh; }
.card { position: relative; height: 100vh; display: flex; flex-direction: column; justify-content: center; padding: 48rpx; }
.title { font-size: 36rpx; color: #000; margin-bottom: 16rpx; }
.meta { color: $text-secondary; margin-bottom: 48rpx; }
.actions { position: absolute; bottom: calc(env(safe-area-inset-bottom) + 60rpx); left: 0; right: 0; display: flex; justify-content: space-around; padding: 0 24rpx; }
.btn { border-radius: 16rpx; background: $bg-secondary; color: $text-primary; padding: 20rpx 40rpx; }
.btn.primary { background: $primary-color; color: #fff; }
.btn.neutral { background: #E5E5EA; color: #000; }
.loading { position: absolute; bottom: 20rpx; left: 0; right: 0; text-align: center; }
</style>

