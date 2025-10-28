import { http } from './request';
import { setTokens, getRefreshToken, clearTokens } from '@/utils/token';

export interface LoginReq { email: string; password: string }
export interface RegisterReq { email: string; password: string; name?: string }
export interface LoginRes { accessToken: string; refreshToken: string }

export async function login(data: LoginReq) {
  const res = await http.post<LoginRes>('/auth/login', data);
  if (res?.accessToken && res?.refreshToken) setTokens(res.accessToken, res.refreshToken);
  return res;
}

export async function register(data: RegisterReq) {
  return http.post('/auth/register', data);
}

export async function me() {
  return http.get('/auth/me');
}

export async function refresh() {
  const rt = getRefreshToken();
  if (!rt) throw new Error('no refresh token');
  const res = await http.post<LoginRes>('/auth/refresh', { refreshToken: rt });
  if (res?.accessToken && res?.refreshToken) setTokens(res.accessToken, res.refreshToken);
  return res;
}

export async function logout() {
  try {
    const rt = getRefreshToken();
    await http.post('/auth/logout', rt ? { refreshToken: rt } : {});
  } finally {
    clearTokens();
  }
}

