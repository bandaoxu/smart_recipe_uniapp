# 智能食谱小程序前端

基于 Vue3 + UniApp 的跨平台智能食谱小程序前端项目。

## 📋 项目概述

本项目是智能食谱小程序的前端部分，支持微信小程序、H5、iOS/Android App 多端发布。提供食谱浏览、创建、搜索、社区互动、购物清单等完整功能。

## 🚀 技术栈

- **框架**: Vue 3 + UniApp
- **状态管理**: Pinia
- **UI 组件库**: uni-ui
- **网络请求**: uni.request（封装）
- **认证方式**: JWT Token

## 📁 项目结构

```
smart-recipe-uniapp/
├── pages/                        # 页面目录
│   ├── index/                    # 首页
│   ├── recipe/                   # 食谱模块
│   ├── community/                # 社区模块
│   ├── shopping/                 # 购物清单
│   └── user/                     # 用户中心
├── components/                   # 公共组件
│   ├── RecipeCard.vue            # 食谱卡片
│   ├── PostCard.vue              # 动态卡片
│   └── CommentList.vue           # 评论列表
├── api/                          # API 封装
│   ├── request.js                # 请求封装（JWT、Token 刷新）
│   ├── user.js                   # 用户 API
│   ├── recipe.js                 # 食谱 API
│   ├── community.js              # 社区 API
│   └── shopping.js               # 购物清单 API
├── store/                        # Pinia 状态管理
│   ├── index.js                  # Store 入口
│   ├── user.js                   # 用户状态
│   └── app.js                    # 应用状态
├── utils/                        # 工具函数
│   ├── auth.js                   # Token 管理
│   ├── storage.js                # 本地存储
│   ├── validate.js               # 表单验证
│   └── format.js                 # 数据格式化
├── static/                       # 静态资源
├── App.vue                       # 应用入口
├── main.js                       # 主文件
├── manifest.json                 # 应用配置
├── pages.json                    # 页面路由配置
└── package.json                  # 项目依赖
```

## ✨ 已实现功能

### 基础架构 ✅
- [x] 项目目录结构
- [x] 配置文件（manifest.json、pages.json）
- [x] 应用入口（App.vue、main.js）
- [x] 全局样式和主题

### API 层 ✅
- [x] 网络请求封装（request.js）
  - 自动添加 JWT Token
  - Token 自动刷新机制
  - 统一错误处理
  - 请求/响应拦截
- [x] 用户 API（注册、登录、个人信息）
- [x] 食谱 API（CRUD、点赞、收藏、搜索）
- [x] 社区 API（动态、评论、点赞）
- [x] 购物清单 API

### 状态管理 ✅
- [x] Pinia Store 配置
- [x] 用户状态管理（登录、用户信息、Token）
- [x] 应用状态管理（加载状态、搜索历史）

### 工具函数 ✅
- [x] 认证工具（Token 存储、获取、清除）
- [x] 本地存储工具（同步/异步存储）
- [x] 表单验证工具（用户名、密码、邮箱、手机号）
- [x] 数据格式化工具（时间、数字、文本）

### 公共组件 ✅
- [x] RecipeCard - 食谱卡片组件
- [x] PostCard - 动态卡片组件
- [x] CommentList - 评论列表组件

### 待实现功能 ⏳
- [ ] 用户模块页面（登录、注册、个人中心）
- [ ] 食谱模块页面（首页、列表、详情、创建、编辑、搜索）
- [ ] 社区模块页面（动态流、发布、详情）
- [ ] 购物清单页面

## 🔧 开发指南

### 环境要求

- Node.js 14+
- HBuilderX（推荐）或 Vue CLI

### 安装依赖

```bash
npm install
```

### 开发运行

```bash
# 微信小程序
npm run dev:mp-weixin

# H5
npm run dev:h5
```

### 构建发布

```bash
# 微信小程序
npm run build:mp-weixin

# H5
npm run build:h5
```

## 📡 API 配置

### 修改 API 地址

编辑 `api/request.js` 文件：

