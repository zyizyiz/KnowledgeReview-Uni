import { http } from './request'

export interface PageQuery { page: number; pageSize: number; [key: string]: any }
export interface PageResult<T> { list: T[]; total: number }

export interface QuestionChoice { id: string; text: string; correct?: boolean }
export interface Question {
  id: string
  stem: string
  type: 'single' | 'multiple' | 'fill' | 'judge' | 'short'
  choices?: QuestionChoice[]
  tags?: string[]
  difficulty?: number
}

export function listQuestions(query: PageQuery & { tag?: string; keyword?: string; type?: string }) {
  return http.get<PageResult<Question>>('/question', query)
}

export function getQuestion(id: string) {
  return http.get<Question>(`/question/${id}`)
}

export interface SubmitAnswerReq {
  questionId: string
  answer: any
  durationSec?: number
}
export interface AnswerResult {
  correct: boolean
  score: number
  feedback?: string
  correctAnswer?: any
}
export function submitAnswer(data: SubmitAnswerReq) {
  return http.post<AnswerResult>('/question/answer', data)
}

