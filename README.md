# Sparrow Blog

一个现代化的个人博客系统，基于 React 18+ 和 TypeScript 构建，具有优雅的 UI 设计和完善的功能特性。

## ✨ 特性

- 🎨 **现代化设计** - 简洁优雅的界面
- ⚡ **高性能** - 基于 Vite 构建，支持热更新和快速构建
- 🔍 **全文搜索** - 支持博客内容全文搜索
- 💬 **评论系统** - 完整的评论功能，支持回复和管理
- 🖼️ **图片管理** - 支持图片上传、预览和管理
- 👥 **友链管理** - 友情链接申请和管理功能
- 🔐 **后台管理** - 完整的后台管理系统
- 📊 **状态管理** - 基于 Zustand 的现代化状态管理
- 🎯 **TypeScript** - 完整的类型安全支持

## 🛠️ 技术栈

### 前端框架
- **React 19** - 最新的 React 版本
- **TypeScript** - 类型安全的 JavaScript
- **Vite** - 现代化的构建工具
- **React Router v7** - 路由管理

### 状态管理
- **Zustand** - 轻量级状态管理库

### UI 组件
- **SCSS** - CSS 预处理器
- **Material-UI** - UI 组件库
- **React Icons** - 图标库
- **ClassNames** - 动态类名管理

### 内容处理
- **React Markdown** - Markdown 渲染
- **Highlight.js** - 代码高亮
- **DOMPurify** - HTML 安全处理

### 工具库
- **Axios** - HTTP 客户端
- **Zod** - 数据验证
- **Ali-OSS** - 阿里云对象存储

## 📦 安装

### 环境要求
- Node.js >= 18.0.0
- npm >= 8.0.0 或 yarn >= 1.22.0

### 克隆项目
```bash
git clone <repository-url>
cd H2Blog
```

### 安装依赖
```bash
npm install
# 或
yarn install
```

### 环境配置

编辑 `.env.development` 和 `.env.production` 文件，配置必要的环境变量。

## 🚀 开发

### 启动开发服务器
```bash
npm run dev
```

访问 [http://localhost:5173](http://localhost:5173) 查看应用。

### 构建生产版本
```bash
# 生产环境构建
npm run build

# 开发环境构建
npm run build:dev
```

### 预览构建结果
```bash
npm run preview
```

### 代码检查
```bash
npm run lint
```

## 📁 项目结构

```
src/
├── components/          # 组件目录
│   ├── common/         # 通用组件
│   │   ├── SvgIcon/    # SVG 图标组件
│   │   ├── ScrollBar/  # 滚动条组件
│   │   └── ui/         # UI 基础组件
│   ├── business/       # 业务组件
│   │   ├── BlogCard/   # 博客卡片
│   │   ├── Comments/   # 评论组件
│   │   ├── SearchModal/ # 搜索模态框
│   │   ├── Home/       # 首页组件
│   │   └── Tools/      # 工具组件
│   └── layout/         # 布局组件
│       ├── Navigator/  # 导航栏
│       ├── Background/ # 背景组件
│       └── WebInfo/    # 网站信息
├── pages/              # 页面组件
│   ├── Home/          # 首页
│   ├── BlogContent/   # 博客详情
│   ├── Admin/         # 后台管理
│   └── ...
├── stores/             # 状态管理
│   ├── useUserStore.ts    # 用户状态
│   ├── useThemeStore.ts   # 主题状态
│   ├── useBlogStore.ts    # 博客数据状态
│   ├── useUIStore.ts      # UI 状态
│   └── types.ts           # 类型定义
├── services/           # API 服务
├── hooks/              # 自定义 Hooks
├── utils/              # 工具函数
├── types/              # 类型定义
├── constants/          # 常量定义
└── styles/             # 全局样式
```
