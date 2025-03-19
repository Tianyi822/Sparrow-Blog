import { saveOSSConfig } from '@/services/configService.ts';
import { AxiosError } from 'axios';
import React, { useState, useEffect } from 'react';
import { FiBox, FiCloud, FiFile, FiGlobe, FiImage, FiKey, FiLock, FiMaximize, FiPercent, FiToggleRight } from 'react-icons/fi';
import './OSSConfigForm.scss';

interface ValidationErrors {
    [key: string]: string;
}

export interface OSSConfigFormData {
    endpoint: string;
    region: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucketName: string;
    imagePath: string;
    blogPath: string;
    webpEnabled: boolean;
    webpQuality: string;
    webpMaxSize: string;
}

// OSSConfigForm 组件的 props 接口
interface OSSConfigFormProps {
    initialData?: OSSConfigFormData;
    onSubmit?: (data: OSSConfigFormData) => void;
    isSubmitted?: boolean;
    onNext?: () => void;
}

// 定义字段配置接口，确保字段名与OSSConfigFormData匹配
interface FieldConfigType {
    [key: string]: {
        label: string;
        icon: React.ReactNode;
        name: string;
        type: string;
        placeholder?: string;
        validate: (value: string) => string;
    };
}

// 字段映射配置
const FIELD_CONFIG: FieldConfigType = {
    endpoint: {
        label: 'OSS Endpoint',
        icon: <FiCloud />,
        name: 'endpoint',
        type: 'text',
        placeholder: 'oss-cn-guangzhou.aliyuncs.com',
        validate: (value: string) => {
            if (!value.trim()) {
                return 'Endpoint 不能为空';
            }
            return '';
        }
    },
    region: {
        label: '区域',
        icon: <FiGlobe />,
        name: 'region',
        type: 'text',
        placeholder: 'cn-guangzhou',
        validate: (value: string) => {
            if (!value.trim()) {
                return '区域不能为空';
            }
            return '';
        }
    },
    accessKeyId: {
        label: 'AccessKey ID',
        icon: <FiKey />,
        name: 'accessKeyId',
        type: 'password',
        placeholder: '请输入AccessKey ID',
        validate: (value: string) => {
            if (!value.trim()) {
                return 'AccessKey ID不能为空';
            }
            return '';
        }
    },
    accessKeySecret: {
        label: 'AccessKey Secret',
        icon: <FiLock />,
        name: 'accessKeySecret',
        type: 'password',
        placeholder: '请输入AccessKey Secret',
        validate: (value: string) => {
            if (!value.trim()) {
                return 'AccessKey Secret不能为空';
            }
            return '';
        }
    },
    bucketName: {
        label: 'Bucket名称',
        icon: <FiBox />,
        name: 'bucketName',
        type: 'text',
        placeholder: '请输入Bucket名称',
        validate: (value: string) => {
            if (!value.trim()) {
                return 'Bucket名称不能为空';
            }
            return '';
        }
    },
    imagePath: {
        label: '图片OSS路径',
        icon: <FiImage />,
        name: 'imagePath',
        type: 'text',
        placeholder: 'images/',
        validate: (value: string) => {
            if (!value.trim()) {
                return '图片路径不能为空';
            }
            if (!value.endsWith('/')) {
                return '路径必须以 / 结尾';
            }
            return '';
        }
    },
    blogPath: {
        label: '博客OSS路径',
        icon: <FiFile />,
        name: 'blogPath',
        type: 'text',
        placeholder: 'blogs/',
        validate: (value: string) => {
            if (!value.trim()) {
                return '博客路径不能为空';
            }
            if (!value.endsWith('/')) {
                return '路径必须以 / 结尾';
            }
            return '';
        }
    },
    webpEnabled: {
        label: '启用WebP转换',
        icon: <FiToggleRight />,
        name: 'webpEnabled',
        type: 'checkbox',
        validate: () => ''
    },
    webpQuality: {
        label: 'WebP质量 (1-100)',
        icon: <FiPercent />,
        name: 'webpQuality',
        type: 'text',
        placeholder: '75',
        validate: (value: string) => {
            const quality = parseFloat(value);
            if (isNaN(quality) || quality < 1 || quality > 100) {
                return 'WebP质量必须是1到100之间的数字';
            }
            return '';
        }
    },
    webpMaxSize: {
        label: '最大大小 (MB)',
        icon: <FiMaximize />,
        name: 'webpMaxSize',
        type: 'text',
        placeholder: '1.5',
        validate: (value: string) => {
            const size = parseFloat(value);
            if (isNaN(size) || size <= 0) {
                return '最大大小必须为正数';
            }
            return '';
        }
    }
};

