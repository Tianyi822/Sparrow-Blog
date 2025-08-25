/**
 * API 端点常量定义
 */

// 管理员相关 API 端点
export const ADMIN_API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    VERIFICATION_CODE: '/admin/login/verification-code',
    LOGIN: '/admin/login',
    USER_INFO: '/admin/login/user-info'
  },
  
  // 文章管理
  POSTS: {
    ALL_BLOGS: '/admin/posts/all-blogs',
    BLOG_BY_ID: (blogId: string) => `/admin/posts/blog/${blogId}`,
    DELETE_BLOG: (blogId: string) => `/admin/posts/delete/${blogId}`,
    CHANGE_BLOG_STATE: (blogId: string) => `/admin/posts/change-blog-state/${blogId}`,
    SET_TOP: (blogId: string) => `/admin/posts/set-top/${blogId}`
  },
  
  // 编辑相关
  EDIT: {
    ALL_TAGS_CATEGORIES: '/admin/edit/all-tags-categories',
    UPDATE_OR_ADD_BLOG: '/admin/edit/update-or-add-blog',
    BLOG_DATA: (blogId: string) => `/admin/edit/blog-data/${blogId}`
  },
  
  // 图库管理
  GALLERY: {
    ALL_IMGS: '/admin/gallery/all-imgs',
    UPDATE_IMG: '/admin/gallery/update',
    DELETE_IMG: (imageId: string) => `/admin/gallery/${imageId}`,
    SEARCH_IMGS: '/admin/gallery/search',
    ADD_IMG: '/admin/gallery/add',
    RENAME_IMG: (imageId: string) => `/admin/gallery/${imageId}`,
    CHECK_IMG_NAME: (imageName: string) => `/admin/gallery/is-exist/${encodeURIComponent(imageName)}`
  },
  
  // 设置相关
  SETTINGS: {
    USER: {
      CONFIG: '/admin/setting/user/config',
      VERIFY_NEW_EMAIL: '/admin/setting/user/verify-new-email',
      VISUAL: '/admin/setting/user/visual'
    },
    SERVER: {
      CONFIG: '/admin/setting/server/config',
      VERIFY_SMTP: '/admin/setting/user/verify-new-smtp-config'
    },
    LOGGER: {
      CONFIG: '/admin/setting/logger/config'
    },
    MYSQL: {
      CONFIG: '/admin/setting/mysql/config'
    },
    OSS: {
      CONFIG: '/admin/setting/oss/config'
    },
    CACHE_INDEX: {
      CONFIG: '/admin/setting/cache-index/config',
      REBUILD_INDEX: '/admin/setting/cache-index/rebuild-index'
    }
  },
  
  // 评论管理
  COMMENTS: {
    ALL: '/admin/comments/all',
    DELETE: (commentId: string) => `/admin/comments/${commentId}`,
    UPDATE: '/admin/comments/update',
    UPDATE_CONTENT: (commentId: string) => `/admin/comments/${commentId}/content`
  },
  
  // 友链管理
  FRIEND_LINKS: {
    ALL: '/admin/friend-links/all',
    UPDATE: '/admin/friend-links/update',
    DELETE: (friendLinkId: string) => `/admin/friend-links/${friendLinkId}`,
    TOGGLE_DISPLAY: (friendLinkId: string) => `/admin/friend-links/${friendLinkId}/display`
  },
  
  // OSS 相关
  OSS: {
    PRE_SIGN_URL: (fileName: string, fileType: string) => `/admin/oss/pre_sign_url/${fileName}/type/${fileType}`
  }
} as const;

// Web 端 API 端点
export const WEB_API_ENDPOINTS = {
  // 系统相关
  SYSTEM: {
    STATUS: '/web/sys/status'
  },
  
  // 基础数据
  DATA: {
    BASIC_DATA: '/web/basic-data',
    BLOG_CONTENT: (blogId: string) => `/web/blog/${blogId}`
  },
  
  // 搜索
  SEARCH: {
    BLOGS: (query: string) => `/web/search/${encodeURIComponent(query)}`
  },
  
  // 评论
  COMMENTS: {
    ADD: '/web/comment',
    REPLY: '/web/comment/reply',
    LATEST: '/web/comment/latest'
  },
  
  // 友链
  FRIEND_LINKS: {
    ALL: '/web/friend-link/all',
    APPLY: '/web/friend-link/apply'
  }
} as const;

// HTTP 方法常量
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH'
} as const;

// HTTP 状态码常量
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
} as const;