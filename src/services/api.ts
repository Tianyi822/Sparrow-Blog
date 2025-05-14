import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// API response type
export interface ApiResponse<T = unknown> {
    code: number;
    message?: string; // For backward compatibility
    msg?: string;    // For backward compatibility
    data: T;
}

// 服务地址配置
export const SERVICE_URLS = {
    CONFIG: import.meta.env.VITE_INITIATE_CONFIG_SERVICE_URL,
    BUSINESS: import.meta.env.VITE_BUSINESS_SERVICE_URL,
};

// 创建两个不同的axios实例
export const configApi = axios.create({
    baseURL: SERVICE_URLS.CONFIG,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

export const businessApi = axios.create({
    baseURL: SERVICE_URLS.BUSINESS,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// 统一的请求拦截器配置
const setupInterceptors = (api: typeof configApi | typeof businessApi) => {
    // Request interceptor
    api.interceptors.request.use(
        (config) => {
            // Get token from localStorage
            const token = localStorage.getItem('auth_token');

            // If token exists, add to headers
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

    // Response interceptor
    api.interceptors.response.use(
        (response: AxiosResponse) => {
            return response;
        },
        (error: AxiosError) => {
            // Handle different error statuses
            if (error.response) {
                const { status } = error.response;

                // Handle authentication errors
                if (status === 401) {
                    // Clear token and redirect to login
                    localStorage.removeItem('auth_token');
                    window.location.href = '/admin/login';
                }

                // Handle forbidden errors
                if (status === 403) {
                    console.error('权限不足，无法访问该资源');
                }

                // Handle not found errors
                if (status === 404) {
                    console.error('请求的资源不存在');
                }

                // Handle server errors
                if (status >= 500) {
                    console.error('服务器错误，请稍后再试');
                }
            } else if (error.request) {
                // Request was made but no response received
                console.error('无法连接到服务器，请检查网络连接');
            } else {
                // Something happened in setting up the request
                console.error('请求配置错误', error.message);
            }

            return Promise.reject(error);
        }
    );
};

// 为两个API实例设置拦截器
setupInterceptors(configApi);
setupInterceptors(businessApi);

// Helper function to handle API responses
export const handleApiResponse = <T>(response: AxiosResponse): T => {
    // You can add additional response handling here
    return response.data;
};

// 配置服务请求函数
export const configApiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
    try {
        const response = await configApi(config);
        return handleApiResponse<T>(response);
    } catch (error) {
        console.error('配置服务请求失败:', error);
        throw error;
    }
};

// 业务服务请求函数
export const businessApiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
    try {
        const response = await businessApi(config);
        return handleApiResponse<T>(response);
    } catch (error) {
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

// 通用请求函数 (兼容 InitiateConfigService 中的用法)
export const request = async <T>(config: AxiosRequestConfig): Promise<T> => {
    // 默认使用配置服务
    return configApiRequest<T>(config);
};

// 兼容旧代码，默认使用业务服务
export const apiRequest = businessApiRequest;

export default {
    configApi,
    businessApi,
    configApiRequest,
    businessApiRequest,
    apiRequest,
    request
};