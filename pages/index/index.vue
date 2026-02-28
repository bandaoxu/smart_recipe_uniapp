<template>
  <view class="index-container">
    <!-- 搜索栏 + 相机入口 -->
    <view class="search-area">
      <view class="search-bar" @click="goToSearch">
        <text class="search-icon">🔍</text>
        <text class="search-placeholder">搜索食谱、食材</text>
      </view>
      <view class="camera-btn" @click="goToRecognize">
        <text class="camera-icon">📷</text>
      </view>
    </view>

    <!-- 热门推荐 -->
    <view class="hot-section" v-if="hotRecipes.length > 0">
      <view class="section-header">
        <text class="section-title">🔥 热门推荐</text>
        <text class="section-more" @click="clearCategoryAndRefresh">更多</text>
      </view>
      <scroll-view class="hot-scroll" scroll-x>
        <view class="hot-list">
          <view
            class="hot-card"
            v-for="r in hotRecipes"
            :key="r.id"
            @click="goToDetail(r.id)"
          >
            <image
              class="hot-cover"
              :src="r.cover_image || '/static/images/default-recipe.png'"
              mode="aspectFill"
            />
            <view class="hot-info">
              <text class="hot-name">{{ r.name }}</text>
              <text class="hot-meta">{{ r.views || 0 }} 次浏览</text>
            </view>
          </view>
        </view>
      </scroll-view>
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

    <!-- 加载更多 -->
    <LoadingMore :loading="loading" :hasMore="hasMore" />
  </view>
</template>

<script>
import RecipeCard from '@/components/RecipeCard.vue'
import LoadingMore from '@/components/LoadingMore.vue'
import { getRecipeList, getHotRecipes } from '@/api/recipe'

export default {
  name: 'Index',
  components: {
    RecipeCard,
    LoadingMore
  },
  data() {
    return {
      recipes: [],
      hotRecipes: [],
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
    this.loadHotRecipes()
    this.loadData()
  },
  onPullDownRefresh() {
    this.page = 1
    this.hasMore = true
    Promise.all([this.loadHotRecipes(), this.loadData()]).then(() => {
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
    async loadHotRecipes() {
      try {
        const res = await getHotRecipes(6)
        this.hotRecipes = Array.isArray(res.data) ? res.data : (res.data.results || [])
      } catch (error) {
        console.error('热门食谱加载失败:', error)
      }
    },

    async loadData() {
      if (this.loading) return
      this.loading = true
      try {
        const params = { page: this.page }
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
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    selectCategory(category) {
      this.currentCategory = category
      this.page = 1
      this.hasMore = true
      this.recipes = []
      this.loadData()
    },

    clearCategoryAndRefresh() {
      this.selectCategory('')
    },

    goToSearch() {
      uni.navigateTo({ url: '/pages/recipe/search' })
    },

    goToRecognize() {
      uni.navigateTo({ url: '/pages/ingredient/recognize' })
    },

    goToDetail(id) {
      uni.navigateTo({ url: `/pages/recipe/detail?id=${id}` })
    }
  }
}
</script>

<style lang="scss" scoped>
.index-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 搜索栏 + 相机按钮 */
.search-area {
  display: flex;
  align-items: center;
  padding: 20rpx 20rpx 0;
  gap: 16rpx;
}

.search-bar {
  flex: 1;
  background-color: #ffffff;
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

.camera-btn {
  width: 80rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.camera-icon {
  font-size: 36rpx;
}

/* 热门推荐 */
.hot-section {
  margin: 20rpx 0 0;
  background-color: #ffffff;
  padding: 20rpx 20rpx 10rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
}

.section-more {
  font-size: 24rpx;
  color: #667eea;
}

.hot-scroll {
  width: 100%;
}

.hot-list {
  display: flex;
  gap: 20rpx;
  padding-bottom: 10rpx;
  width: max-content;
}

.hot-card {
  width: 220rpx;
  background-color: #f9f9f9;
  border-radius: 12rpx;
  overflow: hidden;
  flex-shrink: 0;
}

.hot-cover {
  width: 220rpx;
  height: 160rpx;
}

.hot-info {
  padding: 12rpx 14rpx;
}

.hot-name {
  font-size: 26rpx;
  color: #333333;
  font-weight: 500;
  display: block;
  margin-bottom: 6rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hot-meta {
  font-size: 22rpx;
  color: #999999;
}

/* 分类导航 */
.category-nav {
  background-color: #ffffff;
  padding: 20rpx 0;
  white-space: nowrap;
  margin-top: 20rpx;
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

/* 食谱列表 */
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
</style>
