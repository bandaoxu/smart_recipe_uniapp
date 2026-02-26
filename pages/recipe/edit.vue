<template>
  <view class="edit-container">
    <view class="form-section" v-if="!pageLoading">
      <!-- 封面图 -->
      <view class="form-item">
        <text class="label required">封面图</text>
        <view class="cover-upload" @click="chooseCoverImage">
          <image v-if="formData.cover_image" :src="formData.cover_image" mode="aspectFill" class="cover-preview"></image>
          <view v-else class="upload-placeholder">
            <text class="upload-icon">📷</text>
            <text class="upload-text">点击上传封面图</text>
          </view>
        </view>
      </view>

      <!-- 食谱名称 -->
      <view class="form-item">
        <text class="label required">食谱名称</text>
        <uni-easyinput
          v-model="formData.name"
          placeholder="请输入食谱名称"
          :clearable="true"
          :inputBorder="false"
        />
      </view>

      <!-- 简介 -->
      <view class="form-item">
        <text class="label">简介</text>
        <uni-easyinput
          type="textarea"
          v-model="formData.description"
          placeholder="介绍一下这道菜的特色吧"
          :maxlength="500"
          :inputBorder="false"
        />
      </view>

      <!-- 难度 -->
      <view class="form-item">
        <text class="label required">难度</text>
        <uni-data-picker
          v-model="formData.difficulty"
          :localdata="difficulties"
          placeholder="请选择难度"
        />
      </view>

      <!-- 烹饪时间 -->
      <view class="form-item">
        <text class="label required">烹饪时间（分钟）</text>
        <uni-easyinput
          v-model.number="formData.cooking_time"
          type="number"
          placeholder="请输入烹饪时间"
          :clearable="true"
          :inputBorder="false"
        />
      </view>

      <!-- 份数 -->
      <view class="form-item">
        <text class="label required">份数</text>
        <uni-easyinput
          v-model.number="formData.servings"
          type="number"
          placeholder="请输入份数"
          :clearable="true"
          :inputBorder="false"
        />
      </view>

      <!-- 分类 -->
      <view class="form-item">
        <text class="label required">分类</text>
        <uni-data-picker
          v-model="formData.category"
          :localdata="categories"
          placeholder="请选择分类"
        />
      </view>

      <!-- 菜系 -->
      <view class="form-item">
        <text class="label">菜系</text>
        <uni-data-picker
          v-model="formData.cuisine"
          :localdata="cuisines"
          placeholder="请选择菜系"
        />
      </view>

      <!-- 食材列表 -->
      <view class="form-item">
        <view class="section-header">
          <text class="label required">食材列表</text>
          <button class="add-btn" @click="addIngredient">+ 添加食材</button>
        </view>
        <view class="ingredient-list">
          <view class="ingredient-item" v-for="(item, index) in formData.ingredients" :key="index">
            <uni-easyinput
              class="ingredient-input"
              v-model="item.name"
              placeholder="食材名称"
              :inputBorder="false"
            />
            <uni-easyinput
              class="quantity-input"
              v-model="item.quantity"
              placeholder="数量"
              :inputBorder="false"
            />
            <uni-easyinput
              class="unit-input"
              v-model="item.unit"
              placeholder="单位"
              :inputBorder="false"
            />
            <text class="remove-btn" @click="removeIngredient(index)">✕</text>
          </view>
        </view>
      </view>

      <!-- 烹饪步骤 -->
      <view class="form-item">
        <view class="section-header">
          <text class="label required">烹饪步骤</text>
          <button class="add-btn" @click="addStep">+ 添加步骤</button>
        </view>
        <view class="step-list">
          <view class="step-item" v-for="(step, index) in formData.steps" :key="index">
            <view class="step-header">
              <text class="step-number">步骤 {{ index + 1 }}</text>
              <text class="remove-btn" @click="removeStep(index)">✕</text>
            </view>
            <uni-easyinput
              type="textarea"
              class="step-textarea"
              v-model="step.description"
              placeholder="描述这一步的操作"
              :maxlength="500"
              :inputBorder="false"
            />
            <view class="step-image-upload" @click="chooseStepImage(index)">
              <image v-if="step.image_url" :src="step.image_url" mode="aspectFill" class="step-image-preview"></image>
              <view v-else class="step-upload-placeholder">
                <text class="upload-icon">📷</text>
                <text class="upload-text">添加步骤图片（可选）</text>
              </view>
            </view>
            <uni-easyinput
              class="step-input"
              v-model="step.tips"
              placeholder="小贴士（可选）"
              :inputBorder="false"
            />
          </view>
        </view>
      </view>

      <!-- 提交按钮 -->
      <button class="submit-btn" @click="handleSubmit" :loading="loading">
        {{ loading ? '保存中...' : '保存修改' }}
      </button>
    </view>

    <!-- 页面加载中 -->
    <view class="page-loading" v-if="pageLoading">
      <text>加载中...</text>
    </view>
  </view>
