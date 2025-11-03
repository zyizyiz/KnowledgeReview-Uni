import { http } from './request'

export interface KnowledgeBase {
  id: string
  title: string
  description?: string
  createdAt: string
  updatedAt: string
}

export const kbApi = {
  list() { return http.get<KnowledgeBase[]>('/knowledge-bases') },
  create(data: { title: string; description?: string }) { return http.post<KnowledgeBase>('/knowledge-bases', data) },
  detail(id: string) { return http.get<KnowledgeBase>(`/knowledge-bases/${id}`) },
  update(id: string, data: { title?: string; description?: string }) { return http.patch<KnowledgeBase>(`/knowledge-bases/${id}`, data) },
  remove(id: string) { return http.delete(`/knowledge-bases/${id}`) },
}

export function setCurrentKb(id: string, title?: string) {
  uni.setStorageSync('currentKnowledgeBaseId', id)
  if (title) uni.setStorageSync('currentKnowledgeBaseTitle', title)
}

export function getCurrentKb() {
  const id = uni.getStorageSync('currentKnowledgeBaseId')
  const title = uni.getStorageSync('currentKnowledgeBaseTitle')
  return { id, title }
}

