<template>
  <view class="my-recipes-container">
    <!-- 食谱列表 -->
    <view class="recipe-list" v-if="recipes.length > 0">
      <view
        class="recipe-item-wrap"
        v-for="recipe in recipes"
        :key="recipe.id"
        @longpress="handleLongPress(recipe)"
      >
        <RecipeCard :recipe="recipe" />
        <!-- 编辑/删除快捷按钮 -->
        <view class="recipe-actions">
          <view class="action-btn edit-btn" @click.stop="editRecipe(recipe)">
            <text>编辑</text>
          </view>
          <view class="action-btn delete-btn" @click.stop="confirmDelete(recipe)">
            <text>删除</text>
          </view>
        </view>
      </view>
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

    <!-- 浮动创建按钮（始终可见） -->
    <view class="fab" @click="goToCreate">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script>
/**
 * my-recipes.vue - 我的食谱页面
 *
 * 功能：
 * 1. 显示用户创建的食谱列表
 * 2. 编辑/删除食谱
 * 3. 下拉刷新、上拉加载更多
 */

import RecipeCard from '@/components/RecipeCard.vue'
import { getMyRecipes, deleteRecipe } from '@/api/recipe'

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
  onShow() {
    // 从编辑页返回时刷新列表
    this.page = 1
    this.hasMore = true
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
    },

    /**
     * 编辑食谱
     */
    editRecipe(recipe) {
      uni.navigateTo({
        url: `/pages/recipe/edit?id=${recipe.id}`
      })
    },

    /**
     * 长按弹出操作菜单
     */
    handleLongPress(recipe) {
      uni.showActionSheet({
        itemList: ['编辑食谱', '删除食谱'],
        success: (res) => {
          if (res.tapIndex === 0) {
            this.editRecipe(recipe)
          } else if (res.tapIndex === 1) {
            this.confirmDelete(recipe)
          }
        }
      })
    },

    /**
     * 确认删除食谱
     */
    confirmDelete(recipe) {
      uni.showModal({
        title: '确认删除',
        content: `确定删除「${recipe.name}」吗？删除后不可恢复。`,
        confirmColor: '#ff4d4f',
        success: async (res) => {
          if (res.confirm) {
            try {
              await deleteRecipe(recipe.id)
              this.recipes = this.recipes.filter(r => r.id !== recipe.id)
              uni.showToast({ title: '已删除', icon: 'success' })
            } catch (error) {
              console.error('删除失败:', error)
            }
          }
        }
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

.recipe-item-wrap {
  position: relative;
  margin-bottom: 20rpx;
}

.recipe-actions {
  position: absolute;
  top: 20rpx;
  right: 20rpx;
  display: flex;
  gap: 12rpx;
  z-index: 10;
}

.action-btn {
  padding: 10rpx 24rpx;
  border-radius: 20rpx;
  font-size: 24rpx;
}

.edit-btn {
  background-color: #667eea;
  color: #ffffff;
}

.delete-btn {
  background-color: #ff4d4f;
  color: #ffffff;
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

.fab {
  position: fixed;
  right: 40rpx;
  bottom: 60rpx;
  width: 100rpx;
  height: 100rpx;
  border-radius: 50rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
}

.fab-icon {
  font-size: 60rpx;
  color: #ffffff;
  line-height: 1;
}
</style>
