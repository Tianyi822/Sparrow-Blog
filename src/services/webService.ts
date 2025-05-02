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

// 主页数据接口
export interface HomeData {
    avatar_image: string;
    background_image: string;
    blogs: BlogInfo[];
    categories: BlogCategory[];
    tags: BlogTag[];
    type_writer_content: string[];
    user_email: string;
    user_github_address: string;
    user_hobbies: string[];
    user_name: string;
    web_logo: string;
}

type HomeDataResponse = ApiResponse<HomeData>;

/**
 * 获取用户基本信息以检查系统状态
 * 如果成功获取用户信息，表示系统已配置完成并在运行状态
 * 如果请求失败，表示系统可能尚未配置或需要初始化
 */
export const checkSystemStatus = async (): Promise<{isRuntime: boolean, errorMessage?: string}> => {
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
export const getHomeData = async (): Promise<HomeData | null> => {
    try {
        const response = await businessApiRequest<HomeDataResponse>({
            method: 'GET',
            url: '/web/home'
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
    getHomeData,
    getImageUrl
};