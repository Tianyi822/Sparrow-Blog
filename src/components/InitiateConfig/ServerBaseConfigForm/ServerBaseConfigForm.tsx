import { saveInitiatedServerBaseConfig } from '@/services/initiateConfigService.ts';
import { AxiosError } from 'axios';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { FiClock, FiGlobe, FiKey, FiServer, FiMail, FiHash } from 'react-icons/fi';
import './ServerBaseConfigForm.scss';

/**
 * 服务器基础配置表单数据接口
 */
export interface ServerBaseFormData {
    /** 服务器端口 */
    port: string;
    /** 令牌密钥 */
    tokenKey: string;
    /** 令牌过期时间（小时） */
    tokenExpireDuration: string;
    /** 网站地址（跨域设置） */
    corsOrigins: string;
    /** SMTP邮箱账号 */
    smtpAccount: string;
    /** SMTP服务器地址 */
    smtpAddress: string;
    /** SMTP端口 */
    smtpPort: string;
    /** SMTP授权码 */
    smtpAuthCode: string;
}

/**
 * 表单验证错误接口
 */
interface ValidationErrors {
    [key: string]: string;
}

/**
 * 服务器基础配置表单组件属性接口
 */
interface ServerBaseConfigFormProps {
    /** 初始表单数据 */
    initialData?: ServerBaseFormData;
    /** 提交回调函数 */
    onSubmit?: (data: ServerBaseFormData) => void;
    /** 是否已提交成功 */
    isSubmitted?: boolean;
    /** 进入下一步回调函数 */
    onNext?: () => void;
}

/**
 * 字段配置对象
 * 定义表单字段的标签、图标、验证规则等
 */
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
        label: '网站地址 (仅支持单个地址)',
        icon: <FiGlobe/>,
        placeholder: 'example.com 或 localhost:5173',
        name: 'server_cors_origins',
        validate: (value: string) => {
            if (!value) return '网站地址不能为空';
                
            // 检查是否是localhost开发地址
            const localhostRegex = /^localhost(:[0-9]{1,5})?$/;
            if (localhostRegex.test(value)) {
                return ''; // localhost格式正确
            }

            // 验证IP地址格式（允许带端口）
            const ipRegex = /^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(:[0-9]{1,5})?$/;
            if (ipRegex.test(value)) {
                // 验证IP地址的每个部分是否在0-255范围内
                const ipParts = value.split(':')[0].split('.');
                const isValidIp = ipParts.every(part => {
                    const num = parseInt(part, 10);
                    return num >= 0 && num <= 255;
                });
                
                if (isValidIp) return ''; // IP格式正确
            }

            // 验证域名格式
            const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/;
            if (!domainRegex.test(value)) {
                return '请输入有效的域名格式 (例如: example.com) 或开发地址 (例如: localhost:5173)';
            }
            return '';
        }
    },
    smtpAccount: {
        label: 'SMTP 账号',
        icon: <FiMail/>,
        placeholder: 'example@example.com',
        name: 'server_smtp_account',
        validate: (value: string) => {
            if (!value) return 'SMTP 账号不能为空';
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                return '请输入有效的邮箱地址';
            }
            return '';
        }
    },
    smtpAddress: {
        label: 'SMTP 服务器地址',
        icon: <FiServer/>,
        placeholder: 'smtp.example.com',
        name: 'server_smtp_address',
        validate: (value: string) => {
            if (!value) return 'SMTP 服务器地址不能为空';
            return '';
        }
    },
    smtpPort: {
        label: 'SMTP 端口',
        icon: <FiHash/>,
        placeholder: '465',
        name: 'server_smtp_port',
        validate: (value: string) => {
            if (!value) return 'SMTP 端口不能为空';
            const port = parseInt(value);
            if (isNaN(port) || !Number.isInteger(port)) {
                return 'SMTP 端口必须为整数';
            }
            if (port < 0 || port > 65535) {
                return 'SMTP 端口必须在0~65535之间';
            }
            return '';
        }
    },
    smtpAuthCode: {
        label: 'SMTP 授权码',
        icon: <FiKey/>,
        placeholder: '请输入SMTP授权码',
        name: 'server_smtp_auth_code',
        validate: (value: string) => {
            if (!value) return 'SMTP 授权码不能为空';
            return '';
        }
    }
};

/**
 * 服务器基础配置表单组件
 * 用于配置服务器端口、令牌、SMTP等基础设置
 */
