import { http } from './request'

export interface TrendPoint { date: string; value: number }
export interface TagAccuracy { tag: string; correct: number; total: number; accuracy: number }

export function getOverview() {
  return http.get<{ users?: number; cards?: number; reviewsToday?: number; accuracy?: number }>('/stats/overview')
}

export function getReviewTrend(params: { range?: '7d'|'30d'|'90d'; from?: string; to?: string }) {
  return http.get<TrendPoint[]>('/stats/trend', params)
}

export function getAccuracyByTag(params?: { topN?: number }) {
  return http.get<TagAccuracy[]>('/stats/accuracy-by-tag', params)
}

export function getHeatmap(params: { year: number }) {
  return http.get<Record<string, number>>('/stats/heatmap', params)
}

