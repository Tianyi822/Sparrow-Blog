import { apiRequest, ApiResponse } from './api';

// Types for configuration data
import { ServerBaseFormData } from '@/components/ConfigServer/ServerBaseConfigForm/ServerBaseConfigForm';
import { LoggerFormData } from '@/components/ConfigServer/LoggerConfigForm/LoggerConfigForm';
import { MySQLFormData } from '@/components/ConfigServer/MySqlConfigForm/MySqlConfigForm';
import { OSSConfigFormData } from '@/components/ConfigServer/OSSConfigForm/OSSConfigForm';
import { CacheConfigFormData } from '@/components/ConfigServer/CacheConfigForm/CacheConfigForm';
import { UserEmailConfigFormData } from '@/components/ConfigServer/UserEmailConfigForm/UserEmailConfigForm';

// Combined configuration type
export interface ServerConfig {
    serverBase?: ServerBaseFormData;
    logger?: LoggerFormData;
    mysql?: MySQLFormData;
    ossStorage?: OSSConfigFormData;
    cache?: CacheConfigFormData;
    userEmail?: UserEmailConfigFormData;
}

/**
 * Fetch all server configurations
 */
export const getAllConfigs = async (): Promise<ServerConfig> => {
    return apiRequest<ServerConfig>({
        method: 'GET',
        url: '/config'
    });
};

/**
 * Fetch server base configuration
 */
export const getServerBaseConfig = async (): Promise<ServerBaseFormData> => {
    return apiRequest<ServerBaseFormData>({
        method: 'GET',
        url: '/config/server-base'
    });
};

/**
 * Save server base configuration
 */
export const saveServerBaseConfig = async (data: ServerBaseFormData): Promise<ApiResponse<ServerBaseFormData>> => {
    return apiRequest<ApiResponse<ServerBaseFormData>>({
        method: 'POST',
        url: '/config/server-base',
        data
    });
};

/**
 * Fetch logger configuration
 */
export const getLoggerConfig = async (): Promise<LoggerFormData> => {
    return apiRequest<LoggerFormData>({
        method: 'GET',
        url: '/config/logger'
    });
};

/**
 * Save logger configuration
 */
export const saveLoggerConfig = async (data: LoggerFormData): Promise<ApiResponse<LoggerFormData>> => {
    return apiRequest<ApiResponse<LoggerFormData>>({
        method: 'POST',
        url: '/config/logger',
        data
    });
};

/**
 * Fetch MySQL configuration
 */
export const getMySQLConfig = async (): Promise<MySQLFormData> => {
    return apiRequest<MySQLFormData>({
        method: 'GET',
        url: '/config/mysql'
    });
};

/**
 * Save MySQL configuration
 */
export const saveMySQLConfig = async (data: MySQLFormData): Promise<ApiResponse<MySQLFormData>> => {
    return apiRequest<ApiResponse<MySQLFormData>>({
        method: 'POST',
        url: '/config/mysql',
        data
    });
};

/**
 * Fetch OSS storage configuration
 */
export const getOSSConfig = async (): Promise<OSSConfigFormData> => {
    return apiRequest<OSSConfigFormData>({
        method: 'GET',
        url: '/config/oss'
    });
};

/**
 * Save OSS storage configuration
 */
export const saveOSSConfig = async (data: OSSConfigFormData): Promise<ApiResponse<OSSConfigFormData>> => {
    return apiRequest<ApiResponse<OSSConfigFormData>>({
        method: 'POST',
        url: '/config/oss',
        data
    });
};

/**
 * Fetch Cache configuration
 */
export const getCacheConfig = async (): Promise<CacheConfigFormData> => {
    return apiRequest<CacheConfigFormData>({
        method: 'GET',
        url: '/config/cache'
    });
};

/**
 * Save Cache configuration
 */
export const saveCacheConfig = async (data: CacheConfigFormData): Promise<ApiResponse<CacheConfigFormData>> => {
    return apiRequest<ApiResponse<CacheConfigFormData>>({
        method: 'POST',
        url: '/config/cache',
        data
    });
};

/**
 * Fetch User & Email configuration
 */
export const getUserEmailConfig = async (): Promise<UserEmailConfigFormData> => {
    return apiRequest<UserEmailConfigFormData>({
        method: 'GET',
        url: '/config/user-email'
    });
};

/**
 * Save User & Email configuration
 */
export const saveUserEmailConfig = async (data: UserEmailConfigFormData): Promise<ApiResponse<UserEmailConfigFormData>> => {
    return apiRequest<ApiResponse<UserEmailConfigFormData>>({
        method: 'POST',
        url: '/config/user-email',
        data
    });
};

/**
 * Test database connection
 */
export const testDatabaseConnection = async (data: MySQLFormData): Promise<ApiResponse<{ connected: boolean }>> => {
    return apiRequest<ApiResponse<{ connected: boolean }>>({
        method: 'POST',
        url: '/config/mysql/test-connection',
        data
    });
};

/**
 * Test SMTP configuration
 */
export const testSmtpConnection = async (data: UserEmailConfigFormData): Promise<ApiResponse<{ sent: boolean }>> => {
    return apiRequest<ApiResponse<{ sent: boolean }>>({
        method: 'POST',
        url: '/config/email/test-smtp',
        data
    });
};

/**
 * Apply all configurations (restart server)
 */
export const applyConfigurations = async (): Promise<ApiResponse<null>> => {
    return apiRequest<ApiResponse<null>>({
        method: 'POST',
        url: '/config/apply'
    });
};

export default {
    getAllConfigs,
    getServerBaseConfig,
    saveServerBaseConfig,
    getLoggerConfig,
    saveLoggerConfig,
    getMySQLConfig,
    saveMySQLConfig,
    getOSSConfig,
    saveOSSConfig,
    getCacheConfig,
    saveCacheConfig,
    getUserEmailConfig,
    saveUserEmailConfig,
    testDatabaseConnection,
    testSmtpConnection,
    applyConfigurations
};