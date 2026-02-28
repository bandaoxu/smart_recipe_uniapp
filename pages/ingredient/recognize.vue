<template>
  <view class="recognize-container">

    <!-- 未选图状态：选图入口 -->
    <view class="pick-area" v-if="!previewImage && !loading">
      <view class="pick-header">
        <text class="pick-title">拍照识别食材</text>
        <text class="pick-subtitle">拍摄或上传食材图片，AI 自动识别并推荐食谱</text>
      </view>
      <view class="pick-buttons">
        <view class="pick-btn camera-pick" @click="chooseImage('camera')">
          <text class="pick-btn-icon">📸</text>
          <text class="pick-btn-text">拍照</text>
        </view>
        <view class="pick-btn album-pick" @click="chooseImage('album')">
          <text class="pick-btn-icon">🖼️</text>
          <text class="pick-btn-text">从相册选择</text>
        </view>
      </view>
      <text class="pick-tip">支持 JPG / PNG 格式，建议图片清晰</text>
    </view>

    <!-- 上传 / 识别中 -->
    <view class="loading-area" v-if="loading">
      <view class="loading-spinner"></view>
      <text class="loading-text">{{ loadingText }}</text>
    </view>

    <!-- 有图片时：预览 + 结果 -->
    <view v-if="previewImage && !loading">
      <!-- 预览图 -->
      <view class="preview-section">
        <image class="preview-img" :src="previewImage" mode="aspectFit" />
        <view class="retake-btn" @click="retake">
          <text>重新选择</text>
        </view>
      </view>

      <!-- 识别结果 -->
      <view class="result-section" v-if="results.length > 0">
        <text class="result-title">识别结果</text>
        <view class="ingredient-list">
          <view
            class="ingredient-item"
            v-for="(item, idx) in results"
            :key="idx"
            :class="{ selected: selectedIngredients.includes(item.name) }"
            @click="toggleIngredient(item.name)"
          >
            <view class="ingredient-left">
              <view class="ingredient-check">
                <text v-if="selectedIngredients.includes(item.name)">✓</text>
              </view>
              <text class="ingredient-name">{{ item.name }}</text>
            </view>
            <view class="confidence-bar-wrap">
              <view
                class="confidence-bar"
                :style="{ width: Math.round(item.confidence * 100) + '%' }"
              ></view>
              <text class="confidence-text">{{ Math.round(item.confidence * 100) }}%</text>
            </view>
          </view>
        </view>

        <!-- 推荐按钮 -->
        <view
          class="recommend-btn"
          :class="{ disabled: selectedIngredients.length === 0 }"
          @click="findRecipes"
        >
          <text>用选中食材找食谱（{{ selectedIngredients.length }}）</text>
        </view>
      </view>

      <!-- 无结果 -->
      <view class="no-result" v-else-if="recognized">
        <text class="no-result-icon">🤔</text>
        <text class="no-result-text">未能识别出食材，请换一张更清晰的图片</text>
      </view>
    </view>

    <!-- 推荐食谱列表 -->
    <view class="recipes-section" v-if="recommendedRecipes.length > 0">
      <view class="recipes-header">
        <text class="recipes-title">🍳 推荐食谱（{{ recommendedRecipes.length }}个）</text>
      </view>
      <view class="recipes-list">
        <view
          class="recipe-card"
          v-for="recipe in recommendedRecipes"
          :key="recipe.id"
          @click="goToRecipe(recipe.id)"
        >
          <image
            class="recipe-cover"
            :src="recipe.cover_image || '/static/images/default-recipe.svg'"
            mode="aspectFill"
          />
          <view class="recipe-info">
            <text class="recipe-name">{{ recipe.name }}</text>
            <view class="recipe-meta">
              <text class="meta-tag">{{ formatDifficulty(recipe.difficulty) }}</text>
              <text class="meta-tag">{{ formatCookingTime(recipe.cooking_time) }}</text>
              <text class="meta-tag calories" v-if="recipe.total_calories">{{ recipe.total_calories }} 千卡</text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 找食谱加载中 -->
    <view class="loading-recipes" v-if="loadingRecipes">
      <text>正在搜索食谱...</text>
    </view>

  </view>
