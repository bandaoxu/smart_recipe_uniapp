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
      <view class="bottom-actions">
        <view class="share-bar-btn" @click="openShareModal">
          <text>分享</text>
        </view>
        <button class="clear-btn" @click="clearPurchased" v-if="purchasedCount > 0">
          清除已购
        </button>
      </view>
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

    <!-- ── 分享设置弹窗 ── -->
    <view class="add-modal" v-if="showShareSetup" @click="showShareSetup = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">分享购物清单</text>
        </view>
        <view class="modal-body">
          <!-- 权限 -->
          <text class="label">分享权限</text>
          <view class="option-row">
            <view
              class="option-btn"
              :class="{ active: shareForm.permission === 'read' }"
              @click="shareForm.permission = 'read'"
            >
              <text>只读</text>
              <text class="option-desc">仅查看，不可修改</text>
            </view>
            <view
              class="option-btn"
              :class="{ active: shareForm.permission === 'edit' }"
              @click="shareForm.permission = 'edit'"
            >
              <text>可编辑</text>
              <text class="option-desc">可标记已购买</text>
            </view>
          </view>
          <!-- 有效期 -->
          <text class="label" style="margin-top: 24rpx;">有效期</text>
          <view class="option-row">
            <view
              class="option-btn small"
              v-for="d in [1, 3, 7, 30]"
              :key="d"
              :class="{ active: shareForm.days === d }"
              @click="shareForm.days = d"
            >
              <text>{{ d }}天</text>
            </view>
          </view>
        </view>
        <view class="modal-actions">
          <button class="cancel-btn" @click="showShareSetup = false">取消</button>
          <button class="submit-btn" @click="doCreateShare" :loading="sharing">生成链接</button>
        </view>
      </view>
    </view>

    <!-- ── 分享操作面板 ── -->
    <view class="add-modal" v-if="showSharePanel" @click="showSharePanel = false">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">分享链接已生成</text>
        </view>
        <view class="modal-body">
          <view class="share-meta">
            <text class="share-meta-text">
              权限：{{ shareResult.permission === 'read' ? '只读' : '可编辑' }}
            </text>
            <text class="share-meta-text">
              有效期至：{{ shareResult.expires_label }}
            </text>
          </view>
          <view class="share-actions">
            <view class="share-action-item" @click="copyShareLink">
              <text class="share-action-icon">📋</text>
              <text class="share-action-text">复制链接</text>
            </view>
            <view class="share-action-item" @click="forwardToFriend">
              <text class="share-action-icon">💬</text>
              <text class="share-action-text">转发给朋友</text>
            </view>
            <view class="share-action-item danger" @click="doRevokeShare">
              <text class="share-action-icon">🗑️</text>
              <text class="share-action-text">撤销链接</text>
            </view>
          </view>
        </view>
        <view class="modal-actions">
          <button class="submit-btn" @click="showSharePanel = false">关闭</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getShoppingList, addShoppingItem, updateShoppingItem, deleteShoppingItem, createShare, revokeShare } from '@/api/shopping'

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
      },
      // 分享
      showShareSetup: false,
      showSharePanel: false,
      sharing: false,
      shareForm: { permission: 'read', days: 7 },
      shareResult: { token: '', permission: 'read', expires_label: '', share_path: '' },
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
  onShareAppMessage() {
    // 支持页面右上角转发（微信小程序）
    if (this.shareResult.token) {
      return {
        title: '我的购物清单',
        path: `/pages/shopping/share?token=${this.shareResult.token}`,
      }
    }
    return { title: '智能食谱 - 购物清单' }
  },
  onPullDownRefresh() {
    this.loadData().then(() => {
      uni.stopPullDownRefresh()
    })
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const res = await getShoppingList()
        this.items = Array.isArray(res.data) ? res.data : (res.data.results || [])
      } catch (error) {
        console.error('加载失败:', error)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    async togglePurchased(item) {
      try {
        await updateShoppingItem(item.id, { is_purchased: !item.is_purchased })
        item.is_purchased = !item.is_purchased
      } catch (error) {
        console.error('更新失败:', error)
        uni.showToast({ title: '操作失败', icon: 'none' })
      }
    },

    deleteItem(itemId) {
      uni.showModal({
        title: '提示',
        content: '确定删除这个食材吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              await deleteShoppingItem(itemId)
              const index = this.items.findIndex(item => item.id === itemId)
              if (index > -1) this.items.splice(index, 1)
              uni.showToast({ title: '删除成功', icon: 'success' })
            } catch (error) {
              console.error('删除失败:', error)
              uni.showToast({ title: '删除失败', icon: 'none' })
            }
          }
        }
      })
    },

    clearPurchased() {
      uni.showModal({
        title: '提示',
        content: '确定清除所有已购买的食材吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const purchasedItems = this.items.filter(item => item.is_purchased)
              for (const item of purchasedItems) {
                await deleteShoppingItem(item.id)
              }
              await this.loadData()
              uni.showToast({ title: '清除成功', icon: 'success' })
            } catch (error) {
              console.error('清除失败:', error)
              uni.showToast({ title: '清除失败', icon: 'none' })
            }
          }
        }
      })
    },

    showAddModal() {
      this.showModal = true
    },

    hideAddModal() {
      this.showModal = false
      this.newItem = { ingredient_name: '', quantity: '', unit: '' }
    },

    async addItem() {
      if (!this.newItem.ingredient_name) {
        uni.showToast({ title: '请输入食材名称', icon: 'none' }); return
      }
      if (!this.newItem.quantity) {
        uni.showToast({ title: '请输入数量', icon: 'none' }); return
      }
      if (!this.newItem.unit) {
        uni.showToast({ title: '请输入单位', icon: 'none' }); return
      }
      this.submitting = true
      try {
        await addShoppingItem(this.newItem)
        uni.showToast({ title: '添加成功', icon: 'success' })
        this.hideAddModal()
        await this.loadData()
      } catch (error) {
        console.error('添加失败:', error)
        uni.showToast({ title: error.message || '添加失败', icon: 'none' })
      } finally {
        this.submitting = false
      }
    },

    // ── 分享 ────────────────────────────────────────────

    openShareModal() {
      this.shareForm = { permission: 'read', days: 7 }
      this.showShareSetup = true
    },

    async doCreateShare() {
      this.sharing = true
      try {
        const res = await createShare(this.shareForm)
        const data = res.data
        // 格式化过期时间（含小时和分钟）
        const expiresAt = new Date(data.expires_at)
        const hours = String(expiresAt.getHours()).padStart(2, '0')
        const minutes = String(expiresAt.getMinutes()).padStart(2, '0')
        const label = `${expiresAt.getMonth() + 1}月${expiresAt.getDate()}日 ${hours}:${minutes}`
        this.shareResult = {
          token: data.token,
          permission: data.permission,
          expires_label: label,
          share_path: data.share_path,
        }
        this.showShareSetup = false
        this.showSharePanel = true
      } catch (error) {
        console.error('创建分享失败:', error)
        uni.showToast({ title: '创建失败', icon: 'none' })
      } finally {
        this.sharing = false
      }
    },

    copyShareLink() {
      const path = this.shareResult.share_path
      uni.setClipboardData({
        data: path,
        success: () => {
          uni.showToast({ title: '链接已复制', icon: 'success' })
        }
      })
    },

    forwardToFriend() {
      uni.showToast({ title: '请点击右上角菜单转发', icon: 'none', duration: 2000 })
    },

    doRevokeShare() {
      uni.showModal({
        title: '撤销分享',
        content: '撤销后，已分享的链接将失效，确定撤销吗？',
        confirmColor: '#ff4d4f',
        success: async (res) => {
          if (res.confirm) {
            try {
              await revokeShare(this.shareResult.token)
              this.shareResult = { token: '', permission: 'read', expires_label: '', share_path: '' }
              this.showSharePanel = false
              uni.showToast({ title: '已撤销', icon: 'none' })
            } catch (error) {
              console.error('撤销失败:', error)
              uni.showToast({ title: '撤销失败', icon: 'none' })
            }
          }
        }
      })
    },
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

