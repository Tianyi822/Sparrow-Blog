import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import svgr from 'vite-plugin-svgr'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        svgr({
            // svgr 选项
            svgrOptions: {
                // svg 转换配置
                icon: true,
                // 保留 svg 的 viewBox
                dimensions: false,
            },
            // 是否将 svg 转换为 jsx
            esbuildOptions: false,
            // 排除不需要转换的 svg
            exclude: '',
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'), // 使用 @ 指向 src 目录
        },
    },
})
