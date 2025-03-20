import { businessApiRequest, ApiResponse } from './api';

// 用户基本信息接口
interface UserBasicInfo {
    username: string;
    avatar: string;
    role: string;
    // 其他用户基本信息字段
}

type UserBasicInfoResponse = ApiResponse<UserBasicInfo>;

/**
 * 获取用户基本信息以检查系统状态
 * 如果成功获取用户信息，表示系统已配置完成并在运行状态
 * 如果请求失败，表示系统可能尚未配置或需要初始化
 */
export const checkSystemStatus = async (): Promise<{isRuntime: boolean, errorMessage?: string}> => {
    try {
        const response = await businessApiRequest<UserBasicInfoResponse>({
            method: 'GET',
            url: '/config/user-basic-info'
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

export default {
    checkSystemStatus
};