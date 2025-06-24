import { BlogCategory, BlogTag } from './adminService';
import { ApiResponse, businessApiRequest } from './api';

/**
 * 博客文章信息接口
 * 包含博客列表展示所需的基本信息
 */
export interface BlogInfo {
    blog_id: string;           // 博客唯一标识ID
    blog_title: string;        // 博客标题
    blog_image_id: string;     // 博客封面图片ID
    blog_brief: string;        // 博客简介/摘要
    category_id: string;       // 博客分类ID
    category: BlogCategory;    // 博客分类对象
    tags: BlogTag[];           // 博客标签数组
    blog_state: boolean;       // 博客状态(true为发布,false为草稿)
    blog_words_num: number;    // 博客字数统计
    blog_is_top: boolean;      // 是否置顶
    create_time: string;       // 创建时间
    update_time: string;       // 更新时间
}

/**
 * 博客内容数据接口
 * 包含完整的博客内容以及预签名URL
 */
export interface BlogContentData {
    blog_data: {
        blog_id: string;        // 博客唯一标识ID
        blog_title: string;     // 博客标题
        blog_image_id: string;  // 博客封面图片ID
        blog_brief: string;     // 博客简介/摘要
        category: BlogCategory; // 博客分类对象
        tags: BlogTag[];        // 博客标签数组
        blog_state: boolean;    // 博客状态(true为发布,false为草稿)
        blog_words_num: number; // 博客字数统计
        blog_is_top: boolean;   // 是否置顶
        create_time: string;    // 创建时间
        update_time: string;    // 更新时间
    };
    pre_sign_url: string;       // Markdown内容的预签名URL
}

// 博客内容响应类型
type BlogContentResponse = ApiResponse<BlogContentData>;

/**
 * 主页数据接口
 * 包含网站首页展示所需的所有信息
 */
export interface BasicData {
    avatar_image: string;          // 用户头像图片ID
    background_image: string;      // 网站背景图片ID
    blogs: BlogInfo[];             // 博客文章列表
    categories: BlogCategory[];    // 博客分类列表
    icp_filing_number?: string;    // 网站ICP备案号(可选)
    tags: BlogTag[];               // 所有标签列表
    type_writer_content: string[]; // 首页打字效果内容
    user_email: string;            // 用户邮箱
    user_github_address: string;   // 用户GitHub地址
    user_hobbies: string[];        // 用户爱好/技能标签
    user_name: string;             // 用户名称
    web_logo: string;              // 网站Logo图片ID
}

// 主页数据响应类型
type BasicDataResponse = ApiResponse<BasicData>;

/**
 * 搜索结果项接口
 */
export interface SearchResultItem {
    id: string;
    img_id: string;
    title: string;
    highlights: {
        Content: string[];
        Title: string[];
    };
}

/**
 * 搜索响应数据接口
 */
export interface SearchResponseData {
    results: SearchResultItem[];
    time_ms: number;
}

// 搜索响应类型
type SearchResponse = ApiResponse<SearchResponseData>;

/**
 * 友链信息接口
 */
export interface FriendLink {
    friend_link_id: string;       // 友链唯一标识ID
    friend_link_name: string;     // 友链名称
    friend_link_url: string;      // 友链URL
    friend_avatar_url: string;    // 友链头像URL
    friend_describe: string;      // 友链描述 
    display: boolean;             // 是否显示
}

// 友链响应类型
type FriendLinksResponse = ApiResponse<FriendLink[]>;

/**
 * 获取用户基本信息以检查系统状态
 * 如果成功获取用户信息，表示系统已配置完成并在运行状态
 * 如果请求失败，表示系统可能尚未配置或需要初始化
 * 
 * @returns 包含系统状态和可能的错误信息的对象
 */
export const checkSystemStatus = async (): Promise<{ isRuntime: boolean, errorMessage?: string }> => {
    try {
        const response = await businessApiRequest<ApiResponse<null>>({
            method: 'GET',
            url: '/web/sys/status'
        });

        return {
            isRuntime: response.code === 200,
        };
    } catch (error) {
        // 保留此错误日志，对排查系统状态问题很重要
        console.error('系统状态检查失败:', error);
        return {
            isRuntime: false,
            errorMessage: error instanceof Error ? error.message : '未知错误'
        };
    }
};

/**
 * 获取主页数据，包括用户信息、博客列表、分类和标签
 * 用于渲染网站首页和侧边栏等公共区域
 * 
 * @returns 完整的主页数据对象，失败时返回null
 */
