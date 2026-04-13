<template>
  <view class="post-card" @click="goToDetail">
    <!-- 用户信息 -->
    <view class="post-header">
      <image class="avatar" :src="localAvatarPath || $media(post.user?.avatar, '/static/images/default-avatar.svg')" mode="aspectFill"
        @click.stop="goToUserProfile(post.user?.id)"></image>
      <view class="user-info" @click.stop="goToUserProfile(post.user?.id)">
        <text class="username">{{ post.user?.nickname || '匿名' }}</text>
        <text class="time">{{ formatRelativeTime(post.created_at) }}</text>
      </view>
    </view>

    <!-- 动态内容 -->
    <view class="post-content">
      <text class="content-text">{{ post.content }}</text>
    </view>

    <!-- 图片列表 -->
    <view class="post-images" v-if="post.images && post.images.length > 0">
      <image
        v-for="(image, index) in post.images"
        :key="index"
        class="post-image"
        :class="{ 'single-image': post.images.length ===1 }"
        :src="localImagePaths[index] || $media(image)"
        mode="aspectFill"
        @click.stop="previewImage(index)"
      ></image>
    </view>

    <!-- 关联食谱 -->
    <view class="related-recipe" v-if="post.recipe" @click.stop="goToRecipe">
      <text class="recipe-label">关联食谱：</text>
      <text class="recipe-name">{{ post.recipe.name }}</text>
    </view>

    <!-- 底部操作栏 -->
    <view class="post-footer">
      <view class="action-item" @click.stop="handleLike">
        <text class="iconfont" :class="post.is_liked ? 'icon-like-fill' : 'icon-like'"></text>
        <text class="action-text">{{ formatLargeNumber(post.likes) }}</text>
      </view>
      <view class="action-item">
        <text class="iconfont icon-comment"></text>
        <text class="action-text">{{ formatLargeNumber(post.comments_count) }}</text>
      </view>
      <!-- 作者操作按钮 -->
      <view class="action-item owner-actions" v-if="isOwner" @click.stop="showOwnerActions">
        <text class="more-dots">···</text>
      </view>
    </view>
  </view>
</template>

<script>
/**
 * PostCard.vue - 动态卡片组件
 *
 * 功能：
 * 1. 展示动态基本信息
 * 2. 支持点赞操作
 * 3. 点击跳转到动态详情页
 *
 * Props:
 * - post: 动态对象
 */

import { formatRelativeTime, formatLargeNumber } from '@/utils/format'
import { likePost, deletePost } from '@/api/community'
import { useUserStore } from '@/store'

export default {
  name: 'PostCard',
  props: {
    post: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      imageErrors: {},
      // 本地图片路径
      localAvatarPath: '',
      localImagePaths: {}
    }
  },
  computed: {
    isOwner() {
      const userStore = useUserStore()
      return userStore.isLoggedIn && userStore.userId === this.post.user?.id
    }
  },
  watch: {
    post: {
      handler(newPost) {
        if (newPost && newPost.id) {
          // 先设置为网络 URL（立即显示）
          if (newPost.user?.avatar) {
            this.localAvatarPath = this.$media(newPost.user.avatar, '/static/images/default-avatar.svg')
          }
          if (newPost.images && newPost.images.length > 0) {
            for (let i = 0; i < newPost.images.length; i++) {
              this.$set(this.localImagePaths, i, this.$media(newPost.images[i]))
            }
          }
          // 然后异步下载到本地（优化体验）
          this.downloadImages()
        }
      },
      immediate: true
    }
  },
  methods: {
    formatRelativeTime,
    formatLargeNumber,

    /**
     * 跳转到动态详情页
     */
    goToDetail() {
      uni.navigateTo({
        url: `/pages/community/detail?id=${this.post.id}`
      })
    },

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
     * 跳转到关联食谱
     */
    goToRecipe() {
      if (this.post.recipe && this.post.recipe.id) {
        uni.navigateTo({
          url: `/pages/recipe/detail?id=${this.post.recipe.id}`
        })
      }
    },

    /**
     * 图片加载失败回退
     */
    onImageError(index) {
      this.$set(this.imageErrors, index, true)
    },

    /**
     * 下载图片到本地
     */
    async downloadImages() {
      try {
        // 下载头像
        if (this.post.user?.avatar) {
          await this.downloadImage('avatar', this.post.user.avatar)
        }
        
        // 下载动态图片
        if (this.post.images && this.post.images.length > 0) {
          for (let i = 0; i < this.post.images.length; i++) {
            await this.downloadImage(`image_${i}`, this.post.images[i])
          }
        }
      } catch (error) {
        console.error('[PostCard] 下载图片失败:', error)
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
            console.log('[PostCard] 头像下载成功:', res.tempFilePath)
          } else if (type.startsWith('image_')) {
            const index = parseInt(type.replace('image_', ''))
            this.$set(this.localImagePaths, index, res.tempFilePath)
            console.log(`[PostCard] 图片${index}下载成功:`, res.tempFilePath)
          }
        }
      } catch (error) {
        console.error(`[PostCard] 下载失败 ${type}:`, error)
      }
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
     * 点赞
     */
    async handleLike() {
      try {
        await likePost(this.post.id)
        // 更新点赞状态
        this.post.is_liked = !this.post.is_liked
        this.post.likes += this.post.is_liked ? 1 : -1
        this.$emit('like', this.post.id)
      } catch (error) {
        console.error('点赞失败:', error)
      }
    },

    /**
     * 作者操作菜单（编辑/删除）
     */
    showOwnerActions() {
      uni.showActionSheet({
        itemList: ['编辑动态', '删除动态'],
        success: ({ tapIndex }) => {
          if (tapIndex === 0) {
            uni.navigateTo({ url: `/pages/community/publish?post_id=${this.post.id}` })
          } else {
            uni.showModal({
              title: '删除动态',
              content: '确定删除这条动态吗？',
              confirmColor: '#ff4d4f',
              success: async (res) => {
                if (res.confirm) {
                  try {
                    await deletePost(this.post.id)
                    this.$emit('deleted', this.post.id)
                    uni.showToast({ title: '已删除', icon: 'none' })
                  } catch (error) {
                    uni.showToast({ title: '删除失败', icon: 'none' })
                  }
                }
              }
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.post-card {
  background-color: #ffffff;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  margin-right: 20rpx;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.username {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 4rpx;
}

.time {
  font-size: 24rpx;
  color: #999999;
}

.post-content {
  margin-bottom: 20rpx;
}

.content-text {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.6;
  display: block;
}

.post-images {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-bottom: 20rpx;
}

.post-image {
  width: 220rpx;
  height: 220rpx;
  border-radius: 8rpx;
}

.single-image {
  width: 100%;
  height: 400rpx;
}

.related-recipe {
  background-color: #f5f5f5;
  padding: 20rpx;
  border-radius: 8rpx;
  margin-bottom: 20rpx;
}

.recipe-label {
  font-size: 24rpx;
  color: #999999;
  margin-right: 10rpx;
}

.recipe-name {
  font-size: 28rpx;
  color: #3cc51f;
}

.post-footer {
  display: flex;
  gap: 40rpx;
  padding-top: 20rpx;
  border-top: 1rpx solid #f5f5f5;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.iconfont {
  font-size: 32rpx;
  color: #999999;
}

.icon-like-fill {
  color: #ff4d4f;
}

.action-text {
  font-size: 24rpx;
  color: #999999;
}

.owner-actions {
  margin-left: auto;
}

.more-dots {
  font-size: 32rpx;
  color: #cccccc;
  letter-spacing: 2rpx;
  font-weight: bold;
}
</style>