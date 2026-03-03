<template>
  <view class="history-container">

    <!-- 列表 -->
    <view v-if="records.length > 0">
      <view
        class="record-card"
        v-for="record in records"
        :key="record.id"
      >
        <!-- 图片 + 时间 -->
        <view class="card-header">
          <image
            class="record-img"
            :src="imgErrors[record.id] ? '/static/images/default-recipe.svg' : (record.image_url || '/static/images/default-recipe.svg')"
            mode="aspectFill"
            @error="handleImgError(record.id)"
          />
          <view class="header-info">
            <text class="record-date">{{ formatDate(record.created_at) }}</text>
            <text class="record-count">识别到 {{ getIngredients(record).length }} 种食材</text>
          </view>
        </view>

        <!-- 食材标签 -->
        <view class="ingredient-tags">
          <view
            class="tag"
            v-for="(item, idx) in getIngredients(record)"
            :key="idx"
          >
            <text class="tag-name">{{ item.name }}</text>
            <text class="tag-conf">{{ Math.round(item.confidence * 100) }}%</text>
          </view>
        </view>

        <!-- 推荐按钮 -->
        <view class="find-btn" @click="findRecipes(record)">
          <text>用这些食材找食谱</text>
        </view>
      </view>
    </view>

    <!-- 空状态 -->
    <view class="empty-state" v-else-if="!loading">
      <text class="empty-icon">🔍</text>
      <text class="empty-text">还没有识别记录</text>
      <text class="empty-sub">去拍照识别食材吧</text>
      <view class="go-btn" @click="goRecognize">
        <text>去识别</text>
      </view>
    </view>

    <!-- 加载中 -->
    <view class="loading-state" v-if="loading">
      <uni-load-more status="loading" />
    </view>

  </view>
</template>

<script>
import { getRecognitionHistory } from '@/api/ingredient'
import { recommendByIngredients } from '@/api/ingredient'

export default {
  name: 'IngredientHistory',
  data() {
    return {
      records: [],
      loading: false,
      imgErrors: {}
    }
  },
  onLoad() {
    this.loadHistory()
  },
  onPullDownRefresh() {
    this.loadHistory().then(() => uni.stopPullDownRefresh())
  },
  methods: {
    async loadHistory() {
      this.loading = true
      try {
        const res = await getRecognitionHistory()
        const raw = res.data
        this.records = Array.isArray(raw) ? raw : (raw?.results || [])
      } catch (error) {
        console.error('历史加载失败:', error)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    getIngredients(record) {
      return record.recognition_result?.ingredients || []
    },

    handleImgError(id) {
      this.imgErrors[id] = true
    },

    formatDate(dateStr) {
      if (!dateStr) return ''
      return dateStr.substring(0, 16).replace('T', ' ')
    },

    async findRecipes(record) {
      const names = this.getIngredients(record).map(i => i.name)
      if (!names.length) return
      try {
        const res = await recommendByIngredients(names)
        const recipes = Array.isArray(res.data) ? res.data : (res.data?.results || [])
        if (!recipes.length) {
          uni.showToast({ title: '暂无匹配食谱', icon: 'none' })
          return
        }
        // 跳转到食谱列表搜索页，传递第一个食材名
        uni.navigateTo({ url: `/pages/recipe/search?q=${encodeURIComponent(names[0])}` })
      } catch (error) {
        uni.showToast({ title: '推荐失败', icon: 'none' })
      }
    },

    goRecognize() {
      uni.navigateTo({ url: '/pages/ingredient/recognize' })
    }
  }
}
</script>

<style lang="scss" scoped>
.history-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.record-card {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 20rpx;
}

.record-img {
  width: 120rpx;
  height: 90rpx;
  border-radius: 10rpx;
  flex-shrink: 0;
  background-color: #f0f0f0;
}

.header-info {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.record-date {
  font-size: 26rpx;
  color: #333333;
  font-weight: 500;
}

.record-count {
  font-size: 22rpx;
  color: #999999;
}

.ingredient-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-bottom: 20rpx;
}

.tag {
  display: flex;
  align-items: center;
  gap: 6rpx;
  background-color: #f0f4ff;
  border-radius: 20rpx;
  padding: 8rpx 18rpx;
}

.tag-name {
  font-size: 24rpx;
  color: #333333;
}

.tag-conf {
  font-size: 20rpx;
  color: #667eea;
}

.find-btn {
  height: 72rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: 26rpx;
    color: #ffffff;
    font-weight: 500;
  }
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx 0 60rpx;
}

.empty-icon {
  font-size: 120rpx;
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
  margin-bottom: 40rpx;
}

.go-btn {
  padding: 20rpx 60rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 40rpx;

  text {
    font-size: 28rpx;
    color: #ffffff;
    font-weight: 500;
  }
}

/* 加载 */
.loading-state {
  padding: 40rpx 0;
  display: flex;
  justify-content: center;
}
</style>
