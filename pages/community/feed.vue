<template>
  <view class="feed-container">
    <!-- 动态列表 -->
    <view class="post-list" v-if="posts.length > 0">
      <PostCard
        v-for="post in posts"
        :key="post.id"
        :post="post"
        @like="handleLike"
        @comment="handleComment"
      />
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else-if="!loading">
      <text class="empty-icon">📝</text>
      <text class="empty-text">还没有动态</text>
      <button class="publish-btn" @click="goToPublish">发布第一条动态</button>
    </view>

    <!-- 加载中 -->
    <view class="loading" v-if="loading">
      <text>加载中...</text>
    </view>

    <!-- 发布按钮 -->
    <view class="fab" @click="goToPublish">
      <text class="fab-icon">✏️</text>
    </view>
  </view>
</template>

<script>
/**
 * feed.vue - 社区动态流页面
 *
 * 功能：
 * 1. 显示动态列表
 * 2. 点赞动态
 * 3. 评论动态
 * 4. 下拉刷新、上拉加载更多
 * 5. 发布动态入口
 */

import PostCard from '@/components/PostCard.vue'
import { getPostList, likePost } from '@/api/community'

export default {
  name: 'CommunityFeed',
  components: {
    PostCard
  },
  data() {
    return {
      posts: [],
      loading: false,
      page: 1,
      hasMore: true
    }
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
        const res = await getPostList({ page: this.page })

        if (this.page === 1) {
          this.posts = res.data.results || []
        } else {
          this.posts = [...this.posts, ...(res.data.results || [])]
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
     * 点赞动态
     */
    async handleLike(postId) {
      try {
        await likePost(postId)

        // 更新本地数据
        const post = this.posts.find(p => p.id === postId)
        if (post) {
          post.is_liked = !post.is_liked
          post.likes += post.is_liked ? 1 : -1
        }

      } catch (error) {
        console.error('点赞失败:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    },

    /**
     * 评论动态
     */
    handleComment(postId) {
      uni.navigateTo({
        url: `/pages/community/detail?id=${postId}`
      })
    },

    /**
     * 跳转到发布页面
     */
    goToPublish() {
      uni.navigateTo({
        url: '/pages/community/publish'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.feed-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.post-list {
  padding-bottom: 20rpx;
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

.publish-btn {
  width: 300rpx;
  height: 80rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 40rpx;
  font-size: 28rpx;
  color: #ffffff;
  border: none;
}

.publish-btn::after {
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
  font-size: 48rpx;
}
</style>
