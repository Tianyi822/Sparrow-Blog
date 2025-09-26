/**
 * 路由路径常量定义
 */

// 前台路由路径
export const WEB_ROUTES = {
  HOME: '/',
  BLOG_DETAIL: '/blog/:blogId',
  WAITING: '/waiting'
} as const;

// 后台路由路径
export const ADMIN_ROUTES = {
  ROOT: '/admin',
  LOGIN: '/admin/login',
  POSTS: '/admin/posts',
  EDIT: '/admin/edit',
  GALLERY: '/admin/gallery',
  COMMENTS: '/admin/comments',
  SETTINGS: '/admin/settings'
} as const;

// 404 路由
export const NOT_FOUND_ROUTE = '*';

// 路由参数名称
export const ROUTE_PARAMS = {
  BLOG_ID: 'blogId'
} as const;

// 查询参数名称
export const QUERY_PARAMS = {
  BLOG_ID: 'blog_id',
  CACHE: 'cache'
} as const;