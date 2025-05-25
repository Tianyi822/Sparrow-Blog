# 部署指南 - 解决 SPA 路由问题

## 问题说明

Single Page Application (SPA) 使用前端路由时，直接访问路由路径或刷新页面会出现 404 错误。这是因为服务器尝试查找对应的静态文件，而不是将请求交给前端路由处理。

## 解决方案

### 1. 开发环境

已在 `vite.config.ts` 中配置了 `historyApiFallback`，开发服务器会自动处理路由问题。

```bash
npm run dev
```

### 2. 生产环境部署

#### Netlify 部署

使用 `public/_redirects` 文件（已创建）：

```
/*    /index.html   200
```

#### Vercel 部署

创建 `vercel.json` 文件：

```json
{
  "rewrites": [
    {
      "source": "/((?!api/.*).*)",
      "destination": "/index.html"
    }
  ]
}
```

#### Apache 服务器

使用 `public/.htaccess` 文件（已创建），确保启用了 mod_rewrite 模块。

#### Nginx 服务器

参考 `nginx.conf.example` 文件配置：

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

#### Node.js + Express 服务器

```javascript
const express = require('express');
const path = require('path');
const app = express();

// 静态文件服务
app.use(express.static(path.join(__dirname, 'dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(3000);
```

#### Docker 部署

Dockerfile 示例：

```dockerfile
FROM nginx:alpine
COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3. 测试路由

部署后测试以下场景：

1. 直接访问 `/admin/login`
2. 在任意页面刷新浏览器
3. 通过浏览器前进/后退按钮导航
4. 直接修改地址栏访问不同路由

### 4. 常见问题

#### 问题：静态资源404

解决：确保静态资源路径配置正确，避免相对路径问题。

#### 问题：API请求被重定向

解决：确保API路径（如 `/api/*`）被排除在SPA重定向规则之外。

#### 问题：路由参数丢失

解决：检查路由配置是否正确，确保动态路由（如 `/blog/:id`）正常工作。

## 验证部署

运行以下命令验证生产构建：

```bash
# 构建项目
npm run build

# 预览生产构建（已配置SPA支持）
npm run preview
```

在预览模式下测试各种路由访问方式，确保没有404错误。 