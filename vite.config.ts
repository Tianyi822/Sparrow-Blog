import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 加载环境变量
  loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      react(),
      svgr({
        svgrOptions: {
          icon: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // 使用 @ 指向 src 目录
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // React相关库
            if (id.includes('node_modules/react') || 
                id.includes('node_modules/react-dom') || 
                id.includes('node_modules/react-router-dom')) {
              return 'react-vendor';
            }
            
            // UI相关库
            if (id.includes('node_modules/react-icons')) {
              return 'ui-vendor';
            }
            
            // Markdown相关库
            if (id.includes('node_modules/marked')) {
              return 'markdown-vendor';
            }
            
            // 图片处理库
            if (id.includes('node_modules/browser-image-compression')) {
              return 'image-vendor';
            }
            
            // 将大的组件库单独分块
            if (id.includes('ImageSelectorModal')) {
              return 'image-selector';
            }
            
            // 将前台首页单独分块
            if (id.includes('/pages/Home/')) {
              return 'home-page';
            }
            
            // 将博客内容页单独分块
            if (id.includes('/pages/BlogContent/')) {
              return 'blog-content-page';
            }
            
            // 将友链页面单独分块
            if (id.includes('/pages/FriendLink/')) {
              return 'friend-link-page';
            }
            
            // 管理后台编辑页面单独分块
            if (id.includes('/pages/Admin/Edit/')) {
              return 'admin-edit-page';
            }
            
            // 管理后台文章页面单独分块
            if (id.includes('/pages/Admin/Posts/')) {
              return 'admin-posts-page';
            }
            
            // 管理后台图库页面单独分块
            if (id.includes('/pages/Admin/Gallery/')) {
              return 'admin-gallery-page';
            }
            
            // 管理后台设置页面单独分块
            if (id.includes('/pages/Admin/Settings/')) {
              return 'admin-settings-page';
            }
            
            // 管理后台登录页面单独分块
            if (id.includes('/pages/Admin/Login/')) {
              return 'admin-login-page';
            }
            
            // 其他node_modules的包归类为vendor
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          }
        }
      },
      // 提高chunk大小警告阈值到1.5MB
      chunkSizeWarningLimit: 1500
    }
  }
})
