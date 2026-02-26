<template>
  <view class="index-container">
    <!-- 搜索栏 -->
    <view class="search-bar" @click="goToSearch">
      <text class="search-icon">🔍</text>
      <text class="search-placeholder">搜索食谱、食材</text>
    </view>

    <!-- 分类导航 -->
    <scroll-view class="category-nav" scroll-x>
      <view
        class="category-item"
        :class="{ active: currentCategory === item.value }"
        v-for="item in categories"
        :key="item.value"
        @click="selectCategory(item.value)"
      >
        <text class="category-text">{{ item.label }}</text>
      </view>
    </scroll-view>

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
      <text class="empty-icon">🍳</text>
      <text class="empty-text">暂无食谱</text>
    </view>

    <!-- 加载中 -->
    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script>
/**
 * index.vue - 首页（推荐食谱）
 *
 * 功能：
 * 1. 推荐食谱列表
 * 2. 分类导航
 * 3. 搜索入口
 * 4. 下拉刷新、上拉加载更多
 */

import RecipeCard from '@/components/RecipeCard.vue'
import { getRecipeList } from '@/api/recipe'

export default {
  name: 'Index',
  components: {
    RecipeCard
  },
  data() {
    return {
      recipes: [],
      loading: false,
      page: 1,
      hasMore: true,
      currentCategory: '',
      categories: [
        { label: '全部', value: '' },
        { label: '早餐', value: 'breakfast' },
        { label: '午餐', value: 'lunch' },
        { label: '晚餐', value: 'dinner' },
        { label: '甜品', value: 'dessert' },
        { label: '小吃', value: 'snack' },
        { label: '汤羹', value: 'soup' }
      ]
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
        const params = {
          page: this.page
        }

        // 添加分类筛选
        if (this.currentCategory) {
          params.category = this.currentCategory
        }

        const res = await getRecipeList(params)

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
     * 选择分类
     */
    selectCategory(category) {
      this.currentCategory = category
      this.page = 1
      this.hasMore = true
      this.recipes = []
      this.loadData()
    },

    /**
     * 跳转到搜索页面
     */
    goToSearch() {
      uni.navigateTo({
        url: '/pages/recipe/search'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.index-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.search-bar {
  background-color: #ffffff;
  margin: 20rpx;
  padding: 20rpx 30rpx;
  border-radius: 50rpx;
  display: flex;
  align-items: center;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.search-icon {
  font-size: 32rpx;
  margin-right: 15rpx;
}

.search-placeholder {
  font-size: 28rpx;
  color: #999999;
}

.category-nav {
  background-color: #ffffff;
  padding: 20rpx 0;
  white-space: nowrap;
  margin-bottom: 20rpx;
}

.category-item {
  display: inline-block;
  padding: 15rpx 30rpx;
  margin: 0 10rpx;
  border-radius: 30rpx;
  background-color: #f5f5f5;
}

.category-item.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.category-item.active .category-text {
  color: #ffffff;
}

.category-text {
  font-size: 26rpx;
  color: #666666;
}

.recipe-list {
  padding: 0 20rpx 20rpx;
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
}

.loading {
  text-align: center;
  padding: 40rpx 0;
  font-size: 28rpx;
  color: #999999;
}
</style>
