<script>
/**
 * App.vue - 应用入口文件
 *
 * 功能：
 * 1. 全局生命周期管理
 * 2. 全局样式定义
 * 3. 应用初始化逻辑
 */
export default {
  onLaunch: function() {
    console.log('App Launch')
    // 检查登录状态
    this.checkLoginStatus()
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  },
  methods: {
    /**
     * 检查登录状态
     * 如果有 Token 则自动登录
     */
    checkLoginStatus() {
      const token = uni.getStorageSync('access_token')
      if (token) {
        console.log('用户已登录')
        // 可以在这里获取用户信息
      } else {
        console.log('用户未登录')
      }
    }
  }
}
</script>

<style lang="scss">
/**
 * 全局样式
 */

/* 全局变量 */
$primary-color: #667eea;
$text-color: #333333;
$text-color-light: #666666;
$border-color: #e5e5e5;
$bg-color: #f8f8f8;

/* 全局样式重置 */
page {
  background-color: $bg-color;
  font-size: 14px;
  color: $text-color;
  line-height: 1.6;
}

/* 通用容器 */
.container {
  padding: 20rpx;
}

/* 通用卡片 */
.card {
  background-color: #ffffff;
  border-radius: 10rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
}

/* 通用按钮 */
.btn-primary {
  background-color: $primary-color;
  color: #ffffff;
  border-radius: 10rpx;
  padding: 20rpx;
  text-align: center;
  font-size: 16px;
}

/* 通用文本样式 */
.text-primary {
  color: $primary-color;
}

.text-light {
  color: $text-color-light;
}

.text-small {
  font-size: 12px;
}

/* 通用布局 */
.flex {
  display: flex;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 通用间距 */
.mt-10 {
  margin-top: 10rpx;
}

.mt-20 {
  margin-top: 20rpx;
}

.mb-10 {
  margin-bottom: 10rpx;
}

.mb-20 {
  margin-bottom: 20rpx;
}

.ml-10 {
  margin-left: 10rpx;
}

.mr-10 {
  margin-right: 10rpx;
}

.p-20 {
  padding: 20rpx;
}
</style>
