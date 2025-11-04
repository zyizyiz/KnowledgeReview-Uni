<template>
  <view class="page">
    <view class="header">
      <text class="title">知识库</text>
      <button class="create-btn primary" size="mini" @click="onCreate">新建</button>
    </view>

    <view v-if="loading" class="hint">加载中...</view>
    <view v-else-if="list.length === 0" class="hint">暂无知识库，点击右上角“新建”创建一个</view>

    <view class="kb-list">
      <view class="kb-item" v-for="kb in list" :key="kb.id">
        <view class="kb-main" @click="onSelect(kb)">
          <text class="kb-title">{{ kb.title }}</text>
          <text v-if="currentId === kb.id" class="badge">当前</text>
        </view>
        <view class="kb-actions">
          <button size="mini" @click.stop="onRename(kb)">重命名</button>
          <button size="mini" class="warn" @click.stop="onDelete(kb)">删除</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { kbApi, setCurrentKb, getCurrentKb, type KnowledgeBase } from '@/api/knowledge-base'

const list = ref<KnowledgeBase[]>([])
const loading = ref(false)
const currentId = ref<string | null>(null)

onMounted(() => {
  const cur = getCurrentKb()
  currentId.value = cur.id || null
  load()
})

async function load() {
  loading.value = true
  try {
    list.value = await kbApi.list()
  } catch (e) {
    // toast handled globally
  } finally {
    loading.value = false
  }
}

function promptInput(title: string, placeholder: string): Promise<string | null> {
  return new Promise((resolve) => {
    uni.showModal({
      title,
      editable: true as any,
      placeholderText: placeholder as any,
      success: (res) => {
        if (res.confirm) resolve((res as any).content || '')
        else resolve(null)
      },
      fail: () => resolve(null),
    })
  })
}

async function onCreate() {
  const name = await promptInput('新建知识库', '请输入名称')
  if (name && name.trim()) {
    await kbApi.create({ title: name.trim() })
    await load()
  }
}

async function onRename(kb: KnowledgeBase) {
  const name = await promptInput('重命名', kb.title)
  if (name && name.trim() && name.trim() !== kb.title) {
    await kbApi.update(kb.id, { title: name.trim() })
    await load()
  }
}

async function onDelete(kb: KnowledgeBase) {
  const ok = await new Promise<boolean>((resolve) => {
    uni.showModal({
      title: '删除确认',
      content: `确定删除“${kb.title}”？此操作会级联删除其下所有数据。`,
      success: (res) => resolve(!!res.confirm),
      fail: () => resolve(false),
    })
  })
  if (!ok) return
  await kbApi.remove(kb.id)
  if (currentId.value === kb.id) {
    uni.removeStorageSync('currentKnowledgeBaseId')
    uni.removeStorageSync('currentKnowledgeBaseTitle')
    currentId.value = null
  }
  await load()
}

function onSelect(kb: KnowledgeBase) {
  setCurrentKb(kb.id, kb.title)
  currentId.value = kb.id
  uni.showToast({ title: `已切换到：${kb.title}`, icon: 'none' })
  setTimeout(() => {
    try { uni.reLaunch({ url: '/pages/index/index' }) } catch {}
  }, 300)
}
</script>

<style scoped>
.page { padding: 12px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.title { font-size: 18px; font-weight: 600; }
.create-btn { }
.hint { color: #888; font-size: 14px; padding: 12px 4px; }
.kb-list { display: flex; flex-direction: column; gap: 12px; }
.kb-item { background: #fff; border-radius: 8px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
.kb-main { display: flex; align-items: center; gap: 8px; }
.kb-title { font-size: 16px; }
.badge { font-size: 12px; color: #1aad19; border: 1px solid #1aad19; border-radius: 10px; padding: 1px 6px; }
.kb-actions { margin-top: 8px; display: flex; gap: 8px; }
</style>

