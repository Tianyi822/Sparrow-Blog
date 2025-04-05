import { businessApi, businessApiRequest } from './api';
import { ApiResponse } from '../types/apiTypes';

// 验证码请求数据接口
export interface VerificationCodeRequest {
    user_email: string;
}

// 登录请求数据接口
export interface LoginRequest {
    user_email: string;
    verified_code: string;
}

// 登录响应数据接口
export interface LoginResponse {
    token: string;
    user_info: {
        user_id: number;
        user_name: string;
        user_email: string;
        user_avatar?: string;
    };
}

// Blog相关接口
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
        };
        content_url: string;
    };
}

// Gallery相关接口
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

// 检查图片名称是否存在响应接口
export interface CheckImageNameResponse {
    code: number;
    msg: string;
    data: boolean;
}

// 添加图片请求接口
export interface AddImagesRequest {
    imgs: Array<{
        img_name: string;
        img_type: string;
    }>;
}

// 添加图片响应接口
export interface AddImagesResponse {
    code: number;
    msg: string;
    data: null;
}

// 重命名图片请求接口
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
 * @param data 包含用户邮箱和验证码的请求数据
 * @returns 登录结果
 */
export const loginWithVerificationCode = async (data: LoginRequest): Promise<ApiResponse<null>> => {
    try {
        const response = await businessApi.post<ApiResponse<null>>(
            '/admin/login/login',
            data,
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        // 检查响应头中是否有token
        const authHeader = response.headers['authorization'] || response.headers['Authorization'];
        if (authHeader) {
            // 保存token到localStorage
            const token = typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
                ? authHeader.substring(7)
                : authHeader;
            localStorage.setItem('auth_token', token);
            console.log('已保存token:', token);
        }

        return response.data;
    } catch (error) {
        console.error('登录失败:', error);
        throw error;
    }
};

/**
 * 获取用户基本信息
 * @returns 用户基本信息
 */
export const getUserBasicInfo = async (): Promise<ApiResponse<{ user_name: string }>> => {
    return businessApiRequest<ApiResponse<{ user_name: string }>>({
        method: 'GET',
        url: '/config/user-basic-info'
    });
};

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

export default {
    sendVerificationCode,
    loginWithVerificationCode,
    getUserBasicInfo,
    getAllBlogs,
    changeBlogState,
    setBlogTop,
    deleteBlog,
    getAllTagsAndCategories,
    updateOrAddBlog,
    getBlogDataForEdit,
    getAllGalleryImages,
    renameGalleryImage,
    deleteGalleryImage,
    getPreSignUrl,
    addGalleryImages,
    checkImageNameExistence
}; 