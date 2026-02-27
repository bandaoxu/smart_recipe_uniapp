/**
 * recipe.js - 食谱相关 API
 *
 * 功能：
 * 1. 食谱列表、详情
 * 2. 创建、更新、删除食谱
 * 3. 点赞、收藏食谱
 * 4. 搜索食谱
 */

import request from './request'

/**
 * 获取食谱列表
 * @param {Object} params - 查询参数
 * @param {Number} params.page - 页码
 * @param {Number} params.page_size - 每页数量
 * @param {String} params.category - 分类
 * @param {String} params.difficulty - 难度
 * @param {String} params.search - 搜索关键词
 */
export const getRecipeList = (params) => {
  return request({
    url: '/recipe/',
    method: 'GET',
    params,
    needAuth: false
  })
}

/**
 * 获取食谱详情
 * @param {Number} id - 食谱 ID
 */
export const getRecipeDetail = (id) => {
  return request({
    url: `/recipe/${id}/`,
    method: 'GET'
  })
}

/**
 * 创建食谱
 * @param {Object} data - 食谱数据
 */
export const createRecipe = (data) => {
  return request({
    url: '/recipe/',
    method: 'POST',
    data
  })
}

/**
 * 更新食谱
 * @param {Number} id - 食谱 ID
 * @param {Object} data - 食谱数据
 */
export const updateRecipe = (id, data) => {
  return request({
    url: `/recipe/${id}/update/`,
    method: 'PUT',
    data
  })
}

/**
 * 删除食谱
 * @param {Number} id - 食谱 ID
 */
export const deleteRecipe = (id) => {
  return request({
    url: `/recipe/${id}/delete/`,
    method: 'DELETE'
  })
}

/**
 * 点赞食谱
 * @param {Number} id - 食谱 ID
 */
export const likeRecipe = (id) => {
  return request({
    url: `/recipe/${id}/like/`,
    method: 'POST'
  })
}

/**
 * 收藏食谱
 * @param {Number} id - 食谱 ID
 */
export const favoriteRecipe = (id) => {
  return request({
    url: `/recipe/${id}/favorite/`,
    method: 'POST'
  })
}

/**
 * 获取我的食谱
 */
export const getMyRecipes = () => {
  return request({
    url: '/recipe/my-recipes/',
    method: 'GET'
  })
}

/**
 * 获取我的收藏
 */
export const getFavorites = () => {
  return request({
    url: '/recipe/favorites/',
    method: 'GET'
  })
}

/**
 * 搜索食谱
 * @param {Object} params - 搜索参数
 * @param {String} params.keyword - 搜索关键词
 * @param {Number} params.page - 页码
 */
export const searchRecipes = (params) => {
  return request({
    url: '/recipe/',
    method: 'GET',
    params: {
      search: params.keyword,
      page: params.page
    },
    needAuth: false
  })
}

/**
 * 获取我的喜欢
 */
export const getLiked = (params) => {
  return request({
    url: '/recipe/liked/',
    method: 'GET',
    params
  })
}

/**
 * 获取食谱评论列表
 * @param {Number} id - 食谱 ID
 */
export const getRecipeComments = (id) => {
  return request({
    url: `/community/posts/${id}/comments/`,
    method: 'GET',
    needAuth: false
  })
}

/**
 * 发表食谱评论
 * @param {Number} id - 食谱 ID
 * @param {Object} data - 评论数据
 */
export const createRecipeComment = (id, data) => {
  return request({
    url: `/community/posts/${id}/comments/`,
    method: 'POST',
    data
  })
}