const ServerBaseConfigForm: React.FC<ServerBaseConfigFormProps> = ({initialData, onSubmit, isSubmitted, onNext}) => {
    // 状态定义
    const [formData, setFormData] = useState<ServerBaseFormData>({
        port: initialData?.port || '',
        tokenKey: initialData?.tokenKey || '',
        tokenExpireDuration: initialData?.tokenExpireDuration || '',
        corsOrigins: initialData?.corsOrigins || '',
        smtpAccount: initialData?.smtpAccount || '',
        smtpAddress: initialData?.smtpAddress || '',
        smtpPort: initialData?.smtpPort || '465',
        smtpAuthCode: initialData?.smtpAuthCode || ''
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
                port: initialData.port || prevFormData.port,
                tokenKey: initialData.tokenKey || prevFormData.tokenKey,
                tokenExpireDuration: initialData.tokenExpireDuration || prevFormData.tokenExpireDuration,
                corsOrigins: initialData.corsOrigins || prevFormData.corsOrigins,
                smtpAccount: initialData.smtpAccount || prevFormData.smtpAccount,
                smtpAddress: initialData.smtpAddress || prevFormData.smtpAddress,
                smtpPort: initialData.smtpPort || prevFormData.smtpPort,
                smtpAuthCode: initialData.smtpAuthCode || prevFormData.smtpAuthCode
            }));
        }
    }, [initialData]);

    /**
     * 清除指定字段的错误
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
     * 清除全局消息
     */
    const clearMessages = useCallback(() => {
        if (submitError) setSubmitError('');
        if (successMessage) setSuccessMessage('');
    }, [submitError, successMessage]);

    /**
     * 处理输入变化
     */
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        const fieldKey = Object.keys(FIELD_CONFIG).find(
            key => FIELD_CONFIG[key as keyof typeof FIELD_CONFIG].name === name
        ) as keyof ServerBaseFormData | undefined;

        if (!fieldKey) return;

        let processedValue = value;

        // 特殊处理端口字段，确保只有数字
        if (fieldKey === 'port' || fieldKey === 'smtpPort') {
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
        clearFieldError(fieldKey);

        // 清除错误消息和成功消息
        clearMessages();
    }, [clearFieldError, clearMessages]);

    /**
     * 验证单个字段
     */
    const validateField = useCallback((field: keyof ServerBaseFormData): string => {
        const config = FIELD_CONFIG[field];
        return config.validate(formData[field]);
    }, [formData]);

    /**
     * 验证所有字段
     */
    const validateForm = useCallback((): boolean => {
        const newErrors: ValidationErrors = {};
        let isValid = true;

        // 遍历所有字段进行验证
        Object.keys(FIELD_CONFIG).forEach(field => {
            const fieldKey = field as keyof ServerBaseFormData;
            const errorMessage = validateField(fieldKey);

            if (errorMessage) {
                newErrors[fieldKey] = errorMessage;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    }, [validateField]);

    /**
     * 格式化错误数据显示
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
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');
        setErrorData(null);
        // 不清除成功消息
        // setSuccessMessage('');

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const response = await saveInitiatedServerBaseConfig({
                port: formData.port,
                tokenKey: formData.tokenKey,
                tokenExpireDuration: formData.tokenExpireDuration,
                corsOrigins: formData.corsOrigins,
                smtpAccount: formData.smtpAccount,
                smtpAddress: formData.smtpAddress,
                smtpPort: formData.smtpPort,
                smtpAuthCode: formData.smtpAuthCode
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
            setSubmitSuccess(true);

            // 调用父组件的onSubmit回调函数
            if (onSubmit) {
                onSubmit(formData);
            }
        } catch (error: unknown) {
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
                        // 处理错误数据格式化失败
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

    /**
     * 构建表单字段列表
     */
    const formFields = useMemo(() => {
        return [
            // 基础设置
            { section: '基础设置', icon: <FiServer/>, fields: ['port', 'tokenKey', 'tokenExpireDuration', 'corsOrigins'] },
            // SMTP设置
            { section: 'SMTP 邮箱设置', icon: <FiMail/>, fields: ['smtpAccount', 'smtpAddress', 'smtpPort', 'smtpAuthCode'] }
        ];
    }, []);

    return (
        <div className="server-base-form-container">
            <h2>服务器基础配置</h2>

            <form onSubmit={handleSubmit}>
                {formFields.map((section, sectionIndex) => (
                    <React.Fragment key={`section-${sectionIndex}`}>
                        <div className="form-section-header">
                            <h3>
                                <span className="icon">{section.icon}</span>
                                {section.section}
                            </h3>
                        </div>
                        
                        {section.fields.map(fieldName => {
                            const fieldKey = fieldName as keyof ServerBaseFormData;
                            const field = FIELD_CONFIG[fieldKey];
                            return (
                                <div className="form-group" key={fieldKey}>
                                    <label htmlFor={field.name}>
                                        <span className="icon">{field.icon}</span>
                                        {field.label}
                                    </label>
                                    <input
                                        type={fieldKey === 'smtpAuthCode' ? 'password' : 'text'}
                                        id={field.name}
                                        name={field.name}
                                        value={formData[fieldKey]}
                                        onChange={handleChange}
                                        placeholder={field.placeholder}
                                    />
                                    {errors[fieldKey] && <div className="error-message">{errors[fieldKey]}</div>}
                                </div>
                            );
                        })}
                    </React.Fragment>
                ))}

                <div className="form-actions">
                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading ? '提交中...' : '保存配置'}
                    </button>

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

export default ServerBaseConfigForm;