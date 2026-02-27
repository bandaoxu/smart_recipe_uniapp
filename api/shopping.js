/**
 * shopping.js - 购物清单相关 API
 *
 * 功能：
 * 1. 获取购物清单
 * 2. 添加、更新、删除食材
 * 3. 基于食谱生成购物清单
 */

import request from './request'

/**
 * 获取购物清单
 */
export const getShoppingList = () => {
  return request({
    url: '/shopping-list/',
    method: 'GET'
  })
}

/**
 * 添加食材到购物清单
 * @param {Object} data - 食材数据
 * @param {Number} data.ingredient - 食材 ID
 * @param {Number} data.quantity - 数量
 * @param {String} data.unit - 单位
 */
export const addShoppingItem = (data) => {
  return request({
    url: '/shopping-list/',
    method: 'POST',
    data
  })
}

/**
 * 更新购物清单项
 * @param {Number} id - 清单项 ID
 * @param {Object} data - 更新数据
 * @param {Boolean} data.is_purchased - 是否已购买
 */
export const updateShoppingItem = (id, data) => {
  return request({
    url: `/shopping-list/${id}/`,
    method: 'PATCH',
    data
  })
}

/**
 * 删除购物清单项
 * @param {Number} id - 清单项 ID
 */
export const deleteShoppingItem = (id) => {
  return request({
    url: `/shopping-list/${id}/`,
    method: 'DELETE'
  })
}

/**
 * 基于食谱生成购物清单
 * 将指定食谱的所有食材批量加入购物清单，已存在的食材自动累加数量
 * @param {Object} data - 请求数据
 * @param {Number} data.recipe_id - 食谱 ID
 */
export const generateShoppingList = (data) => {
  return request({
    url: '/shopping-list/generate/',
    method: 'POST',
    data
  })
}
