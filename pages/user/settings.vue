<template>
  <view class="settings-container">
    <!-- 账号与安全 -->
    <view class="section-title">账号与安全</view>
    <view class="menu-section">
      <view class="menu-item" @click="showPasswordModal = true">
        <text class="menu-text">修改密码</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 关于 -->
    <view class="section-title">关于</view>
    <view class="menu-section">
      <view class="menu-item">
        <text class="menu-text">版本信息</text>
        <text class="menu-version">v1.0.0</text>
      </view>
      <view class="menu-item" @click="onFeedback">
        <text class="menu-text">意见反馈</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 修改密码弹窗 -->
    <view class="modal-overlay" v-if="showPasswordModal" @click="closePasswordModal">
      <view class="modal-card" @click.stop>
        <text class="modal-title">修改密码</text>

        <view class="modal-field">
          <text class="field-label">旧密码</text>
          <input
            class="field-input"
            v-model="passwordForm.old_password"
            password
            placeholder="请输入旧密码"
          />
        </view>
        <view class="modal-field">
          <text class="field-label">新密码</text>
          <input
            class="field-input"
            v-model="passwordForm.new_password"
            password
            placeholder="请输入新密码（至少6位）"
          />
        </view>
        <view class="modal-field">
          <text class="field-label">确认新密码</text>
          <input
            class="field-input"
            v-model="passwordForm.confirm_password"
            password
            placeholder="请再次输入新密码"
          />
        </view>

        <view class="modal-actions">
          <button class="modal-cancel" @click="closePasswordModal">取消</button>
          <button class="modal-confirm" @click="handleChangePassword" :loading="changingPwd">确认</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * settings.vue - 设置页面
 *
 * 功能：
 * 1. 修改密码
 * 2. 关于信息
 */

import { changePassword } from '@/api/user'

export default {
  name: 'Settings',
  data() {
    return {
      showPasswordModal: false,
      changingPwd: false,
      passwordForm: {
        old_password: '',
        new_password: '',
        confirm_password: ''
      }
    }
  },
  methods: {
    /**
     * 关闭修改密码弹窗
     */
    closePasswordModal() {
      this.showPasswordModal = false
      this.passwordForm = { old_password: '', new_password: '', confirm_password: '' }
    },

    /**
     * 提交修改密码
     */
    async handleChangePassword() {
      const { old_password, new_password, confirm_password } = this.passwordForm

      if (!old_password) {
        uni.showToast({ title: '请输入旧密码', icon: 'none' })
        return
      }
      if (!new_password || new_password.length < 6) {
        uni.showToast({ title: '新密码至少6位', icon: 'none' })
        return
      }
      if (new_password !== confirm_password) {
        uni.showToast({ title: '两次密码不一致', icon: 'none' })
        return
      }

      this.changingPwd = true

      try {
        await changePassword({ old_password, new_password, new_password_confirm: confirm_password })
        uni.showToast({ title: '修改成功', icon: 'success' })
        this.closePasswordModal()
      } catch (error) {
        console.error('修改密码失败:', error)
      } finally {
        this.changingPwd = false
      }
    },

    /**
     * 意见反馈（占位）
     */
    onFeedback() {
      uni.showToast({ title: '功能开发中', icon: 'none' })
    }
  }
}
</script>

<style lang="scss" scoped>
.settings-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.section-title {
  font-size: 24rpx;
  color: #999999;
  padding: 30rpx 40rpx 16rpx;
}

.menu-section {
  background-color: #ffffff;
  margin-bottom: 20rpx;
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

.menu-text {
  font-size: 28rpx;
  color: #333333;
}

.menu-arrow {
  font-size: 40rpx;
  color: #cccccc;
}

.menu-version {
  font-size: 26rpx;
  color: #999999;
}

/* 修改密码弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-card {
  width: 660rpx;
  background-color: #ffffff;
  border-radius: 24rpx;
  padding: 48rpx 40rpx 40rpx;
}

.modal-title {
  display: block;
  font-size: 34rpx;
  font-weight: bold;
  color: #333333;
  text-align: center;
  margin-bottom: 40rpx;
}

.modal-field {
  margin-bottom: 30rpx;
}

.field-label {
  display: block;
  font-size: 26rpx;
  color: #666666;
  margin-bottom: 12rpx;
}

.field-input {
  width: 100%;
  height: 80rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  color: #333333;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 40rpx;
}

.modal-cancel,
.modal-confirm {
  flex: 1;
  height: 80rpx;
  border-radius: 40rpx;
  font-size: 28rpx;
  border: none;
}

.modal-cancel {
  background-color: #f5f5f5;
  color: #666666;
}

.modal-cancel::after,
.modal-confirm::after {
  border: none;
}

.modal-confirm {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}
</style>
