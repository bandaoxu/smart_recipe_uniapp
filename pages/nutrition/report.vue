<template>
  <view class="report-container">
    <!-- 周期切换 -->
    <view class="period-tabs">
      <view
        class="tab-item"
        :class="{ active: period === 'week' }"
        @click="switchPeriod('week')"
      >周报</view>
      <view
        class="tab-item"
        :class="{ active: period === 'month' }"
        @click="switchPeriod('month')"
      >月报</view>
    </view>

    <!-- 加载中 -->
    <view class="loading-state" v-if="loading">
      <text>加载中...</text>
    </view>

    <view v-else>
      <!-- 热量趋势 -->
      <view class="section-card">
        <text class="section-title">热量趋势（千卡）</text>
        <view class="chart-area">
          <view class="chart-bars">
            <view
              class="bar-item"
              v-for="item in chartData"
              :key="item.date"
            >
              <text class="bar-val" v-if="item.calories > 0">{{ item.calories }}</text>
              <view class="bar-bg">
                <view
                  class="bar-fill"
                  :style="{ height: getBarHeight(item.calories) + '%' }"
                ></view>
              </view>
              <text class="bar-label">{{ item.dayLabel }}</text>
            </view>
          </view>
          <!-- 目标线提示 -->
          <text class="target-hint">目标 {{ targetCalories }} 千卡/天</text>
        </view>
      </view>

      <!-- 平均营养素 -->
      <view class="section-card">
        <text class="section-title">平均营养素摄入</text>
        <view class="avg-list">
          <view class="avg-item">
            <view class="avg-left">
              <view class="avg-dot calories-dot"></view>
              <text class="avg-name">热量</text>
            </view>
            <view class="avg-right">
              <text class="avg-num">{{ averages.calories }}</text>
              <text class="avg-unit">千卡/天</text>
            </view>
          </view>
          <view class="avg-item">
            <view class="avg-left">
              <view class="avg-dot protein-dot"></view>
              <text class="avg-name">蛋白质</text>
            </view>
            <view class="avg-right">
              <text class="avg-num">{{ averages.protein }}</text>
              <text class="avg-unit">g/天</text>
            </view>
          </view>
          <view class="avg-item">
            <view class="avg-left">
              <view class="avg-dot fat-dot"></view>
              <text class="avg-name">脂肪</text>
            </view>
            <view class="avg-right">
              <text class="avg-num">{{ averages.fat }}</text>
              <text class="avg-unit">g/天</text>
            </view>
          </view>
          <view class="avg-item">
            <view class="avg-left">
              <view class="avg-dot carb-dot"></view>
              <text class="avg-name">碳水化合物</text>
            </view>
            <view class="avg-right">
              <text class="avg-num">{{ averages.carbohydrate }}</text>
              <text class="avg-unit">g/天</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 健康建议 -->
      <view class="section-card advice-card" v-if="advice">
        <text class="section-title">💡 健康建议</text>
        <text class="advice-text">{{ advice }}</text>
      </view>

      <!-- 日明细 -->
      <view class="section-card">
        <text class="section-title">每日明细</text>
        <view class="detail-list">
          <view class="detail-item" v-for="item in chartData" :key="item.date">
            <text class="detail-date">{{ item.date }}</text>
            <view class="detail-bars">
              <view class="detail-row">
                <text class="detail-label">热量</text>
                <view class="detail-bar-bg">
                  <view class="detail-bar-fill calories-fill" :style="{ width: Math.min(item.calories / targetCalories * 100, 100) + '%' }"></view>
                </view>
                <text class="detail-val">{{ item.calories }}</text>
              </view>
              <view class="detail-row">
                <text class="detail-label">蛋白</text>
                <view class="detail-bar-bg">
                  <view class="detail-bar-fill protein-fill" :style="{ width: Math.min(item.protein / 60 * 100, 100) + '%' }"></view>
                </view>
                <text class="detail-val">{{ item.protein }}g</text>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getNutritionReport, getNutritionAdvice } from '@/api/nutrition'
import { useUserStore } from '@/store'

