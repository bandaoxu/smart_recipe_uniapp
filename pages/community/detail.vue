<template>
  <view class="detail-container">
    <view class="content-section" v-if="!loading">
      <!-- 动态内容 -->
      <view class="post-content">
        <!-- 作者信息 -->
        <view class="author-info">
          <image :src="post.author?.avatar || '/static/images/default-avatar.svg'" mode="aspectFill" class="author-avatar"></image>
          <view class="author-detail">
            <text class="author-name">{{ post.author?.nickname }}</text>
            <text class="post-time">{{ formatTime(post.created_at) }}</text>
          </view>
        </view>

        <!-- 文本内容 -->
        <view class="post-text">
          <text>{{ post.content }}</text>
        </view>

        <!-- 图片列表 -->
        <view class="post-images" v-if="post.images && post.images.length > 0">
          <image
            v-for="(image, index) in post.images"
            :key="index"
            :src="image"
            mode="aspectFill"
            class="post-image"
            @click="previewImage(index)"
          ></image>
        </view>

        <!-- 关联食谱 -->
        <view class="related-recipe" v-if="post.recipe" @click="goToRecipe(post.recipe.id)">
          <image :src="post.recipe.cover_image" mode="aspectFill" class="recipe-cover"></image>
          <view class="recipe-info">
            <text class="recipe-name">{{ post.recipe.name }}</text>
            <text class="recipe-author">by {{ post.recipe.author?.nickname }}</text>
          </view>
          <text class="arrow">›</text>
        </view>

        <!-- 点赞数和评论数 -->
        <view class="post-stats">
          <text class="stat-item">{{ post.likes }} 点赞</text>
          <text class="stat-item">{{ post.comments_count }} 评论</text>
        </view>
      </view>

      <!-- 评论列表 -->
      <view class="comments-section">
        <view class="section-title">
          <text>评论 ({{ comments.length }})</text>
        </view>
        <CommentList :comments="comments" @reply="handleReply" />

        <!-- 空状态 -->
        <view class="empty-comments" v-if="comments.length === 0">
          <text class="empty-text">还没有评论，快来抢沙发吧~</text>
        </view>
      </view>
    </view>

    <!-- 加载中 -->
    <view class="page-loading" v-if="loading">
      <text>加载中...</text>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="comment-input" @click="showCommentInput">
        <text class="input-placeholder">说点什么...</text>
      </view>
      <view class="action-buttons">
        <view class="action-btn" @click="handleLike">
          <text class="action-icon">{{ post.is_liked ? '❤️' : '🤍' }}</text>
          <text class="action-text">{{ post.likes }}</text>
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
          v-model="commentContent"
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
 * detail.vue - 社区动态详情页面
 *
 * 功能：
 * 1. 显示动态内容
 * 2. 显示关联食谱
 * 3. 点赞动态
 * 4. 评论列表
 * 5. 发表评论
 */

import CommentList from '@/components/CommentList.vue'
import { getPostDetail, likePost, getComments, createComment } from '@/api/community'
import { formatTime } from '@/utils/format'

export default {
  name: 'CommunityDetail',
  components: {
    CommentList
  },
  data() {
    return {
      postId: null,
      post: {},
      comments: [],
      loading: true,
      showModal: false,
      commentContent: '',
      submitting: false,
      replyingTo: null
    }
  },
  onLoad(options) {
    if (options.id) {
      this.postId = options.id
      this.loadData()
    }
  },
  methods: {
    /**
     * 加载数据
     */
    async loadData() {
      this.loading = true

      try {
        // 加载动态详情
        const postRes = await getPostDetail(this.postId)
        this.post = postRes.data

        // 加载评论列表
        const commentsRes = await getComments(this.postId)
        this.comments = commentsRes.data || []

      } catch (error) {
        console.error('加载失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    /**
     * 格式化时间
     */
    formatTime(time) {
      return formatTime(time)
    },

    /**
     * 预览图片
     */
    previewImage(index) {
      uni.previewImage({
        urls: this.post.images,
        current: index
      })
    },

    /**
     * 跳转到食谱详情
     */
    goToRecipe(recipeId) {
      uni.navigateTo({
        url: `/pages/recipe/detail?id=${recipeId}`
      })
    },

    /**
     * 点赞动态
     */
    async handleLike() {
      try {
        const res = await likePost(this.postId)
        this.post.is_liked = res.data.is_liked
        this.post.likes = res.data.likes
      } catch (error) {
        console.error('点赞失败:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
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
      this.commentContent = ''
      this.replyingTo = null
    },

    /**
     * 回复评论
     */
    handleReply(comment) {
      this.replyingTo = comment
      this.showModal = true
    },

    /**
     * 提交评论
     */
    async submitComment() {
      if (!this.commentContent.trim()) {
        uni.showToast({
          title: '请输入评论内容',
          icon: 'none'
        })
        return
      }

      this.submitting = true

      try {
        await createComment(this.postId, {
          content: this.commentContent,
          ...(this.replyingTo ? { parent: this.replyingTo.id } : {})
        })

        uni.showToast({
          title: '评论成功',
          icon: 'success'
        })

        this.hideCommentInput()

        // 重新加载评论列表
        const commentsRes = await getComments(this.postId)
        this.comments = commentsRes.data || []
        this.post.comments_count = this.comments.length

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

.content-section {
  padding: 20rpx;
}

.post-content {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.author-info {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.author-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  margin-right: 20rpx;
}

.author-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.post-time {
  font-size: 24rpx;
  color: #999999;
}

.post-text {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.6;
  margin-bottom: 30rpx;
}

.post-images {
  display: flex;
  flex-wrap: wrap;
  margin: -10rpx -10rpx 30rpx;
}

.post-image {
  width: 220rpx;
  height: 220rpx;
  border-radius: 12rpx;
  margin: 10rpx;
}

.related-recipe {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  margin-bottom: 30rpx;
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

.arrow {
  font-size: 48rpx;
  color: #cccccc;
}

.post-stats {
  display: flex;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.stat-item {
  font-size: 26rpx;
  color: #999999;
  margin-right: 40rpx;
}

.comments-section {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 30rpx;
}

.empty-comments {
  text-align: center;
  padding: 80rpx 0;
}

.empty-text {
  font-size: 26rpx;
  color: #999999;
}

.page-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-size: 28rpx;
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

.action-icon {
  font-size: 40rpx;
  margin-bottom: 5rpx;
}

.action-text {
  font-size: 22rpx;
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

/* 移除原生 textarea 样式，已被 uni-easyinput 替代 */

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
</style>