export const getBasicData = async (): Promise<BasicData | null> => {
    try {
        const response = await businessApiRequest<BasicDataResponse>({
            method: 'GET',
            url: '/web/basic-data'
        });

        if (response.code === 200 && response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        // 保留此错误日志，对排查主页数据加载问题很重要
        console.error('获取主页数据失败:', error);
        return null;
    }
};

/**
 * 根据ID获取博客内容
 * 用于获取单篇博客的详细内容和预签名URL
 * 
 * @param blogId 博客ID，唯一标识一篇博客
 * @returns 博客数据和Markdown内容URL，失败时返回null
 */
export const getBlogContent = async (blogId: string): Promise<BlogContentData | null> => {
    try {
        const response = await businessApiRequest<BlogContentResponse>({
            method: 'GET',
            url: `/web/blog/${blogId}`
        });

        if (response.code === 200 && response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        // 保留此错误日志，对排查博客内容加载问题很重要
        console.error('获取博客内容失败:', error);
        return null;
    }
};

/**
 * 获取Markdown内容
 * 通过预签名URL获取博客的Markdown原始内容
 * 
 * @param url Markdown文件的预签名URL
 * @returns Markdown文本内容
 * @throws 获取失败时抛出增强的错误对象
 */
export const fetchMarkdownContent = async (url: string): Promise<string> => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const errorMessage = `获取Markdown内容失败: 状态码 ${response.status} ${response.statusText}`;
            console.error(errorMessage);
        }
        return await response.text();
    } catch (error) {
        // 实质性地增强错误，添加更多上下文信息
        const enhancedError = new Error(`Markdown内容获取失败: ${error instanceof Error ? error.message : String(error)}`);

        // 保留原始错误堆栈信息
        if (error instanceof Error && error.stack) {
            enhancedError.stack = `${enhancedError.stack}\nCaused by: ${error.stack}`;

            // 可以保留原始错误的其他属性
            Object.entries(error).forEach(([key, value]) => {
                if (key !== 'message' && key !== 'stack') {
                    // @ts-expect-error 自定义错误属性
                    enhancedError[key] = value;
                }
            });
        }

        // 记录增强后的错误
        console.error('获取Markdown内容失败:', enhancedError);

        // 抛出增强后的错误
        throw enhancedError;
    }
};

/**
 * 搜索博客内容
 * 根据关键词搜索博客内容，支持标题和内容全文搜索
 * 
 * @param query 搜索关键词
 * @returns 搜索结果数据，失败时返回null
 */
