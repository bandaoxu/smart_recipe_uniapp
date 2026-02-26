<template>
  <view class="search-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <view class="search-input-wrapper">
        <text class="search-icon">🔍</text>
        <uni-easyinput
          class="search-input"
          v-model="keyword"
          placeholder="搜索食谱名称、食材"
          :inputBorder="false"
          @confirm="handleSearch"
          confirmType="search"
        />
        <text class="clear-icon" v-if="keyword" @click="clearKeyword">✕</text>
      </view>
      <button class="search-btn" @click="handleSearch">搜索</button>
    </view>

    <!-- 搜索历史 -->
    <view class="search-history" v-if="!keyword && searchHistory.length > 0">
      <view class="history-header">
        <text class="history-title">搜索历史</text>
        <text class="clear-history" @click="clearHistory">清空</text>
      </view>
      <view class="history-tags">
        <view
          class="history-tag"
          v-for="(item, index) in searchHistory"
          :key="index"
          @click="selectHistory(item)"
        >
          {{ item }}
        </view>
      </view>
    </view>

    <!-- 热门搜索 -->
    <view class="hot-search" v-if="!keyword && hotKeywords.length > 0">
      <view class="hot-header">
        <text class="hot-title">热门搜索</text>
      </view>
      <view class="hot-tags">
        <view
          class="hot-tag"
          v-for="(item, index) in hotKeywords"
          :key="index"
          @click="selectHotKeyword(item)"
        >
          {{ item }}
        </view>
      </view>
    </view>

    <!-- 搜索结果 -->
    <view class="search-results" v-if="keyword && recipes.length > 0">
      <view class="result-header">
        <text class="result-count">找到 {{ totalCount }} 个结果</text>
      </view>
      <RecipeCard
        v-for="recipe in recipes"
        :key="recipe.id"
        :recipe="recipe"
      />
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="keyword && !loading && recipes.length === 0">
      <text class="empty-icon">🔍</text>
      <text class="empty-text">没有找到相关食谱</text>
      <text class="empty-tip">试试其他关键词吧</text>
    </view>

    <!-- 加载中 -->
    <view class="loading" v-if="loading">
      <text>搜索中...</text>
    </view>
  </view>
</template>

<script>
/**
 * search.vue - 食谱搜索页面
 *
 * 功能：
 * 1. 搜索框输入
 * 2. 搜索历史记录
 * 3. 热门搜索推荐
 * 4. 搜索结果展示
 * 5. 上拉加载更多
 */

import RecipeCard from '@/components/RecipeCard.vue'
import { searchRecipes } from '@/api/recipe'
import { useAppStore } from '@/store'

export default {
  name: 'RecipeSearch',
  components: {
    RecipeCard
  },
  data() {
    return {
      keyword: '',
      recipes: [],
      loading: false,
      page: 1,
      hasMore: true,
      totalCount: 0,

      // 热门搜索关键词
      hotKeywords: [
        '红烧肉',
        '宫保鸡丁',
        '麻婆豆腐',
        '糖醋排骨',
        '西红柿炒鸡蛋',
        '鱼香肉丝',
        '水煮鱼',
        '蛋炒饭'
      ]
    }
  },
  computed: {
    searchHistory() {
      const appStore = useAppStore()
      return appStore.searchHistory || []
    }
  },
  onReachBottom() {
    if (this.keyword && this.hasMore && !this.loading) {
      this.page++
      this.loadData()
    }
  },
  methods: {
    /**
     * 执行搜索
     */
    handleSearch() {
      if (!this.keyword.trim()) {
        uni.showToast({
          title: '请输入搜索关键词',
          icon: 'none'
        })
        return
      }

      // 保存到搜索历史
      this.saveToHistory(this.keyword)

      // 重置分页
      this.page = 1
      this.hasMore = true
      this.recipes = []

      // 加载数据
      this.loadData()
    },

    /**
     * 加载搜索结果
     */
    async loadData() {
      if (this.loading) return

      this.loading = true

      try {
        const res = await searchRecipes({
          keyword: this.keyword,
          page: this.page
        })

        if (this.page === 1) {
          this.recipes = res.data.results || []
          this.totalCount = res.data.count || 0
        } else {
          this.recipes = [...this.recipes, ...(res.data.results || [])]
        }

        this.hasMore = res.data.next !== null

      } catch (error) {
        console.error('搜索失败:', error)
        uni.showToast({
          title: '搜索失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    },

    /**
     * 清空关键词
     */
    clearKeyword() {
      this.keyword = ''
      this.recipes = []
      this.totalCount = 0
    },

    /**
     * 选择历史记录
     */
    selectHistory(keyword) {
      this.keyword = keyword
      this.handleSearch()
    },

    /**
     * 选择热门关键词
     */
    selectHotKeyword(keyword) {
      this.keyword = keyword
      this.handleSearch()
    },

    /**
     * 保存到搜索历史
     */
    saveToHistory(keyword) {
      const appStore = useAppStore()
      appStore.addSearchHistory(keyword)
    },

    /**
     * 清空搜索历史
     */
    clearHistory() {
      uni.showModal({
        title: '提示',
        content: '确定清空搜索历史吗？',
        success: (res) => {
          if (res.confirm) {
            const appStore = useAppStore()
            appStore.clearSearchHistory()
            uni.showToast({
              title: '已清空',
              icon: 'success'
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.search-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #ffffff;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.search-input-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  height: 70rpx;
  background-color: #f5f5f5;
  border-radius: 35rpx;
  padding: 0 30rpx;
  margin-right: 20rpx;
}

.search-icon {
  font-size: 32rpx;
  margin-right: 10rpx;
}

.search-input {
  flex: 1;
}

.search-input ::v-deep .uni-easyinput__content {
  background-color: transparent;
  border-radius: 0;
  padding: 0;
}

.search-input ::v-deep .uni-easyinput__content-input {
  font-size: 28rpx;
  color: #333333;
}

/* 移除原生 input 样式，已被 uni-easyinput 替代 */

.clear-icon {
  font-size: 32rpx;
  color: #999999;
  padding: 0 10rpx;
}

.search-btn {
  width: 120rpx;
  height: 70rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 35rpx;
  font-size: 28rpx;
  color: #ffffff;
  border: none;
  line-height: 70rpx;
  padding: 0;
}

.search-btn::after {
  border: none;
}

.search-history,
.hot-search {
  background-color: #ffffff;
  margin: 20rpx;
  padding: 30rpx;
  border-radius: 16rpx;
}

.history-header,
.hot-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 30rpx;
}

.history-title,
.hot-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.clear-history {
  font-size: 26rpx;
  color: #999999;
}

.history-tags,
.hot-tags {
  display: flex;
  flex-wrap: wrap;
}

.history-tag,
.hot-tag {
  padding: 16rpx 32rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  font-size: 26rpx;
  color: #666666;
  margin-right: 20rpx;
  margin-bottom: 20rpx;
}

.hot-tag {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  color: #667eea;
}

.search-results {
  padding: 20rpx;
}

.result-header {
  margin-bottom: 20rpx;
}

.result-count {
  font-size: 26rpx;
  color: #999999;
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
  margin-bottom: 10rpx;
}

.empty-tip {
  font-size: 24rpx;
  color: #cccccc;
}

.loading {
  text-align: center;
  padding: 40rpx 0;
  font-size: 28rpx;
  color: #999999;
}
</style>