```javascript
// 开发环境
const BASE_URL = 'http://127.0.0.1:8000/api'

// 生产环境
const BASE_URL = 'https://your-domain.com/api'
```

### API 响应格式

所有 API 返回统一格式：

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

## 🔐 认证机制

### JWT Token 管理

- **Access Token**: 有效期 30 分钟，用于 API 请求认证
- **Refresh Token**: 有效期 7 天，用于刷新 Access Token
- **自动刷新**: 当 Access Token 过期时，自动使用 Refresh Token 刷新

### 使用示例

```javascript
import { useUserStore } from '@/store'

const userStore = useUserStore()

// 登录
await userStore.login({
  username: 'testuser',
  password: 'password123'
})

// 退出登录
userStore.logout()
```

## 📦 核心功能说明

### 1. 网络请求

```javascript
import request from '@/api/request'

// GET 请求
const res = await request({
  url: '/recipe/',
  method: 'GET',
  params: { page: 1 }
})

// POST 请求（需要认证）
const res = await request({
  url: '/recipe/',
  method: 'POST',
  data: { name: '宫保鸡丁' }
})

// 不需要认证的请求
const res = await request({
  url: '/recipe/',
  method: 'GET',
  needAuth: false
})
```

### 2. 状态管理

```javascript
import { useUserStore, useAppStore } from '@/store'

// 用户状态
const userStore = useUserStore()
console.log(userStore.nickname)  // 获取昵称
console.log(userStore.isLoggedIn)  // 是否已登录

// 应用状态
const appStore = useAppStore()
appStore.setLoading(true)  // 显示加载
appStore.addSearchHistory('宫保鸡丁')  // 添加搜索历史
```

### 3. 表单验证

```javascript
import { validateUsername, validatePassword } from '@/utils/validate'

const usernameError = validateUsername('test')
if (usernameError) {
  console.log(usernameError)  // "用户名至少3个字符"
}
```

### 4. 数据格式化

```javascript
import { formatTime, formatRelativeTime, formatCookingTime } from '@/utils/format'

formatTime('2026-02-16T10:30:00')  // "2026-02-16 10:30:00"
formatRelativeTime('2026-02-16T10:00:00')  // "30分钟前"
formatCookingTime(90)  // "1小时30分钟"
```

## 🎨 组件使用

### RecipeCard 组件

```vue
<template>
  <RecipeCard :recipe="recipe" />
</template>

<script>
import RecipeCard from '@/components/RecipeCard.vue'

export default {
  components: { RecipeCard },
  data() {
    return {
      recipe: {
        id: 1,
        name: '宫保鸡丁',
        cover_image: 'https://...',
        difficulty: 'medium',
        cooking_time: 30,
        likes: 1234,
        favorites: 567,
        author: {
          nickname: '美食达人',
          avatar: 'https://...'
        }
      }
    }
  }
}
</script>
```

### PostCard 组件

```vue
<template>
  <PostCard :post="post" @like="handleLike" />
</template>

<script>
import PostCard from '@/components/PostCard.vue'

export default {
  components: { PostCard },
  methods: {
    handleLike(postId) {
      console.log('点赞动态:', postId)
    }
  }
}
</script>
```

## 📝 代码规范

### 命名规范

- **组件文件**: 大驼峰（RecipeCard.vue）
- **页面文件**: 小写短横线（my-recipes.vue）
- **JS 文件**: 小写短横线（request.js）
- **变量/函数**: 小驼峰（getUserInfo）
- **常量**: 大写下划线（BASE_URL）

### 注释规范

- 每个文件顶部添加功能说明注释
- 每个函数添加参数和返回值说明
- 复杂逻辑添加行内注释

## 🔗 相关链接

- **后端项目**: [smart_recipe_server](../smart_recipe_server/)
- **项目计划**: [智能食谱小程序项目详细计划书.docx](../智能食谱小程序项目详细计划书.docx)
- **后端文档**: [smart_recipe_server/README.md](../smart_recipe_server/README.md)

## 📄 许可证

本项目仅供学习和研究使用。

---

**当前状态**: 🚧 基础架构已完成，页面开发进行中

**最后更新**: 2026-02-26
