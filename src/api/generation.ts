import { http, buildUrl } from './request';

export interface PageQuery { page: number; pageSize: number; [key: string]: any }
export interface PageResult<T> { list: T[]; total: number }

export type GenStatus = 'pending' | 'processing' | 'completed' | 'failed'
export interface GenerationItem {
  id: string
  title?: string
  status: GenStatus
  createdAt: string
  finishedAt?: string
  progress?: number
}
export interface GenerationDetail extends GenerationItem {
  steps?: { name: string; status: GenStatus | 'skipped'; durationMs?: number; error?: string }[]
  error?: string
}

// 示例：生成任务分页列表（占位，与后端接口约定保持一致）
export async function listGenerations<T = GenerationItem>(query: PageQuery) {
  // 约定后端 GET /generation?page=&pageSize= 返回 { success, data: { list, total } }
  return http.get<PageResult<T>>('/generation', query);
}

// 创建生成任务（支持 URL 或 图片）— 无后端时返回 mock
export async function createGeneration(data: { url?: string; image?: any }): Promise<{ id: string } | any> {
  try {
    if (data?.image) {
      // H5 下 image 可能为 File 对象或临时路径，优先尝试表单上传
      const formData: any = new FormData()
      formData.append('file', (data as any).image)
      if (data?.url) formData.append('url', data.url)
      // 直接用 fetch 兜底（保持与后端一致路径）
      const res = await fetch(buildUrl('/generation'), {
        method: 'POST',
        headers: { /* uni.request 的 token 已在 http 封装，这里简化占位，不附加 */ },
        body: formData as any,
      })
      const body = await res.json()
      return (body as any)?.data || body
    }
    // 仅 URL
    return await http.post('/generation', { url: data?.url })
  } catch (e) {
    // 占位：返回 mock，便于前端流程联调
    return Promise.resolve({ id: 'gen_mock_' + Date.now() })
  }
}

// 获取任务详情—无后端时返回 mock
export async function getGenerationDetail(id: string): Promise<GenerationDetail> {
  try {
    return await http.get<GenerationDetail>(`/generation/${id}`)
  } catch (e) {
    return {
      id,
      title: '示例生成任务',
      status: 'processing',
      progress: 60,
      createdAt: new Date(Date.now() - 60_000).toISOString(),
      steps: [
        { name: '解析内容', status: 'completed', durationMs: 1200 },
        { name: '生成标签', status: 'completed', durationMs: 800 },
        { name: '生成问题', status: 'processing' },
        { name: '生成音频', status: 'pending' },
      ],
    }
  }
}
