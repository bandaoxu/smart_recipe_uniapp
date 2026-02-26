/**
 * shopping.js - 购物清单相关 API
 *
 * 功能：
 * 1. 获取购物清单
 * 2. 添加、更新、删除食材
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
export const addItem = (data) => {
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
export const updateItem = (id, data) => {
  return request({
    url: `/shopping-list/${id}/`,
    method: 'PUT',
    data
  })
}

/**
 * 删除购物清单项
 * @param {Number} id - 清单项 ID
 */
export const deleteItem = (id) => {
  return request({
    url: `/shopping-list/${id}/`,
    method: 'DELETE'
  })
}
