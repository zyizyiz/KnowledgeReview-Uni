<template>
  <z-paging
    ref="zRef"
    v-model="dataList"
    :auto="auto"
    :default-page-size="pageSize"
    :refresher-enabled="enableRefresh"
    :loading-more-enabled="enableLoadMore"
    @query="onQuery"
  >
    <!-- 列表项渲染插槽 -->
    <template #default>
      <slot name="default" :list="dataList"></slot>
    </template>

    <!-- 空状态插槽 -->
    <template #empty>
      <slot name="empty">
        <view class="kr-empty">
          <text class="kr-empty-text">{{ emptyText }}</text>
        </view>
      </slot>
    </template>

    <!-- 错误状态插槽（点击可重试） -->
    <template #error>
      <slot name="error">
        <view class="kr-error" @tap="reload">
          <text class="kr-error-text">{{ errorText }}</text>
        </view>
      </slot>
    </template>

    <!-- 底部加载更多区域可按需扩展 slot="loadingMore" -->
  </z-paging>
</template>

<script setup lang="ts">
import { ref, watch, type PropType } from 'vue'
// @ts-ignore
import zPaging from 'z-paging/components/z-paging/z-paging.vue'

interface FetcherResult<T = any> { list: T[]; total: number }
interface FetcherParams { page: number; pageSize: number; [key: string]: any }

defineOptions({ components: { zPaging } })

const props = defineProps({
  fetcher: { type: Function as PropType<(p: FetcherParams) => Promise<FetcherResult>>, required: true },
  extraParams: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  auto: { type: Boolean, default: true },
  pageSize: { type: Number, default: 10 },
  enableRefresh: { type: Boolean, default: true },
  enableLoadMore: { type: Boolean, default: true },
  emptyText: { type: String, default: '暂无数据' },
  errorText: { type: String, default: '加载失败，点击重试' },
})

const emits = defineEmits<{
  (e: 'loaded', payload: FetcherResult): void
  (e: 'error', err: any): void
}>()

const zRef = ref<any>(null)
const dataList = ref<any[]>([])

async function onQuery(pageNo: number, pageSize: number) {
  try {
    const res = await (props.fetcher as any)({ page: pageNo, pageSize, ...(props.extraParams || {}) })
    if (pageNo === 1) dataList.value = res.list
    else dataList.value = dataList.value.concat(res.list)
    zRef.value?.complete(res.list, res.total)
    emits('loaded', res)
  } catch (err) {
    zRef.value?.complete(false)
    emits('error', err)
  }
}

function reload() {
  zRef.value?.reload()
}

watch(() => [props.pageSize, props.extraParams], () => {
  if (!props.auto) return
  setTimeout(() => zRef.value?.reload(), 0)
}, { deep: true })
</script>

<style scoped>
.kr-empty, .kr-error {
  min-height: 160rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8e8e93;
}
.kr-empty-text, .kr-error-text { font-size: 28rpx; }
.kr-error-text { color: #007AFF; }
</style>

