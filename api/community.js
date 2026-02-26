/**
 * community.js - 社区相关 API
 *
 * 功能：
 * 1. 动态列表、详情
 * 2. 发布动态
 * 3. 点赞、评论
 */

import request from './request'

/**
 * 获取动态列表
 * @param {Object} params - 查询参数
 * @param {Number} params.page - 页码
 * @param {Number} params.page_size - 每页数量
 */
export const getPostList = (params) => {
  return request({
    url: '/community/posts/',
    method: 'GET',
    params,
    needAuth: false
  })
}

/**
 * 获取动态详情
 * @param {Number} id - 动态 ID
 */
export const getPostDetail = (id) => {
  return request({
    url: `/community/posts/${id}/`,
    method: 'GET',
    needAuth: false
  })
}

/**
 * 发布动态
 * @param {Object} data - 动态数据
 * @param {String} data.content - 内容
 * @param {Array} data.images - 图片 URL 数组
 * @param {Number} data.recipe - 关联食谱 ID（可选）
 */
export const createPost = (data) => {
  return request({
    url: '/community/posts/',
    method: 'POST',
    data
  })
}

/**
 * 点赞动态
 * @param {Number} id - 动态 ID
 */
export const likePost = (id) => {
  return request({
    url: `/community/posts/${id}/like/`,
    method: 'POST'
  })
}

/**
 * 获取评论列表
 * @param {Number} id - 动态 ID
 */
export const getComments = (id) => {
  return request({
    url: `/community/posts/${id}/comments/`,
    method: 'GET',
    needAuth: false
  })
}

/**
 * 发表评论
 * @param {Number} id - 动态 ID
 * @param {Object} data - 评论数据
 * @param {String} data.content - 评论内容
 * @param {Number} data.parent - 父评论 ID（可选，用于回复）
 */
export const createComment = (id, data) => {
  return request({
    url: `/community/posts/${id}/comments/`,
    method: 'POST',
    data
  })
}
