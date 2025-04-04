import axios from 'axios';
import { businessApiRequest } from './api';

// 定义文件类型常量
export const FileType = {
    MARKDOWN: "markdown",
    WEBP: "webp",
};

export const ContentType = {
    MARKDOWN: "text/markdown",
    WEBP: "image/webp",
}

// 预签名URL响应接口
export interface PreSignUrlResponse {
    code: number;
    msg: string;
    data: {
        pre_sign_put_url: string;
    };
}

/**
 * 获取OSS预签名URL
 * @param fileName 文件名
 * @param fileType 文件类型, 使用 FileType 常量
 * @returns 包含预签名URL的响应
 */
export const getPreSignUrl = async (fileName: string, fileType: string): Promise<PreSignUrlResponse> => {
    return businessApiRequest<PreSignUrlResponse>({
        method: 'GET',
        url: `/admin/oss/pre_sign_url/${fileName}/type/${fileType}`
    });
};

// 上传文件到OSS
export const uploadToOSS = async (presignUrl: string, content: string | Blob | ArrayBuffer, contentType: string = 'text/markdown'): Promise<boolean> => {
    const response = await axios.put(presignUrl, content, {
        headers: {
            'Content-Type': contentType
        },
        timeout: 10000 // 10秒超时
    });

    return response.status === 200;
};