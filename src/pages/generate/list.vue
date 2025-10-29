<template>
  <view class="page">
    <ZPagingWrapper :fetcher="fetcher">
      <template #default="{ list }">
        <view v-for="it in list" :key="it.id" class="row" @tap="goDetail(it)">
          <view class="left">
            <view class="title">{{ it.title || ('任务 ' + it.id.slice(-6)) }}</view>
            <view class="meta">{{ formatTime(it.createdAt) }}</view>
          </view>
          <view class="right">
            <uni-tag :text="statusText(it.status)" :type="statusType(it.status)" size="small" />
          </view>
        </view>
      </template>
      <template #empty>
        <view class="empty">暂无生成任务</view>
      </template>
    </ZPagingWrapper>
  </view>
</template>

<script setup lang="ts">
import ZPagingWrapper from '@/components/common/ZPagingWrapper.vue'
import { GenerationApi } from '@/api'

function fetcher({ page, pageSize }: { page: number; pageSize: number }) {
  return GenerationApi.listGenerations({ page, pageSize })
}

function statusText(s: any) {
  if (s === 'processing') return '进行中'
  if (s === 'completed') return '已完成'
  if (s === 'failed') return '失败'
  return '待处理'
}
function statusType(s: any) {
  if (s === 'processing') return 'primary'
  if (s === 'completed') return 'success'
  if (s === 'failed') return 'error'
  return 'default'
}

function formatTime(s: string) { try { return new Date(s).toLocaleString() } catch { return s } }
function goDetail(it: any) { uni.navigateTo({ url: `/pages/generate/detail?id=${it.id}` }) }
</script>

<style scoped lang="scss">
.page { background: $bg-primary; min-height: 100vh; }
.row { display: flex; align-items: center; justify-content: space-between; padding: 20rpx 24rpx; border-bottom: 1rpx solid $separator; }
.left { display: flex; flex-direction: column; gap: 6rpx; }
.title { color: #000; font-size: 30rpx; font-weight: 600; }
.meta { color: $text-secondary; font-size: 24rpx; }
.right { display: flex; align-items: center; }
.empty { text-align: center; color: $text-secondary; padding: 80rpx 0; }
</style>

