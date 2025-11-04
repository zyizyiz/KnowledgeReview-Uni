import { http } from './request';

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
  knowledgeBaseId?: string
}
export interface GenerationDetail extends GenerationItem {
  steps?: { name: string; status: GenStatus | 'skipped'; durationMs?: number; error?: string }[]
  error?: string
}

// 背题模式：知识点列表
export interface ReciteItem {
  id: string
  title?: string
  createdAt: string
  question: string
  answer: string
  tags?: string[]
  quality?: { score: number; label: string }
  memory?: { mnemonic?: string; story?: string }
  audio?: { url?: string | null; durationSec?: number }
}

export async function listRecite(query: PageQuery & { keyword?: string; tags?: string[] }) {
  return http.get<PageResult<ReciteItem>>('/generation/recite', query)
}

export async function getAudioUrl(id: string): Promise<{ ok: boolean; url: string }> {
  return http.get(`/generation/${id}/audio`)
}

// 示例：生成任务分页列表（占位，与后端接口约定保持一致）
export async function listGenerations<T = GenerationItem>(query: PageQuery) {
  return http.get<PageResult<T>>('/generation', query);
}

// 创建生成任务（支持 question+answer 或 questionData）
export async function createGeneration(data: { title?: string; question?: string; answer?: string; questionData?: any }): Promise<any> {
  const payload: any = {}
  if (data?.questionData && typeof data.questionData === 'object') {
    payload.title = data.title
    payload.questionData = data.questionData
  } else {
    const q = String(data?.question || '').trim()
    const a = String(data?.answer || '').trim()
    if (!q || !a) throw new Error('请填写题目与答案')
    payload.title = data.title
    payload.question = q
    payload.answer = a
  }
  return http.post('/generation', payload)
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
