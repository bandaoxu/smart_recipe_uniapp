// API 配置文件
// 统一管理后端 API 地址

export const API_CONFIG = {
  // 开发环境
  development: 'http://192.168.45.111:8000/api',
  
  // 生产环境
  production: 'https://your-domain.com/api',
  
  // 当前环境
  current: 'development'
}

// 获取当前 API 地址
export function getApiUrl() {
  return API_CONFIG[API_CONFIG.current]
}

// 获取完整的 API URL
export function getFullApiUrl(path) {
  const baseUrl = getApiUrl()
  return `${baseUrl}${path}`
}
