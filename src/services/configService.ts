import { apiRequest, ApiResponse } from './api';

// Types for configuration data
// import { ServerBaseFormData } from '@/components/ConfigServer/ServerBaseConfigForm/ServerBaseConfigForm';
import { LoggerFormData } from '@/components/ConfigServer/LoggerConfigForm/LoggerConfigForm';
import { MySQLFormData } from '@/components/ConfigServer/MySqlConfigForm/MySqlConfigForm';
import { OSSConfigFormData } from '@/components/ConfigServer/OSSConfigForm/OSSConfigForm';
import { CacheConfigFormData } from '@/components/ConfigServer/CacheConfigForm/CacheConfigForm';
import { UserEmailConfigFormData } from '@/components/ConfigServer/UserEmailConfigForm/UserEmailConfigForm';

// 服务器基础配置数据接口
export interface ServerBaseConfig {
    port: string;
    tokenKey: string;
    tokenExpireDuration: string;
    corsOrigins: string;
}

// Combined configuration type
export interface ServerConfig {
    serverBase?: ServerBaseConfig;
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
export const getServerBaseConfig = async (): Promise<ServerBaseConfig> => {
    return apiRequest<ServerBaseConfig>({
        method: 'GET',
        url: '/config/server-base'
    });
};

/**
 * Save server base configuration
 */
interface ServerBaseBackendData {
    'server.port': string;
    'server.token_key': string;
    'server.token_expire_duration': string;
    'server.cors.origins': string;
}

export const transformServerBaseData = (data: ServerBaseConfig): ServerBaseBackendData => {
    // 处理corsOrigins，确保格式正确
    let corsOrigins = data.corsOrigins.trim();

    // 如果不包含协议前缀，添加https://
    if (corsOrigins && !corsOrigins.startsWith('http://') && !corsOrigins.startsWith('https://')) {
        corsOrigins = `https://${corsOrigins}`;
    }

    return {
        'server.port': data.port,
        'server.token_key': data.tokenKey,
        'server.token_expire_duration': data.tokenExpireDuration,
        'server.cors.origins': JSON.stringify([corsOrigins])
    };
};

export const saveServerBaseConfig = async (data: ServerBaseConfig): Promise<ApiResponse<ServerBaseConfig>> => {
    const transformedData = transformServerBaseData(data);
    console.log('转换后的数据:', transformedData); // 调试用

    // 使用JSON格式提交数据
    return apiRequest<ApiResponse<ServerBaseConfig>>({
        method: 'POST',
        url: '/config/base',
        data: transformedData,
        headers: {
            'Content-Type': 'application/json'
        }
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
 * 转换日志配置数据为后端格式
 */
interface LoggerBackendData {
    'logger.level': string;
    'logger.path': string;
    'logger.max_size': string;
    'logger.compress': string;
    'logger.max_backups': string;
    'logger.max_age': string;
}

export const transformLoggerData = (data: LoggerFormData): LoggerBackendData => {
    return {
        'logger.level': data.logLevel.toLowerCase(),
        'logger.path': data.logPath,
        'logger.max_size': data.maxSize,
        'logger.compress': data.compress ? '1' : '0',
        'logger.max_backups': data.maxBackups,
        'logger.max_age': data.maxDays
    };
};

/**
 * Save logger configuration
 */
export const saveLoggerConfig = async (data: LoggerFormData): Promise<ApiResponse<LoggerFormData>> => {
    const transformedData = transformLoggerData(data);
    console.log('转换后的日志配置数据:', transformedData); // 调试用

    return apiRequest<ApiResponse<LoggerFormData>>({
        method: 'POST',
        url: '/config/logger',
        data: transformedData,
        headers: {
            'Content-Type': 'application/json'
        }
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
 * 转换MySQL配置数据为后端格式
 */
interface MySQLBackendData {
    'mysql.user': string;
    'mysql.password': string;
    'mysql.host': string;
    'mysql.port': string;
    'mysql.database': string;
    'mysql.max_open': string;
    'mysql.max_idle': string;
}

export const transformMySQLData = (data: MySQLFormData): MySQLBackendData => {
    return {
        'mysql.user': data.username,
        'mysql.password': data.password,
        'mysql.host': data.host,
        'mysql.port': data.port,
        'mysql.database': data.database,
        'mysql.max_open': data.maxOpenConns,
        'mysql.max_idle': data.maxIdleConns
    };
};

/**
 * Save MySQL configuration
 */
export const saveMySQLConfig = async (data: MySQLFormData): Promise<ApiResponse<MySQLFormData>> => {
    const transformedData = transformMySQLData(data);
    console.log('转换后的MySQL配置数据:', transformedData); // 调试用

    return apiRequest<ApiResponse<MySQLFormData>>({
        method: 'POST',
        url: '/config/mysql',
        data: transformedData,
        headers: {
            'Content-Type': 'application/json'
        }
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
 * 转换OSS配置数据为后端格式
 */
interface OSSBackendData {
    'oss.endpoint': string;
    'oss.region': string;
    'oss.access_key_id': string;
    'oss.access_key_secret': string;
    'oss.bucket': string;
    'oss.image_oss_path': string;
    'oss.blog_oss_path': string;
    'oss.webp.enable': string;
    'oss.webp.quality': string;
    'oss.webp.size': string;
}

export const transformOSSData = (data: OSSConfigFormData): OSSBackendData => {
    return {
        'oss.endpoint': data.endpoint,
        'oss.region': data.region,
        'oss.access_key_id': data.accessKeyId,
        'oss.access_key_secret': data.accessKeySecret,
        'oss.bucket': data.bucketName,
        'oss.image_oss_path': data.imagePath,
        'oss.blog_oss_path': data.blogPath,
        'oss.webp.enable': data.webpEnabled ? '1' : '0',
        'oss.webp.quality': data.webpQuality,
        'oss.webp.size': data.webpMaxSize
    };
};

/**
 * Save OSS storage configuration
 */
export const saveOSSConfig = async (data: OSSConfigFormData): Promise<ApiResponse<OSSConfigFormData>> => {
    const transformedData = transformOSSData(data);
    console.log('转换后的OSS配置数据:', transformedData); // 调试用

    return apiRequest<ApiResponse<OSSConfigFormData>>({
        method: 'POST',
        url: '/config/oss',
        data: transformedData,
        headers: {
            'Content-Type': 'application/json'
        }
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