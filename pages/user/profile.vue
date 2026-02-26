<template>
  <view class="profile-container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <image class="avatar" :src="userInfo.avatar || '/static/images/default-avatar.png'" mode="aspectFill"></image>
      <view class="user-info">
        <text class="nickname">{{ userInfo.nickname || '未设置昵称' }}</text>
        <text class="username">@{{ userInfo.username }}</text>
      </view>
    </view>

    <!-- 菜单列表 -->
    <view class="menu-section">
      <view class="menu-item" @click="goToMyRecipes">
        <view class="menu-left">
          <text class="menu-icon">📖</text>
          <text class="menu-text">我的食谱</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item" @click="goToFavorites">
        <view class="menu-left">
          <text class="menu-icon">❤️</text>
          <text class="menu-text">我的收藏</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item" @click="editProfile">
        <view class="menu-left">
          <text class="menu-icon">✏️</text>
          <text class="menu-text">编辑资料</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>

      <view class="menu-item" @click="showSettings">
        <view class="menu-left">
          <text class="menu-icon">⚙️</text>
          <text class="menu-text">设置</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 退出登录按钮 -->
    <view class="logout-section">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </view>
  </view>
</template>

<script>
/**
 * profile.vue - 个人中心页面
 *
 * 功能：
 * 1. 显示用户信息
 * 2. 我的食谱、收藏入口
 * 3. 编辑资料
 * 4. 退出登录
 */

import { useUserStore } from '@/store'

export default {
  name: 'Profile',
  data() {
    return {
      userInfo: {}
    }
  },
  onShow() {
    this.loadUserInfo()
  },
  methods: {
    /**
     * 加载用户信息
     */
    async loadUserInfo() {
      const userStore = useUserStore()

      // 检查是否已登录
      if (!userStore.isLoggedIn) {
        uni.showModal({
          title: '提示',
          content: '请先登录',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: '/pages/user/login'
              })
            }
          }
        })
        return
      }

      try {
        // 获取用户信息
        await userStore.fetchUserInfo()
        this.userInfo = userStore.userInfo || {}
      } catch (error) {
        console.error('获取用户信息失败:', error)
      }
    },

    /**
     * 跳转到我的食谱
     */
    goToMyRecipes() {
      uni.navigateTo({
        url: '/pages/user/my-recipes'
      })
    },

    /**
     * 跳转到我的收藏
     */
    goToFavorites() {
      uni.navigateTo({
        url: '/pages/user/favorites'
      })
    },

    /**
     * 编辑资料
     */
    editProfile() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },

    /**
     * 设置
     */
    showSettings() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },

    /**
     * 退出登录
     */
    handleLogout() {
      uni.showModal({
        title: '提示',
        content: '确定要退出登录吗？',
        success: (res) => {
          if (res.confirm) {
            const userStore = useUserStore()
            userStore.logout()
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.profile-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.user-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx;
  display: flex;
  align-items: center;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  margin-right: 30rpx;
}

.user-info {
  flex: 1;
}

.nickname {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 10rpx;
}

.username {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
}

.menu-section {
  margin-top: 20rpx;
  background-color: #ffffff;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-left {
  display: flex;
  align-items: center;
}

.menu-icon {
  font-size: 40rpx;
  margin-right: 20rpx;
}

.menu-text {
  font-size: 28rpx;
  color: #333333;
}

.menu-arrow {
  font-size: 48rpx;
  color: #cccccc;
  font-weight: 300;
}

.logout-section {
  padding: 40rpx;
}

.logout-btn {
  width: 100%;
  height: 88rpx;
  background-color: #ffffff;
  border-radius: 10rpx;
  font-size: 28rpx;
  color: #ff4d4f;
  border: 1rpx solid #ff4d4f;
}

.logout-btn::after {
  border: none;
}
</style>
