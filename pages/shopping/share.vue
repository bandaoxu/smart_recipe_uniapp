<template>
  <view class="share-container">
    <!-- 加载中 -->
    <view class="loading-state" v-if="loading">
      <text>加载中...</text>
    </view>

    <!-- 链接无效/已过期 -->
    <view class="error-state" v-else-if="error">
      <text class="error-icon">🔗</text>
      <text class="error-title">链接已失效</text>
      <text class="error-desc">{{ error }}</text>
    </view>

    <!-- 正常内容 -->
    <template v-else>
      <!-- 分享信息头 -->
      <view class="share-header">
        <view class="owner-row">
          <text class="owner-name">{{ meta.owner_name }}</text>
          <text class="owner-label">的购物清单</text>
        </view>
        <view class="meta-row">
          <view class="permission-tag" :class="meta.permission">
            <text>{{ meta.permission === 'edit' ? '可标记购买' : '只读' }}</text>
          </view>
          <text class="expire-text">有效期至 {{ expireLabel }}</text>
        </view>
      </view>

      <!-- 统计 -->
      <view class="stat-bar">
        <text class="stat-num">{{ items.length }}</text>
        <text class="stat-unit">项食材</text>
        <text class="stat-divider">·</text>
        <text class="stat-num">{{ purchasedCount }}</text>
        <text class="stat-unit">已购</text>
      </view>

      <!-- 清单列表 -->
      <view class="list-section" v-if="items.length > 0">
        <view class="list-group" v-for="(group, gIdx) in itemGroups" :key="gIdx">
          <view class="group-header" v-if="group.label">
            <text class="group-label">{{ group.label }}</text>
          </view>
          <view
            class="list-item"
            v-for="item in group.items"
            :key="item.id"
          >
            <view
              class="check-box"
              :class="{ checked: item.is_purchased, disabled: meta.permission !== 'edit' }"
              @click="toggleItem(item)"
            >
              <text class="check-mark" v-if="item.is_purchased">✓</text>
            </view>
            <view class="item-info" :class="{ purchased: item.is_purchased }">
              <text class="item-name">{{ item.ingredient?.name || item.name || '未知食材' }}</text>
              <text class="item-qty">{{ item.quantity }} {{ item.unit }}</text>
            </view>
          </view>
        </view>
      </view>

      <view class="empty-tip" v-else>
        <text>清单暂无食材</text>
      </view>

      <!-- 只读提示 -->
      <view class="readonly-tip" v-if="meta.permission === 'read'">
        <text>此链接为只读，无法修改购买状态</text>
      </view>
    </template>
  </view>
</template>

<script>
import { getSharedList, updateSharedItem } from '@/api/shopping'

export default {
  name: 'SharedShoppingList',
  data() {
    return {
      token: '',
      loading: true,
      error: '',
      items: [],
      meta: { owner_name: '', permission: 'read', expires_at: '' },
    }
  },
  computed: {
    purchasedCount() {
      return this.items.filter(i => i.is_purchased).length
    },
    expireLabel() {
      if (!this.meta.expires_at) return ''
      const d = new Date(this.meta.expires_at)
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    },
    // 按"未购买/已购买"分两组
    itemGroups() {
      const unpurchased = this.items.filter(i => !i.is_purchased)
      const purchased   = this.items.filter(i => i.is_purchased)
      const groups = []
      if (unpurchased.length) groups.push({ label: '', items: unpurchased })
      if (purchased.length)   groups.push({ label: '已购买', items: purchased })
      return groups
    },
  },
  onLoad(options) {
    this.token = options.token || ''
    if (!this.token) {
      this.loading = false
      this.error = '无效的分享链接'
      return
    }
    this.loadSharedList()
  },
  methods: {
    async loadSharedList() {
      this.loading = true
      this.error = ''
      try {
        const res = await getSharedList(this.token)
        const data = res.data
        this.items = data.items || []
        this.meta  = data.meta  || {}
        uni.setNavigationBarTitle({ title: `${this.meta.owner_name || ''}的购物清单` })
      } catch (err) {
        this.error = err?.message || '链接无效或已过期'
      } finally {
        this.loading = false
      }
    },

    async toggleItem(item) {
      if (this.meta.permission !== 'edit') return
      const next = !item.is_purchased
      // 乐观更新
      item.is_purchased = next
      try {
        await updateSharedItem(this.token, item.id, { is_purchased: next })
      } catch (err) {
        // 回滚
        item.is_purchased = !next
        uni.showToast({ title: '操作失败', icon: 'none' })
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.share-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 60rpx;
}

/* 状态页 */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 200rpx 40rpx;
  color: #999999;
  font-size: 28rpx;
}

.error-icon {
  font-size: 100rpx;
  margin-bottom: 30rpx;
}

.error-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333333;
  margin-bottom: 16rpx;
}

.error-desc {
  font-size: 26rpx;
  color: #999999;
  text-align: center;
}

/* 头部信息 */
.share-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40rpx 32rpx 30rpx;
}

.owner-row {
  display: flex;
  align-items: baseline;
  gap: 8rpx;
  margin-bottom: 16rpx;
}

.owner-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #ffffff;
}

.owner-label {
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.permission-tag {
  padding: 6rpx 18rpx;
  border-radius: 20rpx;
  background-color: rgba(255, 255, 255, 0.2);

  text {
    font-size: 22rpx;
    color: #ffffff;
  }

  &.edit {
    background-color: rgba(82, 196, 26, 0.35);
  }
}

.expire-text {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.7);
}

/* 统计条 */
.stat-bar {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
  padding: 20rpx 32rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;
}

.stat-num {
  font-size: 36rpx;
  font-weight: bold;
  color: #667eea;
}

.stat-unit {
  font-size: 24rpx;
  color: #999999;
}

.stat-divider {
  font-size: 24rpx;
  color: #cccccc;
  margin: 0 8rpx;
}

/* 清单 */
.list-section {
  margin: 20rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.group-header {
  padding: 16rpx 24rpx 8rpx;
  background-color: #f9f9f9;
}

.group-label {
  font-size: 22rpx;
  color: #999999;
  font-weight: 500;
}

.list-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #f5f5f5;

  &:last-child {
    border-bottom: none;
  }
}

.check-box {
  width: 48rpx;
  height: 48rpx;
  border-radius: 24rpx;
  border: 3rpx solid #d9d9d9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 24rpx;
  flex-shrink: 0;
  transition: all 0.2s;

  &.checked {
    background-color: #3cc51f;
    border-color: #3cc51f;
  }

  &:not(.disabled):not(.checked) {
    border-color: #667eea;
  }
}

.check-mark {
  font-size: 26rpx;
  color: #ffffff;
  font-weight: bold;
}

.item-info {
  flex: 1;

  &.purchased .item-name {
    text-decoration: line-through;
    color: #bbbbbb;
  }
}

.item-name {
  display: block;
  font-size: 30rpx;
  color: #333333;
  margin-bottom: 6rpx;
}

.item-qty {
  font-size: 24rpx;
  color: #999999;
}

.empty-tip {
  text-align: center;
  padding: 80rpx 0;
  font-size: 28rpx;
  color: #cccccc;
}

.readonly-tip {
  text-align: center;
  padding: 24rpx;
  font-size: 22rpx;
  color: #cccccc;
}
</style>