</template>

<script>
import { recognizeIngredient } from '@/api/ingredient'
import { recommendByIngredients } from '@/api/ingredient'
import { getToken } from '@/utils/auth'
import { formatDifficulty, formatCookingTime } from '@/utils/format'

const BASE_URL = 'http://127.0.0.1:8000/api'

export default {
  name: 'IngredientRecognize',
  data() {
    return {
      previewImage: '',
      loading: false,
      loadingText: '上传中...',
      results: [],
      recognized: false,
      selectedIngredients: [],
      recommendedRecipes: [],
      loadingRecipes: false
    }
  },
  methods: {
    formatDifficulty,
    formatCookingTime,

    chooseImage(sourceType) {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: [sourceType],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0]
          this.previewImage = tempFilePath
          this.results = []
          this.recognized = false
          this.selectedIngredients = []
          this.recommendedRecipes = []
          this.doRecognize(tempFilePath)
        }
      })
    },

    async doRecognize(tempFilePath) {
      this.loading = true
      this.loadingText = '上传图片中...'
      try {
        // 1. 上传图片
        const token = getToken()
        const uploadRes = await new Promise((resolve, reject) => {
          uni.uploadFile({
            url: BASE_URL + '/upload/',
            filePath: tempFilePath,
            name: 'file',
            header: token ? { Authorization: 'Bearer ' + token } : {},
            success: (res) => {
              try {
                resolve(JSON.parse(res.data))
              } catch (e) {
                reject(new Error('上传响应解析失败'))
              }
            },
            fail: (err) => reject(err)
          })
        })

        if (!uploadRes || uploadRes.code !== 200) {
          throw new Error(uploadRes?.message || '上传失败')
        }

        const imageUrl = uploadRes.data.url
        this.loadingText = '识别食材中...'

        // 2. 调用识别接口
        const res = await recognizeIngredient({ image_url: imageUrl })
        this.results = res.data?.ingredients || []
        // 默认全部选中
        this.selectedIngredients = this.results.map(i => i.name)
        this.recognized = true
      } catch (error) {
        console.error('识别失败:', error)
        uni.showToast({ title: '识别失败，请重试', icon: 'none' })
        this.recognized = true
      } finally {
        this.loading = false
      }
    },

    toggleIngredient(name) {
      const idx = this.selectedIngredients.indexOf(name)
      if (idx > -1) {
        this.selectedIngredients.splice(idx, 1)
      } else {
        this.selectedIngredients.push(name)
      }
    },

    async findRecipes() {
      if (this.selectedIngredients.length === 0) return
      this.loadingRecipes = true
      this.recommendedRecipes = []
      try {
        const res = await recommendByIngredients(this.selectedIngredients)
        this.recommendedRecipes = Array.isArray(res.data) ? res.data : (res.data?.results || [])
        if (this.recommendedRecipes.length === 0) {
          uni.showToast({ title: '暂无匹配食谱', icon: 'none' })
        }
      } catch (error) {
        console.error('推荐失败:', error)
        uni.showToast({ title: '推荐失败', icon: 'none' })
      } finally {
        this.loadingRecipes = false
      }
    },

    retake() {
      this.previewImage = ''
      this.results = []
      this.recognized = false
      this.selectedIngredients = []
      this.recommendedRecipes = []
    },

    goToRecipe(id) {
      uni.navigateTo({ url: `/pages/recipe/detail?id=${id}` })
    }
  }
}
</script>

<style lang="scss" scoped>
.recognize-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 60rpx;
}

