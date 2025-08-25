/**
 * 运行时类型验证 Schema 定义
 * 使用 Zod 进行 API 响应的运行时类型验证
 */

import { z } from 'zod';

// ========================================
// 基础 Schema
// ========================================

// 基础 API 响应 Schema
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    code: z.number(),
    msg: z.string(),
    data: dataSchema,
  });

// ========================================
// 博客相关 Schema
// ========================================

// 博客标签 Schema
export const BlogTagSchema = z.object({
  tag_id: z.string(),
  tag_name: z.string(),
});

// 博客分类 Schema
export const BlogCategorySchema = z.object({
  category_id: z.string(),
  category_name: z.string(),
});

// 博客项目 Schema
export const BlogItemSchema = z.object({
  blog_id: z.string(),
  blog_title: z.string(),
  category: BlogCategorySchema,
  tags: z.array(BlogTagSchema),
  blog_state: z.boolean(),
  blog_words_num: z.number(),
  blog_is_top: z.boolean(),
  create_time: z.string(),
  update_time: z.string(),
});

// 博客信息 Schema
export const BlogInfoSchema = z.object({
  blog_id: z.string(),
  blog_title: z.string(),
  blog_image_id: z.string(),
  blog_brief: z.string(),
  category_id: z.string(),
  category: BlogCategorySchema,
  tags: z.array(BlogTagSchema),
  blog_state: z.boolean(),
  blog_words_num: z.number(),
  blog_is_top: z.boolean(),
  create_time: z.string(),
  update_time: z.string(),
});

// 博客内容数据 Schema
export const BlogContentDataSchema = z.object({
  blog_data: z.object({
    blog_id: z.string(),
    blog_title: z.string(),
    blog_image_id: z.string(),
    blog_brief: z.string(),
    category: BlogCategorySchema,
    tags: z.array(BlogTagSchema),
    blog_state: z.boolean(),
    blog_words_num: z.number(),
    blog_is_top: z.boolean(),
    create_time: z.string(),
    update_time: z.string(),
  }),
  pre_sign_url: z.string(),
});

// 基础数据 Schema
export const BasicDataSchema = z.object({
  avatar_image: z.string(),
  background_image: z.string(),
  blogs: z.array(BlogInfoSchema),
  categories: z.array(BlogCategorySchema),
  icp_filing_number: z.string().optional(),
  tags: z.array(BlogTagSchema),
  type_writer_content: z.array(z.string()),
  user_email: z.string(),
  user_github_address: z.string(),
  user_hobbies: z.array(z.string()),
  user_name: z.string(),
  web_logo: z.string(),
});

// ========================================
// 用户相关 Schema
// ========================================

// 用户配置 Schema
export const UserConfigSchema = z.object({
  user_name: z.string(),
  user_email: z.string().email(),
  avatar_image: z.string(),
  web_logo: z.string(),
  background_image: z.string(),
  user_github_address: z.string().optional(),
  user_hobbies: z.array(z.string()).optional(),
  type_writer_content: z.array(z.string()).optional(),
  icp_filing_number: z.string().optional(),
});

// 登录响应 Schema
export const LoginResponseSchema = z.object({
  token: z.string(),
});

// 用户信息响应 Schema
export const UserInfoResponseSchema = z.object({
  code: z.number(),
  msg: z.string(),
  data: z.object({
    user_name: z.string(),
  }),
});

// ========================================
// 评论相关 Schema
// ========================================

// 评论 Schema
export const CommentSchema: z.ZodType<{
  comment_id: string;
  commenter_email: string;
  blog_id: string;
  blog_title: string;
  content: string;
  create_time: string;
  origin_post_id?: string;
  reply_to_commenter?: string;
  sub_comments?: any[];
}> = z.object({
  comment_id: z.string(),
  commenter_email: z.string().email(),
  blog_id: z.string(),
  blog_title: z.string(),
  content: z.string(),
  create_time: z.string(),
  origin_post_id: z.string().optional(),
  reply_to_commenter: z.string().optional(),
  sub_comments: z.array(z.lazy(() => CommentSchema)).optional(),
});

