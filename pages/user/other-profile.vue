<template>
  <view class="other-profile-container">
    <!-- 加载中 -->
    <view class="page-loading" v-if="loading">
      <text>加载中...</text>
    </view>

    <view v-else>
      <!-- 个人信息头部 -->
      <view class="profile-header">
        <image class="avatar" :src="userInfo.avatar || '/static/images/default-avatar.svg'" mode="aspectFill" />
        <text class="nickname">{{ userInfo.nickname }}</text>
        <text class="username">@{{ userInfo.username }}</text>

        <!-- 数据统计 -->
        <view class="stats-row">
          <view class="stat-item">
            <text class="stat-num">{{ userInfo.followers_count || 0 }}</text>
            <text class="stat-label">粉丝</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-num">{{ userInfo.following_count || 0 }}</text>
            <text class="stat-label">关注</text>
          </view>
          <view class="stat-divider"></view>
          <view class="stat-item">
            <text class="stat-num">{{ userInfo.recipes_count || 0 }}</text>
            <text class="stat-label">食谱</text>
          </view>
        </view>

        <!-- 关注按钮 -->
        <view class="follow-btn" :class="{ followed: isFollowing }" @click="handleFollow" v-if="!followLoading">
          <text>{{ isFollowing ? '已关注' : '+ 关注' }}</text>
        </view>
        <view class="follow-btn loading-btn" v-else>
          <text>...</text>
        </view>
      </view>

      <!-- 食谱列表 -->
      <view class="recipes-section">
        <view class="section-title">
          <text>他的食谱</text>
        </view>

        <view class="recipe-list" v-if="recipes.length > 0">
          <view
            class="recipe-card"
            v-for="recipe in recipes"
            :key="recipe.id"
            @click="goToRecipe(recipe.id)"
          >
            <image class="recipe-cover" :src="recipe.cover_image || '/static/images/default-recipe.png'" mode="aspectFill" />
            <view class="recipe-info">
              <text class="recipe-name">{{ recipe.name }}</text>
              <view class="recipe-meta">
                <text class="meta-item">{{ formatDifficulty(recipe.difficulty) }}</text>
                <text class="meta-item">{{ formatCookingTime(recipe.cooking_time) }}</text>
              </view>
            </view>
          </view>
        </view>

        <view class="empty-recipes" v-else>
          <text class="empty-text">还没有发布食谱</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getPublicProfile, followUser, unfollowUser } from '@/api/user'
import { getUserRecipes } from '@/api/recipe'
import { useUserStore } from '@/store'
import { formatDifficulty, formatCookingTime } from '@/utils/format'

export default {
  name: 'OtherProfile',
  data() {
    return {
      userId: null,
      userInfo: {},
      recipes: [],
      loading: false,
      isFollowing: false,
      followLoading: false
    }
  },
  onLoad(options) {
    if (options.id) {
      this.userId = Number(options.id)

      // 若点击的是自己的主页，跳转到自己的 profile tab
      const userStore = useUserStore()
      if (userStore.isLoggedIn && userStore.userId === this.userId) {
        uni.redirectTo({ url: '/pages/user/profile' })
        return
      }

      this.loadData()
    }
  },
  methods: {
    formatDifficulty,
    formatCookingTime,

    async loadData() {
      this.loading = true
      try {
        const [profileRes, recipesRes] = await Promise.all([
          getPublicProfile(this.userId),
          getUserRecipes(this.userId)
        ])
        this.userInfo = profileRes.data || {}
        this.isFollowing = this.userInfo.is_following || false

        const recipesData = recipesRes.data
        this.recipes = (recipesData && recipesData.results) ? recipesData.results : (Array.isArray(recipesData) ? recipesData : [])
      } catch (error) {
        console.error('加载失败:', error)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    async handleFollow() {
      if (this.followLoading) return
      const userStore = useUserStore()
      if (!userStore.isLoggedIn) {
        uni.navigateTo({ url: '/pages/user/login' })
        return
      }

      this.followLoading = true
      try {
        if (this.isFollowing) {
          await unfollowUser(this.userId)
          this.isFollowing = false
          if (this.userInfo.followers_count > 0) this.userInfo.followers_count--
          uni.showToast({ title: '已取消关注', icon: 'none' })
        } else {
          await followUser(this.userId)
          this.isFollowing = true
          this.userInfo.followers_count = (this.userInfo.followers_count || 0) + 1
          uni.showToast({ title: '关注成功', icon: 'success' })
        }
      } catch (error) {
        console.error('操作失败:', error)
      } finally {
        this.followLoading = false
      }
    },

    goToRecipe(recipeId) {
      uni.navigateTo({ url: `/pages/recipe/detail?id=${recipeId}` })
    }
  }
}
</script>

<style lang="scss" scoped>
.other-profile-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.page-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-size: 28rpx;
  color: #999999;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60rpx 40rpx 50rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar {
  width: 160rpx;
  height: 160rpx;
  border-radius: 80rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.6);
  margin-bottom: 20rpx;
}

.nickname {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 8rpx;
}

.username {
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 40rpx;
}

.stats-row {
  display: flex;
  align-items: center;
  margin-bottom: 36rpx;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 50rpx;
}

.stat-num {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 4rpx;
}

.stat-label {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.75);
}

.stat-divider {
  width: 1rpx;
  height: 60rpx;
  background-color: rgba(255, 255, 255, 0.3);
}

.follow-btn {
  padding: 18rpx 80rpx;
  border-radius: 50rpx;
  border: 2rpx solid #ffffff;
  background-color: transparent;
}

.follow-btn text {
  font-size: 28rpx;
  color: #ffffff;
}

.follow-btn.followed {
  background-color: rgba(255, 255, 255, 0.2);
}

.follow-btn.loading-btn {
  opacity: 0.6;
}

.recipes-section {
  padding: 20rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  padding: 20rpx 10rpx;
}

.recipe-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.recipe-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  display: flex;
  align-items: center;
}

.recipe-cover {
  width: 180rpx;
  height: 140rpx;
  flex-shrink: 0;
}

.recipe-info {
  flex: 1;
  padding: 20rpx 24rpx;
}

.recipe-name {
  font-size: 30rpx;
  color: #333333;
  font-weight: 500;
  margin-bottom: 16rpx;
  display: block;
}

.recipe-meta {
  display: flex;
  gap: 20rpx;
}

.meta-item {
  font-size: 24rpx;
  color: #999999;
}

.empty-recipes {
  text-align: center;
  padding: 80rpx 0;
}

.empty-text {
  font-size: 26rpx;
  color: #999999;
}
</style>
