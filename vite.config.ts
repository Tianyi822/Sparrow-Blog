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
    build: {
      // 启用Terser压缩
      minify: 'terser',
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
          // 设置chunk文件名格式
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
          manualChunks: (id) => {
            // React核心库 - 进一步细分
            if (id.includes('node_modules/react/') && !id.includes('react-dom')) {
              return 'react-core';
            }
            if (id.includes('node_modules/react-dom')) {
              return 'react-dom';
            }
            if (id.includes('node_modules/react-router-dom') || id.includes('node_modules/react-router')) {
              return 'react-router';
            }
            
            // UI相关库细分
            if (id.includes('node_modules/react-icons')) {
              return 'react-icons';
            }
            
            // Markdown相关库
            if (id.includes('node_modules/marked') || 
                id.includes('node_modules/react-syntax-highlighter') ||
                id.includes('node_modules/react-markdown') ||
                id.includes('node_modules/rehype-raw') ||
                id.includes('node_modules/rehype-sanitize')) {
              return 'markdown-vendor';
            }
            
            // 图片处理库
            if (id.includes('node_modules/browser-image-compression')) {
              return 'image-vendor';
            }
            
            // 样式相关库
            if (id.includes('node_modules/sass') || 
                id.includes('node_modules/postcss') ||
                id.includes('.scss') || 
                id.includes('.css')) {
              return 'styles-vendor';
            }
            
            // 工具库分组 - 进一步细分
            if (id.includes('node_modules/lodash')) {
              return 'lodash-vendor';
            }
            if (id.includes('node_modules/date-fns')) {
              return 'date-vendor';
            }
            if (id.includes('node_modules/axios')) {
              return 'http-vendor';
            }
            
            // 代码高亮相关库
            if (id.includes('highlight.js') || 
                id.includes('prismjs') ||
                id.includes('codemirror')) {
              return 'syntax-vendor';
            }
            
            // 动画相关库
            if (id.includes('node_modules/framer-motion') ||
                id.includes('node_modules/lottie') ||
                id.includes('node_modules/gsap')) {
              return 'animation-vendor';
            }
            
            // 表单相关库
            if (id.includes('node_modules/formik') ||
                id.includes('node_modules/yup') ||
                id.includes('node_modules/react-hook-form')) {
              return 'form-vendor';
            }
            
            // 状态管理相关库
            if (id.includes('node_modules/redux') ||
                id.includes('node_modules/zustand') ||
                id.includes('node_modules/mobx')) {
              return 'state-vendor';
            }
            
            // 国际化相关库
            if (id.includes('node_modules/i18next') ||
                id.includes('node_modules/react-i18next')) {
              return 'i18n-vendor';
            }
            
            // 测试相关库（通常不会在生产构建中）
            if (id.includes('node_modules/jest') ||
                id.includes('node_modules/testing-library') ||
                id.includes('node_modules/vitest')) {
              return 'test-vendor';
            }
            
            // 开发工具相关库（通常不会在生产构建中）
            if (id.includes('node_modules/@types/') ||
                id.includes('node_modules/typescript') ||
                id.includes('node_modules/eslint')) {
              return 'dev-vendor';
            }
            
            // polyfill相关库
            if (id.includes('node_modules/core-js') ||
                id.includes('node_modules/regenerator-runtime') ||
                id.includes('node_modules/@babel/runtime')) {
              return 'polyfill-vendor';
            }
            
            // 将大的组件库单独分块
            if (id.includes('ImageSelectorModal')) {
              return 'image-selector';
            }
            
            // 前台页面分块
            if (id.includes('/pages/Home/')) {
              return 'home-page';
            }
            if (id.includes('/pages/BlogContent/')) {
              return 'blog-content-page';
            }
            if (id.includes('/pages/FriendLink/')) {
              return 'friend-link-page';
            }
            if (id.includes('/pages/NotFound/') || id.includes('/pages/Waiting/')) {
              return 'misc-pages';
            }
            
            // 管理后台页面分块 - 进一步细分
            if (id.includes('/pages/Admin/Login/')) {
              return 'admin-login-page';
            }
            if (id.includes('/pages/Admin/Edit/')) {
              return 'admin-edit-page';
            }
            if (id.includes('/pages/Admin/Posts/')) {
              return 'admin-posts-page';
            }
            if (id.includes('/pages/Admin/Gallery/')) {
              return 'admin-gallery-page';
            }
            if (id.includes('/pages/Admin/Comments/')) {
              return 'admin-comments-page';
            }
            if (id.includes('/pages/Admin/FriendLinks/')) {
              return 'admin-friendlinks-page';
            }
            
            // 管理后台设置页面进一步细分
            if (id.includes('/pages/Admin/Settings/UserSetting/')) {
              return 'admin-user-settings';
            }
            if (id.includes('/pages/Admin/Settings/ServerSetting/') ||
                id.includes('/pages/Admin/Settings/DatabaseSetting/')) {
              return 'admin-server-settings';
            }
            if (id.includes('/pages/Admin/Settings/')) {
              return 'admin-other-settings';
            }
            
            // 布局组件分块
            if (id.includes('/layouts/')) {
              return 'layouts';
            }
            
            // 通用组件分块
            if (id.includes('/components/')) {
              // 大型组件单独分块
              if (id.includes('SearchModal') || id.includes('Navigator')) {
                return 'large-components';
              }
              return 'components';
            }
            
            // 服务层分块
            if (id.includes('/services/')) {
              return 'services';
            }
            
            // 剩余的第三方库按字母顺序分组，确保每组不会太大
            if (id.includes('node_modules')) {
              const packageName = id.split('node_modules/')[1].split('/')[0];
              
              // 特别大的库单独处理
              if (packageName.includes('plotly') || 
                  packageName.includes('plotly.js')) {
                return 'plotly-vendor';
              }
              if (packageName.includes('monaco-editor')) {
                return 'monaco-vendor';
              }
              if (packageName.includes('pdf') || 
                  packageName.includes('pdfjs')) {
                return 'pdf-vendor';
              }
              if (packageName.includes('three') || 
                  packageName.includes('threejs')) {
                return 'three-vendor';
              }
              // React相关的大型库单独处理
              if (packageName.includes('react-syntax-highlighter')) {
                return 'syntax-highlighter-vendor';
              }
              if (packageName.includes('react-markdown')) {
                return 'react-markdown-vendor';
              }
              
              // 对refractor进行更细粒度的分割
              if (packageName.includes('refractor')) {
                // 根据文件路径进一步分割refractor
                if (id.includes('refractor/lang/')) {
                  // 按语言分组，每组包含一些语言
                  const langMatch = id.match(/refractor\/lang\/([a-z]+)/);
                  if (langMatch) {
                    const lang = langMatch[1];
                    // 按字母顺序分组语言文件
                    if (lang.match(/^[a-f]/)) {
                      return 'refractor-lang-a-f';
                    } else if (lang.match(/^[g-m]/)) {
                      return 'refractor-lang-g-m';
                    } else if (lang.match(/^[n-s]/)) {
                      return 'refractor-lang-n-s';
                    } else {
                      return 'refractor-lang-t-z';
                    }
                  }
                }
                return 'refractor-core';
              }
              
              if (packageName.includes('prism-react-renderer')) {
                return 'prism-renderer-vendor';
              }
              if (packageName.includes('prismjs') || packageName.includes('prism')) {
                return 'prism-vendor';
              }
              if (packageName.includes('lowlight')) {
                return 'lowlight-vendor';
              }
              if (packageName.includes('unified') || 
                  packageName.includes('remark') ||
                  packageName.includes('rehype')) {
                return 'unified-vendor';
              }
              
              // A-C开头的包
              if (packageName.match(/^[a-c]/i)) {
                return 'vendor-a-c';
              }
              // D开头的包
              if (packageName.match(/^d/i)) {
                return 'vendor-d';
              }
              // E-F开头的包
              if (packageName.match(/^[e-f]/i)) {
                return 'vendor-e-f';
              }
              // G-H开头的包
              if (packageName.match(/^[g-h]/i)) {
                return 'vendor-g-h';
              }
              // I-J开头的包
              if (packageName.match(/^[i-j]/i)) {
                return 'vendor-i-j';
              }
              // K-L开头的包
              if (packageName.match(/^[k-l]/i)) {
                return 'vendor-k-l';
              }
              // M开头的包
              if (packageName.match(/^m/i)) {
                return 'vendor-m';
              }
              // N开头的包
              if (packageName.match(/^n/i)) {
                return 'vendor-n';
              }
              // O-P开头的包
              if (packageName.match(/^[o-p]/i)) {
                return 'vendor-o-p';
              }
              // Q开头的包
              if (packageName.match(/^q/i)) {
                return 'vendor-q';
              }
              // R开头的包（除了已经单独处理的react相关包）
              if (packageName.match(/^r/i)) {
                return 'vendor-r';
              }
              // S开头的包
              if (packageName.match(/^s/i)) {
                return 'vendor-s';
              }
              // T-U开头的包
              if (packageName.match(/^[t-u]/i)) {
                return 'vendor-t-u';
              }
              // V-Z开头的包
              if (packageName.match(/^[v-z]/i)) {
                return 'vendor-v-z';
              }
              
              // 默认vendor
              return 'vendor-misc';
            }
          }
        }
      },
      // 设置更严格的chunk大小警告阈值
      chunkSizeWarningLimit: 512
    }
  }
})
