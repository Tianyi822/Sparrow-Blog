/**
 * 用户相关类型定义
 */

// 用户配置接口
export interface UserConfig {
    user_name: string;
    user_email: string;
    avatar_image: string;
    web_logo: string;
    background_image: string;
    user_github_address?: string;
    user_hobbies?: string[];
    type_writer_content?: string[];
    icp_filing_number?: string;
}

// 用户配置响应接口
export interface UserConfigResponse {
    code: number;
    msg: string;
    data: UserConfig;
}

// 服务器配置接口
export interface ServerConfig {
    port: number;
    token_expire_duration: number;
    cors_origins: string[];
    token_key?: string;
    smtp_account?: string;
    smtp_address?: string;
    smtp_port?: number;
}

// 服务器配置响应接口
export interface ServerConfigResponse {
    code: number;
    msg: string;
    data: ServerConfig;
}

// 日志配置接口
export interface LoggerConfig {
    level: string;
    dir_path: string;
    max_size: number;
    max_backups: number;
    max_age: number;
    compress: boolean;
}

// 日志配置响应接口
export interface LoggerConfigResponse {
    code: number;
    msg: string;
    data: LoggerConfig;
}

// MySQL配置接口
export interface MySQLConfig {
    database: string;
    host: string;
    max_idle: number;
    max_open: number;
    port: number;
    user: string;
    password?: string;
}

// MySQL配置响应接口
export interface MySQLConfigResponse {
    code: number;
    msg: string;
    data: MySQLConfig;
}

// OSS配置接口
export interface OSSConfig {
    endpoint: string;
    region: string;
    bucket: string;
    image_oss_path: string;
    blog_oss_path: string;
    access_key_id?: string;
    access_key_secret?: string;
}

// OSS配置响应接口
export interface OSSConfigResponse {
    code: number;
    msg: string;
    data: OSSConfig;
}

// 缓存和索引配置接口
export interface CacheAndIndexConfig {
    enable_aof: boolean;
    aof_dir_path: string;
    aof_mix_size: number;
    aof_compress: boolean;
    index_path: string;
}

// 缓存和索引配置响应接口
export interface CacheAndIndexConfigResponse {
    code: number;
    msg: string;
    data: CacheAndIndexConfig;
}

// 社交媒体链接接口
export interface SocialMediaLinks {
    github?: string;
    twitter?: string;
    linkedin?: string;
    email?: string;
}

// 工具组件属性接口
export interface ToolsProps {
    /** 自定义类名 */
    className?: string;
    /** 网站基础数据 */
    homeData?: import('./blog').BasicData | null;
    /** 是否显示评论按钮 */
    showCommentsButton?: boolean;
}