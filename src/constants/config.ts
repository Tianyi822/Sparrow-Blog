/**
 * 应用配置常量定义
 */

// 本地存储键名
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  BLOG_DRAFT: 'blog_draft',
  VERIFY_CODE_END_TIME: 'verify_code_end_time'
} as const;

// 文件类型常量
export const FILE_TYPES = {
  MARKDOWN: 'markdown',
  WEBP: 'webp'
} as const;

// 内容类型常量
export const CONTENT_TYPES = {
  JSON: 'application/json',
  MARKDOWN: 'text/markdown',
  WEBP: 'image/webp'
} as const;

// 图片类型常量
export const IMAGE_TYPES = {
  WEBP: 'webp'
} as const;

// 分页配置
export const PAGINATION = {
  BLOGS_PER_PAGE: 8,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 20, 50]
} as const;

// 表单验证
export const VALIDATION = {
  TOKEN_KEY_LENGTH: 32,
  MIN_PASSWORD_LENGTH: 6,
  MAX_DESCRIPTION_LENGTH: 500
} as const;

// 超时配置
export const TIMEOUTS = {
  API_REQUEST: 15000,
  OSS_UPLOAD: 10000
} as const;

// 字符集
export const CHARSET = {
  TOKEN_CHARS: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
} as const;

// 日志级别
export const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
} as const;

// 默认配置值
export const DEFAULT_VALUES = {
  LOG_LEVEL: 'info',
  LOG_FILE_DIR: '/var/log/h2blog',
  AOF_PATH: '',
  INDEX_PATH: ''
} as const;

// 媒体查询断点
export const BREAKPOINTS = {
  MOBILE: '(max-width: 768px)',
  TABLET: '(max-width: 1024px)',
  DESKTOP: '(min-width: 1025px)'
} as const;

// 动画持续时间
export const ANIMATION_DURATION = {
  SHORT: 200,
  MEDIUM: 300,
  LONG: 500
} as const;