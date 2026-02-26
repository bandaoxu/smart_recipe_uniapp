/**
 * format.js - 数据格式化工具函数
 *
 * 功能：
 * 1. 时间格式化
 * 2. 数字格式化
 * 3. 文本处理
 */

/**
 * 格式化时间
 * @param {String|Date} time - 时间
 * @param {String} format - 格式（默认：YYYY-MM-DD HH:mm:ss）
 * @returns {String} 格式化后的时间
 */
export function formatTime(time, format = 'YYYY-MM-DD HH:mm:ss') {
  if (!time) return ''

  const date = new Date(time)
  if (isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  const second = String(date.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hour)
    .replace('mm', minute)
    .replace('ss', second)
}

/**
 * 格式化相对时间（多久前）
 * @param {String|Date} time - 时间
 * @returns {String} 相对时间
 */
export function formatRelativeTime(time) {
  if (!time) return ''

  const date = new Date(time)
  if (isNaN(date.getTime())) return ''

  const now = new Date()
  const diff = now.getTime() - date.getTime()

  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour
  const month = 30 * day
  const year = 365 * day

  if (diff < minute) {
    return '刚刚'
  } else if (diff < hour) {
    return `${Math.floor(diff / minute)}分钟前`
  } else if (diff < day) {
    return `${Math.floor(diff / hour)}小时前`
  } else if (diff < month) {
    return `${Math.floor(diff / day)}天前`
  } else if (diff < year) {
    return `${Math.floor(diff / month)}个月前`
  } else {
    return `${Math.floor(diff / year)}年前`
  }
}

/**
 * 格式化数字（千分位）
 * @param {Number} num - 数字
 * @returns {String} 格式化后的数字
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 格式化大数字（K、M、B）
 * @param {Number} num - 数字
 * @returns {String} 格式化后的数字
 */
export function formatLargeNumber(num) {
  if (num === null || num === undefined) return '0'

  if (num < 1000) {
    return num.toString()
  } else if (num < 1000000) {
    return (num / 1000).toFixed(1) + 'K'
  } else if (num < 1000000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else {
    return (num / 1000000000).toFixed(1) + 'B'
  }
}

/**
 * 格式化文件大小
 * @param {Number} bytes - 字节数
 * @returns {String} 格式化后的文件大小
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i]
}

/**
 * 截断文本
 * @param {String} text - 文本
 * @param {Number} maxLength - 最大长度
 * @param {String} suffix - 后缀（默认：...）
 * @returns {String} 截断后的文本
 */
export function truncateText(text, maxLength, suffix = '...') {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + suffix
}

/**
 * 格式化烹饪时间
 * @param {Number} minutes - 分钟数
 * @returns {String} 格式化后的时间
 */
export function formatCookingTime(minutes) {
  if (!minutes) return '未知'

  if (minutes < 60) {
    return `${minutes}分钟`
  } else {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`
  }
}

/**
 * 格式化难度
 * @param {String} difficulty - 难度（easy/medium/hard）
 * @returns {String} 中文难度
 */
export function formatDifficulty(difficulty) {
  const difficultyMap = {
    'easy': '简单',
    'medium': '中等',
    'hard': '困难'
  }
  return difficultyMap[difficulty] || '未知'
}

/**
 * 格式化价格
 * @param {Number} price - 价格
 * @returns {String} 格式化后的价格
 */
export function formatPrice(price) {
  if (price === null || price === undefined) return '¥0.00'
  return '¥' + price.toFixed(2)
}
