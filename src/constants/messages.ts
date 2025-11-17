/**
 * 提示信息常量定义
 */

// 成功消息
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '登录成功',
  SAVE_SUCCESS: '保存成功',
  UPDATE_SUCCESS: '更新成功',
  DELETE_SUCCESS: '删除成功',
  UPLOAD_SUCCESS: '上传成功',
  SEND_SUCCESS: '发送成功',
  APPLY_SUCCESS: '申请提交成功',
  REBUILD_INDEX_SUCCESS: '重建索引成功',
} as const;

// 错误消息
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络错误，请稍后重试',
  LOGIN_FAILED: '登录失败',
  SAVE_FAILED: '保存失败',
  UPDATE_FAILED: '更新失败',
  DELETE_FAILED: '删除失败',
  UPLOAD_FAILED: '上传失败',
  SEND_FAILED: '发送失败',
  APPLY_FAILED: '申请提交失败',
  UNKNOWN_ERROR: '未知错误',
  PERMISSION_DENIED: '权限不足，无法访问该资源',
  RESOURCE_NOT_FOUND: '请求的资源不存在',
  VALIDATION_FAILED: '表单验证失败',
  FILE_TOO_LARGE: '文件过大',
  INVALID_FILE_TYPE: '文件类型不支持',
} as const;

// 警告消息
export const WARNING_MESSAGES = {
  UNSAVED_CHANGES: '您有未保存的更改，确定要离开吗？',
  DELETE_CONFIRM: '确定要删除吗？此操作不可撤销',
  CLEAR_CACHE_CONFIRM: '确定要清除缓存吗？',
  REBUILD_INDEX_CONFIRM: '确定要重建索引吗？这可能需要一些时间',
} as const;

// 信息提示
export const INFO_MESSAGES = {
  LOADING: '加载中...',
  UPLOADING: '上传中...',
  PROCESSING: '处理中...',
  SAVING: '保存中...',
  DELETING: '删除中...',
  SENDING: '发送中...',
  NO_DATA: '暂无数据',
  NO_RESULTS: '没有找到相关文章',
  EMPTY_LIST: '列表为空',
  DRAG_DROP_HINT: '拖拽文件到此处或点击选择文件',
  SEARCH_PLACEHOLDER: '搜索...',
  EMAIL_PLACEHOLDER: '请输入邮箱地址',
  PASSWORD_PLACEHOLDER: '请输入密码',
  VERIFICATION_CODE_PLACEHOLDER: '请输入验证码',
} as const;

// 表单验证消息
export const VALIDATION_MESSAGES = {
  REQUIRED: '此字段为必填项',
  EMAIL_INVALID: '请输入有效的邮箱地址',
  URL_INVALID: '请输入有效的URL地址',
  TOO_SHORT: '内容过短',
  TOO_LONG: '内容过长',
  INVALID_FORMAT: '格式不正确',
  PASSWORD_TOO_SHORT: '密码长度至少6位',
  CONFIRM_PASSWORD_MISMATCH: '两次输入的密码不一致',
} as const;

// 操作确认消息
export const CONFIRM_MESSAGES = {
  DELETE_BLOG: '确定要删除这篇文章吗？',
  DELETE_IMAGE: '确定要删除这张图片吗？',
  DELETE_COMMENT: '确定要删除这条评论吗？',
  DELETE_FRIEND_LINK: '确定要删除这个友链吗？',
  LOGOUT: '确定要退出登录吗？',
  CLEAR_DRAFT: '确定要清除草稿吗？',
  RESET_FORM: '确定要重置表单吗？',
} as const;

// 状态标签
export const STATUS_LABELS = {
  PUBLIC: '公开',
  HIDDEN: '隐藏',
  DRAFT: '草稿',
  PUBLISHED: '已发布',
  TOP: '置顶',
  NORMAL: '普通',
  ENABLED: '启用',
  DISABLED: '禁用',
  ONLINE: '在线',
  OFFLINE: '离线',
} as const;

// 按钮文本
export const BUTTON_TEXTS = {
  SAVE: '保存',
  CANCEL: '取消',
  CONFIRM: '确认',
  DELETE: '删除',
  EDIT: '编辑',
  ADD: '添加',
  UPLOAD: '上传',
  DOWNLOAD: '下载',
  SEARCH: '搜索',
  RESET: '重置',
  SUBMIT: '提交',
  LOGIN: '登录',
  LOGOUT: '退出',
  BACK: '返回',
  NEXT: '下一步',
  PREVIOUS: '上一步',
  REFRESH: '刷新',
  CLEAR: '清除',
  SELECT: '选择',
  PREVIEW: '预览',
  PUBLISH: '发布',
  DRAFT: '保存草稿',
} as const;
