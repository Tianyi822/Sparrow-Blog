import axios from 'axios';

// 上传文件到OSS
export const uploadToOSS = async (presignUrl: string, content: string): Promise<boolean> => {
    // eslint-disable-next-line no-useless-catch
    try {
        const response = await axios.put(presignUrl, content, {
            headers: {
                'Content-Type': 'text/markdown'
            },
            timeout: 10000 // 10秒超时
        });

        return response.status === 200;
    } catch (error) {
        throw error;
    }
};