/**
 * user.js - 用户相关 API
 *
 * 功能：
 * 1. 用户注册
 * 2. 用户登录
 * 3. 获取/更新用户信息
 * 4. Token 刷新
 */

import request from './request'

/**
 * 用户注册
 * @param {Object} data - 注册数据
 * @param {String} data.username - 用户名
 * @param {String} data.password - 密码
 * @param {String} data.email - 邮箱（可选）
 */
export const register = (data) => {
  return request({
    url: '/user/register/',
    method: 'POST',
    data,
    needAuth: false
  })
}

/**
 * 用户登录
 * @param {Object} data - 登录数据
 * @param {String} data.username - 用户名
 * @param {String} data.password - 密码
 */
export const login = (data) => {
  return request({
    url: '/user/login/',
    method: 'POST',
    data,
    needAuth: false
  })
}

/**
 * 刷新 Token
 * @param {Object} data - 刷新数据
 * @param {String} data.refresh - Refresh Token
 */
export const refreshToken = (data) => {
  return request({
    url: '/user/token/refresh/',
    method: 'POST',
    data,
    needAuth: false
  })
}

/**
 * 获取用户信息
 */
export const getProfile = () => {
  return request({
    url: '/user/profile/',
    method: 'GET'
  })
}

/**
 * 更新用户信息
 * @param {Object} data - 用户信息
 */
export const updateProfile = (data) => {
  return request({
    url: '/user/profile/',
    method: 'PUT',
    data
  })
}
