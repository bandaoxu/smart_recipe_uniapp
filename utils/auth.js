/**
 * auth.js - 认证工具函数
 *
 * 功能：
 * 1. Token 存储和获取
 * 2. 登录状态检查
 * 3. 用户信息管理
 */

const ACCESS_TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_INFO_KEY = 'user_info'

/**
 * 设置 Token
 * @param {Object} token - Token 对象
 * @param {String} token.access - Access Token
 * @param {String} token.refresh - Refresh Token
 */
export function setToken(token) {
  uni.setStorageSync(ACCESS_TOKEN_KEY, token.access)
  uni.setStorageSync(REFRESH_TOKEN_KEY, token.refresh)
}

/**
 * 获取 Access Token
 * @returns {String} Access Token
 */
export function getToken() {
  return uni.getStorageSync(ACCESS_TOKEN_KEY)
}

/**
 * 获取 Refresh Token
 * @returns {String} Refresh Token
 */
export function getRefreshToken() {
  return uni.getStorageSync(REFRESH_TOKEN_KEY)
}

/**
 * 清除 Token
 */
export function clearToken() {
  uni.removeStorageSync(ACCESS_TOKEN_KEY)
  uni.removeStorageSync(REFRESH_TOKEN_KEY)
}

/**
 * 检查是否已登录
 * @returns {Boolean} 是否已登录
 */
export function isLoggedIn() {
  return !!getToken()
}

/**
 * 设置用户信息
 * @param {Object} userInfo - 用户信息
 */
export function setUserInfo(userInfo) {
  uni.setStorageSync(USER_INFO_KEY, JSON.stringify(userInfo))
}

/**
 * 获取用户信息
 * @returns {Object} 用户信息
 */
export function getUserInfo() {
  const userInfo = uni.getStorageSync(USER_INFO_KEY)
  return userInfo ? JSON.parse(userInfo) : null
}

/**
 * 清除用户信息
 */
export function clearUserInfo() {
  uni.removeStorageSync(USER_INFO_KEY)
}

/**
 * 退出登录
 */
export function logout() {
  clearToken()
  clearUserInfo()
  uni.reLaunch({
    url: '/pages/user/login'
  })
}