</template>

<script>
/**
 * edit.vue - 编辑食谱页面
 *
 * 功能：
 * 1. 加载现有食谱数据
 * 2. 编辑表单（同创建页面）
 * 3. 提交更新
 */

import { getRecipeDetail, updateRecipe } from '@/api/recipe'
import { getToken } from '@/utils/auth'

export default {
  name: 'EditRecipe',
  data() {
    return {
      recipeId: null,
      formData: {
        name: '',
        description: '',
        cover_image: '',
        difficulty: '',
        cooking_time: null,
        servings: null,
        category: '',
        cuisine: '',
        ingredients: [],
        steps: []
      },
      loading: false,
      pageLoading: true,

      // 难度选项
      difficulties: [
        { text: '简单', value: 'easy' },
        { text: '中等', value: 'medium' },
        { text: '困难', value: 'hard' }
      ],

      // 分类选项
      categories: [
        { text: '早餐', value: 'breakfast' },
        { text: '午餐', value: 'lunch' },
        { text: '晚餐', value: 'dinner' },
        { text: '甜品', value: 'dessert' },
        { text: '小吃', value: 'snack' },
        { text: '饮品', value: 'drink' }
      ],

      // 菜系选项
      cuisines: [
        { text: '中餐', value: 'chinese' },
        { text: '粤菜', value: 'cantonese' },
        { text: '川菜', value: 'sichuan' },
        { text: '湘菜', value: 'hunan' },
        { text: '鲁菜', value: 'shandong' },
        { text: '西餐', value: 'western' },
        { text: '日料', value: 'japanese' },
        { text: '韩餐', value: 'korean' }
      ]
    }
  },
  computed: {
    // 移除 computed 属性，uni-data-picker 直接使用 v-model
  },
  onLoad(options) {
    if (options.id) {
      this.recipeId = options.id
      this.loadRecipeData()
    } else {
      uni.showToast({
        title: '参数错误',
        icon: 'none'
      })
      setTimeout(() => {
        uni.navigateBack()
      }, 1500)
    }
  },
  methods: {
    /**
     * 加载食谱数据
     */
    async loadRecipeData() {
      this.pageLoading = true

      try {
        const res = await getRecipeDetail(this.recipeId)
        const recipe = res.data

        this.formData = {
          name: recipe.name,
          description: recipe.description || '',
          cover_image: recipe.cover_image,
          difficulty: recipe.difficulty,
          cooking_time: recipe.cooking_time,
          servings: recipe.servings,
          category: recipe.category,
          cuisine: recipe.cuisine || '',
          ingredients: recipe.ingredients.map(item => ({
            name: item.ingredient?.name || item.name,
            quantity: item.quantity,
            unit: item.unit
          })),
          steps: recipe.steps.map(step => ({
            step_number: step.step_number,
            description: step.description,
            image_url: step.image_url || '',
            tips: step.tips || ''
          }))
        }

      } catch (error) {
        console.error('加载失败:', error)
        uni.showToast({
          title: '加载失败',
          icon: 'none'
        })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } finally {
        this.pageLoading = false
      }
    },

    /**
     * 选择封面图
     */
    chooseCoverImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0]
          this.uploadImage(tempFilePath, (url) => {
            this.formData.cover_image = url
          })
        }
      })
    },

    /**
     * 选择步骤图片
     */
    chooseStepImage(index) {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0]
          this.uploadImage(tempFilePath, (url) => {
            this.formData.steps[index].image_url = url
          })
        }
      })
    },

    /**
     * 上传图片
     */
    uploadImage(filePath, callback) {
      uni.showLoading({ title: '上传中...' })

      uni.uploadFile({
        url: 'http://127.0.0.1:8000/api/upload/',
        filePath: filePath,
        name: 'file',
        header: {
          'Authorization': `Bearer ${getToken()}`
        },
        success: (uploadRes) => {
          const data = JSON.parse(uploadRes.data)
          if (data.code === 200) {
            callback(data.data.url)
            uni.showToast({
              title: '上传成功',
              icon: 'success'
            })
          } else {
            uni.showToast({
              title: '上传失败',
              icon: 'none'
            })
          }
        },
        fail: () => {
          uni.showToast({
            title: '上传失败',
            icon: 'none'
          })
        },
        complete: () => {
          uni.hideLoading()
        }
      })
    },

    /**
     * 难度选择变化 - 移除，uni-data-picker 使用 v-model 自动绑定
     */

    /**
     * 分类选择变化 - 移除，uni-data-picker 使用 v-model 自动绑定
     */

    /**
     * 菜系选择变化 - 移除，uni-data-picker 使用 v-model 自动绑定
     */

    /**
     * 添加食材
     */
    addIngredient() {
      this.formData.ingredients.push({
        name: '',
        quantity: '',
        unit: ''
      })
    },

    /**
     * 删除食材
     */
    removeIngredient(index) {
      if (this.formData.ingredients.length === 1) {
        uni.showToast({
          title: '至少保留一个食材',
          icon: 'none'
        })
        return
      }
      this.formData.ingredients.splice(index, 1)
    },

    /**
     * 添加步骤
     */
    addStep() {
      this.formData.steps.push({
        step_number: this.formData.steps.length + 1,
        description: '',
        image_url: '',
        tips: ''
      })
    },

    /**
     * 删除步骤
     */
    removeStep(index) {
      if (this.formData.steps.length === 1) {
        uni.showToast({
          title: '至少保留一个步骤',
          icon: 'none'
        })
        return
      }
      this.formData.steps.splice(index, 1)
      // 重新编号
      this.formData.steps.forEach((step, i) => {
        step.step_number = i + 1
      })
    },

    /**
     * 表单验证
     */
    validateForm() {
      if (!this.formData.name) {
        uni.showToast({ title: '请输入食谱名称', icon: 'none' })
        return false
      }
      if (!this.formData.cover_image) {
        uni.showToast({ title: '请上传封面图', icon: 'none' })
        return false
      }
      if (!this.formData.difficulty) {
        uni.showToast({ title: '请选择难度', icon: 'none' })
        return false
      }
      if (!this.formData.cooking_time) {
        uni.showToast({ title: '请输入烹饪时间', icon: 'none' })
        return false
      }
      if (!this.formData.servings) {
        uni.showToast({ title: '请输入份数', icon: 'none' })
        return false
      }
      if (!this.formData.category) {
        uni.showToast({ title: '请选择分类', icon: 'none' })
        return false
      }

      // 验证食材
      const hasEmptyIngredient = this.formData.ingredients.some(item => !item.name || !item.quantity || !item.unit)
      if (hasEmptyIngredient) {
        uni.showToast({ title: '请完善食材信息', icon: 'none' })
        return false
      }

      // 验证步骤
      const hasEmptyStep = this.formData.steps.some(step => !step.description)
      if (hasEmptyStep) {
        uni.showToast({ title: '请完善步骤描述', icon: 'none' })
        return false
      }

      return true
    },

    /**
     * 提交表单
     */
    async handleSubmit() {
      if (!this.validateForm()) {
        return
      }

      this.loading = true

      try {
        await updateRecipe(this.recipeId, this.formData)

        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })

        setTimeout(() => {
          uni.navigateBack()
        }, 1500)

      } catch (error) {
        console.error('保存失败:', error)
        uni.showToast({
          title: error.message || '保存失败',
          icon: 'none'
        })
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.edit-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 120rpx;
}

