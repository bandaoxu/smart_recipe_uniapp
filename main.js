/**
 * main.js - 应用主入口文件
 *
 * 功能：
 * 1. 创建 Vue 应用实例
 * 2. 引入 Pinia 状态管理
 * 3. 引入 uni-ui 组件库
 * 4. 挂载应用
 */

import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'

export function createApp() {
  const app = createSSRApp(App)

  // 使用 Pinia 状态管理
  const pinia = createPinia()
  app.use(pinia)

  return {
    app,
    pinia
  }
}
