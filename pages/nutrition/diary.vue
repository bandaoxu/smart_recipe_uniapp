<template>
  <view class="diary-container">
    <!-- 日期选择 -->
    <view class="date-bar">
      <view class="date-arrow" @click="changeDate(-1)"><text>‹</text></view>
      <picker mode="date" :value="date" @change="onDateChange">
        <view class="date-text">{{ dateLabel }}</view>
      </picker>
      <view class="date-arrow" @click="changeDate(1)" :class="{ disabled: isToday }"><text>›</text></view>
    </view>

    <!-- 当日汇总卡片 -->
    <view class="summary-card">
      <view class="summary-main">
        <view class="calorie-ring">
          <text class="calorie-num">{{ summary.calories }}</text>
          <text class="calorie-unit">千卡</text>
        </view>
        <view class="calorie-info">
          <text class="target-text">目标 {{ targetCalories }} 千卡</text>
          <view class="progress-bar">
            <view class="progress-fill" :style="{ width: caloriePercent + '%' }"></view>
          </view>
          <text class="remain-text">{{ remainCalories >= 0 ? '剩余 ' + remainCalories : '超出 ' + Math.abs(remainCalories) }} 千卡</text>
        </view>
      </view>
      <view class="macro-row">
        <view class="macro-item">
          <text class="macro-num">{{ summary.protein }}</text>
          <text class="macro-label">蛋白质(g)</text>
          <view class="macro-bar"><view class="macro-fill protein" :style="{ width: Math.min(summary.protein / macroTargets.protein * 100, 100) + '%' }"></view></view>
        </view>
        <view class="macro-item">
          <text class="macro-num">{{ summary.fat }}</text>
          <text class="macro-label">脂肪(g)</text>
          <view class="macro-bar"><view class="macro-fill fat" :style="{ width: Math.min(summary.fat / macroTargets.fat * 100, 100) + '%' }"></view></view>
        </view>
        <view class="macro-item">
          <text class="macro-num">{{ summary.carbohydrate }}</text>
          <text class="macro-label">碳水(g)</text>
          <view class="macro-bar"><view class="macro-fill carb" :style="{ width: Math.min(summary.carbohydrate / macroTargets.carbohydrate * 100, 100) + '%' }"></view></view>
        </view>
      </view>
      <!-- 膳食纤维行 -->
      <view class="fiber-row">
        <view class="fiber-label-group">
          <text class="fiber-label">膳食纤维</text>
          <text class="fiber-value">{{ summary.fiber }}g / {{ macroTargets.fiber }}g</text>
        </view>
        <view class="fiber-bar"><view class="fiber-fill" :style="{ width: Math.min(summary.fiber / macroTargets.fiber * 100, 100) + '%' }"></view></view>
      </view>
    </view>

    <!-- 餐次分组 -->
    <view class="meal-section" v-for="meal in mealTypes" :key="meal.type">
      <view class="meal-header">
        <view class="meal-title-row">
          <text class="meal-icon">{{ meal.icon }}</text>
          <text class="meal-name">{{ meal.label }}</text>
          <text class="meal-calories">{{ getMealCalories(meal.type) }} 千卡</text>
        </view>
        <view class="add-btn" @click="openAddModal(meal.type)">
          <text>+ 添加</text>
        </view>
      </view>
      <view class="log-list" v-if="getMealLogs(meal.type).length > 0">
        <view
          class="log-item"
          v-for="log in getMealLogs(meal.type)"
          :key="log.id"
        >
          <view class="log-top-row">
            <text class="log-name">{{ log.food_name }}</text>
            <view class="log-actions">
              <text class="action-icon" @click.stop="openEditModal(log)">✏️</text>
              <text class="action-icon" @click.stop="confirmDelete(log)">🗑️</text>
            </view>
            <text class="log-cal">{{ log.calories }} 千卡</text>
          </view>
          <text class="log-macros">蛋白{{ log.protein }}g · 脂肪{{ log.fat }}g · 碳水{{ log.carbohydrate }}g · 纤维{{ log.fiber || 0 }}g</text>
        </view>
      </view>
      <view class="meal-empty" v-else>
        <text>点击「+ 添加」记录{{ meal.label }}</text>
      </view>
    </view>

    <!-- 查看报表按钮 -->
    <view class="report-link" @click="goToReport">
      <text>📊 查看营养报表</text>
    </view>

    <!-- 添加/编辑记录弹窗 -->
    <view class="modal-mask" v-if="showModal" @click="closeModal">
      <view class="modal-box" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ editingLog ? '编辑记录' : '添加' + currentMealLabel }}</text>
          <text class="modal-close" @click="closeModal">✕</text>
        </view>

        <!-- 搜索食谱（仅添加模式） -->
        <view v-if="!editingLog">
          <view class="search-bar">
            <input
              class="search-input"
              v-model="searchKeyword"
              placeholder="搜索食谱名称..."
              @input="onSearchInput"
              confirm-type="search"
            />
          </view>

          <!-- 搜索结果 -->
          <scroll-view class="search-results" scroll-y v-if="searchResults.length > 0">
            <view
              class="search-item"
              v-for="recipe in searchResults"
              :key="recipe.id"
              @click="selectRecipe(recipe)"
            >
              <image class="search-cover" :src="recipe.cover_image || '/static/images/default-recipe.svg'" mode="aspectFill" />
              <view class="search-info">
                <text class="search-name">{{ recipe.name }}</text>
                <text class="search-cal">{{ recipe.total_calories || '—' }} 千卡</text>
              </view>
            </view>
          </scroll-view>
        </view>

        <!-- 自定义食物 / 编辑表单 -->
        <view class="custom-section">
          <text class="custom-title">{{ editingLog ? '修改营养信息' : '或手动输入' }}</text>
          <input class="custom-input" v-model="customForm.name" :disabled="!!editingLog && !!editingLog.recipe" placeholder="食物名称" />
          <view class="custom-row">
            <view class="custom-field">
              <text class="custom-label">热量(千卡)</text>
              <input class="custom-num" v-model="customForm.calories" type="digit" placeholder="0" />
            </view>
            <view class="custom-field">
              <text class="custom-label">蛋白(g)</text>
              <input class="custom-num" v-model="customForm.protein" type="digit" placeholder="0" />
            </view>
          </view>
          <view class="custom-row">
            <view class="custom-field">
              <text class="custom-label">脂肪(g)</text>
              <input class="custom-num" v-model="customForm.fat" type="digit" placeholder="0" />
            </view>
            <view class="custom-field">
              <text class="custom-label">碳水(g)</text>
              <input class="custom-num" v-model="customForm.carbohydrate" type="digit" placeholder="0" />
            </view>
          </view>
          <view class="custom-row">
            <view class="custom-field">
              <text class="custom-label">纤维(g)</text>
              <input class="custom-num" v-model="customForm.fiber" type="digit" placeholder="0" />
            </view>
            <view class="custom-field"></view>
          </view>
          <view class="custom-submit" @click="submitCustom">
            <text>{{ editingLog ? '保存修改' : '添加自定义食物' }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
import { getDiaryByDate, addDiaryRecord, deleteDiaryRecord, updateDiaryRecord } from '@/api/nutrition'
import { getRecipeList } from '@/api/recipe'
import { useUserStore } from '@/store'

export default {
  name: 'NutritionDiary',
  data() {
    return {
      date: '',
      logs: [],
      summary: { calories: 0, protein: 0, fat: 0, carbohydrate: 0, fiber: 0 },
      targetCalories: 2000,
      loading: false,
      showModal: false,
      currentMealType: 'lunch',
      searchKeyword: '',
      searchResults: [],
      searchTimer: null,
      editingLog: null,
      customForm: { name: '', calories: '', protein: '', fat: '', carbohydrate: '', fiber: '' },
      mealTypes: [
        { type: 'breakfast', label: '早餐', icon: '🌅' },
        { type: 'lunch', label: '午餐', icon: '☀️' },
        { type: 'dinner', label: '晚餐', icon: '🌙' },
        { type: 'snack', label: '加餐', icon: '🍎' }
      ]
    }
  },
  computed: {
    dateLabel() {
      if (!this.date) return ''
      const today = new Date().toISOString().slice(0, 10)
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
      if (this.date === today) return '今天 ' + this.date
      if (this.date === yesterday) return '昨天 ' + this.date
      return this.date
    },
    isToday() {
      const today = new Date().toISOString().slice(0, 10)
      return this.date >= today
    },
    caloriePercent() {
      if (!this.targetCalories) return 0
      return Math.min(Math.round(this.summary.calories / this.targetCalories * 100), 100)
    },
    remainCalories() {
      return Math.round(this.targetCalories - this.summary.calories)
    },
    currentMealLabel() {
      const meal = this.mealTypes.find(m => m.type === this.currentMealType)
      return meal ? meal.label : ''
    },
    macroTargets() {
      const cal = this.targetCalories || 2000
      return {
        protein:      Math.max(Math.round(cal * 0.175 / 4), 1),
        fat:          Math.max(Math.round(cal * 0.300 / 9), 1),
        carbohydrate: Math.max(Math.round(cal * 0.525 / 4), 1),
        fiber:        25,
      }
    }
  },
  onLoad() {
    this.date = new Date().toISOString().slice(0, 10)
    this._syncTargetCalories()
    this.loadDiary()
  },
  onShow() {
    this._syncTargetCalories()
  },
  methods: {
    _syncTargetCalories() {
      const userStore = useUserStore()
      if (userStore.userInfo?.daily_calories_target) {
        this.targetCalories = userStore.userInfo.daily_calories_target
      }
    },

    async loadDiary() {
      this.loading = true
      try {
        const res = await getDiaryByDate(this.date)
        const data = res.data || {}
        this.logs = data.logs || []
        this.summary = data.summary || { calories: 0, protein: 0, fat: 0, carbohydrate: 0, fiber: 0 }
      } catch (error) {
        console.error('加载失败:', error)
        uni.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        this.loading = false
      }
    },

    changeDate(delta) {
      if (delta > 0 && this.isToday) return
      const d = new Date(this.date)
      d.setDate(d.getDate() + delta)
      this.date = d.toISOString().slice(0, 10)
      this.loadDiary()
    },

    onDateChange(e) {
      this.date = e.detail.value
      this.loadDiary()
    },

    getMealLogs(mealType) {
      return this.logs.filter(l => l.meal_type === mealType)
    },

    getMealCalories(mealType) {
      return this.getMealLogs(mealType).reduce((s, l) => s + Number(l.calories || 0), 0).toFixed(0)
    },

    openAddModal(mealType) {
      this.currentMealType = mealType
      this.editingLog = null
      this.searchKeyword = ''
      this.searchResults = []
      this.customForm = { name: '', calories: '', protein: '', fat: '', carbohydrate: '', fiber: '' }
      this.showModal = true
    },

    openEditModal(log) {
      this.editingLog = log
      this.customForm = {
        name: log.food_name,
        calories: String(log.calories),
        protein: String(log.protein),
        fat: String(log.fat),
        carbohydrate: String(log.carbohydrate),
        fiber: String(log.fiber || 0),
      }
      this.searchKeyword = ''
      this.searchResults = []
      this.showModal = true
    },

    closeModal() {
      this.showModal = false
      this.editingLog = null
    },

    onSearchInput() {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => this.searchRecipes(), 400)
    },

    async searchRecipes() {
      if (!this.searchKeyword.trim()) {
        this.searchResults = []
        return
      }
      try {
        const res = await getRecipeList({ search: this.searchKeyword, page_size: 10 })
        const data = res.data
        this.searchResults = data && data.results ? data.results : (Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('搜索失败:', error)
      }
    },

    async selectRecipe(recipe) {
      try {
        await addDiaryRecord({
          recipe: recipe.id,
          meal_type: this.currentMealType,
          date: this.date
        })
        this.closeModal()
        uni.showToast({ title: '添加成功', icon: 'success' })
        this.loadDiary()
      } catch (error) {
        console.error('添加失败:', error)
        uni.showToast({ title: '添加失败', icon: 'none' })
      }
    },

    async submitCustom() {
      if (!this.customForm.name.trim()) {
        uni.showToast({ title: '请输入食物名称', icon: 'none' })
        return
      }
      const form = {
        calories:     Number(this.customForm.calories)     || 0,
        protein:      Number(this.customForm.protein)      || 0,
        fat:          Number(this.customForm.fat)          || 0,
        carbohydrate: Number(this.customForm.carbohydrate) || 0,
        fiber:        Number(this.customForm.fiber)        || 0,
      }
      try {
        if (this.editingLog) {
          await updateDiaryRecord(this.editingLog.id, form)
          uni.showToast({ title: '修改成功', icon: 'success' })
        } else {
          await addDiaryRecord({
            custom_name: this.customForm.name,
            ...form,
            meal_type: this.currentMealType,
            date: this.date
          })
          uni.showToast({ title: '添加成功', icon: 'success' })
        }
        this.closeModal()
        this.loadDiary()
      } catch (error) {
        console.error('操作失败:', error)
        uni.showToast({ title: '操作失败', icon: 'none' })
      }
    },

    confirmDelete(log) {
      uni.showModal({
        title: '删除记录',
        content: `确定删除「${log.food_name}」吗？`,
        confirmColor: '#ff4d4f',
        success: async (res) => {
          if (res.confirm) {
            try {
              await deleteDiaryRecord(log.id)
              uni.showToast({ title: '已删除', icon: 'none' })
              this.loadDiary()
            } catch (error) {
              console.error('删除失败:', error)
            }
          }
        }
      })
    },

    goToReport() {
      uni.navigateTo({ url: '/pages/nutrition/report' })
    }
  }
}
</script>

<style lang="scss" scoped>
.diary-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 40rpx;
}

