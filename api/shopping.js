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

// ─── 分享相关 ─────────────────────────────────────────────

/**
 * 创建分享链接（需登录）
 * @param {Object} data - { permission: 'read'|'edit', days: 1|3|7|30 }
 */
export const createShare = (data) =>
  request({ url: '/shopping-list/share/', method: 'POST', data })

/**
 * 撤销分享链接（需登录）
 * @param {String} token - 分享 Token
 */
export const revokeShare = (token) =>
  request({ url: `/shopping-list/share/${token}/`, method: 'DELETE' })

/**
 * 获取分享的购物清单（无需登录）
 * @param {String} token - 分享 Token
 */
export const getSharedList = (token) =>
  request({ url: `/shopping-list/shared/${token}/`, method: 'GET', needAuth: false })

/**
 * 更新分享清单中的购买状态（无需登录，需 edit 权限）
 * @param {String} token - 分享 Token
 * @param {Number} id - 清单项 ID
 * @param {Object} data - { is_purchased: Boolean }
 */
export const updateSharedItem = (token, id, data) =>
  request({ url: `/shopping-list/shared/${token}/${id}/`, method: 'PATCH', needAuth: false, data })