.form-section {
  padding: 20rpx;
}

.form-item {
  background-color: #ffffff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333333;
  margin-bottom: 20rpx;
  font-weight: 500;
}

.required::before {
  content: '*';
  color: #ff4d4f;
  margin-right: 8rpx;
}

/* uni-easyinput 样式 */
.form-item ::v-deep .uni-easyinput__content {
  background-color: #f5f5f5;
  border-radius: 10rpx;
  min-height: 88rpx;
}

.form-item ::v-deep .uni-easyinput__content-input {
  font-size: 28rpx;
  color: #333333;
}

.form-item ::v-deep .uni-easyinput__content-textarea {
  font-size: 28rpx;
  color: #333333;
  min-height: 150rpx;
}

/* uni-data-picker 样式 */
.form-item ::v-deep .uni-data-picker {
  background-color: #f5f5f5;
  border-radius: 10rpx;
  height: 88rpx;
}

/* 移除原生 input/textarea/picker 样式，已被 uni-ui 组件替代 */

.cover-upload {
  width: 100%;
  height: 400rpx;
  border-radius: 16rpx;
  overflow: hidden;
}

.cover-preview {
  width: 100%;
  height: 100%;
}

.upload-placeholder,
.step-upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #f5f5f5;
}

.upload-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.upload-text {
  font-size: 26rpx;
  color: #999999;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.add-btn {
  padding: 10rpx 30rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20rpx;
  font-size: 24rpx;
  color: #ffffff;
  border: none;
  line-height: normal;
}

