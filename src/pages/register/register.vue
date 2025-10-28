<template>
  <view class="page">
    <view class="content">
      <view class="app-name">KnowledgeReview</view>

      <view class="form">
        <uni-easyinput class="input" v-model="name" type="text" placeholder="昵称（可选）" :clearable="true"
          :placeholderStyle="'color:#C7C7CC'" />
        <uni-easyinput class="input" v-model="email" type="text" placeholder="邮箱" :clearable="true"
          :placeholderStyle="'color:#C7C7CC'" />
        <uni-easyinput class="input" v-model="password" type="password" placeholder="密码（≥6位）" :clearable="true"
          :placeholderStyle="'color:#C7C7CC'" />

        <button class="primary-btn" :disabled="loading" @tap="onSubmit">
          <text>{{ loading ? '注册中...' : '注册' }}</text>
        </button>

        <view class="link" @tap="goLogin">已有账号？登录</view>
      </view>
    </view>
  </view>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { register } from '@/api/auth'

const name = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)

function isEmail(v: string) { return /[^\s@]+@[^\s@]+\.[^\s@]+/.test(v) }

async function onSubmit() {
  if (!isEmail(email.value)) return uni.showToast({ title: '邮箱格式不正确', icon: 'none' })
  if (!password.value || password.value.length < 6) return uni.showToast({ title: '密码至少 6 位', icon: 'none' })
  loading.value = true
  try {
    await register({ email: email.value, password: password.value, name: name.value || undefined })
    uni.showToast({ title: '注册成功', icon: 'success' })
    setTimeout(() => uni.redirectTo({ url: '/pages/login/login' }), 400)
  } catch (e:any) {
    uni.showToast({ title: e?.message || '注册失败', icon: 'none' })
  } finally {
    loading.value = false
  }
}
function goLogin(){ uni.redirectTo({ url: '/pages/login/login' }) }
</script>
<style lang="scss" scoped>
.page { min-height: 90vh; background: #FFFFFF; padding: 0 48rpx env(safe-area-inset-bottom) 32rpx; display:flex; align-items:center; justify-content:center; }
.content { width: 100%; max-width: 680rpx; text-align:center; }
.logo { width: 120rpx; height: 120rpx; border-radius: 24rpx; overflow: hidden; margin: 0 auto 24rpx; }
.app-name { font-size: 44rpx; font-weight: 700; color: #1C1C1E; margin-bottom: 64rpx; }
.form { display:flex; flex-direction:column; gap: 32rpx; align-items: stretch; }
.input :deep(.uni-easyinput__content) { background:#F2F2F7; border: 1rpx solid #E5E5EA; border-radius: 12rpx; height: 96rpx; padding: 0 28rpx; }
.input :deep(.uni-easyinput__content:focus-within) { background:#FFFFFF; border-color:#007AFF; }
.input :deep(input) { font-size: 32rpx; color:#1C1C1E; }
.input :deep(input::placeholder) { color:#C7C7CC; }
.primary-btn { margin-top: 56rpx; height: 92rpx; line-height:92rpx; background:$primary-color; color:#fff; border:none; border-radius:14rpx; font-size:34rpx; font-weight:600; display:flex; align-items:center; justify-content:center; gap:12rpx; box-shadow:none; }
.primary-btn[disabled] { opacity: .4; }
.link { margin-top: 40rpx; color: $primary-color; font-size: 28rpx; text-align: center; }
</style>

