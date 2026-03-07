<template>
  <view class="recipe-list-container">

    <!-- 筛选栏 -->
    <view class="filter-wrap">

      <!-- 主筛选栏：分类 + 筛选按钮 -->
      <view class="main-filter-bar">
        <view class="category-scroll-wrap">
          <scroll-view scroll-x class="category-scroll" :show-scrollbar="false">
            <view class="category-inner">
              <view
                v-for="c in categories"
                :key="c.value"
                :class="['cat-tag', currentCategory === c.value ? 'active' : '']"
                @click="selectCategory(c.value)"
              >{{ c.text }}</view>
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
import { getRecipeList } from '@/api/recipe'

export default {
  name: 'RecipeList',
  components: { RecipeCard, LoadingMore },
  data() {
    return {
      recipes: [],
      loading: false,
      page: 1,
      hasMore: true,

      showAdvancedFilter: false,

      categories: [
        { text: '全部', value: '' },
        { text: '早餐', value: 'breakfast' },
        { text: '午餐', value: 'lunch' },
        { text: '晚餐', value: 'dinner' },
        { text: '甜品', value: 'dessert' },
        { text: '小吃', value: 'snack' },
        { text: '饮品', value: 'drink' }
      ],
      currentCategory: '',

      difficulties: [
        { text: '全部', value: '' },
        { text: '简单', value: 'easy' },
        { text: '中等', value: 'medium' },
        { text: '困难', value: 'hard' }
      ],
      currentDifficulty: '',

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
      currentCuisine: '',

      sortOptions: [
        { text: '最新', value: '-created_at' },
        { text: '最热', value: '-likes' },
        { text: '最多收藏', value: '-favorites' }
      ],
      currentSort: '-created_at'
    }
  },
  computed: {
    activeAdvancedCount() {
      let count = 0
      if (this.currentDifficulty) count++
      if (this.currentCuisine) count++
      if (this.currentSort !== '-created_at') count++
      return count
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

    reload() {
      this.page = 1
      this.hasMore = true
      this.loadData()
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
    }
  }
}
</script>

<style lang="scss" scoped>
.recipe-list-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* ── 筛选栏整体容器 ─────────────────────────────────────── */
.filter-wrap {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #ffffff;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
}

/* ── 主筛选栏 ────────────────────────────────────────────── */
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
  transition: all 0.2s;

  &.active {
    background-color: #667eea;
    color: #ffffff;
    font-weight: 500;
  }
}

/* 筛选按钮 */
.filter-toggle-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  height: 52rpx;
  padding: 0 20rpx;
  margin-left: 8rpx;
  border-radius: 26rpx;
  border: 2rpx solid #667eea;
  position: relative;
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

/* ── 高级筛选面板 ─────────────────────────────────────────── */
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
  transition: all 0.2s;

  &.active {
    background-color: #667eea;
    color: #ffffff;
    font-weight: 500;
  }
}

/* 底部重置 */
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

/* ── 列表区域 ─────────────────────────────────────────────── */
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
