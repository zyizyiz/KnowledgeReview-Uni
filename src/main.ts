import { createSSRApp } from "vue";
import App from "./App.vue";
import { setupAuthGuard } from "@/utils/auth-guard";

export function createApp() {
  const app = createSSRApp(App);
  // 注册全局路由守卫（登录态检查）
  setupAuthGuard();
  return {
    app,
  };
}
