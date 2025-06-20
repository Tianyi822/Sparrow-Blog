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

export default {
    checkSystemStatus,
    getHomeData: getBasicData,
    getBlogContent,
    fetchMarkdownContent,
    searchBlogs,
    getFriendLinks,
    getImageUrl
};