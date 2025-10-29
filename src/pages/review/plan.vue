<template>
  <view class="page">
    <ZPagingWrapper :fetcher="fetchSchedule" @loaded="onLoaded">
      <template #default="{ list }">
        <uni-list>
          <uni-list-item
            v-for="it in list"
            :key="it.id"
            clickable
            :title="it.title"
            :note="formatTime(it.nextReviewAt)"
            :rightText="formatInterval(it.interval)"
            @click="goFlashcards(it)"
          />
        </uni-list>
      </template>
      <template #empty>
        <view class="empty">今天暂无待复习</view>
      </template>
    </ZPagingWrapper>
  </view>
</template>

<script setup lang="ts">
import { ReviewApi } from '@/api'
import ZPagingWrapper from '@/components/common/ZPagingWrapper.vue'

function fetchSchedule({ page, pageSize }: { page: number; pageSize: number }) {
  return ReviewApi.listReviewSchedule({ page, pageSize })
}
function onLoaded(_: any) {}
function formatTime(s: string) { try { return new Date(s).toLocaleString() } catch { return s } }
function formatInterval(n: number) {
  if (n >= 1440) return Math.round(n / 1440) + '天'
  if (n >= 60) return Math.round(n / 60) + '小时'
  return n + '分钟'
}
function goFlashcards(it: any) {
  uni.navigateTo({ url: `/pages/study/flashcards?seed=${it.id}` })
}
</script>

<style scoped lang="scss">
.page { background: $bg-primary; min-height: 100vh; }
.empty { text-align: center; color: $text-secondary; padding: 48rpx 0; }
</style>

