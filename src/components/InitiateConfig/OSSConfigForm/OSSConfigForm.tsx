import { saveInitiatedOSSConfig } from '@/services/initiateConfigService.ts';
import { AxiosError } from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import {
    FiBox,
    FiCloud,
    FiFile,
    FiGlobe,
    FiImage,
    FiKey,
    FiLock,
} from 'react-icons/fi';
import './OSSConfigForm.scss';

/**
 * 表单验证错误接口
 */
interface ValidationErrors {
    [key: string]: string;
}

/**
 * OSS配置表单数据接口
 */
export interface OSSConfigFormData {
    endpoint: string;        // OSS服务端点
    region: string;          // 区域
    accessKeyId: string;     // 访问密钥ID
    accessKeySecret: string; // 访问密钥密码
    bucketName: string;      // 存储桶名称
    imagePath: string;       // 图片存储路径
    blogPath: string;        // 博客存储路径
}

/**
 * OSS配置表单组件属性接口
 */
interface OSSConfigFormProps {
    initialData?: OSSConfigFormData; // 初始表单数据
    onSubmit?: (data: OSSConfigFormData) => void; // 提交回调
    isSubmitted?: boolean;   // 是否已提交
    onNext?: () => void;     // 下一步回调
}

/**
 * 字段配置接口，确保字段名与OSSConfigFormData匹配
 */
interface FieldConfigType {
    [key: string]: {
        label: string;              // 字段标签
        icon: React.ReactNode;      // 字段图标
        name: string;               // 字段名称
        type: string;               // 输入类型
        placeholder?: string;       // 输入占位符
        validate: (value: string) => string; // 验证函数
    };
}

/**
 * 字段映射配置
 * 定义表单字段的标签、图标、验证规则等
 */
const FIELD_CONFIG: FieldConfigType = {
    endpoint: {
        label: 'OSS Endpoint',
        icon: <FiCloud/>,
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
        icon: <FiGlobe/>,
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
        icon: <FiKey/>,
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
        icon: <FiLock/>,
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
        icon: <FiBox/>,
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
        icon: <FiImage/>,
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
        icon: <FiFile/>,
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
    }
};

/**
 * OSS配置表单组件
 * 用于配置阿里云OSS存储相关设置
 */
const OSSConfigForm: React.FC<OSSConfigFormProps> = ({initialData, onSubmit, isSubmitted, onNext}) => {
    // 表单数据状态
    const [formData, setFormData] = useState<OSSConfigFormData>({
        endpoint: initialData?.endpoint || '',
        region: initialData?.region || '',
        accessKeyId: initialData?.accessKeyId || '',
        accessKeySecret: initialData?.accessKeySecret || '',
        bucketName: initialData?.bucketName || '',
        imagePath: initialData?.imagePath || 'images',
        blogPath: initialData?.blogPath || 'blogs'
    });
    
    // 其他状态定义
    const [errors, setErrors] = useState<ValidationErrors>({});             // 验证错误信息
    const [submitError, setSubmitError] = useState<string>('');             // 提交错误信息
    const [errorData, setErrorData] = useState<Record<string, unknown> | null>(null); // 详细错误数据
    const [loading, setLoading] = useState<boolean>(false);                 // 加载状态
    const [successMessage, setSuccessMessage] = useState<string>('');       // 成功消息
    const [submitSuccess, setSubmitSuccess] = useState<boolean>(isSubmitted || false); // 提交成功状态

    /**
     * 当initialData变化时更新表单数据
     */
    useEffect(() => {
        if (initialData) {
            setFormData(prevFormData => ({
                endpoint: initialData.endpoint || prevFormData.endpoint,
                region: initialData.region || prevFormData.region,
                accessKeyId: initialData.accessKeyId || prevFormData.accessKeyId,
                accessKeySecret: initialData.accessKeySecret || prevFormData.accessKeySecret,
                bucketName: initialData.bucketName || prevFormData.bucketName,
                imagePath: initialData.imagePath || prevFormData.imagePath,
                blogPath: initialData.blogPath || prevFormData.blogPath
            }));
        }
    }, [initialData]);

    /**
     * 清除指定字段的错误信息
     * @param fieldKey 字段名称
     */
    const clearFieldError = useCallback((fieldKey: string) => {
        if (errors[fieldKey]) {
            setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[fieldKey];
                return newErrors;
            });
        }
    }, [errors]);

    /**
     * 清除全局消息(错误和成功)
     */
    const clearMessages = useCallback(() => {
        if (submitError) setSubmitError('');
        if (successMessage) setSuccessMessage('');
    }, [submitError, successMessage]);

    /**
     * 处理表单输入变化
     * @param e 输入事件
     */
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value, type} = e.target;

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
            setFormData(prev => ({...prev, [fieldKey]: value}));
        }

        // 清除该字段的错误
        clearFieldError(fieldKey);

        // 清除错误消息和成功消息
        clearMessages();
    }, [clearFieldError, clearMessages]);

    /**
     * 验证单个字段
     * @param field 要验证的字段名
     * @returns 验证错误信息，无错误则返回空字符串
     */
    const validateField = useCallback((field: string): string => {
        const config = FIELD_CONFIG[field];
        if (!config || typeof config.validate !== 'function') return '';

        // 对于其他字段，执行验证
        return config.validate(formData[field as keyof OSSConfigFormData] as string);
    }, [formData]);

    /**
     * 验证整个表单
     * @returns 是否有效以及错误摘要
     */
    const validateForm = useCallback((): { isValid: boolean; errorSummary: string } => {
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
        return {isValid, errorSummary};
    }, [formData, validateField]);

    /**
     * 格式化错误数据显示
     * @param data 错误数据对象
     * @returns 格式化后的错误信息字符串
     */
    const formatErrorData = useCallback((data: Record<string, unknown> | null): string => {
        if (!data) return '';

        try {
            return JSON.stringify(data, null, 2);
        } catch {
            return String(data);
        }
    }, []);

    /**
     * 处理表单提交
     * @param e 表单提交事件
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 如果已经提交过，直接跳转到下一步
        if (submitSuccess && onNext) {
            onNext();
            return;
        }

        setSubmitError('');
        setErrorData(null);

        // 表单验证
        const {isValid, errorSummary} = validateForm();
        if (!isValid) {
            // 设置提交错误，显示验证失败信息
            setSubmitError('表单验证失败，请检查以下字段');
            setErrorData({validationErrors: errorSummary});
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

            const response = await saveInitiatedOSSConfig(dataToSubmit);

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
                {/* 动态生成表单字段 */}
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

                {/* 操作按钮区域 */}
                <div className="form-actions">
                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading ? '提交中...' : '保存配置'}
                    </button>

                    {/* 提交成功时显示下一步按钮 */}
                    {submitSuccess && !submitError && onNext && (
                        <button
                            type="button"
                            className="next-button"
                            onClick={onNext}
                        >
                            进行下一项配置
                        </button>
                    )}
                </div>

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
                        {/* 显示详细错误数据 */}
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
