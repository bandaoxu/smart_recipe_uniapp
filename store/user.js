/**
 * user.js - 用户状态管理
 *
 * 功能：
 * 1. 管理用户信息
 * 2. 管理登录状态
 * 3. 管理 Token
 */

import { defineStore } from 'pinia'
import { getToken, setToken, clearToken, getUserInfo, setUserInfo, clearUserInfo } from '@/utils/auth'
import { login as loginApi, register as registerApi, getProfile } from '@/api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    // 用户信息
    userInfo: getUserInfo(),
    // Token
    token: getToken(),
    // 是否已登录
    isLoggedIn: !!getToken()
  }),

  getters: {
    /**
     * 获取用户昵称
     */
    nickname: (state) => state.userInfo?.nickname || '未登录',

    /**
     * 获取用户头像
     */
    avatar: (state) => state.userInfo?.avatar || '/static/images/default-avatar.svg',

    /**
     * 获取用户 ID
     */
    userId: (state) => state.userInfo?.id || null
  },

  actions: {
    /**
     * 用户登录
     * @param {Object} data - 登录数据
     * @param {String} data.username - 用户名
     * @param {String} data.password - 密码
     */
    async login(data) {
      try {
        const res = await loginApi(data)

        // 保存 Token
        if (res.data.access && res.data.refresh) {
          setToken({
            access: res.data.access,
            refresh: res.data.refresh
          })
          this.token = res.data.access
          this.isLoggedIn = true
        }

        // 获取用户信息
        await this.fetchUserInfo()

        return res
      } catch (error) {
        console.error('登录失败:', error)
        throw error
      }
    },

    /**
     * 用户注册
     * @param {Object} data - 注册数据
     */
    async register(data) {
      try {
        const res = await registerApi(data)

        // 注册成功后自动登录
        if (res.code === 200) {
          await this.login({
            username: data.username,
            password: data.password
          })
        }

        return res
      } catch (error) {
        console.error('注册失败:', error)
        throw error
      }
    },

    /**
     * 获取用户信息
     */
    async fetchUserInfo() {
      try {
        const res = await getProfile()

        if (res.code === 200 && res.data) {
          this.userInfo = res.data
          setUserInfo(res.data)
        }

        return res
      } catch (error) {
        console.error('获取用户信息失败:', error)
        throw error
      }
    },

    /**
     * 更新用户信息
     * @param {Object} data - 用户信息
     */
    updateUserInfo(data) {
      this.userInfo = { ...this.userInfo, ...data }
      setUserInfo(this.userInfo)
    },

    /**
     * 退出登录
     */
    logout() {
      // 清除 Token 和用户信息
      clearToken()
      clearUserInfo()

      // 重置状态
      this.token = null
      this.userInfo = null
      this.isLoggedIn = false

      // 跳转到登录页
      uni.reLaunch({
        url: '/pages/user/login'
      })
    }
  }
})
