import { businessApiRequest } from './api';
import { ApiResponse } from './api.ts';

// ===============================================================
// 认证相关接口和函数
// ===============================================================

// 验证码请求数据接口
export interface VerificationCodeRequest {
    user_email: string;
}

// 登录请求数据接口
export interface LoginRequest {
    user_email: string;
    verification_code: string;
}

// 登录响应数据接口
export interface LoginResponse {
    token: string;
}

// 用户信息响应接口
export interface UserInfoResponse {
    code: number;
    msg: string;
    data: {
        user_name: string;
    };
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
 * @param data 登录请求数据
 * @returns 登录结果
 */
export const loginWithVerificationCode = async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    try {
        const response = await businessApiRequest<ApiResponse<LoginResponse>>({
            method: 'POST',
            url: '/admin/login',
            data,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // 如果登录成功且返回了token，则存储到localStorage
        if (response.code === 200 && response.data && response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
            console.log('Token已保存到localStorage');
        }

        return response;
    } catch (error) {
        console.error('登录失败:', error);
        throw error;
    }
};

/**
 * 获取登录页用户信息
 * @returns 用户信息数据
 */
export const getUserInfo = async (): Promise<UserInfoResponse> => {
    return businessApiRequest<UserInfoResponse>({
        method: 'GET',
        url: '/admin/login/user-info'
    });
};

// ===============================================================
// 博客相关接口和函数
// ===============================================================

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

export interface TagsAndCategoriesResponse {
    code: number;
    msg: string;
    data: {
        categories: BlogCategory[];
        tags: BlogTag[];
    };
}

export interface UploadToOSSResponse {
    code: number;
    msg: string;
    data: {
        blog_id: string;
        presign_url: string;
    };
}

export interface UpdateOrAddBlogRequest {
    blog_id: string;
    blog_title: string;
    blog_brief: string;
    category_id: string;
    category: {
        category_name: string;
    };
    tags: Array<{
        tag_id?: string;
        tag_name: string;
    }>;
    blog_state: boolean;
    blog_words_num: number;
    blog_is_top: boolean;
    blog_content?: string;
    blog_image_id?: string;
}

// 博客数据接口
export interface BlogDataResponse {
    code: number;
    msg: string;
    data: {
        blog_data: {
            blog_id: string;
            blog_title: string;
            blog_brief: string;
            category_id: string;
            category: BlogCategory;
            tags: BlogTag[];
            blog_words_num: number;
            create_time: string;
            update_time: string;
            blog_is_top?: boolean;
            blog_state?: boolean;
            blog_image?: GalleryImage;
            blog_image_id?: string;
        };
        content_url: string;
    };
}

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

/**
 * 删除博客
 * @param blogId 博客ID
 * @returns 删除结果
 */
export const deleteBlog = async (blogId: string): Promise<ApiResponse<null>> => {
    return businessApiRequest<ApiResponse<null>>({
        method: 'DELETE',
        url: `/admin/posts/delete/${blogId}`
    });
};

/**
 * 获取所有标签和分类
 * @returns 标签和分类数据
 */
export const getAllTagsAndCategories = async (): Promise<TagsAndCategoriesResponse> => {
    return businessApiRequest<TagsAndCategoriesResponse>({
        method: 'GET',
        url: '/admin/edit/all-tags-categories'
    });
};

/**
 * 更新或添加博客
 * @param data 博客数据
 * @returns 操作结果
 */
export const updateOrAddBlog = async (data: UpdateOrAddBlogRequest): Promise<UploadToOSSResponse> => {
    return businessApiRequest<UploadToOSSResponse>({
        method: 'POST',
        url: '/admin/edit/update-or-add-blog',
        data,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

/**
 * 获取博客编辑数据
 * @param blogId 博客ID
 * @returns 博客数据和内容URL
 */
export const getBlogDataForEdit = async (blogId: string): Promise<BlogDataResponse> => {
    return businessApiRequest<BlogDataResponse>({
        method: 'GET',
        url: `/admin/edit/blog-data/${blogId}`
    });
};

// ===============================================================
// 图库相关接口和函数
// ===============================================================

export interface GalleryImage {
    img_id: string;
    img_name: string;
    img_type: string;
    create_time: string;
}

export interface GalleryImagesResponse {
    code: number;
    msg: string;
    data: GalleryImage[];
}

export interface CheckImageNameResponse {
    code: number;
    msg: string;
    data: boolean;
}

export interface AddImagesRequest {
    imgs: Array<{
        img_name: string;
        img_type: string;
    }>;
}

export interface AddImagesResponse {
    code: number;
    msg: string;
    data: null;
}

export interface RenameImageRequest {
    img_id: string;
    img_name: string;
}

export interface PreSignUrlResponse {
    code: number;
    msg: string;
    data: {
        pre_sign_put_url: string;
    };
}

/**
 * 获取所有图片
 * @returns 图片列表数据
 */
export const getAllGalleryImages = async (): Promise<GalleryImagesResponse> => {
    return businessApiRequest<GalleryImagesResponse>({
        method: 'GET',
        url: '/admin/gallery/all-imgs'
    });
};

/**
 * 重命名图片
 * @param imageId 图片ID
 * @param data 包含图片ID和新名称的请求数据
 * @returns 操作结果
 */
export const renameGalleryImage = async (imageId: string, data: RenameImageRequest): Promise<ApiResponse<null>> => {
    return businessApiRequest<ApiResponse<null>>({
        method: 'PUT',
        url: `/admin/gallery/${imageId}`,
        data,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

/**
 * 删除图片
 * @param imageId 图片ID
 * @returns 操作结果
 */
export const deleteGalleryImage = async (imageId: string): Promise<ApiResponse<null>> => {
    return businessApiRequest<ApiResponse<null>>({
        method: 'DELETE',
        url: `/admin/gallery/${imageId}`
    });
};

/**
 * 获取OSS预签名URL
 * @param fileName 文件名
 * @param fileType 文件类型
 * @returns 包含预签名URL的响应
 */
export const getPreSignUrl = async (fileName: string, fileType: string): Promise<PreSignUrlResponse> => {
    return businessApiRequest<PreSignUrlResponse>({
        method: 'GET',
        url: `/admin/oss/pre_sign_url/${fileName}/type/${fileType}`
    });
};

/**
 * 添加多张图片到图库
 * @param data 包含图片信息的请求数据
 * @returns 添加结果
 */
export const addGalleryImages = async (data: AddImagesRequest): Promise<AddImagesResponse> => {
    return businessApiRequest<AddImagesResponse>({
        method: 'POST',
        url: '/admin/gallery/add',
        data,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

/**
 * 检查图片名称是否已存在
 * @param imageName 要检查的图片名称
 * @returns 包含结果的响应（data为true表示名称已存在）
 */
export const checkImageNameExistence = async (imageName: string): Promise<CheckImageNameResponse> => {
    return businessApiRequest<CheckImageNameResponse>({
        method: 'GET',
        url: `/admin/gallery/is-exist/${encodeURIComponent(imageName)}`
    });
};

/**
 * 获取图片的完整URL
 * @param imgId 图片ID
 * @returns 图片的完整URL
 */
export const getImageUrl = (imgId: string): string => {
    const businessServiceUrl = import.meta.env.VITE_BUSINESS_SERVICE_URL || '';
    return `${businessServiceUrl}/web/img/get/${imgId}`;
};

// ===============================================================
// 用户配置相关接口和函数
// ===============================================================

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

export interface UserConfigResponse {
    code: number;
    msg: string;
    data: UserConfig;
}

/**
 * 获取用户配置信息
 * @returns 用户配置数据
 */
export const getUserConfig = async (): Promise<UserConfigResponse> => {
    return businessApiRequest<UserConfigResponse>({
        method: 'GET',
        url: '/admin/setting/user/config'
    });
};

/**
 * 更新用户配置信息
 * @param userData 用户配置数据
 * @param verificationCode 验证码 (如果更改了邮箱)
 * @param isEmailChanged 邮箱是否被修改
 * @returns 更新结果
 */
export const updateUserConfig = async (
    userData: Partial<UserConfig>,
    verificationCode?: string,
    isEmailChanged?: boolean
): Promise<ApiResponse<null>> => {
    // 构建使用点表示法的请求数据对象
    const requestData: Record<string, string | string[] | undefined> = {};

    // 添加用户数据，使用点表示法
    if (userData.user_name) requestData['user.user_name'] = userData.user_name;

    // 如果邮箱已修改，则需要添加邮箱和验证码
    if (isEmailChanged && userData.user_email) {
        requestData['user.user_email'] = userData.user_email;
        if (verificationCode) {
            requestData['user.verification_code'] = verificationCode;
        }
    }

    // 添加新字段
    if (userData.user_github_address) requestData['user.user_github_address'] = userData.user_github_address;
    if (userData.user_hobbies) requestData['user.user_hobbies'] = userData.user_hobbies;
    if (userData.type_writer_content) requestData['user.type_writer_content'] = userData.type_writer_content;
    if (userData.icp_filing_number !== undefined) requestData['user.icp_filing_number'] = userData.icp_filing_number;

    return businessApiRequest<ApiResponse<null>>({
        method: 'PUT',
        url: '/admin/setting/user/config',
        data: requestData,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

/**
 * 发送邮箱验证码
 * @param email 邮箱地址
 * @returns 验证码发送结果
 */
export const sendEmailVerificationCode = async (email: string): Promise<ApiResponse<null>> => {
    return businessApiRequest<ApiResponse<null>>({
        method: 'POST',
        url: '/admin/setting/user/verify-new-email',
        data: { 'user.user_email': email },
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

/**
 * 更新用户图片配置信息
 * @param avatarImage 头像图片ID
 * @param webLogo 网站Logo图片ID
 * @param backgroundImage 背景图片ID
 * @returns 更新结果
 */
export const updateUserImages = async (
    avatarImage?: string,
    webLogo?: string,
    backgroundImage?: string
): Promise<ApiResponse<null>> => {
    // 构建使用点表示法的请求数据对象
    const requestData: Record<string, string> = {};

    // 添加图片数据，使用点表示法
    if (avatarImage) requestData['user.avatar_image'] = avatarImage;
    if (webLogo) requestData['user.web_logo'] = webLogo;
    if (backgroundImage) requestData['user.background_image'] = backgroundImage;

    // 使用完整路径并允许重定向
    return businessApiRequest<ApiResponse<null>>({
        method: 'PUT',
        url: '/admin/setting/user/visual',
        data: requestData,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

// ===============================================================
// 服务器配置相关接口和函数
// ===============================================================

export interface ServerConfig {
    port: number;
    token_expire_duration: number;
    cors_origins: string[];
    token_key?: string;
    smtp_account?: string;
    smtp_address?: string;
    smtp_port?: number;
}

export interface ServerConfigResponse {
    code: number;
    msg: string;
    data: ServerConfig;
}

/**
 * 获取服务器配置信息
 * @returns 服务器配置数据
 */
export const getServerConfig = async (): Promise<ServerConfigResponse> => {
    return businessApiRequest<ServerConfigResponse>({
        method: 'GET',
        url: '/admin/setting/server/config'
    });
};

/**
 * 更新服务器配置信息
 * @param corsOrigins 跨域来源数组
 * @param tokenExpireDuration 令牌过期时间(小时)
 * @param tokenKey 令牌密钥 (可选)
 * @param smtpAccount SMTP账号 (可选)
 * @param smtpAddress SMTP服务器地址 (可选)
 * @param smtpPort SMTP端口 (可选)
 * @returns 更新结果
 */
export const updateServerConfig = async (
    corsOrigins: string[],
    tokenExpireDuration: number,
    tokenKey?: string,
    smtpAccount?: string,
    smtpAddress?: string,
    smtpPort?: number
): Promise<ApiResponse<null>> => {
    // 使用点表示法构建请求数据
    const requestData: Record<string, string | number | string[]> = {
        'server.token_expire_duration': tokenExpireDuration,
        'server.cors_origins': corsOrigins
    };

    // 如果提供了令牌密钥，则添加到请求数据
    if (tokenKey) {
        requestData['server.token_key'] = tokenKey;
    }

    // 添加SMTP相关配置
    if (smtpAccount) {
        requestData['server.smtp_account'] = smtpAccount;
    }

    if (smtpAddress) {
        requestData['server.smtp_address'] = smtpAddress;
    }

    if (smtpPort) {
        requestData['server.smtp_port'] = smtpPort;
    }

    return businessApiRequest<ApiResponse<null>>({
        method: 'PUT',
        url: '/admin/setting/server/config',
        data: requestData,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

/**
 * 发送SMTP配置验证码
 * @param smtpAccount SMTP账号
 * @param smtpAddress SMTP服务器地址
 * @param smtpPort SMTP端口
 * @param smtpAuthCode SMTP授权码
 * @returns 验证码发送结果
 */
export const sendSMTPVerificationCode = async (
    smtpAccount: string,
    smtpAddress: string,
    smtpPort: string,
    smtpAuthCode: string
): Promise<ApiResponse<null>> => {
    return businessApiRequest<ApiResponse<null>>({
        method: 'POST',
        url: '/admin/setting/user/verify-new-smtp-config',
        data: {
            'server.smtp_account': smtpAccount,
            'server.smtp_address': smtpAddress,
            'server.smtp_port': smtpPort,
            'server.smtp_auth_code': smtpAuthCode
        },
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

// ===============================================================
// 日志配置相关接口和函数
// ===============================================================

export interface LoggerConfig {
    level: string;
    dir_path: string;
    max_size: number;
    max_backups: number;
    max_age: number;
    compress: boolean;
}

export interface LoggerConfigResponse {
    code: number;
    msg: string;
    data: LoggerConfig;
}

/**
 * 获取日志配置信息
 * @returns 日志配置数据
 */
export const getLoggerConfig = async (): Promise<LoggerConfigResponse> => {
    return businessApiRequest<LoggerConfigResponse>({
        method: 'GET',
        url: '/admin/setting/logger/config'
    });
};

/**
 * 更新日志配置信息
 * @param level 日志级别
 * @param dirPath 日志目录路径
 * @param maxAge 日志最大保存天数
 * @param maxSize 单个日志文件最大尺寸(MB)
 * @param maxBackups 最大备份文件数
 * @param compress 是否压缩
 * @returns 更新结果
 */
export const updateLoggerConfig = async (
    level: string,
    dirPath: string,
    maxAge: number,
    maxSize: number,
    maxBackups: number,
    compress: boolean
): Promise<ApiResponse<null>> => {
    const requestData: Record<string, string | number | boolean> = {
        'logger.level': level.toUpperCase(),
        'logger.path': dirPath,
        'logger.max_age': maxAge,
        'logger.max_size': maxSize,
        'logger.max_backups': maxBackups,
        'logger.compress': compress
    };

    return businessApiRequest<ApiResponse<null>>({
        method: 'PUT',
        url: '/admin/setting/logger/config',
        data: requestData,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

// ===============================================================
// 数据库配置相关接口和函数
// ===============================================================

export interface MySQLConfig {
    database: string;
    host: string;
    max_idle: number;
    max_open: number;
    port: number;
    user: string;
    password?: string;
}

export interface MySQLConfigResponse {
    code: number;
    msg: string;
    data: MySQLConfig;
}

/**
 * 获取MySQL数据库配置信息
 * @returns 数据库配置数据
 */
export const getMySQLConfig = async (): Promise<MySQLConfigResponse> => {
    return businessApiRequest<MySQLConfigResponse>({
        method: 'GET',
        url: '/admin/setting/mysql/config'
    });
};

/**
 * 更新MySQL数据库配置信息
 * @param user 数据库用户名
 * @param password 数据库密码
 * @param host 数据库主机地址
 * @param port 数据库端口
 * @param database 数据库名称
 * @param maxOpen 最大打开连接数
 * @param maxIdle 最大空闲连接数
 * @returns 更新结果
 */
export const updateMySQLConfig = async (
    user: string,
    password: string,
    host: string,
    port: number,
    database: string,
    maxOpen: number,
    maxIdle: number
): Promise<ApiResponse<null>> => {
    const requestData: Record<string, string | number> = {
        'mysql.user': user,
        'mysql.password': password,
        'mysql.host': host,
        'mysql.port': port,
        'mysql.database': database,
        'mysql.max_open': maxOpen,
        'mysql.max_idle': maxIdle
    };

    return businessApiRequest<ApiResponse<null>>({
        method: 'PUT',
        url: '/admin/setting/mysql/config',
        data: requestData,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

// ===============================================================
// OSS配置相关接口和函数
// ===============================================================

export interface OSSConfig {
    endpoint: string;
    region: string;
    bucket: string;
    image_oss_path: string;
    blog_oss_path: string;
    access_key_id?: string;
    access_key_secret?: string;
}

export interface OSSConfigResponse {
    code: number;
    msg: string;
    data: OSSConfig;
}

/**
 * 获取OSS配置信息
 * @returns OSS配置数据
 */
export const getOSSConfig = async (): Promise<OSSConfigResponse> => {
    return businessApiRequest<OSSConfigResponse>({
        method: 'GET',
        url: '/admin/setting/oss/config'
    });
};

/**
 * 更新OSS配置信息
 * @param endpoint OSS端点
 * @param region OSS区域
 * @param accessKeyId 访问密钥ID
 * @param accessKeySecret 访问密钥密钥
 * @param bucket 存储桶名称
 * @param imageOssPath 图片路径
 * @param blogOssPath 博客路径
 * @returns 更新结果
 */
export const updateOSSConfig = async (
    endpoint: string,
    region: string,
    accessKeyId: string,
    accessKeySecret: string,
    bucket: string,
    imageOssPath: string,
    blogOssPath: string
): Promise<ApiResponse<null>> => {
    const requestData: Record<string, string> = {
        'oss.endpoint': endpoint,
        'oss.region': region,
        'oss.access_key_id': accessKeyId,
        'oss.access_key_secret': accessKeySecret,
        'oss.bucket': bucket,
        'oss.image_oss_path': imageOssPath,
        'oss.blog_oss_path': blogOssPath
    };

    return businessApiRequest<ApiResponse<null>>({
        method: 'PUT',
        url: '/admin/setting/oss/config',
        data: requestData,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

// ===============================================================
// 缓存和索引配置相关接口和函数
// ===============================================================

export interface CacheAndIndexConfig {
    enable_aof: boolean;
    aof_dir_path: string;
    aof_mix_size: number;
    aof_compress: boolean;
    index_path: string;
}

export interface CacheAndIndexConfigResponse {
    code: number;
    msg: string;
    data: CacheAndIndexConfig;
}

/**
 * 获取缓存和索引配置信息
 * @returns 缓存和索引配置数据
 */
export const getCacheAndIndexConfig = async (): Promise<CacheAndIndexConfigResponse> => {
    return businessApiRequest<CacheAndIndexConfigResponse>({
        method: 'GET',
        url: '/admin/setting/cache-index/config'
    });
};

/**
 * 更新缓存和索引配置信息
 * @param enableAOF 是否启用AOF
 * @param aofPath AOF文件路径
 * @param aofMaxSize AOF文件最大大小(MB)
 * @param aofCompress 是否压缩AOF文件
 * @param indexPath 索引文件路径
 * @returns 更新结果
 */
export const updateCacheAndIndexConfig = async (
    enableAOF: boolean,
    aofPath: string,
    aofMaxSize: number,
    aofCompress: boolean,
    indexPath: string
): Promise<ApiResponse<null>> => {
    const requestData: Record<string, boolean | string | number> = {
        'cache.aof.enable': enableAOF,
        'cache.aof.path': aofPath,
        'cache.aof.max_size': aofMaxSize.toString(),
        'cache.aof.compress': aofCompress,
        'search_engine.index_path': indexPath
    };

    return businessApiRequest<ApiResponse<null>>({
        method: 'PUT',
        url: '/admin/setting/cache-index/config',
        data: requestData,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

/**
 * 重建索引
 * @returns 重建索引结果
 */
export const rebuildIndex = async (): Promise<ApiResponse<null>> => {
    return businessApiRequest<ApiResponse<null>>({
        method: 'PUT',
        url: '/admin/setting/cache-index/rebuild-index',
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

// ===============================================================
// ===============================================================
// 评论管理相关接口和函数
// ===============================================================

export interface CommentItem {
    comment_id: string;
    commenter_email: string;
    blog_title: string;
    content: string;
    create_time: string;
}

export interface CommentsResponse {
    code: number;
    msg: string;
    data: CommentItem[];
}

/**
 * 获取所有评论列表
 * @returns 评论列表数据
 */
export const getAllComments = async (): Promise<CommentsResponse> => {
    return businessApiRequest<CommentsResponse>({
        method: 'GET',
        url: '/admin/comments/all'
    });
};

/**
 * 删除评论
 * @param commentId 评论ID
 * @returns 删除结果
 */
export const deleteComment = async (commentId: string): Promise<ApiResponse<null>> => {
    return businessApiRequest<ApiResponse<null>>({
        method: 'DELETE',
        url: `/admin/comments/${commentId}`
    });
};

/**
 * 编辑评论内容
 * @param commentId 评论ID
 * @param content 新的评论内容
 * @returns 编辑结果，包含更新后的评论数据
 */
export const updateComment = async (commentId: string, content: string): Promise<ApiResponse<CommentItem>> => {
    return businessApiRequest<ApiResponse<CommentItem>>({
        method: 'PUT',
        url: `/admin/comments/${commentId}/content`,
        data: { content },
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

// ===============================================================
// 友链管理相关接口和函数
// ===============================================================

export interface FriendLinkItem {
    friend_link_id: string;
    friend_link_name: string;
    friend_link_url: string;
    friend_avatar_url: string;
    friend_describe: string;
    display: boolean;
}

export interface FriendLinksResponse {
    code: number;
    msg: string;
    data: FriendLinkItem[];
}

export interface AddFriendLinkRequest {
    friend_link_name: string;
    friend_link_url: string;
    friend_avatar_url: string;
    friend_describe: string;
    display: boolean;
}

export interface UpdateFriendLinkRequest {
    friend_link_id: string;
    friend_link_name: string;
    friend_link_url: string;
    friend_avatar_url: string;
    friend_describe: string;
}

export interface ToggleDisplayResponse {
    code: number;
    msg: string;
    data: {
        display: boolean;
    };
}

/**
 * 获取所有友链列表
 * @returns 友链列表数据
 */
export const getAllFriendLinks = async (): Promise<FriendLinksResponse> => {
    return businessApiRequest<FriendLinksResponse>({
        method: 'GET',
        url: '/admin/friend-links/all'
    });
};

/**
 * 更新友链
 * @param data 友链数据（包含friend_link_id）
 * @returns 更新结果
 */
export const updateFriendLink = async (data: UpdateFriendLinkRequest): Promise<ApiResponse<null>> => {
    return businessApiRequest<ApiResponse<null>>({
        method: 'PUT',
        url: '/admin/friend-links/update',
        data,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

/**
 * 删除友链
 * @param friendLinkId 友链ID
 * @returns 删除结果
 */
export const deleteFriendLink = async (friendLinkId: string): Promise<ApiResponse<null>> => {
    return businessApiRequest<ApiResponse<null>>({
        method: 'DELETE',
        url: `/admin/friend-links/${friendLinkId}`
    });
};

/**
 * 切换友链显示状态
 * @param friendLinkId 友链ID
 * @returns 切换结果，包含新的显示状态
 */
export const toggleFriendLinkDisplay = async (friendLinkId: string): Promise<ToggleDisplayResponse> => {
    return businessApiRequest<ToggleDisplayResponse>({
        method: 'PUT',
        url: `/admin/friend-links/${friendLinkId}/display`
    });
};

// 导出所有API函数
export default {
    // 认证相关
    sendVerificationCode,
    loginWithVerificationCode,
    getUserInfo,

    // 博客相关
    getAllBlogs,
    changeBlogState,
    setBlogTop,
    deleteBlog,
    getAllTagsAndCategories,
    updateOrAddBlog,
    getBlogDataForEdit,

    // 图库相关
    getAllGalleryImages,
    renameGalleryImage,
    deleteGalleryImage,
    getPreSignUrl,
    addGalleryImages,
    checkImageNameExistence,
    getImageUrl,

    // 配置相关
    getUserConfig,
    updateUserConfig,
    getServerConfig,
    updateServerConfig,
    getLoggerConfig,
    updateLoggerConfig,
    getMySQLConfig,
    updateMySQLConfig,
    getOSSConfig,
    updateOSSConfig,
    getCacheAndIndexConfig,
    updateCacheAndIndexConfig,
    updateUserImages,
    sendEmailVerificationCode,
    sendSMTPVerificationCode,
    rebuildIndex,

    // 评论相关
    getAllComments,
    deleteComment,
    updateComment,

    // 友链相关
    getAllFriendLinks,
    updateFriendLink,
    deleteFriendLink,
    toggleFriendLinkDisplay
};