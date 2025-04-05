import { request } from './api';
import { ApiResponse } from './api.ts';
import { LoggerFormData } from '@/components/InitiateConfig/LoggerConfigForm';
import { MySQLFormData } from '@/components/InitiateConfig/MySqlConfigForm';
import { OSSConfigFormData } from '@/components/InitiateConfig/OSSConfigForm';
import { CacheConfigFormData } from '@/components/InitiateConfig/CacheConfigForm';
import { UserEmailConfigFormData } from '@/components/InitiateConfig/UserConfigForm';

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
 * Save server base configuration
 */
interface ServerBaseBackendData {
    'server.port': string;
    'server.token_key': string;
    'server.token_expire_duration': string;
    'server.cors.origins': string;
}

export const transformServerBaseData = (data: ServerBaseConfig): ServerBaseBackendData => {
    return {
        'server.port': data.port,
        'server.token_key': data.tokenKey,
        'server.token_expire_duration': data.tokenExpireDuration,
        'server.cors.origins': data.corsOrigins.trim()
    };
};

export const saveInitiatedServerBaseConfig = async (data: ServerBaseConfig): Promise<ApiResponse<ServerBaseConfig>> => {
    const transformedData = transformServerBaseData(data);
    console.log('转换后的数据:', transformedData); // 调试用

    // 使用JSON格式提交数据
    return request<ApiResponse<ServerBaseConfig>>({
        method: 'POST',
        url: '/init/server',
        data: transformedData,
        headers: {
            'Content-Type': 'application/json'
        }
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
        'logger.level': data.logLevel,
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
export const saveInitiatedLoggerConfig = async (data: LoggerFormData): Promise<ApiResponse<LoggerFormData>> => {
    const transformedData = transformLoggerData(data);
    console.log('转换后的日志配置数据:', transformedData); // 调试用

    return request<ApiResponse<LoggerFormData>>({
        method: 'POST',
        url: '/init/logger',
        data: transformedData,
        headers: {
            'Content-Type': 'application/json'
        }
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
export const saveInitiatedMySQLConfig = async (data: MySQLFormData): Promise<ApiResponse<MySQLFormData>> => {
    const transformedData = transformMySQLData(data);
    console.log('转换后的MySQL配置数据:', transformedData); // 调试用

    return request<ApiResponse<MySQLFormData>>({
        method: 'POST',
        url: '/init/mysql',
        data: transformedData,
        headers: {
            'Content-Type': 'application/json'
        }
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
export const saveInitiatedOSSConfig = async (data: OSSConfigFormData): Promise<ApiResponse<OSSConfigFormData>> => {
    const transformedData = transformOSSData(data);
    console.log('转换后的OSS配置数据:', transformedData); // 调试用

    return request<ApiResponse<OSSConfigFormData>>({
        method: 'POST',
        url: '/init/oss',
        data: transformedData,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

/**
 * 转换缓存配置数据为后端格式
 */
interface CacheBackendData {
    'cache.aof.enable': string;
    'cache.aof.path': string;
    'cache.aof.max_size': string;
    'cache.aof.compress': string;
}

export const transformCacheData = (data: CacheConfigFormData): CacheBackendData => {
    return {
        'cache.aof.enable': data.aofEnabled ? '1' : '0',
        'cache.aof.path': data.aofPath || '',
        'cache.aof.max_size': data.aofMaxSize,
        'cache.aof.compress': data.compressEnabled ? '1' : '0'
    };
};

/**
 * Save Cache configuration
 */
export const saveInitiatedCacheConfig = async (data: CacheConfigFormData): Promise<ApiResponse<CacheConfigFormData>> => {
    const transformedData = transformCacheData(data);
    console.log('转换后的缓存配置数据:', transformedData); // 调试用

    return request<ApiResponse<CacheConfigFormData>>({
        method: 'POST',
        url: '/init/cache',
        data: transformedData,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

/**
 * Save User configuration with verification code
 */
export interface UserConfigData {
    'user.username': string;
    'user.verification_code': string;
}

export const saveInitiatedUserConfig = async (data: UserConfigData): Promise<ApiResponse<null>> => {
    return request<ApiResponse<null>>({
        method: 'POST',
        url: '/init/user',
        data: data,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

/**
 * Send verification code to email
 */
export interface VerificationCodeData {
    'user.user_email': string;
    'user.smtp_account': string;
    'user.smtp_address': string;
    'user.smtp_port': string;
    'user.smtp_auth_code': string;
}

export const sendInitiatedVerificationCode = async (data: VerificationCodeData): Promise<ApiResponse<null>> => {
    return request<ApiResponse<null>>({
        method: 'POST',
        url: '/init/config-email-send-code',
        data: data,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

/**
 * Complete configuration and restart server
 */
export const completeInitiatedConfig = async (): Promise<ApiResponse<null>> => {
    return request<ApiResponse<null>>({
        method: 'GET',
        url: '/init/complete-config'
    });
};

export default {
    saveServerBaseConfig: saveInitiatedServerBaseConfig,
    saveInitiatedLoggerConfig,
    saveInitiatedMySQLConfig,
    saveInitiatedOSSConfig,
    saveInitiatedCacheConfig,
    saveInitiatedUserConfig,
    completeInitiatedConfig,
    sendInitiatedVerificationCode,
};