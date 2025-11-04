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

    <!-- 可以将自定义导航栏、tab-view等需要固定的(不需要跟着滚动的)元素放入slot="top"的view中。 -->
    <template #top>
      <slot name="top"></slot> 
    </template>

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
// npm 方式使用 z-paging 组件
// 如遇路径变动，请参考官方文档适配导入路径
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import zPaging from 'z-paging/components/z-paging/z-paging.vue'

interface FetcherResult<T = any> { list: T[]; total: number }
interface FetcherParams { page: number; pageSize: number; [key: string]: any }

defineOptions({ components: { zPaging } })

const props = defineProps({
  // 必填：实际数据获取函数，需返回 { list, total }
  fetcher: { type: Function as PropType<(p: FetcherParams) => Promise<FetcherResult>>, required: true },
  // 额外参数：会在每次请求时透传给 fetcher
  extraParams: { type: Object as PropType<Record<string, any>>, default: () => ({}) },
  // 是否自动触发首次加载
  auto: { type: Boolean, default: true },
  // 分页大小
  pageSize: { type: Number, default: 10 },
  // 下拉刷新开关
  enableRefresh: { type: Boolean, default: true },
  // 上拉加载更多开关
  enableLoadMore: { type: Boolean, default: true },
  // 空/错文案
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
    const res = await props.fetcher({ page: pageNo, pageSize, ...(props.extraParams || {}) })
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

// 当分页大小变化或额外参数变化时，自动重新加载
watch(() => [props.pageSize, props.extraParams], () => {
  if (!props.auto) return
  setTimeout(() => zRef.value?.reload(), 0)
}, { deep: true })
</script>

<style scoped>
/* iOS 风格空/错误状态（浅灰+系统蓝） */
.kr-empty, .kr-error {
  min-height: 160rpx;
  padding: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8e8e93; /* iOS 次级文本灰 */
}
.kr-empty-text, .kr-error-text { font-size: 28rpx; }
.kr-error-text { color: #007AFF; /* iOS 系统蓝 */ }
</style>