.bottom-actions {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.share-bar-btn {
  padding: 16rpx 32rpx;
  border-radius: 10rpx;
  background-color: #667eea;

  text {
    font-size: 26rpx;
    color: #ffffff;
  }
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

/* 分享设置 */
.option-row {
  display: flex;
  gap: 16rpx;
  margin-top: 8rpx;
}

.option-btn {
  flex: 1;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 20rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6rpx;

  text:first-child {
    font-size: 28rpx;
    color: #333333;
    font-weight: 500;
  }

  &.active {
    border-color: #667eea;
    background-color: rgba(102, 126, 234, 0.06);

    text:first-child {
      color: #667eea;
    }
  }

  &.small {
    padding: 16rpx 8rpx;
  }
}

.option-desc {
  font-size: 20rpx;
  color: #999999;
}

/* 分享操作面板 */
.share-meta {
  background-color: #f9f9f9;
  border-radius: 10rpx;
  padding: 20rpx 24rpx;
  margin-bottom: 24rpx;
}

.share-meta-text {
  display: block;
  font-size: 24rpx;
  color: #666666;
  line-height: 2;
}

.share-actions {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.share-action-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx 16rpx;
  border-radius: 12rpx;
  background-color: #f5f5f5;

  &.danger {
    background-color: #fff1f0;
  }
}

.share-action-icon {
  font-size: 36rpx;
}

.share-action-text {
  font-size: 28rpx;
  color: #333333;
}

.share-action-item.danger .share-action-text {
  color: #ff4d4f;
}
</style>
