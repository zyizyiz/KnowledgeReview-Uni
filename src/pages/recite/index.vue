<template>
  <view class="recite-page">

    <ZPagingWrapper ref="zp" :fetcher="fetcher" :extra-params="{ keyword }" :page-size="8" @loaded="onLoaded">
      <template #top>
        <view class="toolbar">
          <uni-easyinput v-model="keyword" placeholder="搜索知识点..." clearable @confirm="refresh" />
          <button class="btn search" @tap="refresh">搜索</button>
        </view>
      </template>
      <template #default="{ list }">
        <swiper class="swiper" vertical :current="currentIndex" @change="onSwiperChange">
          <swiper-item v-for="(item, index) in list" :key="item.id">
            <view class="card">
              <view class="card-header">
                <view class="tags" v-if="item.tags && item.tags.length">
                  <text v-for="t in item.tags.slice(0,6)" :key="t" class="tag">{{ t }}</text>
                </view>
                <view class="quality" v-if="item.quality">
                  <text class="q-label" :class="item.quality.label">质量 {{ item.quality.score }}</text>
                </view>
              </view>

              <view class="title">{{ item.title || '知识点' }}</view>

              <view class="question" @tap="toggleQuestion(item.id)">
                <text class="q-hint">问题</text>
                <text class="q-text" :class="{ collapsed: !questionExpandedMap[item.id] }">{{ item.question }}</text>
              </view>

              <view class="answer">
                <button v-if="!answerOpenMap[item.id]" class="btn primary" @tap.stop="openAnswer(item.id)">查看答案</button>
                <view v-else>
                  <zero-markdown-view :markdown="item.answer" :selectable="true" :ai-mode="false" />
                  <button class="btn" @tap.stop="closeAnswer(item.id)">收起答案</button>
                </view>
              </view>

              <view v-if="item.audio" class="audio">
                <view class="audio-header">
                  <text>播客</text>
                  <text class="duration" v-if="item.audio.durationSec">{{ Math.round(item.audio.durationSec) }}s</text>
                </view>
                <view>
                  <button v-if="!audioUrlMap[item.id]" class="btn" @tap="loadAudio(item.id)">加载音频</button>
                  <view v-else class="audio-controls">
                    <button class="btn" v-if="playingId!==item.id" @tap="playAudio(item.id)">播放</button>
                    <button class="btn" v-else @tap="pauseAudio">暂停</button>
                  </view>
                </view>
              </view>

              <view v-if="item.memory" class="memory">
                <view class="memory-header" @tap="toggleMemory(item.id)">
                  <text>记忆辅助</text>
                  <uni-icons :type="memoryOpenMap[item.id] ? 'up' : 'down'" size="18" />
                </view>
                <view v-if="memoryOpenMap[item.id]" class="memory-content">
                  <view v-if="item.memory.mnemonic" class="mem-block">
                    <text class="mem-label">助记词：</text>
                    <text class="mem-text">{{ item.memory.mnemonic }}</text>
                  </view>
                  <view v-if="item.memory.story" class="mem-block">
                    <text class="mem-label">记忆故事：</text>
                    <text class="mem-text">{{ item.memory.story }}</text>
                  </view>
                </view>
              </view>
            </view>
          </swiper-item>
        </swiper>
        <view class="progress">{{ currentIndex + 1 }} / {{ list.length }}</view>
      </template>
    </ZPagingWrapper>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import ZPagingWrapper from '@/components/common/ZPagingWrapper.vue'
import { GenerationApi } from '@/api'
import ZeroMarkdownView from '../../../components/zero-markdown-view/zero-markdown-view.vue'

const keyword = ref('')
const currentIndex = ref(0)
const zp = ref<any>(null)

// 展开/收起状态映射（按知识点 id 保存）
const answerOpenMap = reactive<Record<string, boolean>>({})
const questionExpandedMap = reactive<Record<string, boolean>>({})
const memoryOpenMap = reactive<Record<string, boolean>>({})
const audioUrlMap = reactive<Record<string, string>>({})
const playingId = ref<string | null>(null)
let audioCtx: any = null

function fetcher(p: { page: number; pageSize: number; keyword?: string; tags?: string[] }) {
  return GenerationApi.listRecite(p)
}
function onLoaded() {
  // 初始问题默认展开，答案与记忆默认收起（状态按需在切换时更新）
}
function onSwiperChange(e: any) {
  currentIndex.value = Number(e?.detail?.current || 0)
  // 切换卡片时自动收起答案与记忆，并停止音频
  for (const k in answerOpenMap) delete answerOpenMap[k]
  for (const k in memoryOpenMap) delete memoryOpenMap[k]
  try { audioCtx?.stop?.() } catch {}
  playingId.value = null
}

