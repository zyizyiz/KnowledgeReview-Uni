import { http, buildUrl } from './request'
import { getAccessToken } from '@/utils/token'

export interface PageQuery { page: number; pageSize: number; [key: string]: any }
export interface PageResult<T> { list: T[]; total: number }

export interface MediaItem {
  id: string
  url: string
  type: 'image'|'audio'|'video'|'other'
  size?: number
  durationSec?: number
  createdAt?: string
  meta?: Record<string, any>
}

export function listMedia(query: PageQuery & { type?: string; keyword?: string }) {
  return http.get<PageResult<MediaItem>>('/media', query)
}

export function getMedia(id: string) {
  return http.get<MediaItem>(`/media/${id}`)
}

export function deleteMedia(id: string) {
  return http.delete(`/media/${id}`)
}

export interface UploadResult { id: string; url: string; type: string }
export function uploadMedia(filePath: string, type?: 'image'|'audio'|'video', formData?: Record<string, any>) {
  return new Promise<UploadResult>((resolve, reject) => {
    const token = getAccessToken()
    const header: Record<string, string> = { 'x-request-id': 'rid-' + Date.now().toString(36) }
    if (token) header['Authorization'] = `Bearer ${token}`
    uni.uploadFile({
      url: buildUrl('/media/upload'),
      filePath,
      name: 'file',
      formData: { ...(formData || {}), type },
      header,
      success: (res) => {
        try {
          const body = JSON.parse(res.data)
          if (body?.success && body.data) resolve(body.data as UploadResult)
          else reject(new Error(body?.message || 'upload failed'))
        } catch (e) {
          reject(e as any)
        }
      },
      fail: (err) => reject(err),
    })
  })
}

