import { BASE_URL } from '@/api/request'

// 从 BASE_URL 去掉 /api 后缀，得到后端媒体根地址
// 例: 'http://192.168.45.111:8000/api' → 'http://192.168.45.111:8000'
const MEDIA_HOST = BASE_URL.replace('/api', '')

// 调试模式：在控制台输出 URL 转换信息
const DEBUG = true

/**
 * 解析 URL（微信小程序兼容版本）
 * @param {string} url URL 字符串
 * @returns {Object} { protocol, host, pathname, search }
 */
function parseUrl(url) {
  const result = {
    protocol: '',
    host: '',
    pathname: '',
    search: ''
  }
  
  try {
    // 提取协议
    const protocolMatch = url.match(/^(https?:\/\/)/)
    if (protocolMatch) {
      result.protocol = protocolMatch[1]
      url = url.slice(result.protocol.length)
    }
    
    // 提取 host
    const hostEnd = url.indexOf('/')
    if (hostEnd === -1) {
      result.host = url
      result.pathname = '/'
    } else {
      result.host = url.slice(0, hostEnd)
      const rest = url.slice(hostEnd)
      
      // 提取查询参数
      const queryStart = rest.indexOf('?')
      if (queryStart === -1) {
        result.pathname = rest
      } else {
        result.pathname = rest.slice(0, queryStart)
        result.search = rest.slice(queryStart)
      }
    }
  } catch (e) {
    if (DEBUG) console.error('[media] URL 解析失败:', url, e)
  }
  
  return result
}

/**
 * 将后端图片路径/URL 转换为当前后端 host 的可访问 URL
 *
 * - 绝对 URL (http/https): 替换 host 为 MEDIA_HOST，修正 127.0.0.1 等无法在真机访问的 host
 * - /media/ 开头的相对路径: 拼接 MEDIA_HOST
 * - 其他 (本地临时路径、/static/、blob: 等): 原样返回，不做处理
 *
 * @param {string} url      后端返回的图片 URL 或路径
 * @param {string} fallback url 为空时的回退值
 */
export function getMediaUrl(url, fallback = '') {
  if (!url) {
    if (DEBUG) console.log('[media] URL 为空，使用 fallback:', fallback)
    return fallback
  }
  
  let result = url
  
  // 处理绝对 URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = parseUrl(url)
      result = MEDIA_HOST + parsed.pathname + parsed.search
      if (DEBUG) console.log('[media] 绝对 URL 转换:', url, '→', result)
    } catch (e) {
      if (DEBUG) console.error('[media] URL 解析失败:', url, e)
      result = url
    }
  }
  // 处理 /media/ 开头的相对路径
  else if (url.startsWith('/media/')) {
    result = MEDIA_HOST + url
    if (DEBUG) console.log('[media] 相对路径转换:', url, '→', result)
  }
  // 其他情况（本地临时路径、/static/、blob: 等）
  else {
    if (DEBUG) console.log('[media] 保持原样:', url)
  }
  
  return result
}

/**
 * 检查图片 URL 是否有效（用于调试）
 * @param {string} url 图片 URL
 */
export function checkImageUrl(url) {
  if (!url) {
    console.warn('[media] 图片 URL 为空')
    return false
  }
  
  const processedUrl = getMediaUrl(url)
  console.log('[media] 图片 URL 检查:', {
    original: url,
    processed: processedUrl,
    isValid: !!processedUrl && processedUrl !== ''
  })
  
  return !!processedUrl && processedUrl !== ''
}