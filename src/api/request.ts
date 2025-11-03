import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '@/utils/token';

export interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  requestId?: string;
  timestamp?: string;
  statusCode?: number;
  message?: any;
  error?: string;
  path?: string;
}

export interface RequestOptions<TReq = any> {
  url: string; // e.g. '/auth/login' or full URL
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: TReq;
  headers?: Record<string, string>;
  timeout?: number; // ms
}

export const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

function genRequestId() {
  return 'rid-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function joinUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  return API_BASE_URL.replace(/\/$/, '') + '/' + url.replace(/^\//, '');
}

// helper for other modules (e.g., upload)
export function buildUrl(url: string) { return joinUrl(url); }

function uniRequest<T>(opts: UniApp.RequestOptions): Promise<UniApp.RequestSuccessCallbackResult<T>> {
  return new Promise((resolve, reject) => {
    uni.request({
      ...opts,
      success: (res) => resolve(res as any),
      fail: (err) => reject(err),
    });
  });
}

async function doRefreshToken(): Promise<boolean> {
  if (isRefreshing) {
    await new Promise<void>((resolve) => refreshQueue.push(resolve));
    return !!getAccessToken();
  }
  isRefreshing = true;
  try {
    const rt = getRefreshToken();
    if (!rt) throw new Error('no refresh token');
    const res = await uniRequest<ApiEnvelope<{ accessToken: string; refreshToken: string }>>({
      url: joinUrl('/auth/refresh'),
      method: 'POST',
      header: { 'Content-Type': 'application/json', 'x-request-id': genRequestId() },
      data: { refreshToken: rt },
      timeout: 10000,
    });
    const body = res.data;
    if (body && (body as any).success && body.data) {
      setTokens(body.data.accessToken, body.data.refreshToken);
      return true;
    }
    throw new Error('refresh failed');
  } catch (e) {
    clearTokens();
    return false;
  } finally {
    isRefreshing = false;
    refreshQueue.forEach((fn) => fn());
    refreshQueue = [];
  }
}

export async function request<TRes = any, TReq = any>(options: RequestOptions<TReq>): Promise<TRes> {
  const method = options.method || 'GET';
  const url = joinUrl(options.url);
  const rid = genRequestId();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'x-request-id': rid,
    ...(options.headers || {}),
  };
  const token = getAccessToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const kbId = typeof uni !== 'undefined' ? uni.getStorageSync('currentKnowledgeBaseId') : null;
  if (kbId) headers['X-Knowledge-Base-Id'] = kbId;

  try {
    const res = await uniRequest<ApiEnvelope<TRes>>({
      url,
      method: method as any,
      data: options.data as any,
      header: headers,
      timeout: options.timeout ?? 15000,
    });

    if (res.statusCode === 401) {
      const refreshed = await doRefreshToken();
      if (refreshed) {
        return request<TRes, TReq>(options);
      }
      uni.showToast({ title: '登录已过期', icon: 'none' });
      setTimeout(() => {
        try { uni.reLaunch({ url: '/pages/login/login' }); } catch {}
      }, 800);
      throw new Error('Unauthorized');
    }

    if (res.statusCode >= 400) {
      const msg = (res.data as any)?.message || `HTTP ${res.statusCode}`;
      const text = typeof msg === 'string' ? msg : '请求失败';
      uni.showToast({ title: text, icon: 'none' });
      if (res.statusCode === 400 && String(text).includes('X-Knowledge-Base-Id')) {
        setTimeout(() => { try { uni.navigateTo({ url: '/pages/knowledge-base/index' }); } catch {} }, 500);
      }
      throw new Error(text);
    }

    const body = res.data;
    if ((body as any)?.success) {
      return (body as any).data as TRes;
    } else {
      return body as any as TRes;
    }
  } catch (err: any) {
    if (err?.errMsg?.includes('timeout')) {
      uni.showToast({ title: '请求超时，请稍后重试', icon: 'none' });
    } else if (err && typeof err.message === 'string') {
      // already handled
    } else {
      uni.showToast({ title: '网络异常', icon: 'none' });
    }
    throw err;
  }
}

export const http = {
  get<T = any>(url: string, params?: Record<string, any>, headers?: Record<string, string>) {
    return request<T>({ url, method: 'GET', data: params, headers });
  },
  post<T = any>(url: string, data?: any, headers?: Record<string, string>) {
    return request<T>({ url, method: 'POST', data, headers });
  },
  put<T = any>(url: string, data?: any, headers?: Record<string, string>) {
    return request<T>({ url, method: 'PUT', data, headers });
  },
  patch<T = any>(url: string, data?: any, headers?: Record<string, string>) {
    return request<T>({ url, method: 'PATCH', data, headers });
  },
  delete<T = any>(url: string, data?: any, headers?: Record<string, string>) {
    return request<T>({ url, method: 'DELETE', data, headers });
  },
};

