<template>
  <view class="page">
    <view class="header">
      <text class="idx">第 {{ currentIndex + 1 }} 题</text>
    </view>

    <view v-if="current" class="body">
      <view class="stem">{{ current.stem }}</view>

      <view v-if="current.type === 'single' || current.type === 'multiple'">
        <view v-for="opt in current.choices" :key="opt.id" class="option" :class="{ selected: isSelected(opt.id) }" @tap="toggleOption(opt.id)">
          <text>{{ opt.text }}</text>
        </view>
      </view>

      <view v-else-if="current.type === 'fill'">
        <uni-easyinput v-model="fillAnswer" placeholder="请输入答案" />
      </view>

      <view v-else-if="current.type === 'judge'">
        <view class="option" :class="{ selected: judgeAnswer === true }" @tap="setJudge(true)">正确</view>
        <view class="option" :class="{ selected: judgeAnswer === false }" @tap="setJudge(false)">错误</view>
      </view>

      <view class="actions">
        <button class="btn primary" @tap="submit">提交</button>
        <button class="btn" @tap="next">下一题</button>
      </view>

      <view v-if="result" class="result" :class="{ ok: result.correct, bad: !result.correct }">
        <text>{{ result.correct ? '回答正确' : '回答错误' }}</text>
        <text v-if="result.feedback"> · {{ result.feedback }}</text>
      </view>
    </view>

    <view v-else class="empty">暂无题目</view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { QuestionApi } from '@/api'

const questionList = ref<any[]>([])
const currentIndex = ref(0)
const result = ref<any>(null)
const selected = ref<string[]>([])
const fillAnswer = ref('')
const judgeAnswer = ref<boolean | null>(null)

const current = computed(() => questionList.value[currentIndex.value])

async function load(page = 1) {
  const res = await QuestionApi.listQuestions({ page, pageSize: 1 })
  questionList.value = res.list || []
  currentIndex.value = 0
  result.value = null
  selected.value = []
  fillAnswer.value = ''
  judgeAnswer.value = null
}

function isSelected(id: string) { return selected.value.includes(id) }
function toggleOption(id: string) {
  const c = current.value
  if (!c) return
  if (c.type === 'single') selected.value = [id]
  else {
    if (selected.value.includes(id)) selected.value = selected.value.filter(x => x !== id)
    else selected.value = [...selected.value, id]
  }
}
function setJudge(v: boolean) { judgeAnswer.value = v }

async function submit() {
  if (!current.value) return
  let answer: any = null
  const type = current.value.type
  if (type === 'single' || type === 'multiple') answer = selected.value
  else if (type === 'fill') answer = fillAnswer.value
  else if (type === 'judge') answer = judgeAnswer.value
  const res = await QuestionApi.submitAnswer({ questionId: current.value.id, answer })
  result.value = res
}

async function next() { await load(1) }

onMounted(() => load(1))
</script>

<style scoped lang="scss">
.page { background: $bg-primary; min-height: 100vh; padding: 24rpx; }
.header { padding: 12rpx 8rpx; color: $text-secondary; }
.stem { font-size: 32rpx; color: #000; margin: 24rpx 0 32rpx; line-height: 1.6; }
.option { padding: 24rpx; margin-bottom: 16rpx; background: $bg-secondary; border-radius: 16rpx; }
.option.selected { border: 2rpx solid $primary-color; background: #fff; }
.actions { display: flex; gap: 16rpx; margin-top: 24rpx; }
.btn { flex: 1; padding: 20rpx 0; border-radius: 16rpx; background: $bg-secondary; color: $text-primary; text-align: center; }
.btn.primary { background: $primary-color; color: #fff; }
.result { margin-top: 24rpx; font-size: 28rpx; }
.result.ok { color: #2ecc71; }
.result.bad { color: #ff3b30; }
.empty { text-align: center; color: $text-secondary; padding: 80rpx 0; }
</style>