function openAnswer(id: string) { answerOpenMap[id] = true }
function closeAnswer(id: string) { answerOpenMap[id] = false }
function toggleQuestion(id: string) { questionExpandedMap[id] = !questionExpandedMap[id] }
function toggleMemory(id: string) { memoryOpenMap[id] = !memoryOpenMap[id] }

async function loadAudio(id: string) {
  if (audioUrlMap[id]) return
  try {
    const { url } = await GenerationApi.getAudioUrl(id)
    audioUrlMap[id] = url
  } catch (e) {
    uni.showToast({ title: '获取音频失败', icon: 'none' })
  }
}

async function playAudio(id: string) {
  if (!audioUrlMap[id]) await loadAudio(id)
  const src = audioUrlMap[id]
  if (!src) return
  if (!audioCtx) {
    // #ifdef H5 || MP-WEIXIN || APP
    audioCtx = uni.createInnerAudioContext()
    // #endif
  }
  if (!audioCtx) return
  try {
    audioCtx.src = src
    audioCtx.play()
    playingId.value = id
    // 结束/停止时重置状态
    audioCtx.onEnded?.(() => { playingId.value = null })
    audioCtx.onStop?.(() => { playingId.value = null })
    audioCtx.onError?.(() => { playingId.value = null })
  } catch {}
}
function pauseAudio() { try { audioCtx?.pause?.() } catch {}; playingId.value = null }

function refresh() { zp.value?.reload?.() }
</script>

<style scoped lang="scss">
.recite-page { background: $bg-primary; min-height: 100vh; }
.toolbar { display: flex; gap: 12rpx; padding: 12rpx 16rpx; background: #fff; align-items: center; }
.btn.search { height: 72rpx; line-height: 72rpx; padding: 0 24rpx; border-radius: 12rpx; background: #007AFF; color: #fff; }
.swiper { height: calc(100vh - 96rpx); }
.card { min-height: calc(100vh - 96rpx); box-sizing: border-box; padding: 32rpx 24rpx 120rpx; display: flex; flex-direction: column; gap: 16rpx; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.tags { display: flex; flex-wrap: wrap; gap: 8rpx; }
.tag { background: #F2F2F7; color: #007AFF; border-radius: 999rpx; padding: 6rpx 12rpx; font-size: 22rpx; }
.quality .q-label { color: #fff; background: #8E8E93; padding: 4rpx 10rpx; border-radius: 999rpx; font-size: 22rpx; }
.quality .q-label.high { background: #34C759; }
.quality .q-label.medium { background: #FFCC00; color: #000; }
.quality .q-label.low { background: #FF3B30; }
.title { font-size: 32rpx; font-weight: 600; color: #1C1C1E; }
.question { background: #fff; border-radius: 12rpx; padding: 16rpx; }
.q-hint { font-size: 24rpx; color: $text-secondary; margin-right: 8rpx; }
.q-text { font-size: 30rpx; color: #1C1C1E; display: -webkit-box; -webkit-box-orient: vertical; overflow: hidden; }
.q-text.collapsed { -webkit-line-clamp: 2; }
.answer { background: #fff; border-radius: 12rpx; padding: 16rpx; }
.btn { margin-top: 12rpx; height: 72rpx; line-height: 72rpx; border-radius: 12rpx; background: #E5E5EA; color: #000; }
.btn.primary { background: #007AFF; color: #fff; }
.audio { background: #fff; border-radius: 12rpx; padding: 16rpx; }
.audio-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8rpx; color: $text-secondary; }
.memory { background: #fff; border-radius: 12rpx; padding: 16rpx; }
.memory-header { display: flex; align-items: center; justify-content: space-between; }
.mem-block { margin-top: 8rpx; }
.mem-label { color: $text-secondary; margin-right: 6rpx; }
.mem-text { color: #1C1C1E; }
.progress { position: fixed; right: 16rpx; bottom: calc(env(safe-area-inset-bottom) + 20rpx); background: rgba(0,0,0,0.6); color: #fff; padding: 8rpx 12rpx; border-radius: 12rpx; font-size: 22rpx; }
</style>

