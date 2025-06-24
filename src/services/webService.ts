import { BlogCategory, BlogTag } from './adminService';
import { ApiResponse, businessApiRequest } from './api';

// ========================================
// 类型定义 - Type Definitions
// ========================================

/**
 * 博客文章信息接口
 */
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

/**
 * 博客内容数据接口
 */
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

/**
 * 主页数据接口
 */
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

/**
 * 搜索相关接口
 */
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

/**
 * 评论相关接口
 */
export interface Comment {
    comment_id: string;
    commenter_email: string;
    blog_title: string;
    content: string;
    create_time: string;
    origin_post_id?: string;
    reply_to_comment_id?: string;
    sub_comments?: Comment[];
}

export interface AddCommentData {
    commenter_email: string;
    blog_id: string;
    content: string;
}

export interface ReplyCommentData {
    commenter_email: string;
    blog_id: string;
    reply_to_comment_id: string;
    content: string;
}

/**
 * 友链相关接口
 */
export interface FriendLink {
    friend_link_id: string;
    friend_link_name: string;
    friend_link_url: string;
    friend_avatar_url: string;
    friend_describe: string;
    display: boolean;
}

export interface FriendLinkApplicationData {
    friend_link_name: string;
    friend_link_url: string;
    friend_avatar_url?: string;
    friend_describe?: string;
}

export interface FriendLinkApplicationResponse {
    code: number;
    msg: string;
    data: null;
}

// 响应类型定义
type BlogContentResponse = ApiResponse<BlogContentData>;
type BasicDataResponse = ApiResponse<BasicData>;
type SearchResponse = ApiResponse<SearchResponseData>;
type CommentsResponse = ApiResponse<Comment[]>;
type CommentResponse = ApiResponse<Comment>;
type FriendLinksResponse = ApiResponse<FriendLink[]>;
type FriendLinkApplyResponse = ApiResponse<null>;

// ========================================
// 工具函数 - Utility Functions
// ========================================

/**
 * 统一错误处理函数
 */
const handleError = (operation: string, error: unknown): void => {
    console.error(`${operation}失败:`, error);
};

/**
 * 统一API响应处理
 */
const handleApiResponse = <T>(response: ApiResponse<T>, operation: string): T | null => {
    if (response.code === 200 && response.data) {
        return response.data;
    }
    console.warn(`${operation}: API返回非成功状态`, { code: response.code, msg: response.msg });
    return null;
};

// ========================================
// 系统相关 - System Services
// ========================================

/**
 * 检查系统状态
 */
export const checkSystemStatus = async (): Promise<{ isRuntime: boolean; errorMessage?: string }> => {
    try {
        const response = await businessApiRequest<ApiResponse<null>>({
            method: 'GET',
            url: '/web/sys/status'
        });

        return {
            isRuntime: response.code === 200,
        };
    } catch (error) {
        handleError('系统状态检查', error);
        return {
            isRuntime: false,
            errorMessage: error instanceof Error ? error.message : '未知错误'
        };
    }
};

// ========================================
// 博客相关 - Blog Services
// ========================================

/**
 * 获取主页基础数据
 */
export const getBasicData = async (): Promise<BasicData | null> => {
    try {
        const response = await businessApiRequest<BasicDataResponse>({
            method: 'GET',
            url: '/web/basic-data'
        });

        return handleApiResponse(response, '获取主页数据');
    } catch (error) {
        handleError('获取主页数据', error);
        return null;
    }
};

/**
 * 获取博客内容
 */
export const getBlogContent = async (blogId: string): Promise<BlogContentData | null> => {
    try {
        const response = await businessApiRequest<BlogContentResponse>({
            method: 'GET',
            url: `/web/blog/${blogId}`
        });

        return handleApiResponse(response, '获取博客内容');
    } catch (error) {
        handleError('获取博客内容', error);
        return null;
    }
};

/**
 * 获取Markdown内容
 */
export const fetchMarkdownContent = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`状态码 ${response.status} ${response.statusText}`);
        }
        return await response.text();
    } catch (error) {
        const enhancedError = new Error(`Markdown内容获取失败: ${error instanceof Error ? error.message : String(error)}`);

        if (error instanceof Error && error.stack) {
            enhancedError.stack = `${enhancedError.stack}\nCaused by: ${error.stack}`;
        }

        handleError('获取Markdown内容', enhancedError);
        throw enhancedError;
    }
};

