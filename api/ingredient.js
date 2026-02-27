/**
 * ingredient.js - 食材相关 API
 *
 * 功能：
 * 1. 获取食材列表
 * 2. 获取食材详情
 * 3. 食材搜索
 * 4. 应季食材
 * 5. 食材识别（AI）
 * 6. 营养成分计算
 */

import request from './request'

/**
 * 获取食材列表
 * @param {Object} params - 查询参数
 * @param {String} params.category - 分类（可选）
 * @param {Number} params.page - 页码（可选）
 * @param {Number} params.page_size - 每页数量（可选）
 */
export const getIngredientList = (params = {}) => {
  return request({
    url: '/ingredient/',
    method: 'GET',
    params,
    needAuth: false
  })
}

/**
 * 获取食材详情
 * @param {Number} id - 食材 ID
 */
export const getIngredientDetail = (id) => {
  return request({
    url: `/ingredient/${id}/`,
    method: 'GET',
    needAuth: false
  })
}

/**
 * 搜索食材
 * @param {String} q - 搜索关键词
 * @param {Object} params - 其他查询参数
 */
export const searchIngredients = (q, params = {}) => {
  return request({
    url: '/ingredient/search/',
    method: 'GET',
    params: { q, ...params },
    needAuth: false
  })
}

/**
 * 获取应季食材
 * @param {Number} month - 月份（1-12，可选，默认当前月份）
 */
export const getSeasonalIngredients = (month) => {
  const params = month ? { month } : {}
  return request({
    url: '/ingredient/seasonal/',
    method: 'GET',
    params,
    needAuth: false
  })
}

/**
 * 食材识别（AI 识别图片中的食材）
 * @param {Object} data - 识别请求数据
 * @param {String} data.image_url - 图片 URL
 */
export const recognizeIngredient = (data) => {
  return request({
    url: '/ingredient/recognize/',
    method: 'POST',
    data
  })
}

/**
 * 营养成分计算
 * @param {Object} data - 计算请求数据
 * @param {Number} data.ingredient_id - 食材 ID
 * @param {Number} data.quantity - 数量（克）
 */
export const calculateNutrition = (data) => {
  return request({
    url: '/ingredient/nutrition-calculate/',
    method: 'POST',
    data,
    needAuth: false
  })
}
