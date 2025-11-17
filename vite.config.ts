import react from '@vitejs/plugin-react';
import type { ConfigEnv } from 'vite';
import { defineConfig, loadEnv } from 'vite';
import svgr from 'vite-plugin-svgr';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, writeFileSync } from 'node:fs';

// Deno 兼容的目录路径获取
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 创建404.html插件，用于对象存储部署
const create404Plugin = () => {
  return {
    name: 'create-404-html',
    closeBundle() {
      // 在构建完成后，使用专门的404模板
      const templatePath = path.resolve(__dirname, 'public/404-template.html');
      const notFoundPath = path.resolve(__dirname, 'dist/404.html');
      
      try {
        const templateContent = readFileSync(templatePath, 'utf-8');
        writeFileSync(notFoundPath, templateContent);
        console.log('✓ 404.html created with custom NotFound styling for object storage deployment');
      } catch (error) {
        console.error('Error creating 404.html:', error);
      }
    }
  };
};

// https://vite.dev/config/
export default defineConfig(({ mode }: ConfigEnv) => {
  // 加载环境变量
  loadEnv(mode, process.cwd(), '');
  return {
    // 配置基础路径，使用绝对路径确保子路由正常工作
    base: '/',
    plugins: [
      react(),
      svgr({
        svgrOptions: {
          icon: true,
        },
      }),
      create404Plugin(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'), // 使用 @ 指向 src 目录
      },
    },
    // 开发服务器配置
    server: {
      port: 5173,
      host: true,
      // 配置 SPA fallback，解决前端路由刷新404问题
      historyApiFallback: {
        index: '/index.html',
        rewrites: [
          // 所有非API请求都回退到index.html
          { from: /^\/(?!api).*$/, to: '/index.html' }
        ]
      }
    },
    // 预览服务器配置（用于本地预览生产构建）
    preview: {
      port: 4173,
      host: true,
      // 配置 SPA fallback
      historyApiFallback: {
        index: '/index.html',
        rewrites: [
          { from: /^\/(?!api).*$/, to: '/index.html' }
        ]
      }
    },
    // CSS相关配置
    css: {
      // 开发时保持源码映射，生产时可选
      devSourcemap: true
    },
    build: {
      // 启用Terser压缩
      minify: 'terser' as const,
      // 启用CSS代码分割，但保持简单
      cssCodeSplit: true,
      // 确保输出目录正确
      outDir: 'dist',
      // 确保所有资源使用相对路径
      assetsDir: 'assets',
      // 复制public目录下的文件到输出目录
      copyPublicDir: true,
      // 设置合理的chunk大小警告阈值
      chunkSizeWarningLimit: 1000,
      terserOptions: {
        compress: {
          drop_console: true, // 删除console.log
          drop_debugger: true, // 删除debugger
          pure_funcs: ['console.log', 'console.info', 'console.warn'], // 删除特定函数调用
          passes: 2, // 多次压缩以获得更好的效果
        },
        mangle: {
          safari10: true, // 兼容Safari 10
        },
        format: {
          comments: false, // 删除注释
        },
      },
      rollupOptions: {
        output: {
          // 设置稳定的文件名格式，确保hash值一致性
          chunkFileNames: (chunkInfo: { facadeModuleId?: string | null; name?: string }) => {
            // 为不同类型的chunk使用不同的命名策略
            const facadeModuleId = chunkInfo.facadeModuleId;
            if (facadeModuleId) {
              // 如果是页面组件，使用页面名称
              if (facadeModuleId.includes('/pages/')) {
                const pageName = facadeModuleId.match(/\/pages\/([^\/]+)/)?.[1]?.toLowerCase();
                if (pageName) {
                  return `assets/page-${pageName}-[hash].js`;
                }
              }
              // 如果是组件，使用组件前缀
              if (facadeModuleId.includes('/components/')) {
                return `assets/components-[hash].js`;
              }
            }
            // 默认chunk命名
            return `assets/[name]-[hash].js`;
          },
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: (assetInfo: { name?: string }) => {
            // 为不同类型的资源使用不同的命名策略
            const name = assetInfo.name || '';
            if (name.endsWith('.css')) {
              return 'assets/[name]-[hash].css';
            }
            if (name.match(/\.(png|jpe?g|gif|svg|webp|ico)$/)) {
              return 'assets/images/[name]-[hash].[ext]';
            }
            if (name.match(/\.(woff2?|eot|ttf|otf)$/)) {
              return 'assets/fonts/[name]-[hash].[ext]';
            }
            return 'assets/[name]-[hash].[ext]';
          },
          // 简化的代码分割策略 - 只分割必要的大块
          manualChunks: (id: string) => {
            // 1. React核心库 - 稳定且经常使用
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'react-vendor';
            }
            
            // 2. React Router - 路由相关
            if (id.includes('node_modules/react-router')) {
              return 'router-vendor';
            }
            
            // 3. UI组件库 - 图标和UI组件
            if (id.includes('node_modules/react-icons') || 
                id.includes('node_modules/@mui/')) {
              return 'ui-vendor';
            }
            
            // 4. Markdown相关 - 内容渲染核心
            if (id.includes('node_modules/marked') ||
                id.includes('node_modules/react-markdown') ||
                id.includes('node_modules/react-syntax-highlighter') ||
                id.includes('node_modules/highlight.js') ||
                id.includes('node_modules/rehype') ||
                id.includes('node_modules/remark') ||
                id.includes('node_modules/unified') ||
                id.includes('node_modules/refractor') ||
                id.includes('node_modules/prismjs') ||
                id.includes('node_modules/lowlight')) {
              return 'markdown-vendor';
            }
            
            // 5. 数学公式渲染
            if (id.includes('node_modules/katex')) {
              return 'math-vendor';
            }
            
            // 6. HTTP请求库
            if (id.includes('node_modules/axios')) {
              return 'http-vendor';
            }
            
            // 7. 图片处理
            if (id.includes('node_modules/browser-image-compression')) {
              return 'image-vendor';
            }
            
            // 8. 状态管理
            if (id.includes('node_modules/zustand')) {
              return 'state-vendor';
            }
            
            // 9. 工具库 - 常用工具
            if (id.includes('node_modules/lodash') ||
                id.includes('node_modules/date-fns') ||
                id.includes('node_modules/classnames') ||
                id.includes('node_modules/dompurify') ||
                id.includes('node_modules/zod')) {
              return 'utils-vendor';
            }
            
            // 10. 阿里云OSS
            if (id.includes('node_modules/ali-oss')) {
              return 'oss-vendor';
            }
            
            // 11. 其他第三方库统一打包
            if (id.includes('node_modules/')) {
              return 'vendor';
            }
            
            // 12. 应用代码按功能模块分割
            
            // 管理后台相关页面
            if (id.includes('/pages/Admin/')) {
              return 'admin-pages';
            }
            
            // 前台页面
            if (id.includes('/pages/Home/') || 
                id.includes('/pages/BlogContent/') ||
                id.includes('/pages/FriendLink/')) {
              return 'frontend-pages';
            }
            
            // 其他页面（404、等待页等）
            if (id.includes('/pages/')) {
              return 'misc-pages';
            }
            
            // 组件库
            if (id.includes('/components/')) {
              return 'components';
            }
            
            // 布局组件
            if (id.includes('/layouts/')) {
              return 'layouts';
            }
            
            // 服务层
            if (id.includes('/services/')) {
              return 'services';
            }
            
            // 工具函数和常量
            if (id.includes('/utils/') || 
                id.includes('/constants/') ||
                id.includes('/hooks/')) {
              return 'app-utils';
            }
            
            // 默认不分割，保持在主bundle中
            return undefined;
          }
        }
      }
    }
  }
})