export const searchBlogs = async (query: string): Promise<SearchResponseData | null> => {
    try {
        const response = await businessApiRequest<SearchResponse>({
            method: 'GET',
            url: `/web/search/${encodeURIComponent(query)}`
        });

        if (response.code === 200 && response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        // 保留此错误日志，对排查搜索功能问题很重要
        console.error('搜索博客失败:', error);
        return null;
    }
};

/**
 * 获取图片完整URL
 * 根据图片ID构建完整的图片访问URL
 * 
 * @param imageId 图片ID
 * @returns 完整的图片URL，如果ID为空则返回空字符串
 */
export const getImageUrl = (imageId: string): string => {
    if (!imageId) return '';
    return `${import.meta.env.VITE_BUSINESS_SERVICE_URL}/web/img/get/${imageId}`;
};

/**
 * 获取所有可见的友链
 * 用于友链页面展示
 * 
 * @returns 友链列表，失败时返回null
 */
export const getFriendLinks = async (): Promise<FriendLink[] | null> => {
    try {
        const response = await businessApiRequest<FriendLinksResponse>({
            method: 'GET',
            url: '/web/friend-link/all'
        });

        if (response.code === 200 && response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        // 保留此错误日志，对排查友链数据加载问题很重要
        console.error('获取友链数据失败:', error);
        return null;
    }
};

/**
 * 评论信息接口
 */
export interface Comment {
    comment_id: string;           // 评论ID
    commenter_email: string;      // 评论者邮箱
    blog_title: string;           // 博客标题
    content: string;              // 评论内容
    create_time: string;          // 创建时间
    origin_post_id?: string;      // 原始评论ID（回复时使用）
    reply_to_comment_id?: string; // 回复的评论ID
    sub_comments?: Comment[];     // 子评论列表
}

/**
 * 添加评论请求数据接口
 */
export interface AddCommentData {
    commenter_email: string;      // 评论者邮箱
    blog_id: string;              // 博客ID
    content: string;              // 评论内容
}

/**
 * 回复评论请求数据接口
 */
export interface ReplyCommentData {
    commenter_email: string;      // 回复者邮箱
    blog_id: string;              // 博客ID
    reply_to_comment_id: string;  // 回复的评论ID
    content: string;              // 回复内容
}

// 评论响应类型
type CommentsResponse = ApiResponse<Comment[]>;
type CommentResponse = ApiResponse<Comment>;

/**
 * 友链申请表单数据接口
 */
export interface FriendLinkApplicationData {
    friend_link_name: string;      // 友链名称
    friend_link_url: string;       // 友链URL  
    friend_avatar_url?: string;    // 友链头像URL(可选)
    friend_describe?: string;      // 友链描述(可选)
}

/**
 * 友链申请响应接口
 */
export interface FriendLinkApplicationResponse {
    code: number;
    msg: string;
    data: null;
}

// 友链申请响应类型
type FriendLinkApplyResponse = ApiResponse<null>;

/**
 * 获取博客评论
 * 根据博客ID获取所有评论及其回复
 * 
 * @param blogId 博客ID
 * @returns 评论列表，失败时返回null
 */
export const getBlogComments = async (blogId: string): Promise<Comment[] | null> => {
    try {
        const response = await businessApiRequest<CommentsResponse>({
            method: 'GET',
            url: `/web/comment/${blogId}`
        });

        if (response.code === 200 && response.data) {
            return response.data;
        }
        return null;
    } catch (error) {
        console.error('获取评论失败:', error);
        return null;
    }
};

/**
 * 添加评论
 * 为指定博客添加新评论
 * 
 * @param commentData 评论数据
 * @returns 新添加的评论数据，失败时返回null
 */
export const addComment = async (commentData: AddCommentData): Promise<Comment | null> => {
    try {
        console.log('发送添加评论请求:', commentData); // 调试日志
        const response = await businessApiRequest<CommentResponse>({
            method: 'POST',
            url: '/web/comment/',
            data: commentData
        });

        console.log('添加评论API响应:', response); // 调试日志
        
        if (response.code === 200 && response.data) {
            return response.data;
        }
        
        console.error('添加评论失败: 响应码', response.code, '消息:', response.msg);
        return null;
    } catch (error) {
        console.error('添加评论请求异常:', error);
        return null;
    }
};

/**
 * 回复评论
 * 回复指定的评论
 * 
 * @param replyData 回复数据
 * @returns 新添加的回复数据，失败时返回null
 */
export const replyComment = async (replyData: ReplyCommentData): Promise<Comment | null> => {
    try {
        console.log('发送回复评论请求:', replyData); // 调试日志
        const response = await businessApiRequest<CommentResponse>({
            method: 'POST',
            url: '/web/comment/reply',
            data: replyData
        });

        console.log('回复评论API响应:', response); // 调试日志
        
        if (response.code === 200 && response.data) {
            return response.data;
        }
        
        console.error('回复评论失败: 响应码', response.code, '消息:', response.msg);
        return null;
    } catch (error) {
        console.error('回复评论请求异常:', error);
        return null;
    }
};

/**
 * 申请友链
 * 提交友链申请，等待管理员审核
 * 
 * @param applicationData 友链申请数据
 * @returns 申请结果响应
 */
export const applyFriendLink = async (applicationData: FriendLinkApplicationData): Promise<FriendLinkApplicationResponse> => {
    try {
        const response = await businessApiRequest<FriendLinkApplyResponse>({
            method: 'POST',
            url: '/web/friend-link/apply',
            data: applicationData
        });

        return {
            code: response.code,
            msg: response.msg || '友链申请成功，请等待管理员审核',
            data: response.data
        };
    } catch (error) {
        // 保留此错误日志，对排查友链申请问题很重要
        console.error('友链申请失败:', error);
        
        // 如果是API错误响应，提取错误信息
        if (error && typeof error === 'object' && 'response' in error) {
            const apiError = error as { response?: { data?: { msg?: string; code?: number } } };
            if (apiError.response?.data) {
                return {
                    code: apiError.response.data.code || 500,
                    msg: apiError.response.data.msg || '友链申请失败，请稍后重试',
                    data: null
                };
            }
        }
        
        // 其他错误情况
        return {
            code: 500,
            msg: error instanceof Error ? error.message : '友链申请失败，请稍后重试',
            data: null
        };
    }
};

export default {
    checkSystemStatus,
    getHomeData: getBasicData,
    getBlogContent,
    fetchMarkdownContent,
    searchBlogs,
    getFriendLinks,
    getImageUrl,
    applyFriendLink,
    getBlogComments,
    addComment,
    replyComment
};