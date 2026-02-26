<template>
  <view class="detail-container">
    <!-- 封面图 -->
    <image class="cover-image" :src="recipe.cover_image" mode="aspectFill"></image>

    <!-- 基本信息 -->
    <view class="info-section">
      <text class="recipe-name">{{ recipe.name }}</text>

      <view class="meta-info">
        <view class="meta-item">
          <text class="meta-label">难度</text>
          <text class="meta-value">{{ formatDifficulty(recipe.difficulty) }}</text>
        </view>
        <view class="meta-item">
          <text class="meta-label">时间</text>
          <text class="meta-value">{{ formatCookingTime(recipe.cooking_time) }}</text>
        </view>
        <view class="meta-item">
          <text class="meta-label">份数</text>
          <text class="meta-value">{{ recipe.servings }}人份</text>
        </view>
      </view>

      <view class="author-info">
        <image class="avatar" :src="recipe.author?.avatar || '/static/images/default-avatar.png'" mode="aspectFill"></image>
        <text class="author-name">{{ recipe.author?.nickname || '匿名' }}</text>
      </view>

      <text class="description">{{ recipe.description }}</text>
    </view>

    <!-- 食材列表 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">食材清单</text>
        <text class="add-to-cart" @click="addToShoppingList">添加到购物清单</text>
      </view>
      <view class="ingredient-list">
        <view class="ingredient-item" v-for="item in recipe.ingredients" :key="item.id">
          <text class="ingredient-name">{{ item.ingredient?.name }}</text>
          <text class="ingredient-quantity">{{ item.quantity }}{{ item.unit }}</text>
        </view>
      </view>
    </view>

    <!-- 烹饪步骤 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">烹饪步骤</text>
      </view>
      <view class="step-list">
        <view class="step-item" v-for="step in recipe.steps" :key="step.id">
          <view class="step-number">{{ step.step_number }}</view>
          <view class="step-content">
            <text class="step-description">{{ step.description }}</text>
            <image v-if="step.image_url" class="step-image" :src="step.image_url" mode="aspectFill"></image>
            <text v-if="step.tips" class="step-tips">💡 {{ step.tips }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 营养信息 -->
    <view class="section" v-if="recipe.total_calories">
      <view class="section-header">
        <text class="section-title">营养信息</text>
      </view>
      <view class="nutrition-info">
        <text class="nutrition-text">总卡路里: {{ recipe.total_calories }} kcal</text>
      </view>
    </view>

    <!-- 评论区 -->
    <view class="section">
      <view class="section-header">
        <text class="section-title">评论 ({{ comments.length }})</text>
      </view>
      <CommentList :comments="comments" @reply="handleReply" />
      <!-- 评论输入框 -->
      <view class="comment-input-area">
        <input
          class="comment-input"
          v-model="commentText"
          placeholder="写下你的评论..."
          :placeholder-style="'color: #999'"
        />
        <button class="comment-submit" @click="submitComment">发送</button>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="action-item" @click="handleLike">
        <text class="action-icon">{{ recipe.is_liked ? '❤️' : '🤍' }}</text>
        <text class="action-text">{{ recipe.likes }}</text>
      </view>
      <view class="action-item" @click="handleFavorite">
        <text class="action-icon">{{ recipe.is_favorited ? '⭐' : '☆' }}</text>
        <text class="action-text">{{ recipe.favorites }}</text>
      </view>
      <view class="action-item">
        <text class="action-icon">💬</text>
        <text class="action-text">评论</text>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * detail.vue - 食谱详情页面
 *
 * 功能：
 * 1. 显示食谱完整信息
 * 2. 食材列表
 * 3. 烹饪步骤
 * 4. 点赞、收藏
 * 5. 评论功能
 */

import CommentList from '@/components/CommentList.vue'
import { getRecipeDetail, likeRecipe, favoriteRecipe, getRecipeComments, createRecipeComment } from '@/api/recipe'
import { formatDifficulty, formatCookingTime } from '@/utils/format'

export default {
  name: 'RecipeDetail',
  components: {
    CommentList
  },
  data() {
    return {
      recipe: {},
      comments: [],
      recipeId: null,
      commentText: ''
    }
  },
  onLoad(options) {
    this.recipeId = options.id
    this.loadData()
  },
  methods: {
    formatDifficulty,
    formatCookingTime,

    /**
     * 加载数据
     */
    async loadData() {
      try {
        const [recipeRes, commentsRes] = await Promise.all([
          getRecipeDetail(this.recipeId),
          getRecipeComments(this.recipeId)
        ])
        this.recipe = recipeRes.data || {}
        this.comments = commentsRes.data || []
      } catch (error) {
        console.error('加载失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      }
    },

    /**
     * 点赞
     */
    async handleLike() {
      try {
        await likeRecipe(this.recipeId)
        this.recipe.is_liked = !this.recipe.is_liked
        this.recipe.likes += this.recipe.is_liked ? 1 : -1
      } catch (error) {
        console.error('点赞失败:', error)
      }
    },

    /**
     * 收藏
     */
    async handleFavorite() {
      try {
        await favoriteRecipe(this.recipeId)
        this.recipe.is_favorited = !this.recipe.is_favorited
        this.recipe.favorites += this.recipe.is_favorited ? 1 : -1
        uni.showToast({
          title: this.recipe.is_favorited ? '收藏成功' : '取消收藏',
          icon: 'success'
        })
      } catch (error) {
        console.error('收藏失败:', error)
      }
    },

    /**
     * 添加到购物清单
     */
    addToShoppingList() {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },

    /**
     * 回复评论
     */
    handleReply(comment) {
      uni.showToast({
        title: '功能开发中',
        icon: 'none'
      })
    },

    /**
     * 发表评论
     */
    async submitComment() {
      if (!this.commentText.trim()) {
        uni.showToast({ title: '请输入评论内容', icon: 'none' })
        return
      }
      try {
        const res = await createRecipeComment(this.recipeId, { content: this.commentText })
        this.comments.push(res.data)
        this.commentText = ''
        uni.showToast({ title: '评论成功', icon: 'success' })
      } catch (error) {
        uni.showToast({ title: '评论失败，请先登录', icon: 'none' })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.cover-image {
  width: 100%;
  height: 500rpx;
}

.info-section {
  background-color: #ffffff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.recipe-name {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 20rpx;
}

.meta-info {
  display: flex;
  gap: 40rpx;
  margin-bottom: 20rpx;
}

.meta-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.meta-label {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 5rpx;
}

.meta-value {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
}

.author-info {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 15rpx;
}

.author-name {
  font-size: 26rpx;
  color: #666666;
}

.description {
  font-size: 28rpx;
  color: #666666;
  line-height: 1.6;
}

.section {
  background-color: #ffffff;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.add-to-cart {
  font-size: 24rpx;
  color: #667eea;
}

.ingredient-list {
  display: flex;
  flex-direction: column;
  gap: 15rpx;
}

.ingredient-item {
  display: flex;
  justify-content: space-between;
  padding: 15rpx 20rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
}

.ingredient-name {
  font-size: 28rpx;
  color: #333333;
}

.ingredient-quantity {
  font-size: 28rpx;
  color: #666666;
}

.step-list {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.step-item {
  display: flex;
  gap: 20rpx;
}

.step-number {
  width: 60rpx;
  height: 60rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  color: #ffffff;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-description {
  display: block;
  font-size: 28rpx;
  color: #333333;
  line-height: 1.6;
  margin-bottom: 15rpx;
}

.step-image {
  width: 100%;
  height: 300rpx;
  border-radius: 10rpx;
  margin-bottom: 15rpx;
}

.step-tips {
  display: block;
  font-size: 24rpx;
  color: #667eea;
  padding: 10rpx 15rpx;
  background-color: #f0f2ff;
  border-radius: 8rpx;
}

.nutrition-info {
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 10rpx;
}

.nutrition-text {
  font-size: 28rpx;
  color: #333333;
}

.comment-input-area {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-top: 20rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.comment-input {
  flex: 1;
  height: 72rpx;
  background-color: #f5f5f5;
  border-radius: 36rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
}

.comment-submit {
  width: 120rpx;
  height: 72rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 36rpx;
  font-size: 26rpx;
  color: #ffffff;
  border: none;
  padding: 0;
  line-height: 72rpx;
}

.comment-submit::after {
  border: none;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #ffffff;
  padding: 20rpx 40rpx;
  display: flex;
  justify-content: space-around;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5rpx;
}

.action-icon {
  font-size: 40rpx;
}

.action-text {
  font-size: 24rpx;
  color: #666666;
}
</style>
