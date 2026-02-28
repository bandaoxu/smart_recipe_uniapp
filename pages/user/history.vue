<template>
  <view class="history-container">
    <!-- 食谱列表 -->
    <view class="recipe-list" v-if="recipes.length > 0">
      <RecipeCard
        v-for="recipe in recipes"
        :key="recipe.id"
        :recipe="recipe"
      />
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else-if="!loading">
      <text class="empty-icon">🕐</text>
      <text class="empty-text">还没有浏览记录</text>
      <text class="empty-sub">去发现一些美味食谱吧</text>
    </view>

    <!-- 加载状态 -->
    <view class="loading-state" v-if="loading">
      <uni-load-more status="loading" />
    </view>
  </view>
</template>

<script>
import RecipeCard from '@/components/RecipeCard.vue'
import { getBrowseHistory } from '@/api/recipe'

export default {
  name: 'History',
  components: { RecipeCard },
  data() {
    return {
      recipes: [],
      loading: false
    }
  },
  onLoad() {
    this.loadHistory()
  },
  onPullDownRefresh() {
    this.loadHistory().then(() => {
      uni.stopPullDownRefresh()
    })
  },
  methods: {
    async loadHistory() {
      this.loading = true
      try {
        const res = await getBrowseHistory()
        this.recipes = Array.isArray(res.data) ? res.data : []
      } catch (error) {
        console.error('浏览历史加载失败:', error)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.history-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.recipe-list {
  padding: 20rpx;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 0;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 30rpx;
  color: #666666;
  margin-bottom: 16rpx;
}

.empty-sub {
  font-size: 26rpx;
  color: #999999;
}

.loading-state {
  padding: 40rpx 0;
  display: flex;
  justify-content: center;
}
</style>
