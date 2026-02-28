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
        <image class="avatar" :src="recipe.author?.avatar || '/static/images/default-avatar.svg'" mode="aspectFill"
          @click="goToUserProfile(recipe.author?.id)"></image>
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
      
      <!-- 空状态 -->
      <view class="empty-comments" v-if="comments.length === 0">
        <text class="empty-text">还没有评论，快来抢沙发吧~</text>
      </view>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="comment-input" @click="showCommentInput">
        <text class="input-placeholder">说点什么...</text>
      </view>
      <view class="action-buttons">
        <view class="action-btn" @click="handleLike">
          <text class="action-icon">{{ recipe.is_liked ? '❤️' : '🤍' }}</text>
          <text class="action-text">{{ recipe.likes }}</text>
        </view>
        <view class="action-btn" @click="handleFavorite">
          <text class="action-icon">{{ recipe.is_favorited ? '⭐' : '☆' }}</text>
          <text class="action-text">{{ recipe.favorites }}</text>
        </view>
      </view>
    </view>

    <!-- 评论输入弹窗 -->
    <view class="comment-modal" v-if="showModal" @click="hideCommentInput">
      <view class="modal-content" @click.stop>
        <view v-if="replyingTo" class="reply-hint">
          <text class="reply-hint-text">回复 @{{ replyingTo.user?.nickname }}</text>
          <text class="cancel-reply" @click="replyingTo = null">取消回复</text>
        </view>
        <uni-easyinput
          type="textarea"
          class="comment-textarea"
          v-model="commentText"
          :placeholder="replyingTo ? '回复 @' + replyingTo.user?.nickname + '...' : '写下你的评论...'"
          :focus="true"
          :maxlength="500"
          :inputBorder="false"
        />
        <view class="modal-actions">
          <button class="cancel-btn" @click="hideCommentInput">取消</button>
          <button class="submit-btn" @click="submitComment" :loading="submitting">发送</button>
        </view>
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
import { generateShoppingList } from '@/api/shopping'
import { useUserStore } from '@/store'
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
      commentText: '',
      showModal: false,
      submitting: false,
      replyingTo: null
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
     * 跳转到用户主页
     */
    goToUserProfile(userId) {
      if (!userId) return
      const userStore = useUserStore()
      if (userId === userStore.userId) {
        uni.switchTab({ url: '/pages/user/profile' })
      } else {
        uni.navigateTo({ url: `/pages/user/other-profile?id=${userId}` })
      }
    },

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
     * 将食谱所有食材批量加入购物清单，已存在的食材自动累加数量
     */
    async addToShoppingList() {
      const userStore = useUserStore()
      if (!userStore.isLoggedIn) {
        uni.showModal({
          title: '提示',
          content: '请先登录后再添加到购物清单',
          confirmText: '去登录',
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({ url: '/pages/user/login' })
            }
          }
        })
        return
      }

      if (!this.recipe.ingredients || this.recipe.ingredients.length === 0) {
        uni.showToast({ title: '该食谱暂无食材信息', icon: 'none' })
        return
      }

      try {
        uni.showLoading({ title: '添加中...' })
        const res = await generateShoppingList({ recipe_id: parseInt(this.recipeId) })

        const added = res.data?.added_count ?? 0
        const total = res.data?.total_ingredients ?? 0
        uni.showModal({
          title: '添加成功',
          content: `已将 ${total} 种食材加入购物清单（新增 ${added} 种）`,
          confirmText: '查看清单',
          cancelText: '继续浏览',
          success: (modalRes) => {
            if (modalRes.confirm) {
              uni.switchTab({ url: '/pages/shopping/list' })
            }
          }
        })
      } catch (error) {
        if (!error?.data) {
          uni.showToast({ title: '网络错误，请重试', icon: 'none' })
        }
      } finally {
        try { uni.hideLoading() } catch (e) {}
      }
    },

    /**
     * 回复评论
     */
    handleReply(comment) {
      this.replyingTo = comment
      this.showModal = true
    },

    /**
     * 显示评论输入框
     */
    showCommentInput() {
      this.showModal = true
    },

    /**
     * 隐藏评论输入框
     */
    hideCommentInput() {
      this.showModal = false
      this.commentText = ''
      this.replyingTo = null
    },

    /**
     * 发表评论
     */
    async submitComment() {
      if (!this.commentText.trim()) {
        uni.showToast({ title: '请输入评论内容', icon: 'none' })
        return
      }

      this.submitting = true

      try {
        await createRecipeComment(this.recipeId, {
          content: this.commentText,
          ...(this.replyingTo ? { parent: this.replyingTo.id } : {})
        })

        uni.showToast({
          title: '评论成功',
          icon: 'success'
        })

        this.hideCommentInput()

        // 重新加载评论列表
        const commentsRes = await getRecipeComments(this.recipeId)
        this.comments = commentsRes.data || []

      } catch (error) {
        console.error('评论失败:', error)
        uni.showToast({
          title: error.message || '评论失败',
          icon: 'none'
        })
      } finally {
        this.submitting = false
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

.empty-comments {
  text-align: center;
  padding: 80rpx 0;
}

.empty-text {
  font-size: 26rpx;
  color: #999999;
}

.comment-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  background-color: #ffffff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 40rpx;
}

.comment-textarea {
  margin-bottom: 30rpx;
}

.comment-textarea ::v-deep .uni-easyinput__content {
  background-color: #f5f5f5;
  border-radius: 12rpx;
}

.comment-textarea ::v-deep .uni-easyinput__content-textarea {
  font-size: 28rpx;
  color: #333333;
  min-height: 200rpx;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
}

.cancel-btn,
.submit-btn {
  padding: 20rpx 50rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  border: none;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666666;
  margin-right: 20rpx;
}

.cancel-btn::after,
.submit-btn::after {
  border: none;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.reply-hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
  margin-bottom: 20rpx;
}

.reply-hint-text {
  font-size: 26rpx;
  color: #667eea;
}

.cancel-reply {
  font-size: 24rpx;
  color: #999999;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #ffffff;
  border-top: 1rpx solid #f0f0f0;
  z-index: 100;
}

.comment-input {
  flex: 1;
  height: 70rpx;
  background-color: #f5f5f5;
  border-radius: 35rpx;
  padding: 0 30rpx;
  display: flex;
  align-items: center;
  margin-right: 20rpx;
}

.input-placeholder {
  font-size: 26rpx;
  color: #999999;
}

.action-buttons {
  display: flex;
  align-items: center;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 30rpx;
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