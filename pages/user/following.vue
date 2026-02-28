<template>
  <view class="following-container">
    <!-- 加载中 -->
    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else-if="list.length === 0">
      <text class="empty-icon">👥</text>
      <text class="empty-text">还没有关注任何人</text>
      <text class="empty-sub">去社区发现感兴趣的用户吧~</text>
    </view>

    <!-- 关注列表 -->
    <view class="user-list" v-else>
      <view class="user-item" v-for="user in list" :key="user.id">
        <view class="user-main" @click="goToProfile(user.id)">
          <image class="avatar" :src="user.avatar || '/static/images/default-avatar.svg'" mode="aspectFill" />
          <view class="user-info">
            <text class="nickname">{{ user.nickname }}</text>
            <text class="username">@{{ user.username }}</text>
          </view>
        </view>
        <view class="unfollow-btn" @click="handleUnfollow(user)">
          <text>已关注</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getFollowing, unfollowUser } from '@/api/user'

export default {
  name: 'Following',
  data() {
    return {
      list: [],
      loading: false
    }
  },
  onLoad() {
    this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        const res = await getFollowing()
        this.list = res.data || []
      } catch (error) {
        console.error('加载失败:', error)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    goToProfile(userId) {
      uni.navigateTo({ url: `/pages/user/other-profile?id=${userId}` })
    },

    handleUnfollow(user) {
      uni.showModal({
        title: '取消关注',
        content: `确定取消关注「${user.nickname}」吗？`,
        confirmColor: '#ff4d4f',
        success: async (res) => {
          if (res.confirm) {
            try {
              await unfollowUser(user.id)
              this.list = this.list.filter(u => u.id !== user.id)
              uni.showToast({ title: '已取消关注', icon: 'none' })
            } catch (error) {
              console.error('操作失败:', error)
            }
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.following-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.loading {
  text-align: center;
  padding: 100rpx 0;
  font-size: 28rpx;
  color: #999999;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx 0;
}

.empty-icon {
  font-size: 100rpx;
  margin-bottom: 30rpx;
}

.empty-text {
  font-size: 30rpx;
  color: #666666;
  margin-bottom: 16rpx;
}

.empty-sub {
  font-size: 26rpx;
  color: #999999;
}

.user-list {
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.user-item:last-child {
  border-bottom: none;
}

.user-main {
  display: flex;
  align-items: center;
  flex: 1;
}

.avatar {
  width: 90rpx;
  height: 90rpx;
  border-radius: 45rpx;
  margin-right: 20rpx;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.nickname {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
  margin-bottom: 6rpx;
}

.username {
  font-size: 24rpx;
  color: #999999;
}

.unfollow-btn {
  padding: 12rpx 32rpx;
  border-radius: 32rpx;
  background-color: #f5f5f5;
  border: 2rpx solid #cccccc;
}

.unfollow-btn text {
  font-size: 26rpx;
  color: #999999;
}
</style>
