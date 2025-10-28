import { http } from './request';

export interface PageQuery { page: number; pageSize: number; [key: string]: any }
export interface PageResult<T> { list: T[]; total: number }

// 示例：生成任务分页列表（占位，与后端接口约定保持一致）
export async function listGenerations<T = any>(query: PageQuery) {
  // 约定后端 GET /generation?page=&pageSize= 返回 { success, data: { list, total } }
  return http.get<PageResult<T>>('/generation', query);
}

