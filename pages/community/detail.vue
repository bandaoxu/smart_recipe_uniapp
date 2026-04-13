<template>
  <view class="detail-container">
    <view class="content-section" v-if="!loading">
      <!-- 动态内容 -->
      <view class="post-content">
        <!-- 作者信息 -->
        <view class="author-info">
          <image :src="localAvatarPath || $media(post.user?.avatar || post.author?.avatar, '/static/images/default-avatar.svg')" mode="aspectFill" class="author-avatar"
            @click="goToUserProfile(post.user?.id)"></image>
          <view class="author-detail">
            <text class="author-name">{{ post.user?.nickname || post.author?.nickname }}</text>
            <text class="post-time">{{ formatTime(post.created_at) }}</text>
          </view>
          <!-- 关注按钮（非本人才显示） -->
          <view v-if="!isOwnPost" class="follow-btn" :class="{ followed: isFollowing }" @click="handleFollow">
            <text>{{ isFollowing ? '已关注' : '+ 关注' }}</text>
          </view>
          <!-- 更多操作（本人才显示） -->
          <view v-if="isOwnPost" class="more-btn" @click="showPostActions">
            <text>···</text>
          </view>
        </view>

        <!-- 文本内容 -->
        <view class="post-text">
          <text>{{ post.content }}</text>
        </view>

        <!-- 图片列表 -->
        <view class="post-images" v-if="post.images && post.images.length > 0">
          <image
            v-for="(image, index) in post.images"
            :key="index"
            :src="localImagePaths[index] || $media(image)"
            mode="aspectFill"
            class="post-image"
            @click="previewImage(index)"
          ></image>
        </view>

        <!-- 关联食谱 -->
        <view class="related-recipe" v-if="post.recipe" @click="goToRecipe(post.recipe.id)">
          <image :src="localRecipeCoverPath || $media(post.recipe.cover_image)" mode="aspectFill" class="recipe-cover"></image>
          <view class="recipe-info">
            <text class="recipe-name">{{ post.recipe.name }}</text>
            <text class="recipe-author">by {{ post.recipe.author?.nickname }}</text>
          </view>
          <text class="arrow">›</text>
        </view>

        <!-- 点赞数和评论数 -->
        <view class="post-stats">
          <text class="stat-item">{{ post.likes }} 点赞</text>
          <text class="stat-item">{{ post.comments_count }} 评论</text>
        </view>
      </view>

      <!-- 评论列表 -->
      <view class="comments-section">
        <view class="section-title">
          <text>评论 ({{ comments.length }})</text>
        </view>
        <CommentList :comments="comments" :currentUserId="currentUserId" @reply="handleReply" @deleted="handleCommentDeleted" />

        <!-- 空状态 -->
        <view class="empty-comments" v-if="comments.length === 0">
          <text class="empty-text">还没有评论，快来抢沙发吧~</text>
        </view>
      </view>
    </view>

    <!-- 加载中 -->
    <view class="page-loading" v-if="loading">
      <text>加载中...</text>
    </view>

    <!-- 底部操作栏 -->
    <view class="action-bar">
      <view class="comment-input" @click="showCommentInput">
        <text class="input-placeholder">说点什么...</text>
      </view>
      <view class="action-buttons">
        <view class="action-btn" @click="handleShare">
          <text class="action-icon">↗️</text>
          <text class="action-text">分享</text>
        </view>
        <view class="action-btn" @click="handleLike">
          <text class="action-icon">{{ post.is_liked ? '❤️' : '🤍' }}</text>
          <text class="action-text">{{ post.likes }}</text>
        </view>
      </view>
    </view>

    <!-- 评论输入弹窗 -->
    <view class="comment-modal" v-if="showModal" @click="hideCommentInput">
      <view class="modal-content" @click.stop>
        <view v-if="replyingTo" class="reply-hint">
          <text class="reply-hint-text">回复 @{{ replyingTo.user?.nickname }}</text>
          <text class="cancel-reply" @click="replyingTo = null">取消回复</text>
        </view>
        <uni-easyinput
          type="textarea"
          class="comment-textarea"
          v-model="commentContent"
          :placeholder="replyingTo ? '回复 @' + replyingTo.user?.nickname + '...' : '写下你的评论...'"
          :focus="true"
          :maxlength="500"
          :inputBorder="false"
        />
        <view class="modal-actions">
          <button class="cancel-btn" @click="hideCommentInput">取消</button>
          <button class="submit-btn" @click="submitComment" :loading="submitting">发送</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * detail.vue - 社区动态详情页面
 *
 * 功能：
 * 1. 显示动态内容
 * 2. 显示关联食谱
 * 3. 点赞动态
 * 4. 评论列表
 * 5. 发表评论
 */

