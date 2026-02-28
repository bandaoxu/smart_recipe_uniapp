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

/**
 * 部分更新用户信息（PATCH）
 * @param {Object} data - 要更新的字段
 */
export const patchProfile = (data) => {
  return request({
    url: '/user/profile/',
    method: 'PATCH',
    data
  })
}

/**
 * 修改密码
 * @param {Object} data
 * @param {String} data.old_password - 旧密码
 * @param {String} data.new_password - 新密码
 */
export const changePassword = (data) => {
  return request({
    url: '/user/change-password/',
    method: 'POST',
    data
  })
}

/**
 * 关注用户
 * @param {Number} userId - 目标用户 ID
 */
export const followUser = (userId) => {
  return request({
    url: `/user/${userId}/follow/`,
    method: 'POST'
  })
}

/**
 * 取消关注用户
 * @param {Number} userId - 目标用户 ID
 */
export const unfollowUser = (userId) => {
  return request({
    url: `/user/${userId}/follow/`,
    method: 'DELETE'
  })
}

/**
 * 获取我的关注列表
 */
export const getFollowing = () => {
  return request({
    url: '/user/following/',
    method: 'GET'
  })
}

/**
 * 获取他人公开档案
 * @param {Number} userId - 目标用户 ID
 */
export const getPublicProfile = (userId) => {
  return request({
    url: `/user/${userId}/`,
    method: 'GET',
    needAuth: false
  })
}
