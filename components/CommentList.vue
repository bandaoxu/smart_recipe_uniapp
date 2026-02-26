<template>
  <view class="comment-list">
    <!-- 评论列表 -->
    <view class="comment-item" v-for="comment in comments" :key="comment.id">
      <!-- 用户头像 -->
      <image class="avatar" :src="comment.user?.avatar || '/static/images/default-avatar.svg'" mode="aspectFill"></image>

      <!-- 评论内容 -->
      <view class="comment-content">
        <!-- 用户名和时间 -->
        <view class="comment-header">
          <text class="username">{{ comment.user?.nickname || '匿名' }}</text>
          <text class="time">{{ formatRelativeTime(comment.created_at) }}</text>
        </view>

        <!-- 评论文本 -->
        <text class="comment-text">{{ comment.content }}</text>

        <!-- 回复按钮 -->
        <view class="comment-actions">
          <text class="reply-btn" @click="handleReply(comment)">回复</text>
        </view>

        <!-- 子评论（回复） -->
        <view class="sub-comments" v-if="comment.replies && comment.replies.length > 0">
          <view class="sub-comment" v-for="reply in comment.replies" :key="reply.id">
            <text class="reply-user">{{ reply.user?.nickname || '匿名' }}</text>
            <text class="reply-text">: {{ reply.content }}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-if="comments.length === 0">
      <text class="empty-text">暂无评论</text>
    </view>

    <!-- 加载更多 -->
    <view class="load-more" v-if="hasMore">
      <text class="load-more-text" @click="loadMore">加载更多</text>
    </view>
  </view>
</template>

<script>
/**
 * CommentList.vue - 评论列表组件
 *
 * 功能：
 * 1. 展示评论列表
 * 2. 支持回复评论
 * 3. 支持加载更多
 *
 * Props:
 * - comments: 评论数组
 * - hasMore: 是否有更多评论
 *
 * Events:
 * - reply: 回复评论
 * - loadMore: 加载更多
 */

import { formatRelativeTime } from '@/utils/format'

export default {
  name: 'CommentList',
  props: {
    comments: {
      type: Array,
      default: () => []
    },
    hasMore: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    formatRelativeTime,

    /**
     * 回复评论
     */
    handleReply(comment) {
      this.$emit('reply', comment)
    },

    /**
     * 加载更多
     */
    loadMore() {
      this.$emit('loadMore')
    }
  }
}
</script>

<style lang="scss" scoped>
.comment-list {
  padding: 20rpx;
}

.comment-item {
  display: flex;
  margin-bottom: 30rpx;
}

.avatar {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.username {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
}

.time {
  font-size: 24rpx;
  color: #999999;
}

.comment-text {
  font-size: 28rpx;
  color: #333333;
  line-height: 1.6;
  display: block;
  margin-bottom: 10rpx;
}

.comment-actions {
  display: flex;
  gap: 20rpx;
}

.reply-btn {
  font-size: 24rpx;
  color: #3cc51f;
}

.sub-comments {
  margin-top: 20rpx;
  padding: 20rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
}

.sub-comment {
  font-size: 26rpx;
  color: #666666;
  line-height: 1.6;
  margin-bottom: 10rpx;
}

.sub-comment:last-child {
  margin-bottom: 0;
}

.reply-user {
  color: #3cc51f;
  font-weight: bold;
}

.reply-text {
  color: #333333;
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
}

.empty-text {
  font-size: 28rpx;
  color: #999999;
}

.load-more {
  text-align: center;
  padding: 20rpx 0;
}

.load-more-text {
  font-size: 28rpx;
  color: #3cc51f;
}
</style>
