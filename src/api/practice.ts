import { http } from './request'

export interface PageQuery { page: number; pageSize: number; [key: string]: any }
export interface PageResult<T> { list: T[]; total: number }

export type PracticeType = 'fill' | 'single' | 'multiple' | 'judge' | 'short'

export interface PracticeListItem {
  id: string
  stepId: string
  itemIndex: number
  stem: string
  type: PracticeType
  choices?: Array<{ id: string; text: string }>
  difficulty?: number
  generationId: string
  generationTitle?: string
  createdAt: string
  tags?: string[]
}

export interface PracticeDetail extends PracticeListItem {
  correctAnswer?: any
  analysis?: string
}

export function listPractice(query: PageQuery & { keyword?: string; type?: string; tags?: string[] }) {
  return http.get<PageResult<PracticeListItem>>('/practice', query)
}

export function getPracticeTags() {
  return http.get<{ tags: string[] }>('/practice/tags')
}

export function getPracticeDetail(id: string) {
  return http.get<PracticeDetail>(`/practice/${id}`)
}

export function deletePractice(id: string) {
  return http.delete<{ ok: boolean }>(`/practice/${id}`)
}

export function submitPractice(id: string, data: { answer: any; durationSec?: number }) {
  return http.post<{ correct: boolean; score: number; feedback?: string; correctAnswer?: any; analysis?: string }>(`/practice/${id}/submit`, data)
}

