import { http } from './request'

export interface PageQuery { page: number; pageSize: number; [key: string]: any }
export interface PageResult<T> { list: T[]; total: number }

export interface ReviewPlanItem {
  id: string
  title: string
  dueAt: string // ISO string
  count: number
}
export interface ReviewPlan {
  date: string
  items: ReviewPlanItem[]
}

export function getReviewPlan(params?: { date?: string }) {
  return http.get<ReviewPlan>('/review/plan', params)
}

export interface ReviewScheduleItem {
  id: string
  title: string
  nextReviewAt: string
  interval: number // minutes or days, 由后端定义
  easeFactor?: number
}
export function listReviewSchedule(query: PageQuery) {
  return http.get<PageResult<ReviewScheduleItem>>('/review/schedule', query)
}

export interface ReviewFeedbackReq {
  cardId: string
  quality: 0|1|2|3|4|5
  durationSec?: number
  note?: string
  sessionId?: string
}
export function submitReviewFeedback(data: ReviewFeedbackReq) {
  return http.post('/review/feedback', data)
}

export function startReviewSession(data?: { topicId?: string; limit?: number }) {
  return http.post<{ sessionId: string; count: number }>('/review/session/start', data || {})
}

export function completeReviewSession(data: { sessionId: string; results: Array<{ cardId: string; quality: number }> }) {
  return http.post<{ summary: { correct: number; total: number } }>('/review/session/complete', data)
}

