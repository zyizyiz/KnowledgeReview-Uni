import { isLoggedIn } from '@/utils/token'

const WHITE_LIST = new Set<string>([
  '/pages/login/login',
  '/pages/register/register',
  '/pages/index/index',
])

function normalize(url: string) {
  if (!url) return ''
  const path = url.split('?')[0]
  return path.startsWith('/') ? path : '/' + path
}

function guard(targetUrl: string) {
  const path = normalize(targetUrl)
  if (WHITE_LIST.has(path)) return true
  if (isLoggedIn()) return true
  uni.reLaunch({ url: '/pages/login/login' })
  return false
}

export function setupAuthGuard() {
  ;['navigateTo', 'redirectTo', 'reLaunch', 'switchTab'].forEach((name) => {
    // @ts-ignore
    uni.addInterceptor(name, {
      invoke(args: any) {
        if (!guard(args?.url)) return false
      },
    })
  })
}