export default {
  name: 'NutritionReport',
  data() {
    return {
      period: 'week',
      loading: false,
      chartData: [],
      averages: { calories: 0, protein: 0, fat: 0, carbohydrate: 0 },
      advice: '',
      targetCalories: 2000
    }
  },
  onLoad() {
    const userStore = useUserStore()
    if (userStore.userProfile?.daily_calories_target) {
      this.targetCalories = userStore.userProfile.daily_calories_target
    }
    this.loadReport()
    this.loadAdvice()
  },
  methods: {
    async loadReport() {
      this.loading = true
      try {
        const res = await getNutritionReport(this.period)
        const data = res.data || {}
        this.chartData = (data.daily || []).map(item => ({
          ...item,
          calories: Math.round(item.calories || 0),
          protein: Math.round(item.protein || 0),
          fat: Math.round(item.fat || 0),
          carbohydrate: Math.round(item.carbohydrate || 0),
          dayLabel: this.getDayLabel(item.date)
        }))
        const avg = data.averages || {}
        this.averages = {
          calories: Math.round(avg.calories || 0),
          protein: Math.round(avg.protein || 0),
          fat: Math.round(avg.fat || 0),
          carbohydrate: Math.round(avg.carbohydrate || 0)
        }
      } catch (error) {
        console.error('加载报表失败:', error)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    async loadAdvice() {
      try {
        const res = await getNutritionAdvice()
        this.advice = res.data?.advice || ''
      } catch (error) {
        console.error('获取建议失败:', error)
      }
    },

    switchPeriod(p) {
      if (this.period === p) return
      this.period = p
      this.loadReport()
    },

    getDayLabel(dateStr) {
      if (!dateStr) return ''
      const days = ['日', '一', '二', '三', '四', '五', '六']
      const d = new Date(dateStr)
      if (this.period === 'week') {
        return '周' + days[d.getDay()]
      }
      return String(d.getDate()) + '日'
    },

    getBarHeight(calories) {
      const maxCal = Math.max(...this.chartData.map(d => d.calories), this.targetCalories)
      if (!maxCal) return 0
      return Math.round(calories / maxCal * 100)
    }
  }
}
</script>

<style lang="scss" scoped>
.report-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 60rpx;
}

.period-tabs {
  display: flex;
  background-color: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 28rpx 0;
  font-size: 28rpx;
  color: #999999;
  position: relative;

  &.active {
    color: #667eea;
    font-weight: 600;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 60rpx;
      height: 4rpx;
      background-color: #667eea;
      border-radius: 2rpx;
    }
  }
}

.loading-state {
  text-align: center;
  padding: 100rpx 0;
  font-size: 28rpx;
  color: #999999;
}

.section-card {
  margin: 20rpx 20rpx 0;
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
  display: block;
  margin-bottom: 24rpx;
}

/* 柱状图 */
.chart-area {
  position: relative;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 200rpx;
  padding-bottom: 40rpx;
}

.bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.bar-val {
  font-size: 18rpx;
  color: #667eea;
  margin-bottom: 4rpx;
}

.bar-bg {
  flex: 1;
  width: 32rpx;
  background-color: #f0f0f0;
  border-radius: 6rpx;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  overflow: hidden;
  margin-bottom: 8rpx;
}

.bar-fill {
  width: 100%;
  background: linear-gradient(to top, #667eea, #764ba2);
  border-radius: 6rpx;
  transition: height 0.3s ease;
}

.bar-label {
  font-size: 20rpx;
  color: #999999;
}

.target-hint {
  font-size: 22rpx;
  color: #cccccc;
  display: block;
  text-align: right;
  margin-top: 8rpx;
}

/* 平均值列表 */
.avg-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.avg-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.avg-left {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.avg-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 8rpx;

  &.calories-dot { background-color: #667eea; }
  &.protein-dot { background-color: #52c41a; }
  &.fat-dot { background-color: #faad14; }
  &.carb-dot { background-color: #1890ff; }
}

.avg-name {
  font-size: 28rpx;
  color: #333333;
}

.avg-right {
  display: flex;
  align-items: baseline;
  gap: 6rpx;
}

.avg-num {
  font-size: 34rpx;
  font-weight: bold;
  color: #333333;
}

.avg-unit {
  font-size: 22rpx;
  color: #999999;
}

/* 建议卡片 */
.advice-card {
  background: linear-gradient(135deg, #f0f4ff 0%, #f5f0ff 100%);
  border: 1rpx solid #e0e8ff;
}

.advice-text {
  font-size: 28rpx;
  color: #444444;
  line-height: 1.8;
}

/* 日明细 */
.detail-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.detail-date {
  font-size: 22rpx;
  color: #999999;
  width: 80rpx;
  flex-shrink: 0;
}

.detail-bars {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.detail-label {
  font-size: 20rpx;
  color: #cccccc;
  width: 44rpx;
  flex-shrink: 0;
}

.detail-bar-bg {
  flex: 1;
  height: 10rpx;
  background-color: #f0f0f0;
  border-radius: 5rpx;
  overflow: hidden;
}

.detail-bar-fill {
  height: 100%;
  border-radius: 5rpx;

  &.calories-fill { background-color: #667eea; }
  &.protein-fill { background-color: #52c41a; }
}

.detail-val {
  font-size: 20rpx;
  color: #666666;
  width: 70rpx;
  text-align: right;
  flex-shrink: 0;
}
</style>
