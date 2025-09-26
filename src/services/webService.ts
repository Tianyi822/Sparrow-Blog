import { businessApiRequest } from './api';
import { ApiResponse } from '../types';
import { WEB_API_ENDPOINTS } from '../constants';
import {
    BlogContentData,
    BasicData,
    SearchResponseData,
    Comment,
    AddCommentData,
    ReplyCommentData
} from '../types';

// 响应类型定义
type BlogContentResponse = ApiResponse<BlogContentData>;
type BasicDataResponse = ApiResponse<BasicData>;
type SearchResponse = ApiResponse<SearchResponseData>;
type CommentsResponse = ApiResponse<Comment[]>;
type CommentResponse = ApiResponse<Comment>;

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
            url: WEB_API_ENDPOINTS.SYSTEM.STATUS
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
            url: WEB_API_ENDPOINTS.DATA.BASIC_DATA
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
            url: WEB_API_ENDPOINTS.DATA.BLOG_CONTENT(blogId)
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
            url: WEB_API_ENDPOINTS.SEARCH.BLOGS(query)
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
            url: WEB_API_ENDPOINTS.COMMENTS.ADD,
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
            url: WEB_API_ENDPOINTS.COMMENTS.REPLY,
            data: replyData
        });

        return handleApiResponse(response, '回复评论');
    } catch (error) {
        handleError('回复评论', error);
        return null;
    }
};

/**
 * 获取最新评论
 */
export const getLatestComments = async (): Promise<Comment[] | null> => {
    try {
        const response = await businessApiRequest<CommentsResponse>({
            method: 'GET',
            url: WEB_API_ENDPOINTS.COMMENTS.LATEST
        });

        return handleApiResponse(response, '获取最新评论');
    } catch (error) {
        handleError('获取最新评论', error);
        return null;
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
    replyComment
};