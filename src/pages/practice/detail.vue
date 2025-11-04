<template>
  <view class="page">
    <view class="header">
      <view class="title">{{ detail?.stem || '' }}</view>
      <view class="meta">
        <text class="tag">{{ typeMap[detail?.type || ''] || detail?.type }}</text>
        <view class="more" @tap="showMore"><uni-icons type="more-filled" size="20" /></view>
      </view>
    </view>

    <view class="body">
      <!-- 选择题 -->
      <view v-if="detail?.type === 'single' || detail?.type === 'multiple'" class="options">
        <label v-for="opt in detail?.choices || []" :key="opt.id" class="option" @tap="toggleChoice(opt.id)">
          <view class="ck" :class="{ on: isSelected(opt.id) }"></view>
          <text class="opttxt">{{ opt.text }}</text>
        </label>
      </view>

      <!-- 判断题 -->
      <view v-else-if="detail?.type === 'judge'" class="judge">
        <button class="btn" :class="{ primary: isSelected('正确') }" @tap="selectJudge('正确')">正确</button>
        <button class="btn" :class="{ primary: isSelected('错误') }" @tap="selectJudge('错误')">错误</button>
      </view>

      <!-- 填空/简答 -->
      <view v-else class="text-answer">
        <uni-easyinput type="textarea" v-model="textAnswer" placeholder="请输入你的答案" />
      </view>

      <view class="actions">
        <button class="btn primary" @tap="submit" :disabled="submitting">提交</button>
      </view>

      <view v-if="result" class="result" :class="{ ok: result.correct, bad: !result.correct }">
        <view class="res-title">{{ result.correct ? '回答正确' : '回答不正确' }}</view>
        <view class="res-answer">
          <text class="label">标准答案：</text>
          <text class="value">{{ formatAnswer(detail?.correctAnswer) }}</text>
        </view>
        <view v-if="detail?.analysis" class="res-analysis">
          <text class="label">解析：</text>
          <text class="value">{{ detail?.analysis }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { PracticeApi } from '@/api'

const id = ref<string>('')
const detail = ref<any>(null)
const submitting = ref(false)
const result = ref<any>(null)

const selected = ref<string[]>([])
const textAnswer = ref('')

const typeMap: Record<string, string> = { single: '单选', multiple: '多选', fill: '填空', judge: '判断', short: '简答' }

onMounted(async () => {
  const q = (getCurrentPages() as any[])?.slice(-1)?.[0] as any
  const query = q?.options || {}
  id.value = decodeURIComponent(query.id || '')
  await load()
})

async function load() {
  result.value = null
  detail.value = await PracticeApi.getPracticeDetail(id.value)
  selected.value = []
  textAnswer.value = ''
}

function isSelected(optId: string) { return selected.value.includes(optId) }
function toggleChoice(optId: string) {
  if (detail.value?.type === 'single') {
    selected.value = [optId]
  } else {
    const set = new Set(selected.value)
    set.has(optId) ? set.delete(optId) : set.add(optId)
    selected.value = Array.from(set)
  }
}
function selectJudge(val: '正确' | '错误') { selected.value = [val] }

function formatAnswer(a: any) {
  if (Array.isArray(a)) return a.join('、')
  return String(a ?? '')
}

function buildUserAnswer() {
  const t = detail.value?.type
  if (t === 'judge') {
    const v = String((selected.value[0] ?? '')).trim().toLowerCase()
    if (v === '正确' || v === '对' || v === 'true') return 'true'
    if (v === '错误' || v === '错' || v === 'false') return 'false'
    return ''
  }
  if (t === 'single' || t === 'multiple') {
    if (!detail.value?.choices?.length) {
      return t === 'single' ? (selected.value[0] || '') : selected.value
    }
    // map selected ids to text
    const map = new Map<string, string>((detail.value.choices || []).map((c: any) => [c.id, c.text]))
    const arr = selected.value.map((id) => map.get(id) || id)
    return t === 'single' ? (arr[0] || '') : arr
  }
  return textAnswer.value
}

async function submit() {
  try {
    submitting.value = true
    const answer = buildUserAnswer()
    const res = await PracticeApi.submitPractice(id.value, { answer })
    result.value = res
    if (res.correct) uni.showToast({ title: '正确', icon: 'success' })
    else uni.showToast({ title: '不正确', icon: 'none' })
  } finally {
    submitting.value = false
  }
}

async function showMore() {
  try {
    const act = await new Promise<any>((resolve, reject) => {
      uni.showActionSheet({ itemList: ['删除该题目'], itemColor: '#FF3B30', success: resolve, fail: reject })
    })
    if (act.tapIndex === 0) {
      const ok = await new Promise<boolean>((resolve) => {
        uni.showModal({ title: '确认删除', content: '删除后将不再展示该题', confirmText: '删除', confirmColor: '#FF3B30', success: (res) => resolve(!!res.confirm) })
      })
      if (!ok) return
      await PracticeApi.deletePractice(id.value)
      uni.showToast({ title: '已删除', icon: 'success' })
      setTimeout(() => { try { uni.navigateBack() } catch {} }, 400)
    }
  } catch {}
}
</script>

<style scoped lang="scss">
.page { min-height: 100vh; background: $bg-primary; }
.header { background: #fff; padding: 24rpx; }
.title { font-size: 34rpx; font-weight: 600; color: #1C1C1E; }
.meta { margin-top: 8rpx; display: flex; align-items: center; justify-content: space-between; }
.tag { font-size: 24rpx; color: #007AFF; background: #E6F0FF; padding: 6rpx 12rpx; border-radius: 8rpx; }
.body { padding: 16rpx; }
.options { display: flex; flex-direction: column; gap: 16rpx; }
.option { background: #fff; padding: 16rpx; border-radius: 12rpx; display: flex; align-items: center; gap: 12rpx; }
.ck { width: 28rpx; height: 28rpx; border-radius: 50%; border: 2rpx solid #C7C7CC; }
.ck.on { background: #007AFF; border-color: #007AFF; }
.opttxt { color: #1C1C1E; font-size: 30rpx; }
.judge { display: flex; gap: 16rpx; padding: 8rpx; }
.text-answer { background: #fff; padding: 12rpx; border-radius: 12rpx; }
.actions { margin-top: 16rpx; }
.btn { height: 84rpx; line-height: 84rpx; }
.btn.primary{ background:#007AFF; color:#fff; }
.result { margin-top: 16rpx; background: #fff; padding: 16rpx; border-radius: 12rpx; border-left: 8rpx solid #FF3B30; }
.result.ok { border-left-color: #34C759; }
.res-title { font-size: 30rpx; font-weight: 600; margin-bottom: 8rpx; }
.res-answer, .res-analysis { color: $text-secondary; font-size: 26rpx; }
.label { color: $text-secondary; }
.value { color: #1C1C1E; }
</style>

