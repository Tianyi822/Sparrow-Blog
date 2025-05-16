import { saveInitiatedCacheConfig } from '@/services/initiateConfigService.ts';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { FiDatabase, FiFolder, FiHardDrive, FiZap } from 'react-icons/fi';
import './CacheConfigForm.scss';

/**
 * 表单验证错误接口
 */
interface ValidationErrors {
    [key: string]: string;
}

/**
 * 缓存配置表单数据接口
 */
export interface CacheConfigFormData {
    aofEnabled: boolean;      // 是否启用AOF持久化
    aofPath: string;          // AOF文件路径
    aofMaxSize: string;       // AOF文件最大大小(MB)
    compressEnabled: boolean; // 是否启用压缩
}

/**
 * 缓存配置表单组件属性接口
 */
export interface CacheConfigFormProps {
    initialData?: CacheConfigFormData;  // 初始表单数据
    onSubmit?: (data: CacheConfigFormData) => void; // 提交回调
    isSubmitted?: boolean;              // 是否已提交
    onNext?: () => void;                // 下一步回调
}

/**
 * 字段配置对象
 * 定义表单字段的标签、图标、验证规则等
 */
const FIELD_CONFIG = {
    aofEnabled: {
        label: '启用AOF持久化',
        icon: <FiDatabase/>,
        name: 'aofEnabled',
        type: 'checkbox',
        validate: () => ''
    },
    aofPath: {
        label: 'AOF文件目录',
        icon: <FiFolder/>,
        name: 'aofPath',
        type: 'text',
        placeholder: '可留空，将使用默认路径',
        help: '留空时后端将使用默认路径 ~/.h2blog/aof',
        validate: (value: string) => {
            // AOF路径可以为空
            if (value && !value.endsWith('.aof')) {
                return 'AOF文件路径必须以.aof结尾';
            }
            return '';
        }
    },
    aofMaxSize: {
        label: 'AOF文件最大大小 (MB)',
        icon: <FiHardDrive/>,
        name: 'aofMaxSize',
        type: 'text',
        placeholder: '1',
        validate: (value: string) => {
            const size = parseFloat(value);
            if (isNaN(size) || size <= 0) {
                return 'AOF文件最大大小必须为正数';
            }
            return '';
        }
    },
    compressEnabled: {
        label: '启用压缩',
        icon: <FiZap/>,
        name: 'compressEnabled',
        type: 'checkbox',
        validate: () => ''
    }
};

/**
 * 缓存配置表单组件
 * 用于配置系统缓存持久化相关设置，包括AOF持久化和压缩选项
 */
