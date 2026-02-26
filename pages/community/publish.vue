<template>
  <view class="publish-container">
    <view class="form-section">
      <!-- 文本输入 -->
      <view class="form-item">
        <uni-easyinput
          type="textarea"
          class="content-textarea"
          v-model="formData.content"
          placeholder="分享你的美食心得..."
          :maxlength="1000"
          :inputBorder="false"
        />
        <view class="char-count">{{ formData.content.length }}/1000</view>
      </view>

      <!-- 图片上传 -->
      <view class="form-item">
        <text class="label">图片（最多9张）</text>
        <view class="image-grid">
          <view
            class="image-item"
            v-for="(image, index) in formData.images"
            :key="index"
          >
            <image :src="image" mode="aspectFill" class="image-preview"></image>
            <view class="image-remove" @click="removeImage(index)">
              <text class="remove-icon">✕</text>
            </view>
          </view>
          <view
            class="image-upload"
            v-if="formData.images.length < 9"
            @click="chooseImages"
          >
            <text class="upload-icon">📷</text>
            <text class="upload-text">添加图片</text>
          </view>
        </view>
      </view>

      <!-- 关联食谱 -->
      <view class="form-item">
        <text class="label">关联食谱（可选）</text>
        <view class="recipe-selector" @click="selectRecipe">
          <view v-if="selectedRecipe" class="selected-recipe">
            <image :src="selectedRecipe.cover_image" mode="aspectFill" class="recipe-cover"></image>
            <view class="recipe-info">
              <text class="recipe-name">{{ selectedRecipe.name }}</text>
              <text class="recipe-author">by {{ selectedRecipe.author?.nickname }}</text>
            </view>
            <text class="remove-recipe" @click.stop="removeRecipe">✕</text>
          </view>
          <view v-else class="recipe-placeholder">
            <text class="placeholder-icon">🍳</text>
            <text class="placeholder-text">选择关联的食谱</text>
          </view>
        </view>
      </view>

      <!-- 提交按钮 -->
      <button class="submit-btn" @click="handleSubmit" :loading="loading">
        {{ loading ? '发布中...' : '发布动态' }}
      </button>
    </view>
  </view>
</template>

<script>
/**
 * publish.vue - 发布动态页面
 *
 * 功能：
 * 1. 文本输入
 * 2. 上传图片（最多9张）
 * 3. 关联食谱（可选）
 * 4. 提交发布
 */

import { createPost } from '@/api/community'
import { getMyRecipes } from '@/api/recipe'
import { getToken } from '@/utils/auth'

