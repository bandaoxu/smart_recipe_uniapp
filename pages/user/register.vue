<template>
  <view class="register-container">
    <!-- Logo 区域 -->
    <view class="logo-section">
      <image class="logo" src="/static/images/logo.svg" mode="aspectFit"></image>
      <text class="app-name">注册账号</text>
    </view>

    <!-- 注册表单 -->
    <view class="form-section">
      <view class="form-item">
        <text class="label">用户名</text>
        <uni-easyinput
          v-model="formData.username"
          placeholder="3-20个字符，字母数字下划线"
          :clearable="true"
          :inputBorder="false"
        />
      </view>

      <view class="form-item">
        <text class="label">昵称</text>
        <uni-easyinput
          v-model="formData.nickname"
          placeholder="请输入昵称"
          :clearable="true"
          :inputBorder="false"
        />
      </view>

      <view class="form-item">
        <text class="label">邮箱</text>
        <uni-easyinput
          v-model="formData.email"
          type="email"
          placeholder="请输入邮箱"
          :clearable="true"
          :inputBorder="false"
        />
      </view>

      <view class="form-item">
        <text class="label">手机号</text>
        <uni-easyinput
          v-model="formData.phone"
          type="number"
          placeholder="请输入手机号"
          :clearable="true"
          :inputBorder="false"
        />
      </view>

      <view class="form-item">
        <text class="label">密码</text>
        <uni-easyinput
          v-model="formData.password"
          type="password"
          placeholder="6-20个字符"
          :clearable="true"
          :inputBorder="false"
        />
      </view>

      <view class="form-item">
        <text class="label">确认密码</text>
        <uni-easyinput
          v-model="formData.confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          :clearable="true"
          :inputBorder="false"
        />
      </view>

      <!-- 错误提示 -->
      <view class="error-tip" v-if="errorMessage">
        <text class="error-text">{{ errorMessage }}</text>
      </view>

      <!-- 注册按钮 -->
      <button class="register-btn" @click="handleRegister" :loading="loading">
        {{ loading ? '注册中...' : '注册' }}
      </button>

      <!-- 登录链接 -->
      <view class="login-link">
        <text class="link-text">已有账号？</text>
        <text class="link-btn" @click="goToLogin">立即登录</text>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * register.vue - 用户注册页面
 *
 * 功能：
 * 1. 用户注册表单
 * 2. 表单验证
 * 3. 调用注册 API
 * 4. 注册成功自动登录
 */

import { useUserStore } from '@/store'
import { validateUsername, validatePassword, validatePasswordConfirm, validateEmail, validatePhone } from '@/utils/validate'

export default {
  name: 'Register',
  data() {
    return {
      formData: {
        username: '',
        nickname: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
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
      const { username, nickname, email, phone, password, confirmPassword } = this.formData

      // 验证用户名
      const usernameError = validateUsername(username)
      if (usernameError) {
        this.errorMessage = usernameError
        return false
      }

      // 验证昵称
      if (!nickname || nickname.trim() === '') {
        this.errorMessage = '昵称不能为空'
        return false
      }

      // 验证邮箱
      const emailError = validateEmail(email)
      if (emailError) {
        this.errorMessage = emailError
        return false
      }

      // 验证手机号
      const phoneError = validatePhone(phone)
      if (phoneError) {
        this.errorMessage = phoneError
        return false
      }

      // 验证密码
      const passwordError = validatePassword(password)
      if (passwordError) {
        this.errorMessage = passwordError
        return false
      }

      // 验证确认密码
      const confirmError = validatePasswordConfirm(password, confirmPassword)
      if (confirmError) {
        this.errorMessage = confirmError
        return false
      }

      this.errorMessage = ''
      return true
    },

    /**
     * 处理注册
     */
    async handleRegister() {
      // 表单验证
      if (!this.validateForm()) {
        return
      }

      this.loading = true
      this.errorMessage = ''

      try {
        const userStore = useUserStore()

        // 调用注册 API
        await userStore.register({
          username: this.formData.username,
          password: this.formData.password,
          password_confirm: this.formData.confirmPassword,
          email: this.formData.email,
          phone: this.formData.phone,
          nickname: this.formData.nickname
        })

        // 注册成功提示
        uni.showToast({
          title: '注册成功',
          icon: 'success'
        })

        // 延迟跳转到首页
        setTimeout(() => {
          uni.switchTab({
            url: '/pages/index/index'
          })
        }, 1000)

      } catch (error) {
        console.error('注册失败:', error)
        this.errorMessage = error.message || '注册失败，请稍后重试'
      } finally {
        this.loading = false
      }
    },

    /**
     * 跳转到登录页面
     */
    goToLogin() {
      uni.navigateBack()
    }
  }
}
</script>

<style lang="scss" scoped>
.register-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 60rpx;
}

.logo-section {
  text-align: center;
  margin-bottom: 60rpx;
}

.logo {
  width: 120rpx;
  height: 120rpx;
  margin-bottom: 20rpx;
}

.app-name {
  display: block;
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
}

.form-section {
  background-color: #ffffff;
  border-radius: 20rpx;
  padding: 50rpx 40rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
}

.form-item {
  margin-bottom: 30rpx;
}

.form-item ::v-deep .uni-easyinput__content {
  background-color: #f5f5f5;
  border-radius: 10rpx;
  height: 80rpx;
}

.form-item ::v-deep .uni-easyinput__content-input {
  font-size: 28rpx;
  color: #333333;
  height: 80rpx;
}

.label {
  display: block;
  font-size: 26rpx;
  color: #333333;
  margin-bottom: 15rpx;
  font-weight: 500;
}

/* 移除原生 input 样式，已被 uni-easyinput 替代 */

.error-tip {
  margin-bottom: 20rpx;
  padding: 15rpx;
  background-color: #fff1f0;
  border-radius: 8rpx;
  border-left: 4rpx solid #ff4d4f;
}

.error-text {
  font-size: 24rpx;
  color: #ff4d4f;
}

.register-btn {
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

.register-btn::after {
  border: none;
}

.login-link {
  text-align: center;
  margin-top: 30rpx;
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