const CacheConfigForm: React.FC<CacheConfigFormProps> = ({initialData, onSubmit, isSubmitted, onNext}) => {
    // 状态定义
    const [formData, setFormData] = useState<CacheConfigFormData>({
        aofEnabled: initialData?.aofEnabled !== undefined ? initialData.aofEnabled : true,
        aofPath: initialData?.aofPath || '',
        aofMaxSize: initialData?.aofMaxSize || '1',
        compressEnabled: initialData?.compressEnabled !== undefined ? initialData.compressEnabled : true
    });
    const [errors, setErrors] = useState<ValidationErrors>({});           // 验证错误信息
    const [submitError, setSubmitError] = useState<string>('');           // 提交错误信息
    const [errorData, setErrorData] = useState<Record<string, unknown> | null>(null); // 详细错误数据
    const [loading, setLoading] = useState<boolean>(false);               // 加载状态
    const [successMessage, setSuccessMessage] = useState<string>('');     // 成功消息
    const [submitSuccess, setSubmitSuccess] = useState<boolean>(isSubmitted || false); // 提交成功状态

    /**
     * 当initialData变化时更新表单数据
     */
    useEffect(() => {
        if (initialData) {
            setFormData(prevFormData => ({
                aofEnabled: initialData.aofEnabled !== undefined ? initialData.aofEnabled : prevFormData.aofEnabled,
                aofPath: initialData.aofPath || prevFormData.aofPath,
                aofMaxSize: initialData.aofMaxSize || prevFormData.aofMaxSize,
                compressEnabled: initialData.compressEnabled !== undefined ? initialData.compressEnabled : prevFormData.compressEnabled
            }));
        }
    }, [initialData]);

    /**
     * 处理表单输入变化
     * @param e 输入事件
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, type} = e.target;

        // 处理不同类型的输入
        if (type === 'checkbox') {
            setFormData(prev => ({
                ...prev,
                [name]: e.target.checked
            }));

            // 清除错误和成功消息
            if (errors[name]) {
                setErrors(prev => {
                    const newErrors = {...prev};
                    delete newErrors[name];
                    return newErrors;
                });
            }
            if (submitError) setSubmitError('');
            if (successMessage) setSuccessMessage('');
        } else {
            setFormData(prev => ({...prev, [name]: value}));

            // 清除该字段的错误
            if (errors[name]) {
                setErrors(prev => {
                    const newErrors = {...prev};
                    delete newErrors[name];
                    return newErrors;
                });
            }

            // 清除错误和成功消息
            if (submitError) setSubmitError('');
            if (successMessage) setSuccessMessage('');
        }
    };

    /**
     * 验证单个字段
     * @param field 字段名
     * @returns 验证错误信息，无错误返回空字符串
     */
    const validateField = (field: keyof CacheConfigFormData): string => {
        const config = FIELD_CONFIG[field];
        if (!config || typeof config.validate !== 'function') return '';

        // 对于布尔类型字段，不需要验证
        if (field === 'aofEnabled' || field === 'compressEnabled') {
            return '';
        }

        // 对于其他字段，执行验证
        return config.validate(formData[field] as string);
    };

    /**
     * 验证整个表单
     * @returns 表单是否有效
     */
    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        let isValid = true;

        // 如果AOF持久化启用，则需要验证相关字段
        if (formData.aofEnabled) {
            // 验证AOF路径和AOF最大大小
            ['aofPath', 'aofMaxSize'].forEach(field => {
                const fieldKey = field as keyof CacheConfigFormData;
                const errorMessage = validateField(fieldKey);
                if (errorMessage) {
                    newErrors[fieldKey] = errorMessage;
                    isValid = false;
                }
            });
        }

        setErrors(newErrors);
        return isValid;
    };

    /**
     * 格式化错误数据显示
     * @param data 错误数据对象
     * @returns 格式化后的错误信息字符串
     */
    const formatErrorData = (data: Record<string, unknown> | null): string => {
        if (!data) return '';

        try {
            return JSON.stringify(data, null, 2);
        } catch {
            return String(data);
        }
    };

    /**
     * 处理表单提交
     * @param e 表单提交事件
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');
        setErrorData(null);
        // 不清除成功消息
        // setSuccessMessage('');

        // 表单验证
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const response = await saveInitiatedCacheConfig(formData);

            // 处理非200响应
            if (response && response.code !== 200) {
                setSubmitError(response.msg || '缓存配置保存失败，请检查输入内容');
                if (response.data !== null && response.data !== undefined) {
                    setErrorData(response.data as unknown as Record<string, unknown>);
                }
                return;
            }

            // 成功提交
            setSuccessMessage('缓存配置保存成功！');
            setSubmitSuccess(true);

            // 调用父组件的onSubmit回调函数
            if (onSubmit) {
                onSubmit(formData);
            }
        } catch (error: unknown) {
            console.error('Failed to save cache config:', error);

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
        <div className="cache-config-form-container">
            <h2>缓存配置</h2>

            <form onSubmit={handleSubmit}>
                {/* AOF启用选项 */}
                <div className="form-group checkbox-group">
                    <input
                        type="checkbox"
                        id="aofEnabled"
                        name="aofEnabled"
                        checked={formData.aofEnabled}
                        onChange={handleChange}
                    />
                    <label htmlFor="aofEnabled">
                        <span className="icon">{FIELD_CONFIG.aofEnabled.icon}</span>
                        {FIELD_CONFIG.aofEnabled.label}
                    </label>
                </div>

                {/* AOF配置，仅在启用时显示 */}
                {formData.aofEnabled && (
                    <>
                        {/* AOF文件路径 */}
                        <div className="form-group">
                            <label htmlFor="aofPath">
                                <span className="icon">{FIELD_CONFIG.aofPath.icon}</span>
                                {FIELD_CONFIG.aofPath.label}
                            </label>
                            <input
                                type="text"
                                id="aofPath"
                                name="aofPath"
                                value={formData.aofPath}
                                onChange={handleChange}
                                placeholder={FIELD_CONFIG.aofPath.placeholder}
                            />
                            <div className="help-text">{FIELD_CONFIG.aofPath.help}</div>
                            {errors.aofPath && <div className="error-message">{errors.aofPath}</div>}
                        </div>

                        {/* AOF文件最大大小 */}
                        <div className="form-group">
                            <label htmlFor="aofMaxSize">
                                <span className="icon">{FIELD_CONFIG.aofMaxSize.icon}</span>
                                {FIELD_CONFIG.aofMaxSize.label}
                            </label>
                            <input
                                type="text"
                                id="aofMaxSize"
                                name="aofMaxSize"
                                value={formData.aofMaxSize}
                                onChange={handleChange}
                                placeholder={FIELD_CONFIG.aofMaxSize.placeholder}
                            />
                            {errors.aofMaxSize && <div className="error-message">{errors.aofMaxSize}</div>}
                        </div>

                        {/* 压缩选项 */}
                        <div className="form-group checkbox-group">
                            <input
                                type="checkbox"
                                id="compressEnabled"
                                name="compressEnabled"
                                checked={formData.compressEnabled}
                                onChange={handleChange}
                            />
                            <label htmlFor="compressEnabled">
                                <span className="icon">{FIELD_CONFIG.compressEnabled.icon}</span>
                                {FIELD_CONFIG.compressEnabled.label}
                            </label>
                        </div>
                    </>
                )}

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
                            完成配置进入控制台
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

export default CacheConfigForm; 