export default {
  name: 'PublishPost',
  data() {
    return {
      formData: {
        content: '',
        images: [],
        recipe_id: null
      },
      selectedRecipe: null,
      loading: false
    }
  },
  methods: {
    /**
     * 选择图片
     */
    chooseImages() {
      const remainCount = 9 - this.formData.images.length

      uni.chooseImage({
        count: remainCount,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePaths = res.tempFilePaths

          // 逐个上传图片
          tempFilePaths.forEach(filePath => {
            this.uploadImage(filePath)
          })
        }
      })
    },

    /**
     * 上传图片
     */
    uploadImage(filePath) {
      uni.showLoading({ title: '上传中...' })

      uni.uploadFile({
        url: 'http://127.0.0.1:8000/api/upload/',
        filePath: filePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${getToken()}`
        },
        success: (uploadRes) => {
          const data = JSON.parse(uploadRes.data)
          if (data.code === 200) {
            this.formData.images.push(data.data.url)
          } else {
            uni.showToast({
              title: '上传失败',
              icon: 'none'
            })
          }
        },
        fail: () => {
          uni.showToast({
            title: '上传失败',
            icon: 'none'
          })
        },
        complete: () => {
          uni.hideLoading()
        }
      })
    },

    /**
     * 删除图片
     */
    removeImage(index) {
      this.formData.images.splice(index, 1)
    },

    /**
     * 选择食谱
     */
    async selectRecipe() {
      try {
        // 获取我的食谱列表
        const res = await getMyRecipes()
        const recipes = res.data.results || []

        if (recipes.length === 0) {
          uni.showToast({
            title: '还没有创建食谱',
            icon: 'none'
          })
          return
        }

        // 显示选择器
        const recipeNames = recipes.map(r => r.name)
        uni.showActionSheet({
          itemList: recipeNames,
          success: (selectRes) => {
            const selectedIndex = selectRes.tapIndex
            this.selectedRecipe = recipes[selectedIndex]
            this.formData.recipe_id = this.selectedRecipe.id
          }
        })

      } catch (error) {
        console.error('获取食谱列表失败:', error)
        uni.showToast({
          title: '获取食谱列表失败',
          icon: 'none'
        })
      }
    },

    /**
     * 移除关联食谱
     */
    removeRecipe() {
      this.selectedRecipe = null
      this.formData.recipe_id = null
    },

    /**
     * 表单验证
     */
    validateForm() {
      if (!this.formData.content.trim()) {
        uni.showToast({
          title: '请输入动态内容',
          icon: 'none'
        })
        return false
      }

      if (this.formData.content.length < 5) {
        uni.showToast({
          title: '内容至少5个字符',
          icon: 'none'
        })
        return false
      }

      return true
    },

    /**
     * 提交发布
     */
    async handleSubmit() {
      if (!this.validateForm()) {
        return
      }

      this.loading = true

      try {
        await createPost(this.formData)

        uni.showToast({
          title: '发布成功',
          icon: 'success'
        })

        setTimeout(() => {
          uni.navigateBack()
        }, 1500)

      } catch (error) {
        console.error('发布失败:', error)
        uni.showToast({
          title: error.message || '发布失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.publish-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.form-section {
  padding: 20rpx;
}

.form-item {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 20rpx;
  font-weight: 500;
}

.content-textarea ::v-deep .uni-easyinput__content {
  background-color: transparent;
  border-radius: 0;
}

.content-textarea ::v-deep .uni-easyinput__content-textarea {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.6;
  min-height: 300rpx;
}

/* 移除原生 textarea 样式，已被 uni-easyinput 替代 */

.char-count {
  text-align: right;
  font-size: 24rpx;
  color: #999999;
  margin-top: 20rpx;
}

.image-grid {
  display: flex;
  flex-wrap: wrap;
  margin: -10rpx;
}

.image-item,
.image-upload {
  width: 200rpx;
  height: 200rpx;
  margin: 10rpx;
  border-radius: 12rpx;
  overflow: hidden;
  position: relative;
}

.image-preview {
  width: 100%;
  height: 100%;
}

.image-remove {
  position: absolute;
  top: 10rpx;
  right: 10rpx;
  width: 48rpx;
  height: 48rpx;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-icon {
  font-size: 24rpx;
  color: #ffffff;
}

.image-upload {
  background-color: #f5f5f5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  font-size: 60rpx;
  margin-bottom: 10rpx;
}

.upload-text {
  font-size: 24rpx;
  color: #999999;
}

.recipe-selector {
  min-height: 120rpx;
}

.selected-recipe {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
}

.recipe-cover {
  width: 100rpx;
  height: 100rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
}

.recipe-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.recipe-name {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
  margin-bottom: 10rpx;
}

.recipe-author {
  font-size: 24rpx;
  color: #999999;
}

.remove-recipe {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #ff4d4f;
}

.recipe-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40rpx 0;
  background-color: #f5f5f5;
  border-radius: 12rpx;
}

.placeholder-icon {
  font-size: 60rpx;
  margin-bottom: 10rpx;
}

.placeholder-text {
  font-size: 26rpx;
  color: #999999;
}

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10rpx;
  font-size: 32rpx;
  color: #ffffff;
  font-weight: bold;
  border: none;
  margin-top: 40rpx;
}

.submit-btn::after {
  border: none;
}
</style>
