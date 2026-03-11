/**
 * community.js - 社区相关 API
 *
 * 功能：
 * 1. 动态列表、详情
 * 2. 发布动态
 * 3. 点赞、评论
 */

import request from './request'
import { getToken } from '@/utils/auth'

// 有 token 时发送认证（让后端返回 is_liked / is_following），无 token 时匿名访问
// 这样可避免"无 token 时因 needAuth:true 触发 401 刷新循环"的问题
const authIfLoggedIn = () => !!getToken()

/**
 * 获取动态列表
 * @param {Object} params - 查询参数
 * @param {Number} params.page - 页码
 * @param {Number} [params.author] - 按作者过滤
 */
export const getPostList = (params) =>
  request({ url: '/community/posts/', method: 'GET', params, needAuth: authIfLoggedIn() })

/**
 * 获取动态详情
 * @param {Number} id - 动态 ID
 */
export const getPostDetail = (id) =>
  request({ url: `/community/posts/${id}/`, method: 'GET', needAuth: authIfLoggedIn() })

/**
 * 发布动态
 * @param {Object} data - 动态数据
 */
export const createPost = (data) =>
  request({ url: '/community/posts/', method: 'POST', data })

/**
 * 点赞动态
 * @param {Number} id - 动态 ID
 */
export const likePost = (id) =>
  request({ url: `/community/posts/${id}/like/`, method: 'POST' })

/**
 * 获取评论列表
 * @param {Number} id - 动态 ID
 */
export const getComments = (id) =>
  request({ url: `/community/posts/${id}/comments/`, method: 'GET', needAuth: authIfLoggedIn() })

/**
 * 发表评论
 * @param {Number} id - 动态 ID
 * @param {Object} data - { content, parent? }
 */
export const createComment = (id, data) =>
  request({ url: `/community/posts/${id}/comments/`, method: 'POST', data })

// 删除动态（需登录，仅作者可操作）
export const deletePost = (id) =>
  request({ url: `/community/posts/${id}/delete/`, method: 'DELETE' })

// 编辑动态（需登录，仅作者可操作）
export const updatePost = (id, data) =>
  request({ url: `/community/posts/${id}/update/`, method: 'PATCH', data })

// 获取指定用户的动态列表
export const getUserPosts = (authorId) =>
  request({ url: '/community/posts/', method: 'GET', params: { author: authorId }, needAuth: authIfLoggedIn() })

// 删除评论（需登录，仅评论作者可操作）
export const deleteComment = (commentId) =>
  request({ url: `/community/comments/${commentId}/`, method: 'DELETE' })
