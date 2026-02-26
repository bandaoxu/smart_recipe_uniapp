/**
 * storage.js - 本地存储工具函数
 *
 * 功能：
 * 1. 封装 uni.storage API
 * 2. 提供同步和异步存储方法
 * 3. 支持对象自动序列化
 */

/**
 * 同步设置存储
 * @param {String} key - 键名
 * @param {Any} value - 值（自动序列化对象）
 */
export function setStorage(key, value) {
  try {
    const data = typeof value === 'object' ? JSON.stringify(value) : value
    uni.setStorageSync(key, data)
    return true
  } catch (error) {
    console.error('setStorage error:', error)
    return false
  }
}

/**
 * 同步获取存储
 * @param {String} key - 键名
 * @returns {Any} 值（自动反序列化对象）
 */
export function getStorage(key) {
  try {
    const data = uni.getStorageSync(key)
    if (!data) return null

    // 尝试解析 JSON
    try {
      return JSON.parse(data)
    } catch {
      return data
    }
  } catch (error) {
    console.error('getStorage error:', error)
    return null
  }
}

/**
 * 同步删除存储
 * @param {String} key - 键名
 */
export function removeStorage(key) {
  try {
    uni.removeStorageSync(key)
    return true
  } catch (error) {
    console.error('removeStorage error:', error)
    return false
  }
}

/**
 * 清空所有存储
 */
export function clearStorage() {
  try {
    uni.clearStorageSync()
    return true
  } catch (error) {
    console.error('clearStorage error:', error)
    return false
  }
}

/**
 * 异步设置存储
 * @param {String} key - 键名
 * @param {Any} value - 值
 */
export function setStorageAsync(key, value) {
  return new Promise((resolve, reject) => {
    const data = typeof value === 'object' ? JSON.stringify(value) : value
    uni.setStorage({
      key: key,
      data: data,
      success: () => resolve(true),
      fail: (err) => reject(err)
    })
  })
}

/**
 * 异步获取存储
 * @param {String} key - 键名
 */
export function getStorageAsync(key) {
  return new Promise((resolve, reject) => {
    uni.getStorage({
      key: key,
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          resolve(data)
        } catch {
          resolve(res.data)
        }
      },
      fail: (err) => reject(err)
    })
  })
}
