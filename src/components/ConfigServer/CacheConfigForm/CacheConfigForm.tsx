import { getCacheConfig, saveCacheConfig } from '@/services/configService';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { FiDatabase, FiFolder, FiHardDrive, FiZap } from 'react-icons/fi';
import './CacheConfigForm.scss';

interface ValidationErrors {
    [key: string]: string;
}

export interface CacheConfigFormData {
    aofEnabled: boolean;
    aofPath: string;
    aofMaxSize: string;
    compressEnabled: boolean;
}

// 后端返回的数据结构
interface CacheBackendResponse {
    aof: {
        enable: boolean | string;
        path: string;
        max_size: string | number;
        compress: boolean | string;
    };
}

// 字段配置
const FIELD_CONFIG = {
    aofEnabled: {
        label: '启用AOF持久化',
        icon: <FiDatabase />,
        name: 'aofEnabled',
        type: 'checkbox',
        validate: () => ''
    },
    aofPath: {
        label: 'AOF文件目录',
        icon: <FiFolder />,
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
        icon: <FiHardDrive />,
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
        icon: <FiZap />,
        name: 'compressEnabled',
        type: 'checkbox',
        validate: () => ''
    }
};

const CacheConfigForm: React.FC = () => {
    // 状态定义
    const [formData, setFormData] = useState<CacheConfigFormData>({
        aofEnabled: true,
        aofPath: '',
        aofMaxSize: '1',
        compressEnabled: true
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [submitError, setSubmitError] = useState<string>('');
    const [errorData, setErrorData] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [initialLoading, setInitialLoading] = useState<boolean>(true);

    // 初始化加载数据
    useEffect(() => {
        const fetchData = async () => {
            try {
                setInitialLoading(true);
                const data = await getCacheConfig();
                
                // 处理后端返回的数据格式
                if (data) {
                    // 检查是否是后端指定格式的数据
                    if ('aof' in data) {
                        // 适配后端返回的新格式
                        const backendData = data as unknown as CacheBackendResponse;
                        setFormData({
                            aofEnabled: backendData.aof.enable === '1' || backendData.aof.enable === true,
                            aofPath: backendData.aof.path || '',
                            aofMaxSize: String(backendData.aof.max_size || '1'),
                            compressEnabled: backendData.aof.compress === '1' || backendData.aof.compress === true
                        });
                    } else {
                        // 适配旧格式
                        const oldData = data as CacheConfigFormData;
                        setFormData({
                            aofEnabled: oldData.aofEnabled !== undefined ? oldData.aofEnabled : true,
                            aofPath: oldData.aofPath || '',
                            aofMaxSize: oldData.aofMaxSize || '1',
                            compressEnabled: oldData.compressEnabled !== undefined ? oldData.compressEnabled : true
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to fetch cache config:', error);
                // 只在控制台显示错误，不在UI上显示
            } finally {
                setInitialLoading(false);
            }
        };

        fetchData();
    }, []);

    // 处理输入变化
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        
        // 处理不同类型的输入
        if (type === 'checkbox') {
            setFormData(prev => ({ 
                ...prev, 
                [name]: e.target.checked 
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // 清除该字段的错误
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
        
        // 清除成功和错误消息
        if (successMessage) setSuccessMessage('');
        if (submitError) setSubmitError('');
    };

    // 验证单个字段
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

    // 验证所有字段
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
        setSubmitError('');
        setErrorData(null);
        setSuccessMessage('');

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const response = await saveCacheConfig(formData);

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
            
            {initialLoading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <div className="loading-text">加载中...</div>
                </div>
            ) : (
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

                    <button 
                        type="submit" 
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading ? '提交中...' : '保存配置'}
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
            )}
        </div>
    );
};

export default CacheConfigForm; 