/**
 * request.js - 网络请求封装
 *
 * 功能：
 * 1. 封装 uni.request，统一处理请求和响应
 * 2. 自动添加 JWT Token 到请求头
 * 3. 统一错误处理
 * 4. Token 自动刷新机制
 */

import { getToken, getRefreshToken, setToken, clearToken } from '@/utils/auth'

// API 基础地址
const BASE_URL = 'http://127.0.0.1:8000/api'

// 是否正在刷新 Token
let isRefreshing = false
// 待重试的请求队列
let requestQueue = []

/**
 * 刷新 Token
 */
async function refreshToken() {
  const refresh = getRefreshToken()
  if (!refresh) {
    return Promise.reject('No refresh token')
  }

  try {
    const res = await uni.request({
      url: `${BASE_URL.replace('/api', '')}/api/token/refresh/`,
      method: 'POST',
      data: { refresh }
    })

    if (res.statusCode === 200 && res.data.access) {
      setToken({
        access: res.data.access,
        refresh: refresh
      })
      return res.data.access
    } else {
      throw new Error('Token refresh failed')
    }
  } catch (error) {
    clearToken()
    uni.reLaunch({
      url: '/pages/user/login'
    })
    return Promise.reject(error)
  }
}

/**
 * 处理请求队列
 */
function retryRequestQueue(token) {
  requestQueue.forEach(callback => callback(token))
  requestQueue = []
}

/**
 * 统一请求方法
 * @param {Object} options - 请求配置
 * @param {String} options.url - 请求路径（相对路径）
 * @param {String} options.method - 请求方法（GET/POST/PUT/DELETE）
 * @param {Object} options.data - 请求数据
 * @param {Object} options.params - URL 参数
 * @param {Object} options.header - 自定义请求头
 * @param {Boolean} options.needAuth - 是否需要认证（默认 true）
 */
function request(options) {
  return new Promise((resolve, reject) => {
    const {
      url,
      method = 'GET',
      data = {},
      params = {},
      header = {},
      needAuth = true
    } = options

    // 构建完整 URL
    let fullUrl = `${BASE_URL}${url}`

    // 添加 URL 参数
    if (Object.keys(params).length > 0) {
      const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&')
      fullUrl += `?${queryString}`
    }

    // 构建请求头
    const requestHeader = {
      'Content-Type': 'application/json',
      ...header
    }

    // 添加 Token
    if (needAuth) {
      const token = getToken()
      if (token) {
        requestHeader['Authorization'] = `Bearer ${token}`
      }
    }

    // 发起请求
    uni.request({
      url: fullUrl,
      method: method,
      data: data,
      header: requestHeader,
      success: (res) => {
        // 请求成功
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
        }
        // Token 过期，尝试刷新
        else if (res.statusCode === 401 && needAuth) {
          if (!isRefreshing) {
            isRefreshing = true
            refreshToken()
              .then(newToken => {
                isRefreshing = false
                retryRequestQueue(newToken)
                // 重新发起原请求
                requestHeader['Authorization'] = `Bearer ${newToken}`
                uni.request({
                  url: fullUrl,
                  method: method,
                  data: data,
                  header: requestHeader,
                  success: (retryRes) => {
                    if (retryRes.statusCode >= 200 && retryRes.statusCode < 300) {
                      resolve(retryRes.data)
                    } else {
                      reject(retryRes)
                    }
                  },
                  fail: (err) => {
                    reject(err)
                  }
                })
              })
              .catch(err => {
                isRefreshing = false
                requestQueue = []
                reject(err)
              })
          } else {
            // 正在刷新 Token，将请求加入队列
            requestQueue.push((newToken) => {
              requestHeader['Authorization'] = `Bearer ${newToken}`
              uni.request({
                url: fullUrl,
                method: method,
                data: data,
                header: requestHeader,
                success: (retryRes) => {
                  if (retryRes.statusCode >= 200 && retryRes.statusCode < 300) {
                    resolve(retryRes.data)
                  } else {
                    reject(retryRes)
                  }
                },
                fail: (err) => {
                  reject(err)
                }
              })
            })
          }
        }
        // 其他错误
        else {
          uni.showToast({
            title: res.data.message || '请求失败',
            icon: 'none'
          })
          reject(res)
        }
      },
      fail: (err) => {
        // 网络错误
        uni.showToast({
          title: '网络错误，请检查网络连接',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

export default request
