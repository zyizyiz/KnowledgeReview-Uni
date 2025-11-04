<template>
  <view class="page">

    <ZPagingWrapper :fetcher="fetcher" :extra-params="{ keyword, type, tags: selectedTags, ts }" @loaded="onLoaded">
      <template #default="{ list }">
        <view>
          <view class="toolbar">
            <uni-easyinput v-model="keyword" placeholder="搜索题干关键词" @confirm="reload" confirmType="search" />
            <picker :range="typeOptions" range-key="label" @change="onTypeChange">
              <view class="type-picker">{{ typeLabel }}</view>
            </picker>
            <button class="btn primary" @tap="reload">搜索</button>
          </view
          >

          <view class="tags-filter">
            <view class="tag-search"><uni-easyinput v-model="tagQuery" placeholder="筛选标签" clearable /></view>
            <scroll-view scroll-x class="tags-scroll">
              <view class="tag-chip all" :class="{ active: !selectedTags.length }" @tap="clearTags">全部</view>
              <view v-for="t in displayedTags" :key="t" class="tag-chip" :class="{ active: selectedTags.includes(t) }" @tap="toggleTag(t)">{{ t }}</view>
              <view class="tag-chip more" v-if="availableTags.length > 20" @tap="openTagPicker">更多</view>
            </scroll-view>
          </view>

          <view v-for="item in list" :key="item.id" class="card" @tap="goDetail(item.id)">
            <view class="card-top">
              <text class="tag">{{ typeMap[item.type] || item.type }}</text>
              <view class="more" @tap.stop="showMore(item)"><uni-icons type="more-filled" size="20" /></view>
            </view>
            <view class="stem">{{ item.stem }}</view>
            <view v-if="item.tags && item.tags.length" class="card-tags">
              <view class="tag-chip small" v-for="t in item.tags.slice(0,3)" :key="t" @tap.stop="filterByTag(t)">{{ t }}</view>
              <view class="tag-more" v-if="item.tags.length > 3" @tap.stop="openTagPicker">+{{ item.tags.length - 3 }}</view>
            </view>
            <view class="meta">
              <text>{{ item.generationTitle || '生成任务' }}</text>
              <text class="dot">·</text>
              <text>{{ formatDate(item.createdAt) }}</text>
            </view>
          </view>
        </view>
    <view v-if="showTagPicker" class="overlay" @tap="closeTagPicker">
      <view class="panel" @tap.stop>
        <view class="panel-header">
          <text class="title">选择标签</text>
          <button class="btn" @tap="closeTagPicker">完成</button>
        </view>
        <view class="panel-search">
          <uni-easyinput v-model="tagQuery" placeholder="搜索标签" clearable />
        </view>
        <scroll-view scroll-y class="panel-body">
          <view class="tag-grid">
            <view v-for="t in displayedTags" :key="t" class="tag-chip" :class="{ active: selectedTags.includes(t) }" @tap="toggleTag(t)">{{ t }}</view>
          </view>
        </scroll-view>
        <view class="panel-footer">
          <button class="btn" @tap="clearTags">清空</button>
          <button class="btn primary" @tap="closeTagPicker">完成</button>
        </view>
      </view>
    </view>

      </template>
    </ZPagingWrapper>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ZPagingWrapper from '@/components/common/ZPagingWrapper.vue'
import { PracticeApi } from '@/api'

const keyword = ref('')
const type = ref('')
const selectedTags = ref<string[]>([])
const availableTags = ref<string[]>([])
const tagQuery = ref('')
const displayedTags = computed(() => {
  const q = tagQuery.value.trim().toLowerCase()
  const base = availableTags.value
  if (!q) return base
  return base.filter(t => t.toLowerCase().includes(q))
})
const showTagPicker = ref(false)
const ts = ref(0)
const total = ref(0)

const typeOptions = [
  { value: '', label: '全部题型' },
  { value: 'single', label: '单选' },
  { value: 'multiple', label: '多选' },
  { value: 'fill', label: '填空' },
  { value: 'judge', label: '判断' },
  { value: 'short', label: '简答' },
]
const typeMap: Record<string, string> = { single: '单选', multiple: '多选', fill: '填空', judge: '判断', short: '简答' }
const typeLabel = computed(() => (typeOptions.find(i => i.value === type.value)?.label || '全部题型'))

function onTypeChange(e: any) {
  const idx = Number(e?.detail?.value || 0)
  const opt = typeOptions[idx]
  type.value = opt?.value || ''
  reload()
}

