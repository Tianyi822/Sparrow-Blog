import { businessApi, businessApiRequest } from './api';
import { ApiResponse } from '../types/apiTypes';

// 验证码请求数据接口
export interface VerificationCodeRequest {
    user_email: string;
}

// 登录请求数据接口
export interface LoginRequest {
    user_email: string;
    verified_code: string;
}

// 登录响应数据接口
export interface LoginResponse {
    token: string;
    user_info: {
        user_id: number;
        user_name: string;
        user_email: string;
        user_avatar?: string;
    };
}

// Blog相关接口
export interface BlogTag {
    tag_id: string;
    tag_name: string;
}

export interface BlogCategory {
    category_id: string;
    category_name: string;
}

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

export interface BlogListResponse {
    code: number;
    msg: string;
    data: BlogItem[];
}

/**
 * 发送验证码
 * @param data 包含用户邮箱的请求数据
 * @returns 发送结果
 */
export const sendVerificationCode = async (data: VerificationCodeRequest): Promise<ApiResponse<null>> => {
    return businessApiRequest<ApiResponse<null>>({
        method: 'POST',
        url: '/admin/login/verification-code',
        data,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

/**
 * 验证码登录
 * @param data 包含用户邮箱和验证码的请求数据
 * @returns 登录结果
 */
export const loginWithVerificationCode = async (data: LoginRequest): Promise<ApiResponse<null>> => {
    try {
        const response = await businessApi.post<ApiResponse<null>>(
            '/admin/login/login',
            data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        // 检查响应头中是否有token
        const authHeader = response.headers['authorization'] || response.headers['Authorization'];
        if (authHeader) {
            // 保存token到localStorage
            const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
                ? authHeader.substring(7)
                : authHeader;
            localStorage.setItem('auth_token', token);
            console.log('已保存token:', token);
        }

        return response.data;
    } catch (error) {
        console.error('登录失败:', error);
        throw error;
    }
};

/**
 * 获取用户基本信息
 * @returns 用户基本信息
 */
export const getUserBasicInfo = async (): Promise<ApiResponse<{ user_name: string }>> => {
    return businessApiRequest<ApiResponse<{ user_name: string }>>({
        method: 'GET',
        url: '/config/user-basic-info'
    });
};

/**
 * 获取所有博客列表
 * @returns 博客列表数据
 */
export const getAllBlogs = async (): Promise<BlogListResponse> => {
    return businessApiRequest<BlogListResponse>({
        method: 'GET',
        url: '/admin/posts/all-blogs'
    });
};

/**
 * 修改博客状态
 * @param blogId 博客ID
 * @returns 修改结果
 */
export const changeBlogState = async (blogId: string): Promise<ApiResponse<null>> => {
    return businessApiRequest<ApiResponse<null>>({
        method: 'GET',
        url: `/admin/posts/change-blog-state/${blogId}`
    });
};

/**
 * 修改博客置顶状态
 * @param blogId 博客ID
 * @returns 修改结果
 */
export const setBlogTop = async (blogId: string): Promise<ApiResponse<null>> => {
    return businessApiRequest<ApiResponse<null>>({
        method: 'GET',
        url: `/admin/posts/set-top/${blogId}`
    });
};

export default {
    sendVerificationCode,
    loginWithVerificationCode,
    getUserBasicInfo,
    getAllBlogs,
    changeBlogState,
    setBlogTop
}; 