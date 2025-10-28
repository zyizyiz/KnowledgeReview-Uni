const ACCESS_TOKEN_KEY = 'kr_access_token';
const REFRESH_TOKEN_KEY = 'kr_refresh_token';

export function getAccessToken(): string | null {
  try { return uni.getStorageSync(ACCESS_TOKEN_KEY) || null; } catch { return null; }
}
export function getRefreshToken(): string | null {
  try { return uni.getStorageSync(REFRESH_TOKEN_KEY) || null; } catch { return null; }
}
export function setAccessToken(token: string) {
  try { uni.setStorageSync(ACCESS_TOKEN_KEY, token); } catch {}
}
export function setRefreshToken(token: string) {
  try { uni.setStorageSync(REFRESH_TOKEN_KEY, token); } catch {}
}
export function setTokens(accessToken: string, refreshToken: string) {
  setAccessToken(accessToken); setRefreshToken(refreshToken);
}
export function clearTokens() {
  try { uni.removeStorageSync(ACCESS_TOKEN_KEY); } catch {}
  try { uni.removeStorageSync(REFRESH_TOKEN_KEY); } catch {}
}
export function isLoggedIn() {
  return !!getAccessToken();
}

