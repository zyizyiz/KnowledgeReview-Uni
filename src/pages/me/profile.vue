<template>
  <view class="page">
    <view class="header">
      <image class="avatar" :src="avatarUrl" mode="aspectFill" />
      <view class="name">{{ user?.name || '未命名' }}</view>
      <view class="email">{{ user?.email }}</view>
    </view>

    <uni-list>
      <uni-list-item title="关于" rightText="KnowledgeReview" clickable />
      <uni-list-item title="退出登录" clickable @click="onLogout" />
    </uni-list>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { AuthApi } from '@/api'

const user = ref<any>(null)
const avatarUrl = '/static/logo.png'

async function load() {
  try { user.value = await AuthApi.me() } catch {}
}

async function onLogout() {
  try {
    await AuthApi.logout()
  } finally {
    uni.reLaunch({ url: '/pages/login/login' })
  }
}

onMounted(load)
</script>

<style scoped lang="scss">
.page { background: $bg-primary; min-height: 100vh; }
.header { display: flex; align-items: center; flex-direction: column; padding: 40rpx 0; }
.avatar { width: 140rpx; height: 140rpx; border-radius: 28rpx; }
.name { margin-top: 16rpx; font-size: 34rpx; font-weight: 700; color: #000; }
.email { margin-top: 8rpx; color: $text-secondary; }
</style>