const OSSConfigForm: React.FC<OSSConfigFormProps> = ({ initialData, onSubmit, isSubmitted, onNext }) => {
    // 状态定义
    const [formData, setFormData] = useState<OSSConfigFormData>({
        endpoint: initialData?.endpoint || '',
        region: initialData?.region || '',
        accessKeyId: initialData?.accessKeyId || '',
        accessKeySecret: initialData?.accessKeySecret || '',
        bucketName: initialData?.bucketName || '',
        imagePath: initialData?.imagePath || 'images',
        blogPath: initialData?.blogPath || 'blogs',
        webpEnabled: initialData?.webpEnabled !== undefined ? initialData.webpEnabled : true,
        webpQuality: initialData?.webpQuality || '75',
        webpMaxSize: initialData?.webpMaxSize || '200'
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [submitError, setSubmitError] = useState<string>('');
    const [errorData, setErrorData] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [submitSuccess, setSubmitSuccess] = useState<boolean>(isSubmitted || false);

    // 当initialData变化时更新表单数据
    useEffect(() => {
        if (initialData) {
            setFormData(prevFormData => ({
                endpoint: initialData.endpoint || prevFormData.endpoint,
                region: initialData.region || prevFormData.region,
                accessKeyId: initialData.accessKeyId || prevFormData.accessKeyId,
                accessKeySecret: initialData.accessKeySecret || prevFormData.accessKeySecret,
                bucketName: initialData.bucketName || prevFormData.bucketName,
                imagePath: initialData.imagePath || prevFormData.imagePath,
                blogPath: initialData.blogPath || prevFormData.blogPath,
                webpEnabled: initialData.webpEnabled !== undefined ? initialData.webpEnabled : prevFormData.webpEnabled,
                webpQuality: initialData.webpQuality || prevFormData.webpQuality,
                webpMaxSize: initialData.webpMaxSize || prevFormData.webpMaxSize
            }));
        }
    }, [initialData]);

    // 处理输入变化
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        // 找出对应的字段
        const fieldKey = Object.keys(FIELD_CONFIG).find(
            key => FIELD_CONFIG[key].name === name
        );

        if (!fieldKey) return;

        // 处理不同类型的输入
        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [fieldKey]: (e.target as HTMLInputElement).checked
            }));
        } else {
            setFormData(prev => ({ ...prev, [fieldKey]: value }));
        }

        // 清除该字段的错误
        if (errors[fieldKey]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldKey];
                return newErrors;
            });
        }

        // 只清除错误消息，不清除成功消息
        if (submitError) setSubmitError('');
    };

    // 验证单个字段
    const validateField = (field: string): string => {
        const config = FIELD_CONFIG[field];
        if (!config || typeof config.validate !== 'function') return '';

        // 对于布尔类型字段，直接返回空字符串
        if (field === 'webpEnabled' && typeof formData[field as keyof OSSConfigFormData] === 'boolean') {
            return '';
        }

        // 对于其他字段，执行验证
        return config.validate(formData[field as keyof OSSConfigFormData] as string);
    };

    // 验证所有字段
    const validateForm = (): { isValid: boolean; errorSummary: string } => {
        const newErrors: ValidationErrors = {};
        let isValid = true;
        let errorSummary = '';

        // 遍历所有字段进行验证
        Object.keys(formData).forEach(field => {
            const errorMessage = validateField(field);
            if (errorMessage) {
                newErrors[field] = errorMessage;
                errorSummary += `${FIELD_CONFIG[field]?.label || field}: ${errorMessage}\n`;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return { isValid, errorSummary };
    };

    // 格式化错误数据显示
    const formatErrorData = (data: Record<string, unknown> | null): string => {
        if (!data) return '';

        try {
            return JSON.stringify(data, null, 2);
        } catch {
            return String(data);
        }
    };

    // 处理表单提交
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // 如果已经提交过，直接跳转到下一步
        if (submitSuccess && onNext) {
            onNext();
            return;
        }
        
        setSubmitError('');
        setErrorData(null);

        const { isValid, errorSummary } = validateForm();
        if (!isValid) {
            // 设置提交错误，显示验证失败信息
            setSubmitError('表单验证失败，请检查以下字段');
            setErrorData({ validationErrors: errorSummary });
            return;
        }

        try {
            setLoading(true);
            
            // 确保路径以斜杠结尾，并删除avatarPath
            const dataToSubmit = {
                ...formData,
                imagePath: formData.imagePath.endsWith('/') ? formData.imagePath : formData.imagePath + '/',
                blogPath: formData.blogPath.endsWith('/') ? formData.blogPath : formData.blogPath + '/'
            };
            
            const response = await saveOSSConfig(dataToSubmit);

            // 处理非200响应
            if (response && response.code !== 200) {
                setSubmitError(response.msg || 'OSS配置保存失败，请检查输入内容');
                if (response.data !== null && response.data !== undefined) {
                    setErrorData(response.data as unknown as Record<string, unknown>);
                }
                return;
            }

            // 成功提交
            setSuccessMessage('OSS配置保存成功！');
            setSubmitSuccess(true);
            
            // 调用父组件的onSubmit回调函数
            if (onSubmit) {
                onSubmit(formData);
            }
        } catch (error: unknown) {
            console.error('Failed to save OSS config:', error);

            // 处理错误对象，提取详细信息
            if (error && typeof error === 'object') {
                // 检查是否是Axios错误并包含响应数据
                if (error instanceof AxiosError && error.response) {
                    const errorResponse = error.response;

                    // 尝试提取错误消息
                    if (errorResponse.data) {
                        const errorData = errorResponse.data as Record<string, unknown>;
                        if (errorData.msg) {
                            setSubmitError(errorData.msg as string);
                        } else {
                            setSubmitError(`请求失败: ${errorResponse.status} ${errorResponse.statusText || ''}`);
                        }

                        // 尝试提取错误数据
                        if (errorData.data) {
                            setErrorData(errorData.data as Record<string, unknown>);
                        } else if (typeof errorData === 'object') {
                            // 如果没有data字段但响应本身是对象，则使用整个响应
                            setErrorData(errorData as Record<string, unknown>);
                        }
                    } else {
                        setSubmitError(`请求失败: ${errorResponse.status} ${errorResponse.statusText || ''}`);
                    }
                } else if ('message' in error) {
                    // 普通Error对象
                    setSubmitError(`错误: ${(error as Error).message}`);
                } else {
                    // 未知错误对象
                    setSubmitError('提交过程中发生未知错误');
                    try {
                        setErrorData(error as Record<string, unknown>);
                    } catch (e) {
                        console.error('Failed to format error data:', e);
                    }
                }
            } else {
                // 基础错误处理
                setSubmitError('提交过程中发生错误，请检查网络连接');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="oss-config-form-container">
            <h2>OSS存储配置</h2>

            <form onSubmit={handleSubmit}>
                {/* 基本配置字段 */}
                {['endpoint', 'region', 'accessKeyId', 'accessKeySecret', 'bucketName', 'imagePath', 'blogPath'].map(key => {
                    const fieldKey = key as keyof OSSConfigFormData;
                    const config = FIELD_CONFIG[fieldKey];
                    return (
                        <div className="form-group" key={fieldKey}>
                            <label htmlFor={fieldKey}>
                                <span className="icon">{config.icon}</span>
                                {config.label}
                            </label>
                            <input
                                type={config.type}
                                id={fieldKey}
                                name={fieldKey}
                                value={formData[fieldKey] as string}
                                onChange={handleChange}
                                placeholder={config.placeholder}
                            />
                            {errors[fieldKey] && <div className="error-message">{errors[fieldKey]}</div>}
                        </div>
                    );
                })}

                <div className="form-section-header">
                    <h3>
                        <span className="icon"><FiImage /></span>
                        WebP配置
                    </h3>
                </div>

                {/* WebP 启用选项 */}
                <div className="form-group checkbox-group">
                    <input
                        type="checkbox"
                        id="webpEnabled"
                        name="webpEnabled"
                        checked={formData.webpEnabled}
                        onChange={handleChange}
                    />
                    <label htmlFor="webpEnabled">
                        <span className="icon">{FIELD_CONFIG.webpEnabled.icon}</span>
                        {FIELD_CONFIG.webpEnabled.label}
                    </label>
                </div>

                {/* WebP 参数设置，仅在启用时显示 */}
                {formData.webpEnabled && (
                    <>
                        {['webpQuality', 'webpMaxSize'].map(key => {
                            const fieldKey = key as keyof OSSConfigFormData;
                            const config = FIELD_CONFIG[fieldKey];
                            return (
                                <div className="form-group" key={fieldKey}>
                                    <label htmlFor={fieldKey}>
                                        <span className="icon">{config.icon}</span>
                                        {config.label}
                                    </label>
                                    <input
                                        type={config.type}
                                        id={fieldKey}
                                        name={fieldKey}
                                        value={formData[fieldKey] as string}
                                        onChange={handleChange}
                                        placeholder={config.placeholder}
                                    />
                                    {errors[fieldKey] && <div className="error-message">{errors[fieldKey]}</div>}
                                </div>
                            );
                        })}
                    </>
                )}

                <button
                    type="submit"
                    className="submit-button"
                    disabled={loading}
                >
                    {loading ? '提交中...' : submitSuccess ? '进行下一项配置' : '保存配置'}
                </button>

                {/* 显示成功消息 */}
                {successMessage && (
                    <div className="success-message-container">
                        <div className="success-message">{successMessage}</div>
                    </div>
                )}

                {/* 显示提交错误信息 */}
                {submitError && (
                    <div className="error-message-container">
                        <div className="error-message">
                            <span className="error-title">错误：</span>
                            {submitError}
                        </div>
                        {errorData && (
                            <div className="error-details">
                                <div className="error-details-title">详细信息：</div>
                                <pre>{formatErrorData(errorData)}</pre>
                            </div>
                        )}
                    </div>
                )}
            </form>
        </div>
    );
};

export default OSSConfigForm; 
