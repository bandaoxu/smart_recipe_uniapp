<template>
  <view class="shopping-list-container">
    <!-- 购物清单列表 -->
    <view class="list-section" v-if="items.length > 0">
      <view
        class="list-item"
        v-for="item in items"
        :key="item.id"
      >
        <view class="check-icon" @tap="togglePurchased(item)">
          <uni-icons
            :type="item.is_purchased ? 'checkmarkempty' : 'circle'"
            :color="item.is_purchased ? '#3cc51f' : '#cccccc'"
            size="24"
          />
        </view>
        <view class="item-content" :class="{ purchased: item.is_purchased }">
          <text class="item-name">{{ item.ingredient?.name || item.name }}</text>
          <text class="item-quantity">{{ item.quantity }} {{ item.unit }}</text>
        </view>
        <view class="item-actions">
          <text class="delete-btn" @click="deleteItem(item.id)">删除</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else-if="!loading">
      <text class="empty-icon">🛒</text>
      <text class="empty-text">购物清单是空的</text>
      <text class="empty-tip">在食谱详情页添加食材到购物清单</text>
    </view>

    <!-- 加载中 -->
    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>

    <!-- 底部统计 -->
    <view class="bottom-bar" v-if="items.length > 0">
      <view class="stats">
        <text class="stat-text">共 {{ items.length }} 项</text>
        <text class="stat-text">已购 {{ purchasedCount }} 项</text>
      </view>
      <button class="clear-btn" @click="clearPurchased" v-if="purchasedCount > 0">
        清除已购
      </button>
    </view>

    <!-- 添加按钮 -->
    <view class="fab" @click="showAddModal">
      <text class="fab-icon">+</text>
    </view>

    <!-- 添加食材弹窗 -->
    <view class="add-modal" v-if="showModal" @click="hideAddModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">添加食材</text>
        </view>
        <view class="modal-body">
          <view class="form-item">
            <text class="label">食材名称</text>
            <uni-easyinput
              v-model="newItem.ingredient_name"
              placeholder="请输入食材名称"
              :clearable="true"
              :inputBorder="false"
            />
          </view>
          <view class="form-item">
            <text class="label">数量</text>
            <uni-easyinput
              v-model="newItem.quantity"
              placeholder="请输入数量"
              :clearable="true"
              :inputBorder="false"
            />
          </view>
          <view class="form-item">
            <text class="label">单位</text>
            <uni-easyinput
              v-model="newItem.unit"
              placeholder="请输入单位（如：克、个）"
              :clearable="true"
              :inputBorder="false"
            />
          </view>
        </view>
        <view class="modal-actions">
          <button class="cancel-btn" @click="hideAddModal">取消</button>
          <button class="submit-btn" @click="addItem" :loading="submitting">添加</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * list.vue - 购物清单页面
 *
 * 功能：
 * 1. 显示购物清单列表
 * 2. 勾选已购买
 * 3. 删除食材
 * 4. 添加食材
 * 5. 清除已购买的食材
 */

import { getShoppingList, addShoppingItem, updateShoppingItem, deleteShoppingItem } from '@/api/shopping'

