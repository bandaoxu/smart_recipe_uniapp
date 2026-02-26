<template>
  <view class="recipe-card" @click="goToDetail">
    <!-- 封面图 -->
    <image class="cover-image" :src="recipe.cover_image" mode="aspectFill"></image>

    <!-- 食谱信息 -->
    <view class="recipe-info">
      <!-- 标题 -->
      <text class="recipe-title">{{ recipe.name }}</text>

      <!-- 标签 -->
      <view class="recipe-tags">
        <text class="tag">{{ formatDifficulty(recipe.difficulty) }}</text>
        <text class="tag">{{ formatCookingTime(recipe.cooking_time) }}</text>
      </view>

      <!-- 底部信息 -->
      <view class="recipe-footer">
        <!-- 作者 -->
        <view class="author">
          <image class="avatar" :src="recipe.author?.avatar || '/static/images/default-avatar.png'" mode="aspectFill"></image>
          <text class="author-name">{{ recipe.author?.nickname || '匿名' }}</text>
        </view>

        <!-- 统计信息 -->
        <view class="stats">
          <view class="stat-item">
            <text class="iconfont icon-like"></text>
            <text class="stat-text">{{ formatLargeNumber(recipe.likes) }}</text>
          </view>
          <view class="stat-item">
            <text class="iconfont icon-favorite"></text>
            <text class="stat-text">{{ formatLargeNumber(recipe.favorites) }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * RecipeCard.vue - 食谱卡片组件
 *
 * 功能：
 * 1. 展示食谱基本信息
 * 2. 点击跳转到食谱详情页
 *
 * Props:
 * - recipe: 食谱对象
 */

import { formatDifficulty, formatCookingTime, formatLargeNumber } from '@/utils/format'

export default {
  name: 'RecipeCard',
  props: {
    recipe: {
      type: Object,
      required: true
    }
  },
  methods: {
    formatDifficulty,
    formatCookingTime,
    formatLargeNumber,

    /**
     * 跳转到食谱详情页
     */
    goToDetail() {
      uni.navigateTo({
        url: `/pages/recipe/detail?id=${this.recipe.id}`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.recipe-card {
  background-color: #ffffff;
  border-radius: 10rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.cover-image {
  width: 100%;
  height: 400rpx;
  display: block;
}

.recipe-info {
  padding: 20rpx;
}

.recipe-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  display: block;
  margin-bottom: 10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recipe-tags {
  display: flex;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.tag {
  font-size: 24rpx;
  color: #666666;
  background-color: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.recipe-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.author {
  display: flex;
  align-items: center;
}

.avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  margin-right: 10rpx;
}

.author-name {
  font-size: 24rpx;
  color: #999999;
}

.stats {
  display: flex;
  gap: 20rpx;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.stat-text {
  font-size: 24rpx;
  color: #999999;
}

.iconfont {
  font-size: 28rpx;
  color: #999999;
}
</style>