/**
 * 搜索博客
 */
export const searchBlogs = async (query: string): Promise<SearchResponseData | null> => {
    try {
        const response = await businessApiRequest<SearchResponse>({
            method: 'GET',
            url: `/web/search/${encodeURIComponent(query)}`
        });

        return handleApiResponse(response, '搜索博客');
    } catch (error) {
        handleError('搜索博客', error);
        return null;
    }
};

// ========================================
// 资源相关 - Resource Services
// ========================================

/**
 * 获取图片完整URL
 */
export const getImageUrl = (imageId: string): string => {
    if (!imageId) return '';
    return `${import.meta.env.VITE_BUSINESS_SERVICE_URL}/web/img/get/${imageId}`;
};

// ========================================
// 评论相关 - Comment Services
// ========================================

/**
 * 获取博客评论
 */
export const getBlogComments = async (blogId: string): Promise<Comment[] | null> => {
    try {
        const response = await businessApiRequest<CommentsResponse>({
            method: 'GET',
            url: `/web/comment/${blogId}`
        });

        return handleApiResponse(response, '获取评论');
    } catch (error) {
        handleError('获取评论', error);
        return null;
    }
};

/**
 * 添加评论
 */
export const addComment = async (commentData: AddCommentData): Promise<Comment | null> => {
    try {
        const response = await businessApiRequest<CommentResponse>({
            method: 'POST',
            url: '/web/comment',
            data: commentData
        });

        return handleApiResponse(response, '添加评论');
    } catch (error) {
        handleError('添加评论', error);
        return null;
    }
};

/**
 * 回复评论
 */
export const replyComment = async (replyData: ReplyCommentData): Promise<Comment | null> => {
    try {
        const response = await businessApiRequest<CommentResponse>({
            method: 'POST',
            url: '/web/comment/reply',
            data: replyData
        });

        return handleApiResponse(response, '回复评论');
    } catch (error) {
        handleError('回复评论', error);
        return null;
    }
};

// ========================================
// 友链相关 - Friend Link Services
// ========================================

/**
 * 获取友链列表
 */
export const getFriendLinks = async (): Promise<FriendLink[] | null> => {
    try {
        const response = await businessApiRequest<FriendLinksResponse>({
            method: 'GET',
            url: '/web/friend-link/all'
        });

        return handleApiResponse(response, '获取友链数据');
    } catch (error) {
        handleError('获取友链数据', error);
        return null;
    }
};

/**
 * 申请友链
 */
export const applyFriendLink = async (applicationData: FriendLinkApplicationData): Promise<FriendLinkApplicationResponse> => {
    try {
        const response = await businessApiRequest<FriendLinkApplyResponse>({
            method: 'POST',
            url: '/web/friend-link/apply',
            data: applicationData
        });

        return {
            code: response.code,
            msg: response.msg || '友链申请成功，请等待管理员审核',
            data: response.data
        };
    } catch (error) {
        handleError('友链申请', error);

        // 提取API错误信息
        if (error && typeof error === 'object' && 'response' in error) {
            const apiError = error as { response?: { data?: { msg?: string; code?: number } } };
            if (apiError.response?.data) {
                return {
                    code: apiError.response.data.code || 500,
                    msg: apiError.response.data.msg || '友链申请失败，请稍后重试',
                    data: null
                };
            }
        }

        return {
            code: 500,
            msg: error instanceof Error ? error.message : '友链申请失败，请稍后重试',
            data: null
        };
    }
};

// ========================================
// 默认导出 - Default Export
// ========================================

export default {
    // 系统相关
    checkSystemStatus,

    // 博客相关
    getHomeData: getBasicData,
    getBlogContent,
    fetchMarkdownContent,
    searchBlogs,

    // 资源相关
    getImageUrl,

    // 评论相关
    getBlogComments,
    addComment,
    replyComment,

    // 友链相关
    getFriendLinks,
    applyFriendLink
};