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
    smtpAccount?: string;
    smtpAddress?: string;
    smtpPort?: string; 
    smtpAuthCode?: string;
}

// 组合配置类型，包含所有初始化配置
export interface ServerConfig {
    serverBase?: ServerBaseConfig;
    logger?: LoggerFormData;
    mysql?: MySQLFormData;
    ossStorage?: OSSConfigFormData;
    cache?: CacheConfigFormData;
    userEmail?: UserEmailConfigFormData;
}

/**
 * 服务器基础配置数据的后端格式
 */
interface ServerBaseBackendData {
    'server.port': string;
    'server.token_key': string;
    'server.token_expire_duration': string;
    'server.cors.origins': string;
    'server.smtp_account'?: string;
    'server.smtp_address'?: string;
    'server.smtp_port'?: string;
    'server.smtp_auth_code'?: string;
}

/**
 * 转换服务器基础配置数据为后端格式
 * @param data 前端服务器配置数据
 * @returns 转换后的后端格式数据
 */
export const transformServerBaseData = (data: ServerBaseConfig): ServerBaseBackendData => {
    return {
        'server.port': data.port,
        'server.token_key': data.tokenKey,
        'server.token_expire_duration': data.tokenExpireDuration,
        'server.cors.origins': data.corsOrigins.trim(),
        'server.smtp_account': data.smtpAccount,
        'server.smtp_address': data.smtpAddress,
        'server.smtp_port': data.smtpPort,
        'server.smtp_auth_code': data.smtpAuthCode
    };
};

/**
 * 保存服务器基础配置
 * @param data 服务器基础配置数据
 * @returns 保存响应结果
 */
export const saveInitiatedServerBaseConfig = async (data: ServerBaseConfig): Promise<ApiResponse<ServerBaseConfig>> => {
    const transformedData = transformServerBaseData(data);

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
 * 日志配置的后端格式
 */
interface LoggerBackendData {
    'logger.level': string;
    'logger.path': string;
    'logger.max_size': string;
    'logger.compress': string;
    'logger.max_backups': string;
    'logger.max_age': string;
}

/**
 * 转换日志配置数据为后端格式
 * @param data 前端日志配置数据
 * @returns 转换后的后端格式数据
 */
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
 * 保存日志配置
 * @param data 日志配置数据
 * @returns 保存响应结果
 */
export const saveInitiatedLoggerConfig = async (data: LoggerFormData): Promise<ApiResponse<LoggerFormData>> => {
    const transformedData = transformLoggerData(data);

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
 * MySQL配置的后端格式
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

/**
 * 转换MySQL配置数据为后端格式
 * @param data 前端MySQL配置数据
 * @returns 转换后的后端格式数据
 */
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
 * 保存MySQL配置
 * @param data MySQL配置数据
 * @returns 保存响应结果
 */
export const saveInitiatedMySQLConfig = async (data: MySQLFormData): Promise<ApiResponse<MySQLFormData>> => {
    const transformedData = transformMySQLData(data);

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
 * @param data 前端OSS配置数据
 * @returns 转换后的后端格式数据
 */
export const transformOSSData = (data: OSSConfigFormData): {
    "oss.endpoint": string;
    "oss.region": string;
    "oss.access_key_id": string;
    "oss.access_key_secret": string;
    "oss.bucket": string;
    "oss.image_oss_path": string;
    "oss.blog_oss_path": string
} => {
    return {
        'oss.endpoint': data.endpoint,
        'oss.region': data.region,
        'oss.access_key_id': data.accessKeyId,
        'oss.access_key_secret': data.accessKeySecret,
        'oss.bucket': data.bucketName,
        'oss.image_oss_path': data.imagePath,
        'oss.blog_oss_path': data.blogPath,
    };
};

/**
 * 保存OSS存储配置
 * @param data OSS配置数据
 * @returns 保存响应结果
 */
export const saveInitiatedOSSConfig = async (data: OSSConfigFormData): Promise<ApiResponse<OSSConfigFormData>> => {
    const transformedData = transformOSSData(data);

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
 * 缓存配置的后端格式
 */
interface CacheBackendData {
    'cache.aof.enable': string;
    'cache.aof.path': string;
    'cache.aof.max_size': string;
    'cache.aof.compress': string;
}

/**
 * 转换缓存配置数据为后端格式
 * @param data 前端缓存配置数据
 * @returns 转换后的后端格式数据
 */
export const transformCacheData = (data: CacheConfigFormData): CacheBackendData => {
    return {
        'cache.aof.enable': data.aofEnabled ? '1' : '0',
        'cache.aof.path': data.aofPath || '',
        'cache.aof.max_size': data.aofMaxSize,
        'cache.aof.compress': data.compressEnabled ? '1' : '0'
    };
};

/**
 * 保存缓存配置
 * @param data 缓存配置数据
 * @returns 保存响应结果
 */
export const saveInitiatedCacheConfig = async (data: CacheConfigFormData): Promise<ApiResponse<CacheConfigFormData>> => {
    const transformedData = transformCacheData(data);

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
 * 用户配置数据的后端格式（带验证码）
 */
export interface UserConfigData {
    'user.username': string;
    'user.user_email': string;
    'user.user_github_address'?: string;
    'user.user_hobbies'?: string[];
    'user.type_writer_content'?: string[];
    'user.verification_code': string;
}

/**
 * 保存用户配置（需要验证码）
 * @param data 用户配置数据
 * @returns 保存响应结果
 */
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
 * 验证码请求数据格式
 */
export interface VerificationCodeData {
    'user.user_email': string;
}

/**
 * 发送验证码到邮箱
 * @param data 包含用户邮箱的数据
 * @returns 发送响应结果
 */
export const sendInitiatedVerificationCode = async (data: VerificationCodeData): Promise<ApiResponse<null>> => {
    return request<ApiResponse<null>>({
        method: 'POST',
        url: '/init/send-code',
        data: data,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

/**
 * 完成配置并重启服务器
 * @returns 完成配置的响应结果
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