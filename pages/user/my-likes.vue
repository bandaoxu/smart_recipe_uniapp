<template>
  <view class="likes-container">
    <view class="recipe-list" v-if="recipes.length > 0">
      <RecipeCard
        v-for="recipe in recipes"
        :key="recipe.id"
        :recipe="recipe"
      />
    </view>

    <view class="empty-state" v-else-if="!loading">
      <text class="empty-icon">👍</text>
      <text class="empty-text">还没有喜欢的食谱</text>
      <button class="browse-btn" @click="goToHome">去逛逛</button>
    </view>

    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script>
import RecipeCard from '@/components/RecipeCard.vue'
import { getLiked } from '@/api/recipe'

export default {
  name: 'MyLikes',
  components: { RecipeCard },
  data() {
    return {
      recipes: [],
      loading: false,
      page: 1,
      hasMore: true
    }
  },
  onLoad() {
    this.loadData()
  },
  onPullDownRefresh() {
    this.page = 1
    this.hasMore = true
    this.loadData().then(() => uni.stopPullDownRefresh())
  },
  onReachBottom() {
    if (this.hasMore && !this.loading) {
      this.page++
      this.loadData()
    }
  },
  methods: {
    async loadData() {
      if (this.loading) return
      this.loading = true
      try {
        const res = await getLiked({ page: this.page })
        if (this.page === 1) {
          this.recipes = res.data.results || []
        } else {
          this.recipes = [...this.recipes, ...(res.data.results || [])]
        }
        this.hasMore = res.data.next !== null
      } catch (error) {
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },
    goToHome() {
      uni.switchTab({ url: '/pages/index/index' })
    }
  }
}
</script>

<style lang="scss" scoped>
.likes-container {
  min-height: 100vh;
  background-color: #f5f5f5;
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
  font-size: 28rpx;
  color: #999999;
  margin-bottom: 40rpx;
}

.browse-btn {
  width: 300rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 40rpx;
  font-size: 28rpx;
  color: #ffffff;
  border: none;
}

.browse-btn::after {
  border: none;
}

.loading {
  text-align: center;
  padding: 40rpx 0;
  font-size: 28rpx;
  color: #999999;
}
</style>
