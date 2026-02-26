<template>
  <view class="recipe-list-container">
    <!-- 筛选栏 -->
    <view class="filter-bar">
      <!-- 分类筛选 -->
      <view class="filter-item">
        <uni-data-picker
          v-model="currentCategory"
          :localdata="categories"
          placeholder="分类"
          @change="onCategoryChange"
        />
      </view>

      <!-- 难度筛选 -->
      <view class="filter-item">
        <uni-data-picker
          v-model="currentDifficulty"
          :localdata="difficulties"
          placeholder="难度"
          @change="onDifficultyChange"
        />
      </view>

      <!-- 菜系筛选 -->
      <view class="filter-item">
        <uni-data-picker
          v-model="currentCuisine"
          :localdata="cuisines"
          placeholder="菜系"
          @change="onCuisineChange"
        />
      </view>

      <!-- 排序 -->
      <view class="filter-item">
        <uni-data-picker
          v-model="currentSort"
          :localdata="sortOptions"
          placeholder="排序"
          @change="onSortChange"
        />
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

    <!-- 加载中 -->
    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script>
/**
 * list.vue - 食谱列表页面
 *
 * 功能：
 * 1. 显示食谱列表
 * 2. 分类筛选（早餐、午餐、晚餐等）
 * 3. 难度筛选（简单、中等、困难）
 * 4. 菜系筛选（中餐、粤菜、川菜等）
 * 5. 排序（最新、最热、最多收藏）
 * 6. 下拉刷新、上拉加载更多
 */

import RecipeCard from '@/components/RecipeCard.vue'
import { getRecipeList } from '@/api/recipe'

export default {
  name: 'RecipeList',
  components: {
    RecipeCard
  },
  data() {
    return {
      recipes: [],
      loading: false,
      page: 1,
      hasMore: true,

      // 分类选项
      categories: [
        { text: '全部分类', value: '' },
        { text: '早餐', value: 'breakfast' },
        { text: '午餐', value: 'lunch' },
        { text: '晚餐', value: 'dinner' },
        { text: '甜品', value: 'dessert' },
        { text: '小吃', value: 'snack' },
        { text: '饮品', value: 'drink' }
      ],
      currentCategory: '',

      // 难度选项
      difficulties: [
        { text: '全部难度', value: '' },
        { text: '简单', value: 'easy' },
        { text: '中等', value: 'medium' },
        { text: '困难', value: 'hard' }
      ],
      currentDifficulty: '',

      // 菜系选项
      cuisines: [
        { text: '全部菜系', value: '' },
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

      // 排序选项
      sortOptions: [
        { text: '最新', value: '-created_at' },
        { text: '最热', value: '-likes' },
        { text: '最多收藏', value: '-favorites' }
      ],
      currentSort: '-created_at'
    }
  },
  computed: {
    // 移除 computed 属性，uni-data-picker 直接使用 v-model
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
          page: this.page,
          ordering: this.currentSort
        }

        // 添加筛选条件
        if (this.currentCategory) {
          params.category = this.currentCategory
        }
        if (this.currentDifficulty) {
          params.difficulty = this.currentDifficulty
        }
        if (this.currentCuisine) {
          params.cuisine = this.currentCuisine
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
     * 分类筛选变化
     */
    onCategoryChange() {
      this.page = 1
      this.hasMore = true
      this.loadData()
    },

    /**
     * 难度筛选变化
     */
    onDifficultyChange() {
      this.page = 1
      this.hasMore = true
      this.loadData()
    },

    /**
     * 菜系筛选变化
     */
    onCuisineChange() {
      this.page = 1
      this.hasMore = true
      this.loadData()
    },

    /**
     * 排序变化
     */
    onSortChange() {
      this.page = 1
      this.hasMore = true
      this.loadData()
    }
  }
}
</script>

<style lang="scss" scoped>
.recipe-list-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.filter-bar {
  display: flex;
  background-color: #ffffff;
  padding: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 100;
}

.filter-item {
  flex: 1;
  margin: 0 10rpx;
}

.filter-item ::v-deep .uni-data-picker {
  background-color: #f5f5f5;
  border-radius: 8rpx;
  height: 60rpx;
}

/* 移除原生 picker 样式，已被 uni-data-picker 替代 */

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

.loading {
  text-align: center;
  padding: 40rpx 0;
  font-size: 28rpx;
  color: #999999;
}
</style>
