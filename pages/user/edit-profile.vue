<template>
  <view class="edit-profile-container">
    <!-- 表单区域 -->
    <view class="form-section">
      <!-- 头像 -->
      <view class="form-item avatar-row" @click="chooseAvatar">
        <text class="form-label">头像</text>
        <view class="avatar-right">
          <image
            class="avatar-preview"
            :src="form.avatar || '/static/images/default-avatar.svg'"
            mode="aspectFill"
          />
          <text class="avatar-arrow">›</text>
        </view>
      </view>

      <!-- 昵称 -->
      <view class="form-item">
        <text class="form-label">昵称</text>
        <input
          class="form-input"
          v-model="form.nickname"
          placeholder="请输入昵称"
          maxlength="20"
        />
      </view>

      <!-- 性别 -->
      <view class="form-item">
        <text class="form-label">性别</text>
        <view class="radio-group">
          <label class="radio-item" v-for="option in genderOptions" :key="option.value">
            <radio :value="option.value" :checked="form.gender === option.value" @click="form.gender = option.value" />
            <text class="radio-label">{{ option.label }}</text>
          </label>
        </view>
      </view>

      <!-- 年龄 -->
      <view class="form-item">
        <text class="form-label">年龄</text>
        <input
          class="form-input"
          v-model="form.age"
          type="number"
          placeholder="请输入年龄"
        />
      </view>

      <!-- 健康目标 -->
      <view class="form-item">
        <text class="form-label">健康目标</text>
        <picker
          :value="healthGoalIndex"
          :range="healthGoalOptions"
          @change="onHealthGoalChange"
        >
          <view class="picker-value">
            <text>{{ form.health_goal ? healthGoalLabels[form.health_goal] : '请选择' }}</text>
            <text class="picker-arrow">›</text>
          </view>
        </picker>
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="save-section">
      <button class="save-btn" @click="handleSave" :loading="saving">保存</button>
    </view>
  </view>
</template>

<script>
/**
 * edit-profile.vue - 编辑资料页面
 *
 * 功能：
 * 1. 展示并修改用户昵称、性别、年龄、健康目标
 * 2. 调用 PATCH /api/user/profile/ 部分更新
 */

import { useUserStore } from '@/store'
import { getProfile, patchProfile } from '@/api/user'
import { getToken } from '@/api/request'

export default {
  name: 'EditProfile',
  data() {
    return {
      saving: false,
      form: {
        nickname: '',
        gender: '',
        age: '',
        health_goal: '',
        avatar: ''
      },
      genderOptions: [
        { value: 'male', label: '男' },
        { value: 'female', label: '女' },
        { value: 'secret', label: '保密' }
      ],
      healthGoalOptions: ['减重', '增肌', '均衡饮食', '健康生活'],
      healthGoalValues: ['lose_weight', 'gain_muscle', 'balanced_diet', 'healthy_life'],
      healthGoalLabels: {
        lose_weight: '减重',
        gain_muscle: '增肌',
        balanced_diet: '均衡饮食',
        healthy_life: '健康生活'
      }
    }
  },
  computed: {
    healthGoalIndex() {
      return this.healthGoalValues.indexOf(this.form.health_goal)
    }
  },
  async onLoad() {
    const userStore = useUserStore()
    let userInfo = userStore.userInfo

    if (!userInfo || !userInfo.nickname) {
      try {
        const res = await getProfile()
        userInfo = res.data
      } catch (e) {
        console.error('获取用户信息失败:', e)
      }
    }

    if (userInfo) {
      this.form.nickname = userInfo.nickname || ''
      this.form.gender = userInfo.gender || ''
      this.form.age = userInfo.age ? String(userInfo.age) : ''
      this.form.health_goal = userInfo.health_goal || ''
      this.form.avatar = userInfo.avatar || ''
    }
  },
  methods: {
    /**
     * 选择头像
     */
    chooseAvatar() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          this.uploadAvatar(res.tempFilePaths[0])
        }
      })
    },

    /**
     * 上传头像到服务器
     */
    uploadAvatar(filePath) {
      uni.showLoading({ title: '上传中...' })
      uni.uploadFile({
        url: 'http://127.0.0.1:8000/api/upload/',
        filePath,
        name: 'file',
        header: { 'Authorization': `Bearer ${getToken()}` },
        success: (uploadRes) => {
          const data = JSON.parse(uploadRes.data)
          if (data.code === 200) {
            this.form.avatar = data.data.url
            uni.showToast({ title: '头像已更新', icon: 'success' })
          } else {
            uni.showToast({ title: '上传失败', icon: 'none' })
          }
        },
        fail: () => {
          uni.showToast({ title: '上传失败', icon: 'none' })
        },
        complete: () => {
          uni.hideLoading()
        }
      })
    },

    /**
     * 健康目标选择
     */
    onHealthGoalChange(e) {
      this.form.health_goal = this.healthGoalValues[e.detail.value]
    },

    /**
     * 保存资料
     */
    async handleSave() {
      if (!this.form.nickname.trim()) {
        uni.showToast({ title: '昵称不能为空', icon: 'none' })
        return
      }

      this.saving = true

      try {
        const payload = {
          nickname: this.form.nickname.trim()
        }
        if (this.form.gender) payload.gender = this.form.gender
        if (this.form.age) payload.age = parseInt(this.form.age)
        if (this.form.health_goal) payload.health_goal = this.form.health_goal
        if (this.form.avatar) payload.avatar = this.form.avatar

        await patchProfile(payload)

        // 更新 store 中的用户信息
        const userStore = useUserStore()
        await userStore.fetchUserInfo()

        uni.showToast({ title: '保存成功', icon: 'success' })

        setTimeout(() => {
          uni.navigateBack()
        }, 1000)

      } catch (error) {
        console.error('保存失败:', error)
        uni.showToast({ title: '保存失败，请重试', icon: 'none' })
      } finally {
        this.saving = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.edit-profile-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.form-section {
  margin-top: 20rpx;
  background-color: #ffffff;
}

.form-item {
  display: flex;
  align-items: center;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
  min-height: 100rpx;
}

.form-item:last-child {
  border-bottom: none;
}

.form-label {
  width: 140rpx;
  font-size: 28rpx;
  color: #333333;
  flex-shrink: 0;
}

.form-input {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
  text-align: right;
}

.radio-group {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  gap: 40rpx;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.radio-label {
  font-size: 28rpx;
  color: #333333;
}

.picker-value {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.picker-value text:first-child {
  font-size: 28rpx;
  color: #333333;
}

.picker-arrow {
  font-size: 40rpx;
  color: #cccccc;
  margin-left: 10rpx;
}

.save-section {
  padding: 60rpx 40rpx 40rpx;
}

.save-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 44rpx;
  font-size: 32rpx;
  color: #ffffff;
  border: none;
}

.save-btn::after {
  border: none;
}

.avatar-row {
  cursor: pointer;
}

.avatar-right {
  display: flex;
  align-items: center;
  flex: 1;
  justify-content: flex-end;
}

.avatar-preview {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 16rpx;
}

.avatar-arrow {
  font-size: 40rpx;
  color: #cccccc;
}
</style>
