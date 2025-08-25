# H2Blog

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

## 🎯 核心功能

### 状态管理
项目使用 Zustand 进行状态管理，主要包括：

- **用户状态** (`useUserStore`) - 用户信息、登录状态
- **主题状态** (`useThemeStore`) - 主题模式、主题切换
- **博客状态** (`useBlogStore`) - 博客数据、分类、标签
- **UI 状态** (`useUIStore`) - 模态框、侧边栏、通知等

### 组件架构
采用分层组件架构：

- **Common** - 可复用的通用组件
- **Business** - 业务逻辑相关组件
- **Layout** - 页面布局组件

## 🔧 配置说明

### 环境变量
```bash
# API 配置
VITE_API_BASE_URL=your_api_url
```

### Vite 配置
项目使用 Vite 作为构建工具，支持：
- SVG 组件化导入
- 路径别名配置
- 环境变量处理
- 生产优化

## 📚 开发指南

### 添加新组件
1. 在对应的组件目录下创建组件文件夹
2. 创建组件文件、样式文件和导出文件
3. 在 `components/index.ts` 中添加导出

### 状态管理
使用 Zustand store：
```typescript
import { useUserStore } from '@/stores';

const { user, login, logout } = useUserStore();
```

### 样式开发
使用 SCSS 模块化：
```scss
// 使用全局变量
@import '@/styles/variables';

.component {
  color: var(--text-primary);
}
```

⭐ 如果这个项目对你有帮助，请给它一个星标！