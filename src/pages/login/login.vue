<template>
  <view class="page">
    <view class="content">
      <view class="app-name">KnowledgeReview</view>

      <view class="form">
        <uni-easyinput class="input" v-model="email" type="text" placeholder="邮箱" :clearable="true"
          :placeholderStyle="'color:#C7C7CC'" />
        <uni-easyinput class="input" v-model="password" type="password" placeholder="密码（≥6位）" :clearable="true"
          :placeholderStyle="'color:#C7C7CC'" />

        <view class="options">
          <label class="remember">
            <switch :checked="remember" @change="remember = ($event as any).detail.value" />
            <text class="remember-text">记住我</text>
          </label>
        </view>

        <button class="primary-btn" :disabled="loading" @tap="onSubmit">
          <text>{{ loading ? '登录中...' : '登录' }}</text>
        </button>

        <view class="link" @tap="goRegister">没有账号？注册</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { login } from '@/api/auth'

const email = ref('')
const password = ref('')
const remember = ref(true)
const loading = ref(false)

function isEmail(v: string) {
  return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(v)
}

onMounted(() => {
  try {
    const last = uni.getStorageSync('kr_last_email')
    if (last) email.value = last
  } catch {}
})

async function onSubmit() {
  if (!isEmail(email.value)) { return uni.showToast({ title: '邮箱格式不正确', icon: 'none' }) }
  if (!password.value || password.value.length < 6) { return uni.showToast({ title: '密码至少 6 位', icon: 'none' }) }
  loading.value = true
  try {
    await login({ email: email.value, password: password.value })
    if (remember.value) {
      try { uni.setStorageSync('kr_last_email', email.value) } catch {}
    }
    uni.showToast({ title: '登录成功', icon: 'success' })
    setTimeout(() => uni.reLaunch({ url: '/pages/index/index' }), 400)
  } catch (e: any) {
    uni.showToast({ title: e?.message || '登录失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}

function goRegister() {
  uni.navigateTo({ url: '/pages/register/register' })
}
</script>

<style lang="scss" scoped>
.page {
  min-height: 90vh;
  background: #FFFFFF;
  padding: 0 22rpx env(safe-area-inset-bottom) 32rpx;
  display: flex; align-items: center; justify-content: center;
}
.content { width: 100%; max-width: 680rpx; text-align: center; }
.logo { width: 120rpx; height: 120rpx; border-radius: 24rpx; overflow: hidden; margin: 0 auto 24rpx; }
.app-name { font-size: 44rpx; font-weight: 700; color: #1C1C1E; margin-bottom: 64rpx; }
.form { display: flex; flex-direction: column; gap: 32rpx; align-items: stretch; }

/* iOS 输入框样式 */
.input :deep(.uni-easyinput__content) {
  background-color: #F2F2F7;
  border: 1rpx solid #E5E5EA;
  border-radius: 12rpx;
  height: 96rpx;
  padding: 0 28rpx;
}
.input :deep(.uni-easyinput__content:focus-within) {
  background-color: #FFFFFF;
  border-color: #007AFF;
}
.input :deep(input) { font-size: 32rpx; color: #1C1C1E; }
.input :deep(input::placeholder) { color: #C7C7CC; }

/* 记住我 */
.options { display:flex; justify-content:center; }
.remember { display:flex; align-items:center; gap: 12rpx; }
.remember-text { color: $text-primary; font-size: 28rpx; }

/* 主按钮 */
.primary-btn {
  margin-top: 56rpx;
  height: 92rpx; line-height: 92rpx;
  background: $primary-color; color: #FFFFFF; border: none;
  border-radius: 14rpx; font-size: 34rpx; font-weight: 600;
  display: flex; align-items: center; justify-content: center; gap: 12rpx;
  box-shadow: none;
}
.primary-btn[disabled] { opacity: .4; }

/* 链接 */
.link { margin-top: 40rpx; color: $primary-color; font-size: 28rpx; text-align: center; }
</style>