.add-btn::after {
  border: none;
}

.ingredient-list,
.step-list {
  margin-top: 20rpx;
}

.ingredient-item {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.ingredient-input,
.quantity-input,
.unit-input {
  margin-right: 10rpx;
}

.ingredient-input {
  flex: 2;
}

.quantity-input,
.unit-input {
  flex: 1;
}

.ingredient-item ::v-deep .uni-easyinput__content {
  background-color: #f5f5f5;
  border-radius: 8rpx;
  height: 70rpx;
}

.ingredient-item ::v-deep .uni-easyinput__content-input {
  font-size: 26rpx;
  height: 70rpx;
}

.remove-btn {
  width: 60rpx;
  height: 60rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  color: #ff4d4f;
}

.step-item {
  background-color: #f5f5f5;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 20rpx;
}

.step-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20rpx;
}

.step-number {
  font-size: 28rpx;
  font-weight: bold;
  color: #667eea;
}

.step-textarea,
.step-input {
  margin-bottom: 20rpx;
}

.step-item ::v-deep .uni-easyinput__content {
  background-color: #ffffff;
  border-radius: 8rpx;
}

.step-item ::v-deep .uni-easyinput__content-textarea {
  font-size: 26rpx;
  min-height: 150rpx;
}

.step-item ::v-deep .uni-easyinput__content-input {
  font-size: 26rpx;
  height: 70rpx;
}

.step-image-upload {
  width: 100%;
  height: 300rpx;
  border-radius: 12rpx;
  overflow: hidden;
  margin-bottom: 20rpx;
}

.step-image-preview {
  width: 100%;
  height: 100%;
}

/* 移除原生 step-input 样式，已被 uni-easyinput 替代 */

.submit-btn {
  width: 100%;
  height: 88rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10rpx;
  font-size: 32rpx;
  color: #ffffff;
  font-weight: bold;
  border: none;
  margin-top: 40rpx;
}

.submit-btn::after {
  border: none;
}

.page-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-size: 28rpx;
  color: #999999;
}
</style>
