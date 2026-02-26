<template>
  <view class="my-recipes-container">
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
      <text class="empty-icon">📝</text>
      <text class="empty-text">还没有创建食谱</text>
      <button class="create-btn" @click="goToCreate">创建食谱</button>
    </view>

    <!-- 加载中 -->
    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script>
/**
 * my-recipes.vue - 我的食谱页面
 *
 * 功能：
 * 1. 显示用户创建的食谱列表
 * 2. 下拉刷新
 * 3. 上拉加载更多
 */

import RecipeCard from '@/components/RecipeCard.vue'
import { getMyRecipes } from '@/api/recipe'

export default {
  name: 'MyRecipes',
  components: {
    RecipeCard
  },
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
    this.loadData().then(() => {
      uni.stopPullDownRefresh()
    })
  },
  onReachBottom() {
    if (this.hasMore && !this.loading) {
      this.page++
      this.loadData()
    }
  },
  methods: {
    /**
     * 加载数据
     */
    async loadData() {
      if (this.loading) return

      this.loading = true

      try {
        const res = await getMyRecipes({ page: this.page })

        if (this.page === 1) {
          this.recipes = res.data.results || []
        } else {
          this.recipes = [...this.recipes, ...(res.data.results || [])]
        }

        this.hasMore = res.data.next !== null

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
     * 跳转到创建食谱页面
     */
    goToCreate() {
      uni.navigateTo({
        url: '/pages/recipe/create'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.my-recipes-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.recipe-list {
  padding-bottom: 20rpx;
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

.create-btn {
  width: 300rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 40rpx;
  font-size: 28rpx;
  color: #ffffff;
  border: none;
}

.create-btn::after {
  border: none;
}

.loading {
  text-align: center;
  padding: 40rpx 0;
  font-size: 28rpx;
  color: #999999;
}
</style>
