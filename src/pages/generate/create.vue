<template>
  <view class="page">
    <view class="nav">
      <text class="nav-link" @tap="goList">查看任务列表</text>
    </view>
    <view class="form">
      <view class="label">任务标题（可选）</view>
      <uni-easyinput v-model="title" placeholder="例如：一道选择题" :placeholderStyle="'color:#C7C7CC'" />

      <view class="sep" />

      <view class="label">题目（必填）</view>
      <uni-easyinput v-model="question" placeholder="请输入题目（stem）" :placeholderStyle="'color:#C7C7CC'" />

      <view class="sep" />

      <view class="label">答案（必填）</view>
      <uni-easyinput v-model="answer" placeholder="请输入正确答案" type="textarea" maxlength="-1" autoHeight :placeholderStyle="'color:#C7C7CC'" />

      <view class="hint">请输入题目与答案，将在当前知识库下创建任务。</view>

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

const title = ref('')
const question = ref('')
const answer = ref('')
const submitting = ref(false)

function goList() { uni.navigateTo({ url: '/pages/generate/list' }) }

async function onSubmit() {
  if (!question.value || !answer.value) {
    uni.showToast({ title: '请填写题目与答案', icon: 'none' })
    return
  }
  submitting.value = true
  try {
    await GenerationApi.createGeneration({
      title: title.value || undefined,
      question: question.value,
      answer: answer.value,
    })
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

