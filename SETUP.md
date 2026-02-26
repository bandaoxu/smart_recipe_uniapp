# 智能食谱前端 - 环境配置指南

## 📋 前置要求

### 必需软件
- **HBuilderX**: 最新版本（用于 UniApp 开发）- **必需**
- **Node.js**: >= 14.0.0（推荐使用 LTS 版本）- 可选，用于安装 Pinia
- **npm**: >= 6.0.0 - 可选

### 可选软件
- **微信开发者工具**: 用于微信小程序开发和调试
- **Git**: 用于版本控制

---

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd smart-recipe-uniapp
```

### 2. 安装依赖（可选）

**注意**: UniApp 项目主要通过 HBuilderX 运行，不需要手动安装 UniApp 相关依赖。

如果需要使用 Pinia 状态管理，可以安装：

```bash
npm install
```

这将安装 `pinia` 和 `vue` 依赖。

### 3. 使用 HBuilderX 打开项目

1. 打开 HBuilderX
2. 文件 -> 打开目录 -> 选择 `smart-recipe-uniapp` 目录
3. 等待项目加载完成

### 4. 配置后端 API 地址

编辑 [api/request.js](api/request.js:13) 文件，修改 `BASE_URL` 为实际的后端地址：

```javascript
// api/request.js
const BASE_URL = 'http://127.0.0.1:8000/api'  // 修改为实际后端地址
```

### 5. 运行项目

#### H5 开发

在 HBuilderX 中：
1. 点击顶部菜单：运行 -> 运行到浏览器 -> Chrome
2. 或使用快捷键：Ctrl + R

浏览器会自动打开项目。

#### 微信小程序开发

在 HBuilderX 中：
1. 点击顶部菜单：运行 -> 运行到小程序模拟器 -> 微信开发者工具
2. 首次运行需要配置微信开发者工具路径
3. 微信开发者工具会自动打开项目

---

## 🔧 详细配置

### 后端服务配置

确保后端服务已启动：

```bash
cd smart_recipe_server
uv run python manage.py runserver
```

验证后端服务：访问 http://127.0.0.1:8000/api/

### 微信小程序配置

1. **安装微信开发者工具**
   - 下载地址: https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

2. **配置 AppID**
   - 编辑 [manifest.json](manifest.json)
   - 在 `mp-weixin` 配置中填入你的 AppID
   - 或在 HBuilderX 中：manifest.json -> 微信小程序配置 -> AppID

3. **开启开发模式**
   - 在微信开发者工具中，点击右上角"详情"
   - 勾选"不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书"

### HBuilderX 配置

1. **配置微信开发者工具路径**
   - 工具 -> 设置 -> 运行配置 -> 小程序运行配置
   - 设置微信开发者工具的安装路径

2. **配置浏览器**
   - 工具 -> 设置 -> 运行配置 -> 浏览器运行配置
   - 选择默认浏览器

---

## 📦 构建发布

### H5 构建

在 HBuilderX 中：
1. 点击顶部菜单：发行 -> 网站-H5手机版
2. 选择发行目录
3. 点击发行

构建产物在 `unpackage/dist/build/h5` 目录。

### 微信小程序构建

在 HBuilderX 中：
1. 点击顶部菜单：发行 -> 小程序-微信
2. 填写小程序名称和 AppID
3. 点击发行

构建产物在 `unpackage/dist/build/mp-weixin` 目录。

然后在微信开发者工具中：
1. 打开构建产物目录
2. 点击右上角"上传"
3. 填写版本号和项目备注
4. 上传到微信公众平台

---

## 🐛 常见问题

### 1. HBuilderX 无法运行项目

**问题**: 点击运行后没有反应

**解决方案**:
- 检查是否正确打开了项目目录
- 检查 [manifest.json](manifest.json) 和 [pages.json](pages.json) 是否存在
- 重启 HBuilderX

### 2. 启动后白屏

**问题**: 启动后页面白屏

**检查**:
- 后端服务是否启动
- API 地址是否正确（[api/request.js:13](api/request.js:13)）
- 浏览器控制台是否有错误

**解决**:
- 检查 [api/request.js](api/request.js:13) 中的 `BASE_URL`
- 确保后端服务运行在 http://127.0.0.1:8000
- 打开浏览器开发者工具查看网络请求

### 3. 微信小程序无法请求接口

**问题**: 小程序中无法请求后端接口

**解决**:
- 在微信开发者工具中，点击右上角"详情"
- 勾选"不校验合法域名"选项
- 或在微信公众平台配置服务器域名（生产环境）

### 4. 图片上传失败

**问题**: 上传图片时失败

**检查**:
- 后端上传接口是否正常（访问 http://127.0.0.1:8000/api/upload/）
- Token 是否有效（检查是否已登录）
- 图片大小是否超限（建议小于 2MB）

**解决**:
- 检查后端日志
- 检查浏览器控制台的网络请求
- 确认已登录并且 Token 有效

### 5. Pinia 状态管理报错

**问题**: 提示找不到 Pinia

**解决**:
```bash
npm install pinia vue
```

### 6. 找不到组件

**问题**: 提示找不到 RecipeCard、PostCard 等组件

**检查**:
- 确认 [components](components/) 目录下的组件文件是否存在
- 检查组件引入路径是否正确（使用 `@/components/`）

---

## 📱 多端开发

### H5 开发
- 使用 HBuilderX 内置浏览器或外部浏览器
- 支持热重载
- 推荐使用 Chrome 浏览器
- 可以使用浏览器开发者工具调试

### 微信小程序开发
- 使用微信开发者工具
- 支持真机预览（点击"预览"生成二维码）
- 支持真机调试（点击"真机调试"）
- 注意小程序的限制和规范

### App 开发（可选）
- 在 HBuilderX 中：运行 -> 运行到手机或模拟器
- 需要配置 iOS/Android 开发环境
- 参考 UniApp 官方文档

---

## 📂 项目结构说明

```
smart-recipe-uniapp/
├── api/                    # API 接口封装
├── components/             # 公共组件
├── pages/                  # 页面文件
├── store/                  # Pinia 状态管理
├── utils/                  # 工具函数
├── static/                 # 静态资源
├── App.vue                 # 应用入口
├── main.js                 # 主文件
├── manifest.json           # 应用配置
├── pages.json              # 页面路由配置
├── uni.scss                # 全局样式变量
└── package.json            # 项目依赖
```

---

## 🔗 相关链接

- [UniApp 官方文档](https://uniapp.dcloud.net.cn/)
- [HBuilderX 下载](https://www.dcloud.io/hbuilderx.html)
- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Pinia 官方文档](https://pinia.vuejs.org/zh/)
- [uni-ui 组件库](https://uniapp.dcloud.net.cn/component/uniui/uni-ui.html)
- [微信小程序开发文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)

---

## 📞 技术支持

如果遇到问题，请：
1. 查看本文档的常见问题部分
2. 查看项目的 [README.md](README.md)
3. 查看 [COMPLETION_REPORT.md](COMPLETION_REPORT.md) 了解项目详情
4. 查看 UniApp 官方文档
5. 提交 Issue 到项目仓库

---

## ✅ 验证安装

### 检查项目是否正常运行

1. **后端服务检查**
   ```bash
   curl http://127.0.0.1:8000/api/
   ```
   应该返回 API 响应

2. **前端项目检查**
   - 在 HBuilderX 中运行到浏览器
   - 应该能看到登录页面或首页
   - 浏览器控制台没有错误

3. **API 连接检查**
   - 尝试注册或登录
   - 如果能成功，说明前后端连接正常

---

**最后更新**: 2026-02-26

**重要提示**: UniApp 项目推荐使用 HBuilderX 进行开发，这是最简单和最稳定的方式。
