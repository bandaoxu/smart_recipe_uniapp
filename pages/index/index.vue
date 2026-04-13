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
              :src="localHotCoverPaths[r.id] || $media(r.cover_image, '/static/images/default-recipe.svg')"
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

    <!-- 折叠筛选栏 -->
    <view class="filter-wrap">

      <!-- 主筛选栏：分类 + 筛选按钮 -->
      <view class="main-filter-bar">
        <view class="category-scroll-wrap">
          <scroll-view scroll-x class="category-scroll" :show-scrollbar="false">
            <view class="category-inner">
              <view
                v-for="item in categories"
                :key="item.value"
                :class="['cat-tag', currentCategory === item.value ? 'active' : '']"
                @click="selectCategory(item.value)"
              >{{ item.label }}</view>
            </view>
          </scroll-view>
        </view>

        <view class="filter-toggle-btn" @click="toggleAdvanced">
          <text class="filter-btn-text">筛选</text>
          <view v-if="activeAdvancedCount > 0" class="filter-badge">{{ activeAdvancedCount }}</view>
          <text class="filter-arrow" :class="showAdvancedFilter ? 'arrow-up' : ''">▾</text>
        </view>
      </view>

      <!-- 高级筛选面板 -->
      <view v-show="showAdvancedFilter" class="advanced-panel">

        <!-- 难度 -->
        <view class="filter-row">
          <text class="row-label">难度</text>
          <view class="tags-scroll-wrap">
            <scroll-view scroll-x class="tags-scroll" :show-scrollbar="false">
              <view class="tags-inner">
                <view
                  v-for="d in difficulties"
                  :key="d.value"
                  :class="['option-tag', currentDifficulty === d.value ? 'active' : '']"
                  @click="selectDifficulty(d.value)"
                >{{ d.text }}</view>
              </view>
            </scroll-view>
          </view>
        </view>

        <!-- 菜系 -->
        <view class="filter-row">
          <text class="row-label">菜系</text>
          <view class="tags-scroll-wrap">
            <scroll-view scroll-x class="tags-scroll" :show-scrollbar="false">
              <view class="tags-inner">
                <view
                  v-for="cu in cuisines"
                  :key="cu.value"
                  :class="['option-tag', currentCuisine === cu.value ? 'active' : '']"
                  @click="selectCuisine(cu.value)"
                >{{ cu.text }}</view>
              </view>
            </scroll-view>
          </view>
        </view>

        <!-- 排序 -->
        <view class="filter-row">
          <text class="row-label">排序</text>
          <view class="tags-scroll-wrap">
            <scroll-view scroll-x class="tags-scroll" :show-scrollbar="false">
              <view class="tags-inner">
                <view
                  v-for="s in sortOptions"
                  :key="s.value"
                  :class="['option-tag', currentSort === s.value ? 'active' : '']"
                  @click="selectSort(s.value)"
                >{{ s.text }}</view>
              </view>
            </scroll-view>
          </view>
        </view>

        <!-- 底部重置 -->
        <view class="panel-footer">
          <view class="reset-btn" @click="resetAdvanced">重置筛选</view>
        </view>

      </view>
    </view>

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
  components: { RecipeCard, LoadingMore },
  data() {
    return {
      recipes: [],
      hotRecipes: [],
      loading: false,
      page: 1,
      hasMore: true,
      // 本地图片路径（热门推荐）
      localHotCoverPaths: {},

      showAdvancedFilter: false,

      currentCategory: '',
      categories: [
        { label: '全部', value: '' },
        { label: '早餐', value: 'breakfast' },
        { label: '午餐', value: 'lunch' },
        { label: '晚餐', value: 'dinner' },
        { label: '甜品', value: 'dessert' },
        { label: '小吃', value: 'snack' },
        { label: '饮品', value: 'soup' }
      ],

      currentDifficulty: '',
      difficulties: [
        { text: '全部', value: '' },
        { text: '简单', value: 'easy' },
        { text: '中等', value: 'medium' },
        { text: '困难', value: 'hard' }
      ],

      currentCuisine: '',
      cuisines: [
        { text: '全部', value: '' },
        { text: '中餐', value: 'chinese' },
        { text: '粤菜', value: 'cantonese' },
        { text: '川菜', value: 'sichuan' },
        { text: '湘菜', value: 'hunan' },
        { text: '鲁菜', value: 'shandong' },
        { text: '西餐', value: 'western' },
        { text: '日料', value: 'japanese' },
        { text: '韩餐', value: 'korean' }
      ],

      currentSort: '-created_at',
      sortOptions: [
        { text: '最新', value: '-created_at' },
        { text: '最热', value: '-likes' },
        { text: '最多收藏', value: '-favorites' }
      ]
    }
  },
  computed: {
    activeAdvancedCount() {
      let n = 0
      if (this.currentDifficulty) n++
      if (this.currentCuisine) n++
      if (this.currentSort !== '-created_at') n++
      return n
    }
  },
  watch: {
    hotRecipes: {
      handler(newRecipes) {
        if (newRecipes && newRecipes.length > 0) {
          this.downloadHotImages()
        }
      },
      immediate: true
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

    /**
     * 下载热门推荐图片到本地
     */
    async downloadHotImages() {
      try {
        for (let i = 0; i < this.hotRecipes.length; i++) {
          const recipe = this.hotRecipes[i]
          if (recipe.cover_image) {
            await this.downloadHotImage(recipe.id, recipe.cover_image)
          }
        }
      } catch (error) {
        console.error('[首页] 下载热门图片失败:', error)
      }
    },

    /**
     * 下载单个热门图片
     */
    async downloadHotImage(recipeId, url) {
      try {
        const fullUrl = this.$media(url)
        const res = await uni.downloadFile({
          url: fullUrl,
          timeout: 30000
        })
        
        if (res.statusCode === 200 && res.tempFilePath) {
          this.$set(this.localHotCoverPaths, recipeId, res.tempFilePath)
          console.log(`[首页] 热门${recipeId}封面下载成功:`, res.tempFilePath)
        }
      } catch (error) {
        console.error(`[首页] 下载热门${recipeId}封面失败:`, error)
      }
    },

    async loadData() {
      if (this.loading) return
      this.loading = true
      try {
        const params = { page: this.page, ordering: this.currentSort }
        if (this.currentCategory) params.category = this.currentCategory
        if (this.currentDifficulty) params.difficulty = this.currentDifficulty
        if (this.currentCuisine) params.cuisine_type = this.currentCuisine

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

    reload() {
      this.page = 1
      this.hasMore = true
      this.recipes = []
      this.loadData()
    },

    toggleAdvanced() {
      this.showAdvancedFilter = !this.showAdvancedFilter
    },

    selectCategory(value) {
      this.currentCategory = value
      this.reload()
    },

    selectDifficulty(value) {
      this.currentDifficulty = value
      this.reload()
    },

    selectCuisine(value) {
      this.currentCuisine = value
      this.reload()
    },

    selectSort(value) {
      this.currentSort = value
      this.reload()
    },

    resetAdvanced() {
      this.currentDifficulty = ''
      this.currentCuisine = ''
      this.currentSort = '-created_at'
      this.reload()
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

/* 搜索栏 */
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

/* 折叠筛选栏 */
.filter-wrap {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #ffffff;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
  margin-top: 20rpx;
}

.main-filter-bar {
  display: flex;
  align-items: center;
  height: 88rpx;
  padding: 0 24rpx 0 16rpx;
}

.category-scroll-wrap {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  height: 88rpx;
}

.category-scroll {
  width: 100%;
  height: 88rpx;
  white-space: nowrap;
}

.category-inner {
  display: inline-flex;
  align-items: center;
  height: 88rpx;
  padding-right: 16rpx;
}

.cat-tag {
  display: inline-flex;
  align-items: center;
  height: 52rpx;
  padding: 0 24rpx;
  margin-right: 12rpx;
  border-radius: 26rpx;
  font-size: 26rpx;
  color: #666666;
  background-color: #f5f5f5;
  white-space: nowrap;

  &.active {
    background-color: #667eea;
    color: #ffffff;
    font-weight: 500;
  }
}

.filter-toggle-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  height: 52rpx;
  padding: 0 20rpx;
  margin-left: 8rpx;
  border-radius: 26rpx;
  border: 2rpx solid #667eea;
}

.filter-btn-text {
  font-size: 26rpx;
  color: #667eea;
  font-weight: 500;
}

.filter-badge {
  min-width: 32rpx;
  height: 32rpx;
  padding: 0 8rpx;
  border-radius: 16rpx;
  background-color: #ff4757;
  color: #ffffff;
  font-size: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 6rpx;
}

.filter-arrow {
  font-size: 22rpx;
  color: #667eea;
  margin-left: 4rpx;
  display: inline-block;
  transition: transform 0.25s;

  &.arrow-up {
    transform: rotate(180deg);
  }
}

.advanced-panel {
  border-top: 2rpx solid #f0f0f0;
  padding: 16rpx 24rpx 8rpx;
  background-color: #ffffff;
}

.filter-row {
  display: flex;
  align-items: center;
  min-height: 72rpx;
  margin-bottom: 8rpx;
}

.row-label {
  flex-shrink: 0;
  width: 72rpx;
  font-size: 24rpx;
  color: #999999;
  margin-right: 12rpx;
}

.tags-scroll-wrap {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.tags-scroll {
  width: 100%;
  white-space: nowrap;
}

.tags-inner {
  display: inline-flex;
  align-items: center;
  padding: 4rpx 0;
}

.option-tag {
  display: inline-flex;
  align-items: center;
  height: 52rpx;
  padding: 0 24rpx;
  margin-right: 12rpx;
  border-radius: 26rpx;
  font-size: 24rpx;
  color: #666666;
  background-color: #f5f5f5;
  white-space: nowrap;

  &.active {
    background-color: #667eea;
    color: #ffffff;
    font-weight: 500;
  }
}

.panel-footer {
  display: flex;
  justify-content: flex-end;
  padding: 8rpx 0 12rpx;
  border-top: 2rpx solid #f5f5f5;
  margin-top: 8rpx;
}

.reset-btn {
  font-size: 24rpx;
  color: #999999;
  padding: 8rpx 16rpx;
}

/* 食谱列表 */
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
  font-size: 28rpx;
  color: #999999;
}
</style>