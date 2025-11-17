/**
 * API 相关类型定义
 */

// API响应类型定义
export interface ApiResponse<T = unknown> {
  code: number;
  msg?: string; // 错误消息或成功提示
  data: T;
}

// 认证相关接口
export interface VerificationCodeRequest {
  user_email: string;
}

export interface LoginRequest {
  user_email: string;
  verification_code: string;
}

export interface LoginResponse {
  token: string;
}

export interface UserInfoResponse {
  code: number;
  msg: string;
  data: {
    user_name: string;
  };
}

// 搜索相关接口
export interface SearchResultItem {
  id: string;
  img_id: string;
  title: string;
  highlights: {
    Content: string[];
    Title: string[];
  };
}

export interface SearchResponseData {
  results: SearchResultItem[];
  time_ms: number;
}

export interface SearchResponse {
  code: number;
  msg: string;
  data: SearchResponseData;
}

// OSS相关接口
export interface PreSignUrlResponse {
  code: number;
  msg: string;
  data: {
    pre_sign_put_url: string;
  };
}

export interface UploadToOSSResponse {
  code: number;
  msg: string;
  data: {
    blog_id: string;
    presign_url: string;
  };
}

// 文件类型常量
export const FileType = {
  MARKDOWN: 'markdown',
  WEBP: 'webp',
} as const;

// 内容类型常量
export const ContentType = {
  MARKDOWN: 'text/markdown',
  WEBP: 'image/webp',
} as const;

// 图库相关接口
export interface GalleryImage {
  img_id: string;
  img_name: string;
  img_type: string;
  create_time: string;
}

export interface GalleryImagesResponse {
  code: number;
  msg: string;
  data: GalleryImage[];
}

export interface CheckImageNameResponse {
  code: number;
  msg: string;
  data: boolean;
}

export interface AddImagesRequest {
  imgs: Array<{
    img_name: string;
    img_type: string;
  }>;
}

export interface AddImagesResponse {
  code: number;
  msg: string;
  data: null;
}

export interface RenameImageRequest {
  img_id: string;
  img_name: string;
}
