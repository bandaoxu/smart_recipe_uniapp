/**
 * LoadingMore.vue - 加载更多组件
 *
 * 功能：
 * 1. 显示加载中状态
 * 2. 显示没有更多数据状态
 *
 * Props:
 *   loading: Boolean - 是否正在加载
 *   hasMore: Boolean - 是否还有更多数据
 */
<template>
  <view class="loading-more">
    <view v-if="loading" class="loading-state">
      <text class="loading-text">加载中...</text>
    </view>
    <view v-else-if="!hasMore" class="no-more-state">
      <text class="no-more-text">没有更多了</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'LoadingMore',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    hasMore: {
      type: Boolean,
      default: true
    }
  }
}
</script>

<style scoped>
.loading-more {
  padding: 20rpx 0;
  text-align: center;
}

.loading-text,
.no-more-text {
  font-size: 26rpx;
  color: #999;
}
</style>
