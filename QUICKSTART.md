# 快速启动指南

## 🚀 5分钟快速启动

### 1. 下载 HBuilderX
- 访问：https://www.dcloud.io/hbuilderx.html
- 下载并安装 HBuilderX（标准版即可）

### 2. 打开项目
1. 启动 HBuilderX
2. 点击菜单：文件 -> 打开目录
3. 选择 `smart-recipe-uniapp` 文件夹
4. 等待项目加载完成

### 3. 配置后端地址
编辑 `api/request.js` 第13行：
```javascript
const BASE_URL = 'http://127.0.0.1:8000/api'
```

### 4. 启动后端服务
```bash
cd smart_recipe_server
uv run python manage.py runserver
```

### 5. 运行前端项目
在 HBuilderX 中：
- 点击菜单：运行 -> 运行到浏览器 -> Chrome
- 或按快捷键：Ctrl + R

浏览器会自动打开项目！

## ✅ 验证成功

如果看到登录页面或首页，说明启动成功！

## 🐛 遇到问题？

查看详细文档：
- [SETUP.md](SETUP.md) - 完整安装指南
- [COMPLETION_REPORT.md](COMPLETION_REPORT.md) - 项目详情

## 📱 开发微信小程序

1. 下载微信开发者工具
2. 在 HBuilderX 中：运行 -> 运行到小程序模拟器 -> 微信开发者工具
3. 首次运行需要配置微信开发者工具路径

---

**重要提示**:
- ✅ 已修复 uni-ui 依赖问题
- ✅ 项目可以直接在 HBuilderX 中运行
- ✅ 不需要执行 `npm install`（可选）
