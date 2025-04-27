import { businessApiRequest, ApiResponse } from './api';

// 用户基本信息接口
interface UserBasicInfo {
    username: string;
    avatar: string;
    role: string;
    // 其他用户基本信息字段
}

// 博客用户信息接口
export interface BlogUserInfo {
    avatar_image: string;
    background_image: string;
    user_email: string;
    user_name: string;
    web_logo: string;
    type_writer_content?: string[];
    user_hobbies?: string[];
    user_github_address?: string;
}

type UserBasicInfoResponse = ApiResponse<UserBasicInfo>;
type BlogUserInfoResponse = ApiResponse<BlogUserInfo>;

/**
 * 获取用户基本信息以检查系统状态
 * 如果成功获取用户信息，表示系统已配置完成并在运行状态
 * 如果请求失败，表示系统可能尚未配置或需要初始化
 */
export const checkSystemStatus = async (): Promise<{isRuntime: boolean, errorMessage?: string}> => {
    try {
        const response = await businessApiRequest<UserBasicInfoResponse>({
            method: 'GET',
            url: '/web/user-basic-info'
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
 * 获取博客用户信息，包括用户名、头像、Logo和背景图片
 */
export const getBlogUserInfo = async (): Promise<BlogUserInfo | null> => {
    try {
        const response = await businessApiRequest<BlogUserInfoResponse>({
            method: 'GET',
            url: '/web/user-basic-info'
        });
        
        if (response.code === 200 && response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('获取博客用户信息失败:', error);
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
    return `${import.meta.env.VITE_BUSINESS_SERVICE_URL}/img/get/${imageId}`;
};

export default {
    checkSystemStatus,
    getBlogUserInfo,
    getImageUrl
};