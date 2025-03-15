import React, { useState } from 'react';
import './OSSConfigForm.scss';

interface ValidationErrors {
    endpoint?: string;
    region?: string;
    accessKeyId?: string;
    accessKeySecret?: string;
    bucketName?: string;
    imagePath?: string;
    avatarPath?: string;
    blogPath?: string;
    webpEnabled?: string;
    webpQuality?: string;
    webpMaxSize?: string;
}

interface OSSConfigFormProps {
    onSubmit?: (formData: OSSConfigFormData) => void;
    initialData?: OSSConfigFormData;
    serverError?: string;
}

export interface OSSConfigFormData {
    endpoint: string;
    region: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucketName: string;
    imagePath: string;
    avatarPath: string;
    blogPath: string;
    webpEnabled: boolean;
    webpQuality: string;
    webpMaxSize: string;
}

const OSSConfigForm: React.FC<OSSConfigFormProps> = ({ onSubmit, initialData, serverError }) => {
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [formData, setFormData] = useState<OSSConfigFormData>({
        endpoint: initialData?.endpoint || '',
        region: initialData?.region || '',
        accessKeyId: initialData?.accessKeyId || '',
        accessKeySecret: initialData?.accessKeySecret || '',
        bucketName: initialData?.bucketName || '',
        imagePath: initialData?.imagePath || 'images/',
        avatarPath: initialData?.avatarPath || 'images/avatar/',
        blogPath: initialData?.blogPath || 'blogs/',
        webpEnabled: initialData?.webpEnabled !== undefined ? initialData.webpEnabled : true,
        webpQuality: initialData?.webpQuality || '75',
        webpMaxSize: initialData?.webpMaxSize || '1'
    });

    const validateField = (name: string, value: string | boolean): string => {
        if (typeof value === 'boolean') return '';
        
        switch (name) {
            case 'endpoint':
                if (!value.trim()) {
                    return 'Endpoint 不能为空';
                }
                if (!value.startsWith('http://') && !value.startsWith('https://')) {
                    return 'Endpoint 必须以 http:// 或 https:// 开头';
                }
                return '';

            case 'region':
                if (!value.trim()) {
                    return '地域不能为空';
                }
                return '';

            case 'accessKeyId':
                if (!value.trim()) {
                    return 'AccessKey ID 不能为空';
                }
                return '';

            case 'accessKeySecret':
                if (!value.trim()) {
                    return 'AccessKey Secret 不能为空';
                }
                return '';

            case 'bucketName':
                if (!value.trim()) {
                    return 'Bucket 名称不能为空';
                }
                return '';

            case 'imagePath':
                if (!value.trim()) {
                    return '图片路径不能为空';
                }
                if (!value.endsWith('/')) {
                    return '路径必须以 / 结尾';
                }
                return '';

            case 'avatarPath':
                if (!value.trim()) {
                    return '头像路径不能为空';
                }
                if (!value.endsWith('/')) {
                    return '路径必须以 / 结尾';
                }
                return '';

            case 'blogPath':
                if (!value.trim()) {
                    return '博客路径不能为空';
                }
                if (!value.endsWith('/')) {
                    return '路径必须以 / 结尾';
                }
                return '';

            case 'webpQuality': {
                const quality = parseInt(value);
                if (isNaN(quality) || !Number.isInteger(quality)) {
                    return 'Webp 质量必须为整数';
                }
                if (quality < 1 || quality > 100) {
                    return 'Webp 质量必须在 1-100 之间';
                }
                return '';
            }

            case 'webpMaxSize': {
                const size = parseFloat(value);
                if (isNaN(size) || size <= 0) {
                    return '压缩后的大小必须为正数';
                }
                return '';
            }

            default:
                return '';
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData({
                ...formData,
                [name]: checked
            });
            return;
        }
        
        setFormData({
            ...formData,
            [name]: value
        });

        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 验证所有字段
        const newErrors: ValidationErrors = {};
        Object.entries(formData).forEach(([key, value]) => {
            if (typeof value !== 'boolean') {
                const error = validateField(key, value);
                if (error) {
                    newErrors[key as keyof ValidationErrors] = error;
                }
            }
        });

        setErrors(newErrors);

        // 如果没有错误，则提交表单
        if (Object.keys(newErrors).length === 0) {
            if (onSubmit) {
                onSubmit(formData);
            }
        }
    };

    return (
        <div className="oss-config-form-container">
            <div className="card-glow"></div>
            <div className="card-border-glow"></div>

            <h2>OSS 存储配置</h2>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="endpoint">
                        <span className="icon">🔗</span>
                        Endpoint
                    </label>
                    <input
                        type="text"
                        id="endpoint"
                        name="endpoint"
                        value={formData.endpoint}
                        onChange={handleChange}
                        placeholder="https://oss-cn-hangzhou.aliyuncs.com"
                    />
                    {errors.endpoint && <div className="error-message">{errors.endpoint}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="region">
                        <span className="icon">🌏</span>
                        地域
                    </label>
                    <input
                        type="text"
                        id="region"
                        name="region"
                        value={formData.region}
                        onChange={handleChange}
                        placeholder="cn-hangzhou"
                    />
                    {errors.region && <div className="error-message">{errors.region}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="accessKeyId">
                        <span className="icon">🔑</span>
                        AccessKey ID
                    </label>
                    <input
                        type="password"
                        id="accessKeyId"
                        name="accessKeyId"
                        value={formData.accessKeyId}
                        onChange={handleChange}
                    />
                    {errors.accessKeyId && <div className="error-message">{errors.accessKeyId}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="accessKeySecret">
                        <span className="icon">🔐</span>
                        AccessKey Secret
                    </label>
                    <input
                        type="password"
                        id="accessKeySecret"
                        name="accessKeySecret"
                        value={formData.accessKeySecret}
                        onChange={handleChange}
                    />
                    {errors.accessKeySecret && <div className="error-message">{errors.accessKeySecret}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="bucketName">
                        <span className="icon">📦</span>
                        Bucket 名称
                    </label>
                    <input
                        type="text"
                        id="bucketName"
                        name="bucketName"
                        value={formData.bucketName}
                        onChange={handleChange}
                    />
                    {errors.bucketName && <div className="error-message">{errors.bucketName}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="imagePath">
                        <span className="icon">🖼️</span>
                        图片在 OSS 路径
                    </label>
                    <input
                        type="text"
                        id="imagePath"
                        name="imagePath"
                        value={formData.imagePath}
                        onChange={handleChange}
                    />
                    {errors.imagePath && <div className="error-message">{errors.imagePath}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="avatarPath">
                        <span className="icon">👤</span>
                        头像在 OSS 路径
                    </label>
                    <input
                        type="text"
                        id="avatarPath"
                        name="avatarPath"
                        value={formData.avatarPath}
                        onChange={handleChange}
                    />
                    {errors.avatarPath && <div className="error-message">{errors.avatarPath}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="blogPath">
                        <span className="icon">📝</span>
                        博客在 OSS 路径
                    </label>
                    <input
                        type="text"
                        id="blogPath"
                        name="blogPath"
                        value={formData.blogPath}
                        onChange={handleChange}
                    />
                    {errors.blogPath && <div className="error-message">{errors.blogPath}</div>}
                </div>

                <div className="form-section-header">
                    <h3>
                        <span className="icon">🖼️</span>
                        Webp 配置
                    </h3>
                </div>

                <div className="form-group checkbox-group">
                    <input
                        type="checkbox"
                        id="webpEnabled"
                        name="webpEnabled"
                        checked={formData.webpEnabled}
                        onChange={handleChange}
                    />
                    <label htmlFor="webpEnabled">开启 Webp 功能</label>
                </div>

                {formData.webpEnabled && (
                    <>
                        <div className="form-group">
                            <label htmlFor="webpQuality">
                                <span className="icon">✨</span>
                                Webp 压缩质量 (1-100)
                            </label>
                            <input
                                type="text"
                                id="webpQuality"
                                name="webpQuality"
                                value={formData.webpQuality}
                                onChange={handleChange}
                            />
                            {errors.webpQuality && <div className="error-message">{errors.webpQuality}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="webpMaxSize">
                                <span className="icon">📏</span>
                                压缩后的大小 (MB)
                            </label>
                            <input
                                type="text"
                                id="webpMaxSize"
                                name="webpMaxSize"
                                value={formData.webpMaxSize}
                                onChange={handleChange}
                            />
                            {errors.webpMaxSize && <div className="error-message">{errors.webpMaxSize}</div>}
                        </div>
                    </>
                )}

                <button type="submit" className="submit-button">保存配置</button>
                {serverError && <div className="server-error-message">{serverError}</div>}
            </form>
        </div>
    );
};

export default OSSConfigForm; 