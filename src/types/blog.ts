/**
 * 博客相关类型定义
 */

// 博客标签接口
export interface BlogTag {
  tag_id: string;
  tag_name: string;
}

// 博客分类接口
export interface BlogCategory {
  category_id: string;
  category_name: string;
}

// 博客项目接口
export interface BlogItem {
  blog_id: string;
  blog_title: string;
  category: BlogCategory;
  tags: BlogTag[];
  blog_state: boolean;
  blog_words_num: number;
  blog_is_top: boolean;
  create_time: string;
  update_time: string;
}

// 博客信息接口（用于前台展示）
export interface BlogInfo {
  blog_id: string;
  blog_title: string;
  blog_image_id: string;
  blog_brief: string;
  category_id: string;
  category: BlogCategory;
  tags: BlogTag[];
  blog_state: boolean;
  blog_words_num: number;
  blog_is_top: boolean;
  create_time: string;
  update_time: string;
}

// 博客内容数据接口
export interface BlogContentData {
  blog_data: {
    blog_id: string;
    blog_title: string;
    blog_image_id: string;
    blog_brief: string;
    category: BlogCategory;
    tags: BlogTag[];
    blog_state: boolean;
    blog_words_num: number;
    blog_is_top: boolean;
    create_time: string;
    update_time: string;
  };
  pre_sign_url: string;
}

// 博客列表响应接口
export interface BlogListResponse {
  code: number;
  msg: string;
  data: BlogItem[];
}

// 标签和分类响应接口
export interface TagsAndCategoriesResponse {
  code: number;
  msg: string;
  data: {
    categories: BlogCategory[];
    tags: BlogTag[];
  };
}

// 更新或添加博客请求接口
export interface UpdateOrAddBlogRequest {
  blog_id: string;
  blog_title: string;
  blog_brief: string;
  category_id: string;
  category: {
    category_name: string;
  };
  tags: Array<{
    tag_id?: string;
    tag_name: string;
  }>;
  blog_state: boolean;
  blog_words_num: number;
  blog_is_top: boolean;
  blog_content?: string;
  blog_image_id?: string;
}

// 博客数据响应接口（用于编辑）
export interface BlogDataResponse {
  code: number;
  msg: string;
  data: {
    blog_data: {
      blog_id: string;
      blog_title: string;
      blog_brief: string;
      category_id: string;
      category: BlogCategory;
      tags: BlogTag[];
      blog_words_num: number;
      create_time: string;
      update_time: string;
      blog_is_top?: boolean;
      blog_state?: boolean;
      blog_image?: import('./api').GalleryImage;
      blog_image_id?: string;
    };
    content_url: string;
  };
}

// 博客内容响应类型
export type BlogContentResponse = import('./api').ApiResponse<BlogContentData>;

// 主页数据接口
export interface BasicData {
  avatar_image: string;
  background_image: string;
  blogs: BlogInfo[];
  categories: BlogCategory[];
  icp_filing_number?: string;
  tags: BlogTag[];
  type_writer_content: string[];
  user_email: string;
  user_github_address: string;
  user_hobbies: string[];
  user_name: string;
  web_logo: string;
}

// 主页数据响应类型
export type BasicDataResponse = import('./api').ApiResponse<BasicData>;

// 博客统计信息接口
export interface BlogStats {
  articles: number;
  tags: number;
  categories: number;
}
