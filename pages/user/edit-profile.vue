<template>
  <view class="edit-profile-container">
    <!-- 头像区域 -->
    <view class="avatar-section" @click="chooseAvatar">
      <image
        class="profile-avatar"
        :src="form.avatar || '/static/images/default-avatar.svg'"
        mode="aspectFill"
      />
      <view class="avatar-tip">
        <text>点击修改头像</text>
      </view>
    </view>

    <!-- 基本信息 -->
    <view class="section-title-bar">
      <text class="section-label">基本信息</text>
    </view>
    <view class="form-section">
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
    </view>

    <!-- 健康档案 -->
    <view class="section-title-bar">
      <text class="section-label">健康档案</text>
    </view>
    <view class="form-section">
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

      <!-- 每日卡路里目标 -->
      <view class="form-item">
        <text class="form-label">每日热量目标</text>
        <view class="input-unit-row">
          <input
            class="form-input"
            v-model="form.daily_calories_target"
            type="number"
            placeholder="如 2000"
          />
          <text class="unit-text">kcal</text>
        </view>
      </view>

      <!-- 饮食偏好 -->
      <view class="form-item-block">
        <text class="form-label">饮食偏好</text>
        <view class="checkbox-group">
          <label
            class="checkbox-item"
            v-for="option in dietaryOptions"
            :key="option.value"
            @click="toggleDietary(option.value)"
          >
            <view
              class="checkbox-box"
              :class="{ checked: form.dietary_preference.includes(option.value) }"
            >
              <text v-if="form.dietary_preference.includes(option.value)" class="check-mark">✓</text>
            </view>
            <text class="checkbox-label">{{ option.label }}</text>
          </label>
        </view>
      </view>

      <!-- 过敏食材 -->
      <view class="form-item-block">
        <text class="form-label">过敏食材</text>
        <input
          class="form-input-block"
          v-model="form.allergiesText"
          placeholder="多个食材用逗号分隔，如：花生,海鲜"
        />
      </view>
    </view>

    <!-- 保存按钮 -->
    <view class="save-section">
      <button class="save-btn" @click="handleSave" :loading="saving">保存</button>
    </view>
  </view>
</template>

<script>
import { useUserStore } from '@/store'
import { getProfile, patchProfile, updateHealthProfile } from '@/api/user'
import { getToken } from '@/utils/auth'

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
        avatar: '',
        dietary_preference: [],
        allergiesText: '',
        daily_calories_target: ''
      },
      genderOptions: [
        { value: 'male', label: '男' },
        { value: 'female', label: '女' },
        { value: 'other', label: '其他' }
      ],
      healthGoalOptions: ['减脂', '增肌', '均衡饮食', '控糖', '心脏健康'],
      healthGoalValues: ['lose_fat', 'gain_muscle', 'balanced', 'low_sugar', 'heart_healthy'],
      healthGoalLabels: {
        lose_fat: '减脂',
        gain_muscle: '增肌',
        balanced: '均衡饮食',
        low_sugar: '控糖',
        heart_healthy: '心脏健康',
        // 兼容旧值
        lose_weight: '减肥',
        maintain: '保持健康',
        improve_nutrition: '改善营养'
      },
      dietaryOptions: [
        { value: 'no_restriction', label: '无限制' },
        { value: 'vegetarian', label: '素食' },
        { value: 'vegan', label: '纯素' },
        { value: 'gluten_free', label: '无麸质' },
        { value: 'low_fat', label: '低脂' },
        { value: 'low_sugar', label: '低糖' }
      ]
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
      this.form.dietary_preference = Array.isArray(userInfo.dietary_preference)
        ? userInfo.dietary_preference
        : []
      this.form.allergiesText = Array.isArray(userInfo.allergies)
        ? userInfo.allergies.join(',')
        : (userInfo.allergies || '')
      this.form.daily_calories_target = userInfo.daily_calories_target
        ? String(userInfo.daily_calories_target)
        : ''
    }
  },
  methods: {
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

    onHealthGoalChange(e) {
      this.form.health_goal = this.healthGoalValues[e.detail.value]
    },

    toggleDietary(value) {
      const idx = this.form.dietary_preference.indexOf(value)
      if (idx >= 0) {
        this.form.dietary_preference.splice(idx, 1)
      } else {
        this.form.dietary_preference.push(value)
      }
    },

    async handleSave() {
      if (!this.form.nickname.trim()) {
        uni.showToast({ title: '昵称不能为空', icon: 'none' })
        return
      }

      this.saving = true

      try {
        // 基本信息更新
        const basicPayload = {
          nickname: this.form.nickname.trim()
        }
        if (this.form.gender) basicPayload.gender = this.form.gender
        if (this.form.age) basicPayload.age = parseInt(this.form.age)
        if (this.form.avatar) basicPayload.avatar = this.form.avatar

        // 健康档案更新
        const allergiesArr = this.form.allergiesText
          ? this.form.allergiesText.split(',').map(s => s.trim()).filter(Boolean)
          : []

        const healthPayload = {
          dietary_preference: this.form.dietary_preference,
          allergies: allergiesArr
        }
        if (this.form.health_goal) healthPayload.health_goal = this.form.health_goal
        if (this.form.daily_calories_target) {
          healthPayload.daily_calories_target = parseInt(this.form.daily_calories_target)
        }

        await Promise.all([
          patchProfile(basicPayload),
          updateHealthProfile(healthPayload)
        ])

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
  padding-bottom: 40rpx;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60rpx 0 40rpx;
  background-color: #ffffff;
}

.profile-avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 50%;
  border: 4rpx solid #f0f0f0;
  margin-bottom: 20rpx;
}

.avatar-tip {
  font-size: 24rpx;
  color: #667eea;
}

.section-title-bar {
  padding: 24rpx 40rpx 10rpx;
}

.section-label {
  font-size: 24rpx;
  color: #999999;
  font-weight: 500;
}

.form-section {
  background-color: #ffffff;
  margin-bottom: 20rpx;
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

.form-item-block {
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.form-item-block:last-child {
  border-bottom: none;
}

.form-label {
  width: 160rpx;
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

.input-unit-row {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10rpx;
}

.unit-text {
  font-size: 24rpx;
  color: #999999;
}

.form-input-block {
  display: block;
  width: 100%;
  font-size: 28rpx;
  color: #333333;
  margin-top: 16rpx;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #f0f0f0;
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

/* 饮食偏好复选框 */
.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 20rpx;
  margin-top: 20rpx;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.checkbox-box {
  width: 40rpx;
  height: 40rpx;
  border: 2rpx solid #cccccc;
  border-radius: 6rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &.checked {
    background-color: #667eea;
    border-color: #667eea;
  }
}

.check-mark {
  font-size: 26rpx;
  color: #ffffff;
}

.checkbox-label {
  font-size: 26rpx;
  color: #333333;
}

.save-section {
  padding: 40rpx 40rpx;
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
</style>
