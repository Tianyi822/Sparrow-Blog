import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// API response type
export interface ApiResponse<T> {
    code: number;
    data: T;
    msg: string;
}

// Create axios instance with default config
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('auth_token');

        // If token exists, add to headers
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
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
            const {status} = error.response;

            // Handle authentication errors
            if (status === 401) {
                // Clear token and redirect to login
                localStorage.removeItem('auth_token');
                window.location.href = '/login';
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

// Helper function to handle API responses
export const handleApiResponse = <T>(response: AxiosResponse): T => {
    // You can add additional response handling here
    return response.data;
};

// Custom request function with typing and error handling
export const apiRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
    try {
        const response = await api(config);
        return handleApiResponse<T>(response);
    } catch (error) {
        console.error('API 请求失败:', error); // 记录错误日志
        throw error; // 继续抛出错误以保持调用链的错误处理机制
    }
};

export default api;