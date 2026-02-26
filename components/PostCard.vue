<template>
  <view class="post-card" @click="goToDetail">
    <!-- 用户信息 -->
    <view class="post-header">
      <image class="avatar" :src="post.user?.avatar || '/static/images/default-avatar.png'" mode="aspectFill"></image>
      <view class="user-info">
        <text class="username">{{ post.user?.nickname || '匿名' }}</text>
        <text class="time">{{ formatRelativeTime(post.created_at) }}</text>
      </view>
    </view>

    <!-- 动态内容 -->
    <view class="post-content">
      <text class="content-text">{{ post.content }}</text>
    </view>

    <!-- 图片列表 -->
    <view class="post-images" v-if="post.images && post.images.length > 0">
      <image
        v-for="(image, index) in post.images"
        :key="index"
        class="post-image"
        :class="{ 'single-image': post.images.length === 1 }"
        :src="image"
        mode="aspectFill"
        @click.stop="previewImage(index)"
      ></image>
    </view>

    <!-- 关联食谱 -->
    <view class="related-recipe" v-if="post.recipe" @click.stop="goToRecipe">
      <text class="recipe-label">关联食谱：</text>
      <text class="recipe-name">{{ post.recipe.name }}</text>
    </view>

    <!-- 底部操作栏 -->
    <view class="post-footer">
      <view class="action-item" @click.stop="handleLike">
        <text class="iconfont" :class="post.is_liked ? 'icon-like-fill' : 'icon-like'"></text>
        <text class="action-text">{{ formatLargeNumber(post.likes) }}</text>
      </view>
      <view class="action-item">
        <text class="iconfont icon-comment"></text>
        <text class="action-text">{{ formatLargeNumber(post.comments_count) }}</text>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * PostCard.vue - 动态卡片组件
 *
 * 功能：
 * 1. 展示动态基本信息
 * 2. 支持点赞操作
 * 3. 点击跳转到动态详情页
 *
 * Props:
 * - post: 动态对象
 */

import { formatRelativeTime, formatLargeNumber } from '@/utils/format'
import { likePost } from '@/api/community'

export default {
  name: 'PostCard',
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatRelativeTime,
    formatLargeNumber,

    /**
     * 跳转到动态详情页
     */
    goToDetail() {
      uni.navigateTo({
        url: `/pages/community/detail?id=${this.post.id}`
      })
    },

    /**
     * 跳转到关联食谱
     */
    goToRecipe() {
      if (this.post.recipe && this.post.recipe.id) {
        uni.navigateTo({
          url: `/pages/recipe/detail?id=${this.post.recipe.id}`
        })
      }
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
     * 点赞
     */
    async handleLike() {
      try {
        await likePost(this.post.id)
        // 更新点赞状态
        this.post.is_liked = !this.post.is_liked
        this.post.likes += this.post.is_liked ? 1 : -1
        this.$emit('like', this.post.id)
      } catch (error) {
        console.error('点赞失败:', error)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.post-card {
  background-color: #ffffff;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 4rpx;
}

.time {
  font-size: 24rpx;
  color: #999999;
}

.post-content {
  margin-bottom: 20rpx;
}

.content-text {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.6;
  display: block;
}

.post-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.post-image {
  width: 220rpx;
  height: 220rpx;
  border-radius: 8rpx;
}

.single-image {
  width: 100%;
  height: 400rpx;
}

.related-recipe {
  background-color: #f5f5f5;
  padding: 20rpx;
  border-radius: 8rpx;
  margin-bottom: 20rpx;
}

.recipe-label {
  font-size: 24rpx;
  color: #999999;
  margin-right: 10rpx;
}

.recipe-name {
  font-size: 28rpx;
  color: #3cc51f;
}

.post-footer {
  display: flex;
  gap: 40rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f5f5f5;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.iconfont {
  font-size: 32rpx;
  color: #999999;
}

.icon-like-fill {
  color: #ff4d4f;
}

.action-text {
  font-size: 24rpx;
  color: #999999;
}
</style>
