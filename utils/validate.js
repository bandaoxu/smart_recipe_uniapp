/**
 * validate.js - 表单验证工具函数
 *
 * 功能：
 * 1. 提供常用的表单验证规则
 * 2. 支持自定义验证规则
 */

/**
 * 验证用户名
 * @param {String} username - 用户名
 * @returns {String|null} 错误信息，null 表示验证通过
 */
export function validateUsername(username) {
  if (!username) {
    return '用户名不能为空'
  }
  if (username.length < 3) {
    return '用户名至少3个字符'
  }
  if (username.length > 20) {
    return '用户名最多20个字符'
  }
  // 只允许字母、数字、下划线
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return '用户名只能包含字母、数字和下划线'
  }
  return null
}

/**
 * 验证密码
 * @param {String} password - 密码
 * @returns {String|null} 错误信息
 */
export function validatePassword(password) {
  if (!password) {
    return '密码不能为空'
  }
  if (password.length < 6) {
    return '密码至少6个字符'
  }
  if (password.length > 20) {
    return '密码最多20个字符'
  }
  return null
}

/**
 * 验证确认密码
 * @param {String} password - 密码
 * @param {String} confirmPassword - 确认密码
 * @returns {String|null} 错误信息
 */
export function validatePasswordConfirm(password, confirmPassword) {
  if (!confirmPassword) {
    return '请再次输入密码'
  }
  if (password !== confirmPassword) {
    return '两次密码不一致'
  }
  return null
}

/**
 * 验证邮箱
 * @param {String} email - 邮箱
 * @returns {String|null} 错误信息
 */
export function validateEmail(email) {
  if (!email) {
    return '邮箱不能为空'
  }
  const emailReg = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
  if (!emailReg.test(email)) {
    return '邮箱格式不正确'
  }
  return null
}

/**
 * 验证手机号
 * @param {String} phone - 手机号
 * @returns {String|null} 错误信息
 */
export function validatePhone(phone) {
  if (!phone) {
    return '手机号不能为空'
  }
  const phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(phone)) {
    return '手机号格式不正确'
  }
  return null
}

/**
 * 验证必填项
 * @param {Any} value - 值
 * @param {String} fieldName - 字段名称
 * @returns {String|null} 错误信息
 */
export function validateRequired(value, fieldName = '此项') {
  if (value === null || value === undefined || value === '') {
    return `${fieldName}不能为空`
  }
  return null
}

/**
 * 验证长度范围
 * @param {String} value - 值
 * @param {Number} min - 最小长度
 * @param {Number} max - 最大长度
 * @param {String} fieldName - 字段名称
 * @returns {String|null} 错误信息
 */
export function validateLength(value, min, max, fieldName = '此项') {
  if (!value) {
    return `${fieldName}不能为空`
  }
  if (value.length < min) {
    return `${fieldName}至少${min}个字符`
  }
  if (value.length > max) {
    return `${fieldName}最多${max}个字符`
  }
  return null
}

/**
 * 验证数字范围
 * @param {Number} value - 值
 * @param {Number} min - 最小值
 * @param {Number} max - 最大值
 * @param {String} fieldName - 字段名称
 * @returns {String|null} 错误信息
 */
export function validateRange(value, min, max, fieldName = '此项') {
  if (value === null || value === undefined || value === '') {
    return `${fieldName}不能为空`
  }
  const num = Number(value)
  if (isNaN(num)) {
    return `${fieldName}必须是数字`
  }
  if (num < min) {
    return `${fieldName}不能小于${min}`
  }
  if (num > max) {
    return `${fieldName}不能大于${max}`
  }
  return null
}