/* 选图入口 */
.pick-area {
  background-color: #ffffff;
  padding: 60rpx 40rpx 40rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.pick-header {
  text-align: center;
  margin-bottom: 60rpx;
}

.pick-title {
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 16rpx;
}

.pick-subtitle {
  font-size: 26rpx;
  color: #999999;
  display: block;
  line-height: 1.6;
}

.pick-buttons {
  display: flex;
  gap: 40rpx;
  margin-bottom: 40rpx;
}

.pick-btn {
  width: 240rpx;
  height: 200rpx;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
}

.camera-pick {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.album-pick {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.pick-btn-icon {
  font-size: 60rpx;
}

.pick-btn-text {
  font-size: 28rpx;
  color: #ffffff;
  font-weight: 500;
}

.pick-tip {
  font-size: 22rpx;
  color: #cccccc;
}

/* 加载中 */
.loading-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 40rpx;
  background-color: #ffffff;
}

.loading-spinner {
  width: 80rpx;
  height: 80rpx;
  border: 6rpx solid #f0f0f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 30rpx;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 28rpx;
  color: #666666;
}

/* 预览图 */
.preview-section {
  background-color: #000000;
  position: relative;
}

.preview-img {
  width: 100%;
  height: 500rpx;
  display: block;
}

.retake-btn {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 12rpx 24rpx;
  border-radius: 30rpx;

  text {
    font-size: 24rpx;
    color: #ffffff;
  }
}

/* 识别结果 */
.result-section {
  background-color: #ffffff;
  margin-top: 20rpx;
  padding: 30rpx;
}

.result-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  display: block;
  margin-bottom: 20rpx;
}

.ingredient-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
  margin-bottom: 30rpx;
}

.ingredient-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  border-radius: 12rpx;
  background-color: #f9f9f9;
  border: 2rpx solid transparent;

  &.selected {
    background-color: #f0f4ff;
    border-color: #667eea;
  }
}

.ingredient-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.ingredient-check {
  width: 40rpx;
  height: 40rpx;
  border-radius: 20rpx;
  background-color: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: 22rpx;
    color: #ffffff;
    font-weight: bold;
  }
}

.ingredient-name {
  font-size: 30rpx;
  color: #333333;
  font-weight: 500;
}

.confidence-bar-wrap {
  display: flex;
  align-items: center;
  gap: 12rpx;
  width: 180rpx;
}

.confidence-bar {
  height: 10rpx;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 5rpx;
  flex-shrink: 0;
}

.confidence-text {
  font-size: 22rpx;
  color: #999999;
  white-space: nowrap;
}

.recommend-btn {
  height: 90rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: 30rpx;
    color: #ffffff;
    font-weight: 500;
  }

  &.disabled {
    background: #cccccc;
  }
}

/* 无结果 */
.no-result {
  background-color: #ffffff;
  margin-top: 20rpx;
  padding: 60rpx;
  text-align: center;
}

.no-result-icon {
  font-size: 80rpx;
  display: block;
  margin-bottom: 20rpx;
}

.no-result-text {
  font-size: 26rpx;
  color: #999999;
}

/* 推荐食谱列表 */
.recipes-section {
  margin-top: 20rpx;
  background-color: #ffffff;
  padding: 30rpx;
}

.recipes-header {
  margin-bottom: 20rpx;
}

.recipes-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
}

.recipes-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.recipe-card {
  display: flex;
  align-items: center;
  background-color: #f9f9f9;
  border-radius: 16rpx;
  overflow: hidden;
}

.recipe-cover {
  width: 180rpx;
  height: 140rpx;
  flex-shrink: 0;
}

.recipe-info {
  flex: 1;
  padding: 16rpx 20rpx;
}

.recipe-name {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
  display: block;
  margin-bottom: 12rpx;
}

.recipe-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
}

.meta-tag {
  font-size: 22rpx;
  color: #999999;
  background-color: #f0f0f0;
  padding: 4rpx 14rpx;
  border-radius: 10rpx;

  &.calories {
    color: #667eea;
    background-color: #f0f4ff;
  }
}

/* 加载食谱 */
.loading-recipes {
  text-align: center;
  padding: 40rpx;
  font-size: 26rpx;
  color: #999999;
  background-color: #ffffff;
  margin-top: 20rpx;
}
</style>
