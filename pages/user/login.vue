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
      <!-- Tab 切换 -->
      <view class="login-tabs">
        <view
          class="tab-item"
          :class="{ active: loginTab === 'password' }"
          @click="loginTab = 'password'"
        >账号登录</view>
        <view
          class="tab-item"
          :class="{ active: loginTab === 'phone' }"
          @click="loginTab = 'phone'"
        >手机验证码</view>
      </view>

      <!-- 账号密码登录 -->
      <view v-if="loginTab === 'password'">
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
      </view>

      <!-- 手机验证码登录 -->
      <view v-if="loginTab === 'phone'">
        <view class="form-item">
          <text class="label">手机号</text>
          <uni-easyinput
            v-model="phoneData.phone"
            placeholder="请输入手机号"
            :clearable="true"
            :inputBorder="false"
            type="number"
            maxlength="11"
          />
        </view>
        <view class="form-item">
          <text class="label">验证码</text>
          <view class="code-row">
            <uni-easyinput
              class="code-input"
              v-model="phoneData.code"
              placeholder="请输入验证码"
              :inputBorder="false"
              type="number"
              maxlength="6"
            />
            <view
              class="send-code-btn"
              :class="{ disabled: codeCounting }"
              @click="sendVerifyCode"
            >
              <text>{{ codeCounting ? countdown + 's后重发' : '发送验证码' }}</text>
            </view>
          </view>
        </view>
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
import { useUserStore } from '@/store'
import { sendCode, loginWithPhone } from '@/api/user'
import { validateUsername, validatePassword } from '@/utils/validate'
import { setToken } from '@/utils/auth'

export default {
  name: 'Login',
  data() {
    return {
      loginTab: 'password',
      formData: { username: '', password: '' },
      phoneData: { phone: '', code: '' },
      errorMessage: '',
      loading: false,
      codeCounting: false,
      countdown: 60,
      countdownTimer: null
    }
  },
  onUnload() {
    clearInterval(this.countdownTimer)
  },
  methods: {
    async sendVerifyCode() {
      if (this.codeCounting) return
      const phone = this.phoneData.phone.trim()
      if (!phone || phone.length !== 11) {
        this.errorMessage = '请输入正确的手机号'
        return
      }
      this.errorMessage = ''
      try {
        const res = await sendCode(phone)
        // 开发模式：弹窗显示验证码
        if (res.data?.code) {
          uni.showModal({ title: '验证码（开发模式）', content: res.data.code, showCancel: false })
        } else {
          uni.showToast({ title: '验证码已发送', icon: 'none' })
        }
        this.startCountdown()
      } catch (error) {
        this.errorMessage = error.message || '发送失败'
      }
    },

    startCountdown() {
      this.codeCounting = true
      this.countdown = 60
      this.countdownTimer = setInterval(() => {
        this.countdown--
        if (this.countdown <= 0) {
          clearInterval(this.countdownTimer)
          this.codeCounting = false
        }
      }, 1000)
    },

    async handleLogin() {
      this.errorMessage = ''
      this.loading = true
      try {
        if (this.loginTab === 'phone') {
          // 手机验证码登录
          const { phone, code } = this.phoneData
          if (!phone || !code) {
            this.errorMessage = '请填写手机号和验证码'
            return
          }
          const res = await loginWithPhone(phone, code)
          const userStore = useUserStore()
          // 与 store.login 逻辑一致：存 token + 获取 profile
          setToken({ access: res.data.access, refresh: res.data.refresh })
          userStore.token = res.data.access
          userStore.isLoggedIn = true
          await userStore.fetchUserInfo()
        } else {
          // 账号密码登录
          const usernameError = validateUsername(this.formData.username)
          if (usernameError) { this.errorMessage = usernameError; return }
          const passwordError = validatePassword(this.formData.password)
          if (passwordError) { this.errorMessage = passwordError; return }
          const userStore = useUserStore()
          await userStore.login({ username: this.formData.username, password: this.formData.password })
        }
        uni.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => {
          uni.switchTab({ url: '/pages/index/index' })
        }, 1000)
      } catch (error) {
        console.error('登录失败:', error)
        this.errorMessage = error.message || '登录失败，请检查信息后重试'
      } finally {
        this.loading = false
      }
    },

    goToRegister() {
      uni.navigateTo({ url: '/pages/user/register' })
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
  margin-bottom: 80rpx;
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
  padding: 40rpx 40rpx 60rpx;
  box-shadow: 0 10rpx 40rpx rgba(0, 0, 0, 0.1);
}

/* Tab */
.login-tabs {
  display: flex;
  margin-bottom: 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 24rpx 0;
  font-size: 28rpx;
  color: #999999;
  position: relative;

  &.active {
    color: #667eea;
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      bottom: -1rpx;
      left: 25%;
      width: 50%;
      height: 4rpx;
      background-color: #667eea;
      border-radius: 2rpx;
    }
  }
}

.form-item {
  margin-bottom: 36rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 16rpx;
  font-weight: 500;
}

.form-item ::v-deep .uni-easyinput__content {
  background-color: #f5f5f5;
  border-radius: 10rpx;
  height: 88rpx;
}

.code-row {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.code-input {
  flex: 1;
}

.send-code-btn {
  flex-shrink: 0;
  padding: 0 28rpx;
  height: 80rpx;
  background-color: #667eea;
  border-radius: 10rpx;
  display: flex;
  align-items: center;
  white-space: nowrap;

  text {
    font-size: 24rpx;
    color: #ffffff;
  }

  &.disabled {
    background-color: #cccccc;
  }
}

.error-tip {
  margin-bottom: 24rpx;
  padding: 16rpx 20rpx;
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
}

.login-btn::after { border: none; }

.register-link {
  text-align: center;
  margin-top: 36rpx;
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
