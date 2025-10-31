<template>
  <view class="page">
    <view class="nav">
      <text class="nav-link" @tap="goList">查看任务列表</text>
    </view>
    <view class="form">
      <view class="label">链接 URL（可选）</view>
      <uni-easyinput v-model="url" placeholder="https://example.com/article" :placeholderStyle="'color:#C7C7CC'" />

      <view class="sep" />

      <view class="label">或 上传图片（可选）</view>
      <uni-file-picker fileMediatype="image" mode="grid" :limit="1" @select="onSelect" @delete="onDelete" />

      <view class="hint">二选一或同时提供，后端会自动解析内容并创建生成任务。</view>

      <button class="primary" :disabled="submitting" @tap="onSubmit">
        <template v-if="!submitting">创建生成任务</template>
        <template v-else>提交中...</template>
      </button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { GenerationApi } from '@/api'

const url = ref('')
const imageFile = ref<any | null>(null)
const submitting = ref(false)

function goList() { uni.navigateTo({ url: '/pages/generate/list' }) }

function onSelect(e: any) {
  // H5 下 e.tempFiles[0].file 为 File 对象
  const f = e?.tempFiles?.[0]
  imageFile.value = f?.file || f || null
}
function onDelete() { imageFile.value = null }

async function onSubmit() {
  if (!url.value && !imageFile.value) {
    uni.showToast({ title: '请填写URL或选择图片', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    await GenerationApi.createGeneration({ url: url.value || undefined, image: imageFile.value || undefined })
    uni.showToast({ title: '已创建', icon: 'success' })
    setTimeout(() => uni.redirectTo({ url: '/pages/generate/list' }), 500)
  } catch (e) {
    uni.showToast({ title: '提交失败', icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped lang="scss">
.page { background: $bg-primary; min-height: 100vh; }
.nav { display: flex; justify-content: flex-end; padding: 16rpx 24rpx 0; }
.nav-link { color: $primary-color; font-size: 26rpx; }
.form { padding: 24rpx; display: flex; flex-direction: column; gap: 16rpx; }
.label { color: #000; font-weight: 600; font-size: 28rpx; margin-top: 8rpx; }
.sep { height: 12rpx; }
.hint { color: $text-secondary; font-size: 24rpx; margin-top: 8rpx; }
.primary { margin-top: 28rpx; height: 92rpx; line-height: 92rpx; border-radius: 16rpx; background: $primary-color; color: #fff; font-weight: 600; }
</style>