export default {
  name: 'ShoppingList',
  data() {
    return {
      items: [],
      loading: false,
      showModal: false,
      submitting: false,
      newItem: {
        ingredient_name: '',
        quantity: '',
        unit: ''
      }
    }
  },
  computed: {
    purchasedCount() {
      return this.items.filter(item => item.is_purchased).length
    }
  },
  onLoad() {
    this.loadData()
  },
  onShow() {
    this.loadData()
  },
  onPullDownRefresh() {
    this.loadData().then(() => {
      uni.stopPullDownRefresh()
    })
  },
  methods: {
    /**
     * 加载数据
     */
    async loadData() {
      this.loading = true

      try {
        const res = await getShoppingList()
        this.items = Array.isArray(res.data) ? res.data : (res.data.results || [])

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
     * 切换购买状态
     */
    async togglePurchased(item) {
      try {
        await updateShoppingItem(item.id, {
          is_purchased: !item.is_purchased
        })

        // 更新本地数据
        item.is_purchased = !item.is_purchased

      } catch (error) {
        console.error('更新失败:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    },

    /**
     * 删除食材
     */
    deleteItem(itemId) {
      uni.showModal({
        title: '提示',
        content: '确定删除这个食材吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await deleteShoppingItem(itemId)

              // 从列表中移除
              const index = this.items.findIndex(item => item.id === itemId)
              if (index > -1) {
                this.items.splice(index, 1)
              }

              uni.showToast({
                title: '删除成功',
                icon: 'success'
              })

            } catch (error) {
              console.error('删除失败:', error)
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    /**
     * 清除已购买的食材
     */
    clearPurchased() {
      uni.showModal({
        title: '提示',
        content: '确定清除所有已购买的食材吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const purchasedItems = this.items.filter(item => item.is_purchased)

              // 逐个删除
              for (const item of purchasedItems) {
                await deleteShoppingItem(item.id)
              }

              // 重新加载数据
              await this.loadData()

              uni.showToast({
                title: '清除成功',
                icon: 'success'
              })

            } catch (error) {
              console.error('清除失败:', error)
              uni.showToast({
                title: '清除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },

    /**
     * 显示添加弹窗
     */
    showAddModal() {
      this.showModal = true
    },

    /**
     * 隐藏添加弹窗
     */
    hideAddModal() {
      this.showModal = false
      this.newItem = {
        ingredient_name: '',
        quantity: '',
        unit: ''
      }
    },

    /**
     * 添加食材
     */
    async addItem() {
      if (!this.newItem.ingredient_name) {
        uni.showToast({
          title: '请输入食材名称',
          icon: 'none'
        })
        return
      }

      if (!this.newItem.quantity) {
        uni.showToast({
          title: '请输入数量',
          icon: 'none'
        })
        return
      }

      if (!this.newItem.unit) {
        uni.showToast({
          title: '请输入单位',
          icon: 'none'
        })
        return
      }

      this.submitting = true

      try {
        await addShoppingItem(this.newItem)

        uni.showToast({
          title: '添加成功',
          icon: 'success'
        })

        this.hideAddModal()

        // 重新加载数据
        await this.loadData()

      } catch (error) {
        console.error('添加失败:', error)
        uni.showToast({
          title: error.message || '添加失败',
          icon: 'none'
        })
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.shopping-list-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 150rpx;
}

.list-section {
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.list-item:last-child {
  border-bottom: none;
}

.item-checkbox {
  margin-right: 20rpx;
}

.item-checkbox ::v-deep .checklist-group {
  margin: 0;
}

.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-content.purchased .item-name {
  text-decoration: line-through;
  color: #999999;
}

.item-name {
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 10rpx;
}

.item-quantity {
  font-size: 24rpx;
  color: #999999;
}

.item-actions {
  margin-left: 20rpx;
}

.delete-btn {
  font-size: 26rpx;
  color: #ff4d4f;
  padding: 10rpx 20rpx;
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

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background-color: #ffffff;
  border-top: 1rpx solid #f0f0f0;
  z-index: 100;
}

.stats {
  display: flex;
  flex-direction: column;
}

.stat-text {
  font-size: 24rpx;
  color: #999999;
  margin-bottom: 5rpx;
}

.clear-btn {
  padding: 20rpx 40rpx;
  background-color: #ff4d4f;
  border-radius: 10rpx;
  font-size: 26rpx;
  color: #ffffff;
  border: none;
}

.clear-btn::after {
  border: none;
}

.fab {
  position: fixed;
  right: 40rpx;
  bottom: 120rpx;
  width: 120rpx;
  height: 120rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 24rpx rgba(102, 126, 234, 0.4);
  z-index: 100;
}

.fab-icon {
  font-size: 60rpx;
  color: #ffffff;
}

.add-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 600rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
}

.modal-header {
  padding: 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.modal-body {
  padding: 40rpx;
}

.form-item {
  margin-bottom: 30rpx;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-item ::v-deep .uni-easyinput__content {
  background-color: #f5f5f5;
  border-radius: 8rpx;
  height: 70rpx;
}

.form-item ::v-deep .uni-easyinput__content-input {
  font-size: 28rpx;
  color: #333333;
  height: 70rpx;
}

.label {
  display: block;
  font-size: 26rpx;
  color: #666666;
  margin-bottom: 15rpx;
}

/* 移除原生 input 样式，已被 uni-easyinput 替代 */

.modal-actions {
  display: flex;
  border-top: 1rpx solid #f0f0f0;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  height: 100rpx;
  font-size: 28rpx;
  border: none;
  border-radius: 0;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666666;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.cancel-btn::after,
.submit-btn::after {
  border: none;
}
</style>
