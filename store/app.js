/**
 * app.js - 应用全局状态管理
 *
 * 功能：
 * 1. 管理应用全局状态
 * 2. 管理加载状态
 * 3. 管理网络状态
 */

import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    // 是否正在加载
    loading: false,
    // 网络状态
    networkStatus: 'online',
    // 系统信息
    systemInfo: null,
    // 搜索历史
    searchHistory: uni.getStorageSync('search_history') || []
  }),

  getters: {
    /**
     * 是否在线
     */
    isOnline: (state) => state.networkStatus === 'online',

    /**
     * 获取状态栏高度
     */
    statusBarHeight: (state) => state.systemInfo?.statusBarHeight || 0
  },

  actions: {
    /**
     * 设置加载状态
     * @param {Boolean} loading - 是否加载中
     */
    setLoading(loading) {
      this.loading = loading
      if (loading) {
        uni.showLoading({
          title: '加载中...',
          mask: true
        })
      } else {
        uni.hideLoading()
      }
    },

    /**
     * 设置网络状态
     * @param {String} status - 网络状态
     */
    setNetworkStatus(status) {
      this.networkStatus = status
    },

    /**
     * 获取系统信息
     */
    getSystemInfo() {
      if (!this.systemInfo) {
        this.systemInfo = uni.getSystemInfoSync()
      }
      return this.systemInfo
    },

    /**
     * 添加搜索历史
     * @param {String} keyword - 搜索关键词
     */
    addSearchHistory(keyword) {
      if (!keyword || !keyword.trim()) return

      // 去重
      const index = this.searchHistory.indexOf(keyword)
      if (index > -1) {
        this.searchHistory.splice(index, 1)
      }

      // 添加到开头
      this.searchHistory.unshift(keyword)

      // 最多保存 10 条
      if (this.searchHistory.length > 10) {
        this.searchHistory = this.searchHistory.slice(0, 10)
      }

      // 保存到本地存储
      uni.setStorageSync('search_history', this.searchHistory)
    },

    /**
     * 清空搜索历史
     */
    clearSearchHistory() {
      this.searchHistory = []
      uni.removeStorageSync('search_history')
    },

    /**
     * 删除单条搜索历史
     * @param {Number} index - 索引
     */
    removeSearchHistory(index) {
      this.searchHistory.splice(index, 1)
      uni.setStorageSync('search_history', this.searchHistory)
    }
  }
})
