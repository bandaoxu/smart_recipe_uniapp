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
        @deleted="handleDeleted"
      />
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else-if="!loading">
      <text class="empty-icon">📝</text>
      <text class="empty-text">还没有动态</text>
    </view>

    <!-- 加载更多 -->
    <LoadingMore :loading="loading" :hasMore="hasMore" />
  </view>
</template>

<script>
import PostCard from '@/components/PostCard.vue'
import LoadingMore from '@/components/LoadingMore.vue'
import { getPostList, likePost } from '@/api/community'

export default {
  name: 'MyPosts',
  components: {
    PostCard,
    LoadingMore
  },
  data() {
    return {
      posts: [],
      loading: false,
      page: 1,
      hasMore: true,
      authorFilter: null,
    }
  },
  onLoad(options) {
    if (options.author) {
      this.authorFilter = options.author
    }
    if (options.title) {
      uni.setNavigationBarTitle({ title: options.title })
    }
    this.loadData()
  },
  onShow() {
    if (!this.loading && this.authorFilter) {
      this.page = 1
      this.hasMore = true
      this.loadData()
    }
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
    async loadData() {
      if (this.loading) return
      this.loading = true
      try {
        const params = { page: this.page }
        if (this.authorFilter) params.author = this.authorFilter

        const res = await getPostList(params)

        if (this.page === 1) {
          this.posts = res.data.results || []
        } else {
          this.posts = [...this.posts, ...(res.data.results || [])]
        }
        this.hasMore = res.data.next !== null
      } catch (error) {
        console.error('加载失败:', error)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    async handleLike(postId) {
      try {
        await likePost(postId)
        const post = this.posts.find(p => p.id === postId)
        if (post) {
          post.is_liked = !post.is_liked
          post.likes += post.is_liked ? 1 : -1
        }
      } catch (error) {
        console.error('点赞失败:', error)
        uni.showToast({ title: '操作失败', icon: 'none' })
      }
    },

    handleComment(postId) {
      uni.navigateTo({ url: `/pages/community/detail?id=${postId}` })
    },

    handleDeleted(postId) {
      const idx = this.posts.findIndex(p => p.id === postId)
      if (idx > -1) this.posts.splice(idx, 1)
    },
  }
}
</script>

<style lang="scss" scoped>
.feed-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
  padding-bottom: 60rpx;
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
}
</style>
