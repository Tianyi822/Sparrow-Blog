import { businessApiRequest, ApiResponse } from './api';
import { BlogCategory, BlogTag } from './adminService';

// 博客文章信息接口
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

type BlogContentResponse = ApiResponse<BlogContentData>;

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

type BasicDataResponse = ApiResponse<BasicData>;

/**
 * 获取用户基本信息以检查系统状态
 * 如果成功获取用户信息，表示系统已配置完成并在运行状态
 * 如果请求失败，表示系统可能尚未配置或需要初始化
 */
export const checkSystemStatus = async (): Promise<{ isRuntime: boolean, errorMessage?: string }> => {
    try {
        const response = await businessApiRequest<ApiResponse<null>>({
            method: 'GET',
            url: '/web/sys/status'
        });

        return {
            isRuntime: response.code === 200,
        };
    } catch (error) {
        console.error('系统状态检查失败:', error);
        return {
            isRuntime: false,
            errorMessage: error instanceof Error ? error.message : '未知错误'
        };
    }
};

/**
 * 获取主页数据，包括用户信息、博客列表、分类和标签
 */
export const getBasicData = async (): Promise<BasicData | null> => {
    try {
        const response = await businessApiRequest<BasicDataResponse>({
            method: 'GET',
            url: '/web/basic-data'
        });

        if (response.code === 200 && response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('获取主页数据失败:', error);
        return null;
    }
};

/**
 * 根据ID获取博客内容
 * @param blogId 博客ID
 * @returns 博客数据和Markdown内容URL
 */
export const getBlogContent = async (blogId: string): Promise<BlogContentData | null> => {
    try {
        const response = await businessApiRequest<BlogContentResponse>({
            method: 'GET',
            url: `/web/blog/${blogId}`
        });

        if (response.code === 200 && response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('获取博客内容失败:', error);
        return null;
    }
};

/**
 * 获取Markdown内容
 * @param url Markdown文件的预签名URL
 * @returns Markdown内容
 */
export const fetchMarkdownContent = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorMessage = `获取Markdown内容失败: 状态码 ${response.status} ${response.statusText}`;
            console.error(errorMessage);
        }
        return await response.text();
    } catch (error) {
        // 实质性地增强错误，添加更多上下文信息
        const enhancedError = new Error(`Markdown内容获取失败: ${error instanceof Error ? error.message : String(error)}`);
        
        // 保留原始错误堆栈信息
        if (error instanceof Error && error.stack) {
            enhancedError.stack = `${enhancedError.stack}\nCaused by: ${error.stack}`;
            
            // 可以保留原始错误的其他属性
            Object.entries(error).forEach(([key, value]) => {
                if (key !== 'message' && key !== 'stack') {
                    // @ts-expect-error 自定义错误属性
                    enhancedError[key] = value;
                }
            });
        }
        
        // 记录增强后的错误
        console.error('获取Markdown内容失败:', enhancedError);
        
        // 抛出增强后的错误
        throw enhancedError;
    }
};

/**
 * 获取图片完整URL
 * @param imageId 图片ID
 * @returns 完整的图片URL
 */
export const getImageUrl = (imageId: string): string => {
    if (!imageId) return '';
    return `${import.meta.env.VITE_BUSINESS_SERVICE_URL}/web/img/get/${imageId}`;
};

export default {
    checkSystemStatus,
    getHomeData: getBasicData,
    getBlogContent,
    fetchMarkdownContent,
    getImageUrl
};