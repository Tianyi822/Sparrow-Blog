import axios from 'axios';
import { businessApiRequest } from './api';
import { FileType, ContentType, PreSignUrlResponse } from '../types';

// 重新导出常量以保持向后兼容性
export { FileType, ContentType };

/**
 * 获取OSS预签名URL
 * 用于从服务器获取临时授权的URL，可以直接上传文件到对象存储
 * 
 * @param fileName 文件名，将用于在OSS中存储的文件名
 * @param fileType 文件类型，建议使用FileType常量枚举
 * @returns 包含预签名URL的响应对象
 */
export const getPreSignUrl = async (fileName: string, fileType: string): Promise<PreSignUrlResponse> => {
    return businessApiRequest<PreSignUrlResponse>({
        method: 'GET',
        url: `/admin/oss/pre_sign_url/${fileName}/type/${fileType}`
    });
};

/**
 * 上传文件到OSS
 * 使用预签名URL直接将文件内容上传到对象存储服务
 * 
 * @param presignUrl 预签名URL，通过getPreSignUrl获取
 * @param content 要上传的内容，可以是字符串、Blob或ArrayBuffer
 * @param contentType 内容的MIME类型，默认为'text/markdown'，建议使用ContentType常量
 * @returns 布尔值，表示上传是否成功
 */
export const uploadToOSS = async (presignUrl: string, content: string | Blob | ArrayBuffer, contentType: string = 'text/markdown'): Promise<boolean> => {
    const response = await axios.put(presignUrl, content, {
        headers: {
            'Content-Type': contentType
        },
        timeout: 10000 // 10秒超时
    });

    return response.status === 200;
};