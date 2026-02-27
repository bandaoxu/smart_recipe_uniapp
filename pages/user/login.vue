<template>
  <view class="login-container">
    <!-- Logo 区域 -->
    <view class="logo-section">
      <image class="logo" src="/static/images/logo.svg" mode="aspectFit"></image>
      <text class="app-name">智能食谱</text>
      <text class="app-slogan">让烹饪变得简单</text>
    </view>

    <!-- 登录表单 -->
    <view class="form-section">
      <view class="form-item">
        <text class="label">用户名</text>
        <uni-easyinput
          v-model="formData.username"
          placeholder="请输入用户名"
          :clearable="true"
          :inputBorder="false"
        />
      </view>

      <view class="form-item">
        <text class="label">密码</text>
        <uni-easyinput
          v-model="formData.password"
          type="password"
          placeholder="请输入密码"
          :clearable="true"
          :inputBorder="false"
        />
      </view>

      <!-- 错误提示 -->
      <view class="error-tip" v-if="errorMessage">
        <text class="error-text">{{ errorMessage }}</text>
      </view>

      <!-- 登录按钮 -->
      <button class="login-btn" @click="handleLogin" :loading="loading">
        {{ loading ? '登录中...' : '登录' }}
      </button>

      <!-- 注册链接 -->
      <view class="register-link">
        <text class="link-text">还没有账号？</text>
        <text class="link-btn" @click="goToRegister">立即注册</text>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * login.vue - 用户登录页面
 *
 * 功能：
 * 1. 用户名/密码登录
 * 2. 表单验证
 * 3. 调用登录 API
 * 4. 存储 Token
 * 5. 跳转到首页
 */

import { useUserStore } from '@/store'
import { validateUsername, validatePassword } from '@/utils/validate'

export default {
  name: 'Login',
  data() {
    return {
      formData: {
        username: '',
        password: ''
      },
      errorMessage: '',
      loading: false
    }
  },
  methods: {
    /**
     * 表单验证
     */
    validateForm() {
      // 验证用户名
      const usernameError = validateUsername(this.formData.username)
      if (usernameError) {
        this.errorMessage = usernameError
        return false
      }

      // 验证密码
      const passwordError = validatePassword(this.formData.password)
      if (passwordError) {
        this.errorMessage = passwordError
        return false
      }

      this.errorMessage = ''
      return true
    },

    /**
     * 处理登录
     */
    async handleLogin() {
      // 表单验证
      if (!this.validateForm()) {
        return
      }

      this.loading = true
      this.errorMessage = ''

      try {
        const userStore = useUserStore()

        // 调用登录 API
        await userStore.login({
          username: this.formData.username,
          password: this.formData.password
        })

        // 登录成功提示
        uni.showToast({
          title: '登录成功',
          icon: 'success'
        })

        // 延迟跳转到首页
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/index/index'
          })
        }, 1000)

      } catch (error) {
        console.error('登录失败:', error)
        this.errorMessage = error.message || '登录失败，请检查用户名和密码'
      } finally {
        this.loading = false
      }
    },

    /**
     * 跳转到注册页面
     */
    goToRegister() {
      uni.navigateTo({
        url: '/pages/user/register'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 100rpx 60rpx;
}

.logo-section {
  text-align: center;
  margin-bottom: 100rpx;
}

.logo {
  width: 160rpx;
  height: 160rpx;
  margin-bottom: 30rpx;
}

.app-name {
  display: block;
  font-size: 48rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 10rpx;
}

.app-slogan {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.form-section {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 60rpx 40rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
}

.form-item {
  margin-bottom: 40rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 20rpx;
  font-weight: 500;
}

.form-item ::v-deep .uni-easyinput__content {
  background-color: #f5f5f5;
  border-radius: 10rpx;
  height: 88rpx;
}

.form-item ::v-deep .uni-easyinput__content-input {
  font-size: 28rpx;
  color: #333333;
  height: 88rpx;
}

/* 移除原生 input 样式，已被 uni-easyinput 替代 */

.error-tip {
  margin-bottom: 30rpx;
  padding: 20rpx;
  background-color: #fff1f0;
  border-radius: 8rpx;
  border-left: 4rpx solid #ff4d4f;
}

.error-text {
  font-size: 24rpx;
  color: #ff4d4f;
}

.login-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10rpx;
  font-size: 32rpx;
  color: #ffffff;
  font-weight: bold;
  border: none;
  margin-top: 20rpx;
}

.login-btn::after {
  border: none;
}

.register-link {
  text-align: center;
  margin-top: 40rpx;
}

.link-text {
  font-size: 26rpx;
  color: #666666;
}

.link-btn {
  font-size: 26rpx;
  color: #667eea;
  margin-left: 10rpx;
}
</style>