import CommentList from '@/components/CommentList.vue'
import { getPostDetail, likePost, getComments, createComment, deletePost, deleteComment } from '@/api/community'
import { useUserStore, useFollowStore } from '@/store'
import { formatTime } from '@/utils/format'

export default {
  name: 'CommunityDetail',
  components: {
    CommentList
  },
  data() {
    return {
      postId: null,
      post: {},
      comments: [],
      loading: true,
      showModal: false,
      commentContent: '',
      submitting: false,
      replyingTo: null,
      isOwnPost: false,
      // 本地图片路径
      localAvatarPath: '',
      localImagePaths: {},
      localRecipeCoverPath: ''
    }
  },
  computed: {
    isFollowing() {
      return useFollowStore().isFollowing(this.post.user?.id)
    },
    currentUserId() {
      return useUserStore().userId
    }
  },
  watch: {
    post: {
      handler(newPost) {
        if (newPost && newPost.id) {
          // 先设置为网络 URL（立即显示）
          const avatarUrl = newPost.user?.avatar || newPost.author?.avatar
          if (avatarUrl) {
            this.localAvatarPath = this.$media(avatarUrl, '/static/images/default-avatar.svg')
          }
          if (newPost.images && newPost.images.length > 0) {
            for (let i = 0; i < newPost.images.length; i++) {
              this.$set(this.localImagePaths, i, this.$media(newPost.images[i]))
            }
          }
          if (newPost.recipe?.cover_image) {
            this.localRecipeCoverPath = this.$media(newPost.recipe.cover_image)
          }
          // 然后异步下载到本地（优化体验）
          this.downloadImages()
        }
      },
      immediate: true
    }
  },
  onLoad(options) {
    if (options.id) {
      this.postId = options.id
      this.loadData()
    }
  },
  onShow() {
    if (this.postId && !this.loading) {
      this.refreshState()
    }
  },
  onShareAppMessage() {
    return {
      title: this.post.content?.slice(0, 40) || '美食动态',
      path: `/pages/community/detail?id=${this.postId}`,
    }
  },
  methods: {
    /**
     * 跳转到用户主页
     */
    goToUserProfile(userId) {
      if (!userId) return
      const userStore = useUserStore()
      if (userId === userStore.userId) {
        uni.switchTab({ url: '/pages/user/profile' })
      } else {
        uni.navigateTo({ url: `/pages/user/other-profile?id=${userId}` })
      }
    },

    /**
     * 刷新点赞和关注状态（从详情页/其他页返回时调用）
     */
    async refreshState() {
      try {
        const res = await getPostDetail(this.postId)
        const fresh = res.data || {}
        if (fresh.is_liked !== undefined) this.post.is_liked = fresh.is_liked
        if (fresh.likes !== undefined) this.post.likes = fresh.likes
        if (fresh.user?.is_following !== undefined) {
          useFollowStore().setFollowing(fresh.user.id, fresh.user.is_following)
        }
      } catch {}
    },

    /**
     * 加载数据
     */
    async loadData() {
      this.loading = true

      try {
        // 加载动态详情
        const postRes = await getPostDetail(this.postId)
        this.post = postRes.data
        
        // 初始化关注状态（后端返回 author.is_following）
        const userStore = useUserStore()
        const authorId = this.post.user?.id || this.post.author?.id
        this.isOwnPost = userStore.isLoggedIn && (userStore.userId === authorId)
        useFollowStore().setFollowing(authorId, this.post.user?.is_following || false)

        // 加载评论列表
        const commentsRes = await getComments(this.postId)
        this.comments = commentsRes.data || []
        
        // 下载图片到本地（解决真机调试图片不显示问题）
        await this.downloadImages()

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
     * 下载图片到本地
     */
    async downloadImages() {
      try {
        // 下载头像
        const avatarUrl = this.post.user?.avatar || this.post.author?.avatar
        if (avatarUrl) {
          await this.downloadImage('avatar', avatarUrl)
        }
        
        // 下载动态图片
        if (this.post.images && this.post.images.length > 0) {
          for (let i = 0; i < this.post.images.length; i++) {
            await this.downloadImage(`image_${i}`, this.post.images[i])
          }
        }
        
        // 下载关联食谱封面
        if (this.post.recipe?.cover_image) {
          await this.downloadImage('recipe_cover', this.post.recipe.cover_image)
        }
      } catch (error) {
        console.error('[社区详情] 下载图片失败:', error)
      }
    },

    /**
     * 下载单个图片
     */
    async downloadImage(type, url) {
      try {
        const fullUrl = this.$media(url)
        const res = await uni.downloadFile({
          url: fullUrl,
          timeout: 30000
        })
        
        if (res.statusCode === 200 && res.tempFilePath) {
          if (type === 'avatar') {
            this.localAvatarPath = res.tempFilePath
            console.log('[社区详情] 头像下载成功:', res.tempFilePath)
          } else if (type.startsWith('image_')) {
            const index = parseInt(type.replace('image_', ''))
            this.$set(this.localImagePaths, index, res.tempFilePath)
            console.log(`[社区详情] 图片${index}下载成功:`, res.tempFilePath)
          } else if (type === 'recipe_cover') {
            this.localRecipeCoverPath = res.tempFilePath
            console.log('[社区详情] 食谱封面下载成功:', res.tempFilePath)
          }
        }
      } catch (error) {
        console.error(`[社区详情] 下载失败 ${type}:`, error)
      }
    },

    /**
     * 格式化时间
     */
    formatTime(time) {
      return formatTime(time)
    },

    /**
     * 预览图片
     */
    previewImage(index) {
      uni.previewImage({
        urls: this.post.images.map(url => this.$media(url)),
        current: index
      })
    },

    /**
     * 跳转到食谱详情
     */
    goToRecipe(recipeId) {
      uni.navigateTo({
        url: `/pages/recipe/detail?id=${recipeId}`
      })
    },

    /**
     * 点赞动态
     */
    async handleLike() {
      try {
        const res = await likePost(this.postId)
        this.post.is_liked = res.data.is_liked
        this.post.likes = res.data.likes
      } catch (error) {
        console.error('点赞失败:', error)
        uni.showToast({
          title: '操作失败',
          icon: 'none'
        })
      }
    },

    /**
     * 关注/取消关注作者
     */
    async handleFollow() {
      const followStore = useFollowStore()
      const authorId = this.post.user?.id
      try {
        if (this.isFollowing) {
          await followStore.unfollow(authorId)
          uni.showToast({ title: '已取消关注', icon: 'none' })
        } else {
          await followStore.follow(authorId)
          uni.showToast({ title: '关注成功', icon: 'success' })
        }
      } catch (error) {
        console.error('操作失败:', error)
        uni.showToast({ title: '操作失败', icon: 'none' })
      }
    },

    /**
     * 显示评论输入框
     */
    showCommentInput() {
      this.showModal = true
    },

    /**
     * 隐藏评论输入框
     */
    hideCommentInput() {
      this.showModal = false
      this.commentContent = ''
      this.replyingTo = null
    },

    /**
     * 回复评论
     */
    handleReply(comment) {
      this.replyingTo = comment
      this.showModal = true
    },

    /**
     * 删除评论
     */
    async handleCommentDeleted({ id, parentId }) {
      try {
        await deleteComment(id)
        if (parentId === null) {
          const idx = this.comments.findIndex(c => c.id === id)
          if (idx > -1) {
            this.comments.splice(idx, 1)
            this.post.comments_count = Math.max(0, (this.post.comments_count || 0) - 1)
          }
        } else {
          const parent = this.comments.find(c => c.id === parentId)
          if (parent?.replies) {
            const idx = parent.replies.findIndex(r => r.id === id)
            if (idx > -1) parent.replies.splice(idx, 1)
          }
        }
        uni.showToast({ title: '已删除', icon: 'none' })
      } catch {
        uni.showToast({ title: '删除失败', icon: 'none' })
      }
    },

    /**
     * 提交评论
     */
    async submitComment() {
      let content = this.commentContent.trim()
      if (!content) {
        uni.showToast({
          title: '请输入评论内容',
          icon: 'none'
        })
        return
      }

      // 回复子评论时自动添加 @mention
      if (this.replyingTo?.parentId) {
        content = `@${this.replyingTo.user?.nickname} ${content}`
      }

      this.submitting = true

      try {
        const res = await createComment(this.postId, {
          content,
          ...(this.replyingTo ? { parent: this.replyingTo.parentId || this.replyingTo.id } : {})
        })
        const newComment = res.data

        // 乐观更新：直接插入到本地列表，不全量刷新
        if (this.replyingTo) {
          const parentId = this.replyingTo.parentId || this.replyingTo.id
          const parent = this.comments.find(c => c.id === parentId)
          if (parent) {
            if (!parent.replies) parent.replies = []
            parent.replies.push(newComment)
          }
        } else {
          this.comments.push(newComment)
        }
        this.post.comments_count = (this.post.comments_count || 0) + 1

        uni.showToast({
          title: '评论成功',
          icon: 'success'
        })

        this.hideCommentInput()

      } catch (error) {
        console.error('评论失败:', error)
        uni.showToast({
          title: error.message || '评论失败',
          icon: 'none'
        })
      } finally {
        this.submitting = false
      }
    },

    /**
     * 分享动态（触发微信小程序分享菜单）
     */
    handleShare() {
      uni.showToast({ title: '请点击右上角菜单转发', icon: 'none', duration: 2000 })
    },

    /**
     * 显示帖子作者操作菜单（编辑/删除）
     */
    showPostActions() {
      uni.showActionSheet({
        itemList: ['编辑动态', '删除动态'],
        success: ({ tapIndex }) => {
          if (tapIndex === 0) {
            uni.navigateTo({ url: `/pages/community/publish?post_id=${this.postId}` })
          } else {
            this.confirmDeletePost()
          }
        }
      })
    },

    /**
     * 确认删除动态
     */
    confirmDeletePost() {
      uni.showModal({
        title: '删除动态',
        content: '确定删除这条动态吗？此操作不可撤销。',
        confirmColor: '#ff4d4f',
        success: async (res) => {
          if (res.confirm) {
            try {
              await deletePost(this.postId)
              uni.showToast({ title: '已删除', icon: 'none' })
              // 返回社区列表
              if (getCurrentPages().length > 1) uni.navigateBack()
              else uni.switchTab({ url: '/pages/community/feed' })
            } catch (error) {
              console.error('删除失败:', error)
              uni.showToast({ title: '删除失败', icon: 'none' })
            }
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.content-section {
  padding: 20rpx;
}

.post-content {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.author-info {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.author-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 40rpx;
  margin-right: 20rpx;
}

.author-detail {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.author-name {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.post-time {
  font-size: 24rpx;
  color: #999999;
}

.post-text {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.6;
  margin-bottom: 30rpx;
}

.post-images {
  display: flex;
  flex-wrap: wrap;
  margin: -10rpx -10rpx 30rpx;
}

.post-image {
  width: 220rpx;
  height: 220rpx;
  border-radius: 12rpx;
  margin: 10rpx;
}

.related-recipe {
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 12rpx;
  margin-bottom: 30rpx;
}

.recipe-cover {
  width: 100rpx;
  height: 100rpx;
  border-radius: 8rpx;
  margin-right: 20rpx;
}

.recipe-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.recipe-name {
  font-size: 28rpx;
  color: #333333;
  font-weight: 500;
  margin-bottom: 10rpx;
}

.recipe-author {
  font-size: 24rpx;
  color: #999999;
}

.arrow {
  font-size: 48rpx;
  color: #cccccc;
}

.post-stats {
  display: flex;
  padding-top: 20rpx;
  border-top: 1rpx solid #f0f0f0;
}

.stat-item {
  font-size: 26rpx;
  color: #999999;
  margin-right: 40rpx;
}

.comments-section {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 30rpx;
}

.empty-comments {
  text-align: center;
  padding: 80rpx 0;
}

.empty-text {
  font-size: 26rpx;
  color: #999999;
}

.page-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-size: 28rpx;
  color: #999999;
}

.action-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 20rpx;
  background-color: #ffffff;
  border-top: 1rpx solid #f0f0f0;
  z-index: 100;
}

.comment-input {
  flex: 1;
  height: 70rpx;
  background-color: #f5f5f5;
  border-radius: 35rpx;
  padding: 0 30rpx;
  display: flex;
  align-items: center;
  margin-right: 20rpx;
}

.input-placeholder {
  font-size: 26rpx;
  color: #999999;
}

.action-buttons {
  display: flex;
  align-items: center;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 30rpx;
}

.action-icon {
  font-size: 40rpx;
  margin-bottom: 5rpx;
}

.action-text {
  font-size: 22rpx;
  color: #999999;
}

.comment-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  z-index: 1000;
}

.modal-content {
  width: 100%;
  background-color: #ffffff;
  border-radius: 32rpx 32rpx 0 0;
  padding: 40rpx;
}

.comment-textarea {
  margin-bottom: 30rpx;
}

.comment-textarea ::v-deep .uni-easyinput__content {
  background-color: #f5f5f5;
  border-radius: 12rpx;
}

.comment-textarea ::v-deep .uni-easyinput__content-textarea {
  font-size: 28rpx;
  color: #333333;
  min-height: 200rpx;
}

/* 移除原生 textarea 样式，已被 uni-easyinput 替代 */

.modal-actions {
  display: flex;
  justify-content: flex-end;
}

.cancel-btn,
.submit-btn {
  padding: 20rpx 50rpx;
  border-radius: 10rpx;
  font-size: 28rpx;
  border: none;
}

.cancel-btn {
  background-color: #f5f5f5;
  color: #666666;
  margin-right: 20rpx;
}

.cancel-btn::after,
.submit-btn::after {
  border: none;
}

.submit-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
}

.reply-hint {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16rpx 0 24rpx;
  border-bottom: 1rpx solid #f0f0f0;
  margin-bottom: 20rpx;
}

.reply-hint-text {
  font-size: 26rpx;
  color: #667eea;
}

.cancel-reply {
  font-size: 24rpx;
  color: #999999;
}

.follow-btn {
  padding: 12rpx 32rpx;
  border-radius: 32rpx;
  border: 2rpx solid #667eea;
  background-color: #ffffff;
}

.follow-btn text {
  font-size: 26rpx;
  color: #667eea;
}

.follow-btn.followed {
  background-color: #f5f5f5;
  border-color: #cccccc;
}

.follow-btn.followed text {
  color: #999999;
}

.more-btn {
  padding: 8rpx 20rpx;
  text {
    font-size: 36rpx;
    color: #999999;
    font-weight: bold;
    letter-spacing: 2rpx;
  }
}
</style>