// ========================================
// 友链相关 Schema
// ========================================

// 友链 Schema
export const FriendLinkSchema = z.object({
  friend_link_id: z.string(),
  friend_link_name: z.string(),
  friend_link_url: z.string().url(),
  friend_avatar_url: z.string(),
  friend_describe: z.string(),
  display: z.boolean(),
});

// ========================================
// 搜索相关 Schema
// ========================================

// 搜索结果项 Schema
export const SearchResultItemSchema = z.object({
  id: z.string(),
  img_id: z.string(),
  title: z.string(),
  highlights: z.object({
    Content: z.array(z.string()),
    Title: z.array(z.string()),
  }),
});

// 搜索响应数据 Schema
export const SearchResponseDataSchema = z.object({
  results: z.array(SearchResultItemSchema),
  time_ms: z.number(),
});

// ========================================
// 图库相关 Schema
// ========================================

// 图库图片 Schema
export const GalleryImageSchema = z.object({
  img_id: z.string(),
  img_name: z.string(),
  img_type: z.string(),
  create_time: z.string(),
});

// ========================================
// 常用响应 Schema
// ========================================

// 博客列表响应 Schema
export const BlogListResponseSchema = ApiResponseSchema(z.array(BlogItemSchema));

// 基础数据响应 Schema
export const BasicDataResponseSchema = ApiResponseSchema(BasicDataSchema);

// 博客内容响应 Schema
export const BlogContentResponseSchema = ApiResponseSchema(BlogContentDataSchema);

// 搜索响应 Schema
export const SearchResponseSchema = ApiResponseSchema(SearchResponseDataSchema);

// 评论列表响应 Schema
export const CommentsResponseSchema = ApiResponseSchema(z.array(CommentSchema));

// 友链列表响应 Schema
export const FriendLinksResponseSchema = ApiResponseSchema(z.array(FriendLinkSchema));

// 图库图片列表响应 Schema
export const GalleryImagesResponseSchema = ApiResponseSchema(z.array(GalleryImageSchema));

// 用户配置响应 Schema
export const UserConfigResponseSchema = ApiResponseSchema(UserConfigSchema);

// 登录响应 Schema
export const LoginApiResponseSchema = ApiResponseSchema(LoginResponseSchema);

// ========================================
// 类型推导
// ========================================

// 从 Schema 推导出 TypeScript 类型
export type BlogTag = z.infer<typeof BlogTagSchema>;
export type BlogCategory = z.infer<typeof BlogCategorySchema>;
export type BlogItem = z.infer<typeof BlogItemSchema>;
export type BlogInfo = z.infer<typeof BlogInfoSchema>;
export type BlogContentData = z.infer<typeof BlogContentDataSchema>;
export type BasicData = z.infer<typeof BasicDataSchema>;
export type UserConfig = z.infer<typeof UserConfigSchema>;
export type LoginResponse = z.infer<typeof LoginResponseSchema>;
export type Comment = z.infer<typeof CommentSchema>;
export type FriendLink = z.infer<typeof FriendLinkSchema>;
export type SearchResultItem = z.infer<typeof SearchResultItemSchema>;
export type SearchResponseData = z.infer<typeof SearchResponseDataSchema>;
export type GalleryImage = z.infer<typeof GalleryImageSchema>;

// ========================================
// 验证工具函数
// ========================================

/**
 * 验证 API 响应数据
 * @param schema Zod schema
 * @param data 待验证的数据
 * @returns 验证结果
 */
export function validateApiResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `数据验证失败: ${error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`,
      };
    }
    return {
      success: false,
      error: `未知验证错误: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * 安全解析 API 响应
 * @param schema Zod schema
 * @param data 待解析的数据
 * @returns 解析结果或 null
 */
export function safeParseApiResponse<T>(schema: z.ZodSchema<T>, data: unknown): T | null {
  const result = validateApiResponse(schema, data);
  return result.success ? result.data : null;
}