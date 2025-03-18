import { getServerBaseConfig, saveServerBaseConfig } from '@/services/configService';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import { FiClock, FiGlobe, FiKey, FiServer } from 'react-icons/fi';
import './ServerBaseConfigForm.scss';

// 定义接口
interface FormData {
    port: string;
    tokenKey: string;
    tokenExpireDuration: string;
    corsOrigins: string;
}

interface ValidationErrors {
    [key: string]: string;
}

// 字段映射配置
const FIELD_CONFIG = {
    port: {
        label: '服务器端口',
        icon: <FiServer/>,
        placeholder: '2233',
        name: 'server_port',
        validate: (value: string) => {
            if (!value) return '端口不能为空';
            const numValue = parseInt(value, 10);
            if (isNaN(numValue) || numValue < 0 || numValue > 65535) {
                return '端口必须是0-65535之间的数字';
            }
            return '';
        }
    },
    tokenKey: {
        label: '令牌密钥',
        icon: <FiKey/>,
        placeholder: '请输入令牌密钥',
        name: 'server_token_key',
        validate: (value: string) => {
            if (!value) return '令牌密钥不能为空';
            if (/\s/.test(value)) return '令牌密钥不能包含空格';
            return '';
        }
    },
    tokenExpireDuration: {
        label: '令牌过期时间 (小时)',
        icon: <FiClock/>,
        placeholder: '24',
        name: 'server_token_expire_duration',
        validate: (value: string) => !value ? '令牌过期时间不能为空' : ''
    },
    corsOrigins: {
        label: '网站地址 (仅输入单个域名，无需http或www前缀)',
        icon: <FiGlobe/>,
        placeholder: 'example.com',
        name: 'server_cors_origins',
        validate: (value: string) => {
            if (!value) return '网站地址不能为空';

            // 验证单个域名格式
            const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
            if (!domainRegex.test(value)) {
                return '请输入有效的域名格式 (例如: example.com)';
            }
            return '';
        }
    }
};

const ServerBaseConfigForm: React.FC = () => {
    // 状态定义
    const [formData, setFormData] = useState<FormData>({
        port: '',
        tokenKey: '',
        tokenExpireDuration: '',
        corsOrigins: 'tybook.cc'
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
                const data = await getServerBaseConfig();
                if (data) {
                    setFormData({
                        port: data.port || '',
                        tokenKey: data.tokenKey || '',
                        tokenExpireDuration: data.tokenExpireDuration || '',
                        corsOrigins: data.corsOrigins || 'tybook.cc'
                    });
                }
            } catch (error) {
                console.error('Failed to fetch server config:', error);
                // 只在控制台显示错误，不在UI上显示
            } finally {
                setInitialLoading(false);
            }
        };

        fetchData();
    }, []);

    // 处理输入变化
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        const fieldKey = Object.keys(FIELD_CONFIG).find(
            key => FIELD_CONFIG[key as keyof typeof FIELD_CONFIG].name === name
        ) as keyof FormData | undefined;

        if (!fieldKey) return;

        let processedValue = value;

        // 特殊处理端口字段，确保只有数字
        if (fieldKey === 'port') {
            processedValue = value.replace(/\D/g, '');
            const numValue = parseInt(processedValue, 10);
            if (!isNaN(numValue) && numValue > 65535) {
                processedValue = '65535';
            }
        }

        // 特殊处理令牌密钥，自动移除空格
        if (fieldKey === 'tokenKey') {
            processedValue = value.replace(/\s/g, '');
        }

        setFormData(prev => ({...prev, [fieldKey]: processedValue}));

        // 清除该字段的错误
        if (errors[fieldKey]) {
            setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[fieldKey];
                return newErrors;
            });
        }

        // 清除成功和错误消息
        if (successMessage) setSuccessMessage('');
        if (submitError) setSubmitError('');
    };

    // 验证单个字段
    const validateField = (field: keyof FormData): string => {
        const config = FIELD_CONFIG[field];
        return config.validate(formData[field]);
    };

    // 验证所有字段
    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        let isValid = true;

        // 遍历所有字段进行验证
        Object.keys(FIELD_CONFIG).forEach(field => {
            const fieldKey = field as keyof FormData;
            const errorMessage = validateField(fieldKey);

            if (errorMessage) {
                newErrors[fieldKey] = errorMessage;
                isValid = false;
            }
        });

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
            const response = await saveServerBaseConfig({
                port: formData.port,
                tokenKey: formData.tokenKey,
                tokenExpireDuration: formData.tokenExpireDuration,
                corsOrigins: formData.corsOrigins
            });

            // 处理非200响应
            if (response && response.code !== 200) {
                setSubmitError(response.msg || '服务器配置保存失败，请检查输入内容');
                if (response.data !== null && response.data !== undefined) {
                    setErrorData(response.data as unknown as Record<string, unknown>);
                }
                return;
            }

            // 成功提交
            setSuccessMessage('服务器基础配置保存成功！');
        } catch (error: unknown) {
            console.error('Failed to save server config:', error);

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
        <div className="server-base-form-container">
            <h2>服务器基础配置</h2>

            {initialLoading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <div className="loading-text">加载中...</div>
                </div>
            ) : (
                <form onSubmit={handleSubmit}>
                    {/* 动态生成表单字段 */}
                    {Object.entries(FIELD_CONFIG).map(([key, config]) => {
                        const fieldKey = key as keyof FormData;
                        return (
                            <div className="form-group" key={fieldKey}>
                                <label>
                                    <span className="icon">{config.icon}</span>
                                    {config.label}
                                </label>
                                <input
                                    type="text"
                                    name={config.name}
                                    value={formData[fieldKey]}
                                    onChange={handleChange}
                                    placeholder={config.placeholder}
                                />
                                {errors[fieldKey] && <div className="error-message">{errors[fieldKey]}</div>}
                            </div>
                        );
                    })}

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

export default ServerBaseConfigForm;