function fetcher(p: { page: number; pageSize: number; keyword?: string; type?: string; tags?: string[] }) {
  return PracticeApi.listPractice(p)
}

function onLoaded(res: any) { total.value = res.total || 0 }
function reload() { ts.value = Date.now() }

function formatDate(s: string) { try { return s.slice(0, 10) } catch { return '' } }

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/practice/detail?id=${encodeURIComponent(id)}` })
}

async function showMore(item: any) {
  try {
    const act = await new Promise<any>((resolve, reject) => {
      uni.showActionSheet({
        itemList: ['删除该题目'],
        itemColor: '#FF3B30',
        success: resolve,
        fail: reject,
      })
    })
    if (act.tapIndex === 0) {
      const ok = await new Promise<boolean>((resolve) => {
        uni.showModal({
          title: '确认删除',
          content: '删除后不可恢复，是否继续？',
          confirmText: '删除',
          confirmColor: '#FF3B30',
          success: (res) => resolve(!!res.confirm),
        })
      })
      if (!ok) return
      await PracticeApi.deletePractice(item.id)
      uni.showToast({ title: '已删除', icon: 'success' })
      setTimeout(() => reload(), 300)
    }
  } catch {}
}
function openTagPicker() { showTagPicker.value = true }
function closeTagPicker() { showTagPicker.value = false }


function toggleTag(t: string) {
  const idx = selectedTags.value.indexOf(t)
  if (idx >= 0) selectedTags.value.splice(idx, 1)
  else selectedTags.value.push(t)
  reload()
}
function clearTags() { selectedTags.value = []; reload() }

function filterByTag(t: string) { selectedTags.value = [t]; reload() }

async function loadTags() {
  try {
    const res = await PracticeApi.getPracticeTags()
    availableTags.value = (res?.tags || []).slice(0, 200)
  } catch {}
}

onMounted(() => { loadTags() })
</script>

<style scoped lang="scss">
.page { min-height: 100vh; background: $bg-primary; }
.toolbar { display: flex; gap: 16rpx; padding: 16rpx; align-items: center; }
.type-picker { padding: 16rpx 20rpx; background: #fff; border-radius: 12rpx; color: $text-secondary; }
.btn { height: 72rpx; line-height: 72rpx; }
.tags-filter { padding: 0 16rpx 8rpx; }
.tags-scroll { white-space: nowrap; }
.tag-chip { display: inline-flex; align-items: center; padding: 8rpx 14rpx; margin-right: 12rpx; border-radius: 999rpx; background: #F2F2F7; color: #007AFF; font-size: 22rpx; }
.tag-chip.active { background: #E6F0FF; color: #007AFF; }
.tag-chip.all { color: #3C3C43; background: #EFEFF4; }
.card { background: #fff; margin: 16rpx; padding: 24rpx; border-radius: 16rpx; box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.04); }
.card-top { display: flex; justify-content: space-between; align-items: center; }
.tag { font-size: 24rpx; color: #007AFF; background: #E6F0FF; padding: 6rpx 12rpx; border-radius: 8rpx; }
.more { padding: 8rpx; }
.stem { margin-top: 12rpx; font-size: 30rpx; color: #1C1C1E; }
.card-tags { margin-top: 10rpx; display: flex; flex-wrap: nowrap; gap: 8rpx; }
.tag-chip.small { font-size: 20rpx; padding: 6rpx 10rpx; background: #F2F2F7; color: #007AFF; }
.tag-more { font-size: 20rpx; color: $text-secondary; }
.meta { margin-top: 8rpx; color: $text-secondary; font-size: 24rpx; display: flex; gap: 8rpx; align-items: center; }
.dot { opacity: 0.6; }
.btn.primary{ background:#007AFF; color:#fff; }

.tag-search { padding: 8rpx 0; }
.tag-chip.more { background: #E6F0FF; color: #007AFF; }
.overlay { position: fixed; left: 0; right: 0; top: 0; bottom: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: flex-end; }
.panel { background: #fff; width: 100%; max-height: 70vh; border-top-left-radius: 24rpx; border-top-right-radius: 24rpx; padding: 16rpx; }
.panel-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 8rpx; }
.panel-search { padding: 8rpx 0; }
.panel-body { max-height: 52vh; }
.tag-grid { display: flex; flex-wrap: wrap; gap: 12rpx; }
.panel-footer { display: flex; justify-content: space-between; gap: 16rpx; padding-top: 8rpx; }

</style>