.date-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  padding: 24rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
}

.date-arrow {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
  color: #667eea;

  &.disabled {
    color: #cccccc;
  }
}

.date-text {
  font-size: 30rpx;
  color: #333333;
  font-weight: 500;
  padding: 0 30rpx;
}

.summary-card {
  margin: 24rpx 20rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  padding: 30rpx;
}

.summary-main {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
}

.calorie-ring {
  width: 140rpx;
  height: 140rpx;
  border-radius: 70rpx;
  border: 6rpx solid rgba(255, 255, 255, 0.4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
  flex-shrink: 0;
}

.calorie-num {
  font-size: 40rpx;
  font-weight: bold;
  color: #ffffff;
  line-height: 1.2;
}

.calorie-unit {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}

.calorie-info {
  flex: 1;
}

.target-text {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  display: block;
  margin-bottom: 12rpx;
}

.progress-bar {
  height: 12rpx;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 6rpx;
  overflow: hidden;
  margin-bottom: 10rpx;
}

.progress-fill {
  height: 100%;
  background-color: #ffffff;
  border-radius: 6rpx;
  transition: width 0.3s ease;
}

.remain-text {
  font-size: 26rpx;
  color: #ffffff;
  font-weight: 500;
}

.macro-row {
  display: flex;
  gap: 20rpx;
}

.macro-item {
  flex: 1;
  background-color: rgba(255, 255, 255, 0.15);
  border-radius: 12rpx;
  padding: 16rpx 12rpx;
}

.macro-num {
  font-size: 30rpx;
  font-weight: bold;
  color: #ffffff;
  display: block;
  margin-bottom: 4rpx;
}

.macro-label {
  font-size: 20rpx;
  color: rgba(255, 255, 255, 0.75);
  display: block;
  margin-bottom: 10rpx;
}

.macro-bar {
  height: 8rpx;
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 4rpx;
  overflow: hidden;
}

.macro-fill {
  height: 100%;
  border-radius: 4rpx;

  &.protein { background-color: #52c41a; }
  &.fat { background-color: #faad14; }
  &.carb { background-color: #1890ff; }
}

.meal-section {
  margin: 0 20rpx 20rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
}

.meal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 30rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.meal-title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.meal-icon {
  font-size: 36rpx;
}

.meal-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333333;
}

.meal-calories {
  font-size: 24rpx;
  color: #999999;
}

.add-btn {
  padding: 10rpx 28rpx;
  border-radius: 30rpx;
  background-color: #667eea;

  text {
    font-size: 24rpx;
    color: #ffffff;
  }
}

.log-list {
  padding: 0 30rpx;
}

.log-item {
  padding: 20rpx 0;
  border-bottom: 1rpx solid #f9f9f9;

  &:last-child {
    border-bottom: none;
  }
}

.log-top-row {
  display: flex;
  align-items: center;
  margin-bottom: 8rpx;
}

.log-name {
  flex: 1;
  font-size: 28rpx;
  color: #333333;
}

.log-actions {
  display: flex;
  gap: 16rpx;
  margin-right: 16rpx;
}

.action-icon {
  font-size: 32rpx;
  padding: 4rpx;
}

.log-cal {
  font-size: 28rpx;
  color: #667eea;
  font-weight: 500;
}

.log-macros {
  font-size: 22rpx;
  color: #999999;
}

.meal-empty {
  padding: 30rpx;
  text-align: center;
  font-size: 26rpx;
  color: #cccccc;
}

.report-link {
  text-align: center;
  padding: 30rpx;

  text {
    font-size: 28rpx;
    color: #667eea;
  }
}

/* 弹窗 */
.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
}

.modal-box {
  width: 100%;
  max-height: 80vh;
  background-color: #ffffff;
  border-radius: 30rpx 30rpx 0 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx 40rpx;
  border-bottom: 1rpx solid #f0f0f0;
  flex-shrink: 0;
}

.modal-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333333;
}

.modal-close {
  font-size: 36rpx;
  color: #999999;
  padding: 10rpx;
}

.search-bar {
  padding: 20rpx 40rpx;
  flex-shrink: 0;
}

.search-input {
  width: 100%;
  height: 72rpx;
  background-color: #f5f5f5;
  border-radius: 36rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.search-results {
  max-height: 300rpx;
  flex-shrink: 0;
}

.search-item {
  display: flex;
  align-items: center;
  padding: 16rpx 40rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.search-cover {
  width: 80rpx;
  height: 70rpx;
  border-radius: 10rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
}

.search-info {
  flex: 1;
}

.search-name {
  font-size: 28rpx;
  color: #333333;
  display: block;
  margin-bottom: 6rpx;
}

.search-cal {
  font-size: 24rpx;
  color: #667eea;
}

.custom-section {
  padding: 20rpx 40rpx 40rpx;
  overflow-y: auto;
}

.custom-title {
  font-size: 26rpx;
  color: #999999;
  display: block;
  margin-bottom: 16rpx;
  margin-top: 10rpx;
}

.custom-input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #e8e8e8;
  border-radius: 12rpx;
  padding: 0 24rpx;
  font-size: 28rpx;
  box-sizing: border-box;
  margin-bottom: 16rpx;
}

.custom-row {
  display: flex;
  gap: 20rpx;
  margin-bottom: 16rpx;
}

.custom-field {
  flex: 1;
}

.custom-label {
  font-size: 24rpx;
  color: #666666;
  display: block;
  margin-bottom: 8rpx;
}

.custom-num {
  width: 100%;
  height: 72rpx;
  border: 1rpx solid #e8e8e8;
  border-radius: 10rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.custom-submit {
  margin-top: 20rpx;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  text {
    font-size: 30rpx;
    color: #ffffff;
    font-weight: 500;
  }
}

/* 膳食纤维行 */
.fiber-row {
  margin-top: 20rpx;
  padding-top: 18rpx;
  border-top: 1rpx solid rgba(255, 255, 255, 0.2);
}

.fiber-label-group {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.fiber-label {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.8);
}

.fiber-value {
  font-size: 22rpx;
  color: #ffffff;
  font-weight: 500;
}

.fiber-bar {
  height: 8rpx;
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 4rpx;
  overflow: hidden;
}

.fiber-fill {
  height: 100%;
  background-color: #52c41a;
  border-radius: 4rpx;
  transition: width 0.3s ease;
}
</style>
