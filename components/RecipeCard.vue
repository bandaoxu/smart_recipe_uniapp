<template>
  <view class="recipe-card" @click="goToDetail">
    <!-- 封面图 -->
    <image class="cover-image" :src="coverSrc" mode="aspectFill" @error="coverSrc='/static/images/default-recipe.svg'"></image>

    <!-- 食谱信息 -->
    <view class="recipe-info">
      <!-- 标题 -->
      <text class="recipe-title">{{ recipe.name }}</text>

      <!-- 标签 -->
      <view class="recipe-tags">
        <text class="tag">{{ formatDifficulty(recipe.difficulty) }}</text>
        <text class="tag">{{ formatCookingTime(recipe.cooking_time) }}</text>
      </view>

      <!-- 营养摘要行 -->
      <view class="nutrition-row" v-if="recipe.total_calories > 0 || recipe.total_fiber > 0">
        <view class="nut-cell" v-for="item in nutritionSummary" :key="item.label">
          <text class="nut-val">{{ item.value }}</text>
          <text class="nut-lbl">{{ item.label }}</text>
        </view>
      </view>

      <!-- 底部信息 -->
      <view class="recipe-footer">
        <!-- 作者 -->
        <view class="author">
          <image class="avatar" :src="avatarSrc" mode="aspectFill" @error="avatarSrc='/static/images/default-avatar.svg'"></image>
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
import { getMediaUrl } from '@/utils/media'

export default {
  name: 'RecipeCard',
  props: {
    recipe: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      coverSrc: '',
      avatarSrc: ''
    }
  },
  computed: {
    nutritionSummary() {
      const r = this.recipe
      return [
        { label: '千卡',  value: r.total_calories     ?? 0 },
        { label: '蛋白质g', value: r.total_protein       ?? 0 },
        { label: '脂肪g', value: r.total_fat           ?? 0 },
        { label: '碳水g', value: r.total_carbohydrate  ?? 0 },
        { label: '纤维g', value: r.total_fiber         ?? 0 },
      ]
    }
  },
  watch: {
    recipe: {
      handler(newRecipe) {
        if (newRecipe && newRecipe.id) {
          // 先设置为网络 URL（立即显示）
          this.coverSrc = this.$media(newRecipe.cover_image, '/static/images/default-recipe.svg')
          this.avatarSrc = this.$media(newRecipe.author?.avatar, '/static/images/default-avatar.svg')
          
          // 然后异步下载到本地（优化体验）
          this.downloadImages()
        }
      },
      immediate: true
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
    },

    /**
     * 下载图片到本地
     */
    async downloadImages() {
      try {
        // 下载封面图
        if (this.recipe.cover_image) {
          await this.downloadImage('cover', this.recipe.cover_image)
        }
        
        // 下载头像
        if (this.recipe.author?.avatar) {
          await this.downloadImage('avatar', this.recipe.author.avatar)
        }
      } catch (error) {
        console.error('[RecipeCard] 下载图片失败:', error)
      }
    },

    /**
     * 下载单个图片
     */
    async downloadImage(type, url) {
      try {
        const fullUrl = this.$media(url)
        const res = await uni.downloadFile({
          url: fullUrl,
          timeout: 30000
        })
        
        if (res.statusCode === 200 && res.tempFilePath) {
          if (type === 'cover') {
            this.coverSrc = res.tempFilePath
            console.log('[RecipeCard] 封面图下载成功:', res.tempFilePath)
          } else if (type === 'avatar') {
            this.avatarSrc = res.tempFilePath
            console.log('[RecipeCard] 头像下载成功:', res.tempFilePath)
          }
        }
      } catch (error) {
        console.error(`[RecipeCard] 下载失败 ${type}:`, error)
      }
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
  margin-bottom: 14rpx;
}

.tag {
  font-size: 24rpx;
  color: #666666;
  background-color: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 4rpx;
}

.nutrition-row {
  display: flex;
  background-color: #fff8f0;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
  overflow: hidden;
}

.nut-cell {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10rpx 0;
  border-right: 1rpx solid #f0ebe4;

  &:last-child {
    border-right: none;
  }
}

.nut-val {
  font-size: 26rpx;
  font-weight: 600;
  color: #333333;
}

.nut-lbl {
  font-size: 18rpx;
  color: #aaaaaa;
  margin-top: 2rpx;
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