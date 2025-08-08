import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '../types';

// 智能服务地址配置
const getBusinessServiceUrl = (): string => {
    // 优先使用环境变量
    if (import.meta.env.VITE_BUSINESS_SERVICE_URL) {
        return import.meta.env.VITE_BUSINESS_SERVICE_URL;
    }
    
    // 在浏览器环境中，本地开发环境回退处理
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        
        // 本地开发环境
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:2233';
        }
    }
    
    // 如果没有配置环境变量，抛出错误提示
    throw new Error('VITE_BUSINESS_SERVICE_URL environment variable is not defined. Please check your .env file.');
};

export const SERVICE_URLS = {
    BUSINESS: getBusinessServiceUrl(),
};

// 创建axios实例
export const businessApi = axios.create({
    baseURL: SERVICE_URLS.BUSINESS,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// 统一的请求拦截器配置
const setupInterceptors = (api: typeof businessApi) => {
    // 请求拦截器
    api.interceptors.request.use(
        (config) => {
            // 从localStorage获取token
            const token = localStorage.getItem('auth_token');

            // 如果token存在，添加到请求头
            if (token) {
                config.headers = config.headers || {};
                config.headers.Authorization = token;
            }

            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    // 响应拦截器
    api.interceptors.response.use(
        (response: AxiosResponse) => {
            return response;
        },
        (error: AxiosError) => {
            // 处理不同的错误状态码
            if (error.response) {
                const { status } = error.response;

                // 处理认证错误
                if (status === 401) {
                    // 清除token并重定向到登录页
                    localStorage.removeItem('auth_token');
                    window.location.href = '/admin/login';
                }

                // 处理权限不足错误
                if (status === 403) {
                    // 记录权限错误
                    console.error('权限不足，无法访问该资源');
                }

                // 处理资源不存在错误
                if (status === 404) {
                    // 记录404错误
                    console.error('请求的资源不存在');
                }

                // 处理服务器错误
                if (status >= 500) {
                    // 记录服务器错误
                    console.error('服务器错误，请稍后再试');
                }
            } else if (error.request) {
                // 发送了请求但未收到响应
                console.error('无法连接到服务器，请检查网络连接');
            } else {
                // 请求配置过程中出错
                console.error('请求配置错误', error.message);
            }

            return Promise.reject(error);
        }
    );
};

// 为API实例设置拦截器
setupInterceptors(businessApi);

// 处理API响应的辅助函数
export const handleApiResponse = <T>(response: AxiosResponse): T => {
    // 可以在这里添加额外的响应处理逻辑
    return response.data;
};



// 业务服务请求函数
export const businessApiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
    try {
        const response = await businessApi(config);
        return handleApiResponse<T>(response);
    } catch (error) {
        // 保留错误日志，对调试很重要
        console.error('业务服务请求失败:', error);

        // 检查是否是axios错误并且有响应
        if (axios.isAxiosError(error) && error.response && error.response.data) {
            // 如果响应数据符合ApiResponse格式，直接返回它
            const errorResponse = error.response.data;
            if (typeof errorResponse === 'object' && 'code' in errorResponse && 'msg' in errorResponse) {
                return errorResponse as T;
            }
        }

        // 其他错误情况抛出异常
        throw error;
    }
};

// 通用请求函数
export const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
    // 默认使用业务服务
    return businessApiRequest<T>(config);
};

// 兼容旧代码，默认使用业务服务
export const apiRequest = businessApiRequest;

export default {
    businessApi,
    businessApiRequest,
    apiRequest,
    request
};