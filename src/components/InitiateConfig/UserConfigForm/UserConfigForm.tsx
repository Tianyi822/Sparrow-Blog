import { ApiResponse } from '@/services/api.ts';
import {
    saveInitiatedUserConfig,
    sendInitiatedVerificationCode,
    UserConfigData,
    VerificationCodeData
} from '@/services/initiateConfigService.ts';
import { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
import './UserConfigForm.scss';
import { FiHash, FiKey, FiLock, FiMail, FiServer, FiUser } from 'react-icons/fi';

interface ValidationErrors {
    [key: string]: string;
}

export interface UserEmailConfigFormProps {
    onSubmit?: (formData: UserEmailConfigFormData) => void;
    initialData?: UserEmailConfigFormData;
    isSubmitted?: boolean;
    onNext?: () => void;
}

export interface UserEmailConfigFormData {
    username: string;
    email: string;
    smtpUsername: string;
    smtpServer: string;
    smtpPort: string;
    smtpPassword: string;
}

// 字段映射配置
const FIELD_CONFIG = {
    username: {
        label: '用户名',
        icon: <FiUser/>,
        name: 'username',
        type: 'text',
        validate: (value: string) => {
            if (!value.trim()) {
                return '用户名不能为空';
            }
            return '';
        }
    },
    email: {
        label: '用户邮箱',
        icon: <FiMail/>,
        name: 'email',
        type: 'email',
        validate: (value: string) => {
            if (!value.trim()) {
                return '用户邮箱不能为空';
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                return '请输入有效的邮箱地址';
            }
            return '';
        }
    },
    smtpUsername: {
        label: 'SMTP 邮箱账号',
        icon: <FiMail/>,
        name: 'smtpUsername',
        type: 'email',
        validate: (value: string) => {
            if (!value.trim()) {
                return 'SMTP 邮箱账号不能为空';
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                return '请输入有效的邮箱地址';
            }
            return '';
        }
    },
    smtpServer: {
        label: 'SMTP 服务器地址',
        icon: <FiServer/>,
        name: 'smtpServer',
        type: 'text',
        placeholder: '例如: smtp.gmail.com',
        validate: (value: string) => {
            if (!value.trim()) {
                return 'SMTP 服务器地址不能为空';
            }
            return '';
        }
    },
    smtpPort: {
        label: 'SMTP 端口',
        icon: <FiHash/>,
        name: 'smtpPort',
        type: 'text',
        placeholder: '465',
        validate: (value: string) => {
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
    smtpPassword: {
        label: 'SMTP 密码',
        icon: <FiKey/>,
        name: 'smtpPassword',
        type: 'password',
        validate: (value: string) => {
            if (!value.trim()) {
                return 'SMTP 密码不能为空';
            }
            return '';
        }
    },
    verifyCode: {
        label: '验证码',
        icon: <FiLock/>,
        name: 'verifyCode',
        type: 'text',
        placeholder: '请输入验证码',
        validate: (value: string) => {
            if (!value.trim()) {
                return '验证码不能为空';
            }
            return '';
        }
    }
};

const UserConfigForm: React.FC<UserEmailConfigFormProps> = ({onSubmit, initialData, isSubmitted, onNext}) => {
    // 状态定义
    const [formData, setFormData] = useState<UserEmailConfigFormData & { verifyCode?: string }>({
        username: initialData?.username || '',
        email: initialData?.email || '',
        smtpUsername: initialData?.smtpUsername || '',
        smtpServer: initialData?.smtpServer || '',
        smtpPort: initialData?.smtpPort || '465',
        smtpPassword: initialData?.smtpPassword || '',
        verifyCode: ''
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [syncWithEmail, setSyncWithEmail] = useState<boolean>(
        !initialData?.smtpUsername || initialData.smtpUsername === initialData.email
    );
    const [submitError, setSubmitError] = useState<string>('');
    const [errorData, setErrorData] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [submitSuccess, setSubmitSuccess] = useState<boolean>(isSubmitted || false);

    // 验证码相关状态
    const [countdown, setCountdown] = useState<number>(0);
    const [disableSendCode, setDisableSendCode] = useState<boolean>(false);

    // 初始化检查倒计时状态
    useEffect(() => {
        // 从localStorage检查倒计时状态
        const storedCountdown = localStorage.getItem('verifyCodeCountdown');
        const storedTimestamp = localStorage.getItem('verifyCodeTimestamp');

        if (storedCountdown && storedTimestamp) {
            const elapsed = Math.floor((Date.now() - parseInt(storedTimestamp)) / 1000);
            const remainingTime = parseInt(storedCountdown) - elapsed;

            if (remainingTime > 0) {
                setCountdown(remainingTime);
                setDisableSendCode(true);
            } else {
                // 倒计时已结束，清除存储
                localStorage.removeItem('verifyCodeCountdown');
                localStorage.removeItem('verifyCodeTimestamp');
            }
        }
    }, []);

    // 当initialData变化时更新表单数据
    useEffect(() => {
        if (initialData) {
            setFormData(prevData => ({
                ...prevData,
                username: initialData.username || prevData.username,
                email: initialData.email || prevData.email,
                smtpUsername: initialData.smtpUsername || prevData.smtpUsername,
                smtpServer: initialData.smtpServer || prevData.smtpServer,
                smtpPort: initialData.smtpPort || prevData.smtpPort,
                smtpPassword: initialData.smtpPassword || prevData.smtpPassword
            }));

            // 更新是否同步邮箱用户名的状态
            setSyncWithEmail(!initialData.smtpUsername || initialData.smtpUsername === initialData.email);
        }
    }, [initialData]);

    // 处理倒计时
    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (countdown > 0) {
            timer = setTimeout(() => {
                setCountdown(prev => {
                    const newValue = prev - 1;
                    if (newValue <= 0) {
                        setDisableSendCode(false);
                        localStorage.removeItem('verifyCodeCountdown');
                        localStorage.removeItem('verifyCodeTimestamp');
                        return 0;
                    }

                    // 更新localStorage
                    localStorage.setItem('verifyCodeCountdown', String(newValue));
                    return newValue;
                });
            }, 1000);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [countdown]);

    // 验证单个字段
    const validateField = (field: string, value: string): string => {
        const config = FIELD_CONFIG[field as keyof typeof FIELD_CONFIG];
        if (!config) return '';
        return config.validate(value);
    };

    // 验证所有字段
    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        let isValid = true;

        // 验证所有必填字段
        Object.keys(FIELD_CONFIG).forEach(field => {
            // 如果启用了同步，跳过smtpUsername验证
            if (field === 'smtpUsername' && syncWithEmail) {
                return;
            }

            const value = formData[field as keyof typeof formData] as string || '';
            const error = validateField(field, value);

            if (error) {
                newErrors[field] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    // 处理输入变化
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const {name, value, type} = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
            return;
        }

        setFormData(prev => {
            const updated = {
                ...prev,
                [name]: value
            };

            // 如果email字段更新且启用了同步，更新SMTP用户名
            if (name === 'email' && syncWithEmail) {
                updated.smtpUsername = value;
            }

            return updated;
        });

        // 清除该字段的错误
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[name];
                return newErrors;
            });
        }

        // 清除成功和错误消息
        if (successMessage) setSuccessMessage('');
        if (submitError) setSubmitError('');
    };

    // 处理同步选项变更
    const handleSyncToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setSyncWithEmail(isChecked);

        if (isChecked) {
            // 更新SMTP用户名为邮箱地址
            setFormData(prev => ({
                ...prev,
                smtpUsername: prev.email
            }));

            // 清除SMTP用户名的错误
            setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors.smtpUsername;
                return newErrors;
            });
        }
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

    // 处理发送验证码
    const handleSendVerifyCode = async () => {
        // 首先验证必填字段
        if (!formData.email || !formData.smtpServer || !formData.smtpPort || !formData.smtpPassword) {
            setSubmitError('发送验证码前，请完成邮箱和SMTP服务器设置');
            return;
        }

        try {
            setDisableSendCode(true);

            // 准备请求数据，按照后端要求的格式
            const verificationData: VerificationCodeData = {
                "user.user_email": formData.email,
                "user.smtp_account": syncWithEmail ? formData.email : formData.smtpUsername,
                "user.smtp_address": formData.smtpServer,
                "user.smtp_port": formData.smtpPort,
                "user.smtp_auth_code": formData.smtpPassword
            };

            // 使用configService发送验证码
            const response = await sendInitiatedVerificationCode(verificationData);

            // 检查响应状态
            if (response && response.code === 200) {
                // 验证码发送成功
                setSuccessMessage('验证码已发送至邮箱，请查收');

                // 开始倒计时
                setCountdown(30); // 30秒倒计时

                // 存储倒计时状态到localStorage
                localStorage.setItem('verifyCodeCountdown', '30');
                localStorage.setItem('verifyCodeTimestamp', Date.now().toString());

                // 5秒后清除成功消息
                setTimeout(() => {
                    if (successMessage === '验证码已发送至邮箱，请查收') {
                        setSuccessMessage('');
                    }
                }, 5000);
            } else {
                // 处理错误响应
                setSubmitError(response?.msg || '发送验证码失败，请检查邮箱配置');
                if (response?.data) {
                    setErrorData(response.data as Record<string, unknown>);
                }
                setDisableSendCode(false);
            }
        } catch (error: unknown) {
            console.error('Failed to send verification code:', error);

            // 处理错误
            if (error && typeof error === 'object') {
                if (error instanceof AxiosError && error.response) {
                    const errorResponse = error.response;
                    if (errorResponse.data) {
                        const errorData = errorResponse.data as ApiResponse<unknown>;
                        setSubmitError(errorData.msg || `发送验证码失败: ${errorResponse.status}`);
                        if (errorData.data) {
                            setErrorData(errorData.data as unknown as Record<string, unknown>);
                        } else if (typeof errorData === 'object') {
                            // 如果没有data字段但响应本身是对象，则使用整个响应
                            setErrorData(errorData as unknown as Record<string, unknown>);
                        }
                    } else {
                        setSubmitError(`发送验证码失败: ${errorResponse.status}`);
                    }
                } else if ('message' in error) {
                    setSubmitError(`发送验证码错误: ${(error as Error).message}`);
                } else {
                    setSubmitError('发送验证码过程中发生未知错误');
                }
            } else {
                setSubmitError('发送验证码失败，请检查网络连接');
            }

            // 重置发送按钮状态
            setDisableSendCode(false);
        }
    };

    // 处理表单提交
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');
        setErrorData(null);

        // 确保同步状态正确
        if (syncWithEmail) {
            setFormData(prev => ({
                ...prev,
                smtpUsername: prev.email
            }));
        }

        // 验证表单
        if (!validateForm()) {
            return;
        }

        // 检查验证码
        if (!formData.verifyCode) {
            setErrors(prev => ({
                ...prev,
                verifyCode: '请输入验证码'
            }));
            return;
        }

        try {
            setLoading(true);

            // 准备用户配置数据（包含验证码）
            const userData: UserConfigData = {
                'user.username': formData.username,
                'user.verification_code': formData.verifyCode
            };

            // 使用saveUserConfig发送到 /config/user 端点
            const response = await saveInitiatedUserConfig(userData);

            // 处理保存响应
            if (response && response.code !== 200) {
                setSubmitError(response.msg || '用户配置保存失败，验证码可能已过期');
                if (response.data !== null && response.data !== undefined) {
                    setErrorData(response.data as unknown as Record<string, unknown>);
                }
                return;
            }

            // 成功提交
            setSuccessMessage('用户和邮件配置保存成功！');
            setSubmitSuccess(true);

            // 调用父组件的onSubmit回调函数
            if (onSubmit) {
                onSubmit({
                    username: formData.username,
                    email: formData.email,
                    smtpUsername: syncWithEmail ? formData.email : formData.smtpUsername,
                    smtpServer: formData.smtpServer,
                    smtpPort: formData.smtpPort,
                    smtpPassword: formData.smtpPassword
                });
            }
        } catch (error: unknown) {
            console.error('Failed to save user email config:', error);

            // 处理错误对象，提取详细信息
            if (error && typeof error === 'object') {
                // 检查是否是Axios错误并包含响应数据
                if (error instanceof AxiosError && error.response) {
                    const errorResponse = error.response;

                    // 尝试提取错误消息
                    if (errorResponse.data) {
                        const errorData = errorResponse.data as ApiResponse<unknown>;
                        if (errorData.msg) {
                            setSubmitError(errorData.msg);
                        } else {
                            setSubmitError(`请求失败: ${errorResponse.status} ${errorResponse.statusText || ''}`);
                        }

                        // 尝试提取错误数据
                        if (errorData.data) {
                            setErrorData(errorData.data as unknown as Record<string, unknown>);
                        } else if (typeof errorData === 'object') {
                            // 如果没有data字段但响应本身是对象，则使用整个响应
                            setErrorData(errorData as unknown as Record<string, unknown>);
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
        <div className="user-email-config-form-container">
            <h2>用户与邮箱配置</h2>

            <form onSubmit={handleSubmit}>
                <div className="form-section-header">
                    <h3>
                        <span className="icon"><FiUser/></span>
                        用户信息
                    </h3>
                </div>

                {/* 用户名 */}
                <div className="form-group">
                    <label htmlFor="username">
                        <span className="icon">{FIELD_CONFIG.username.icon}</span>
                        {FIELD_CONFIG.username.label}
                    </label>
                    <input
                        type={FIELD_CONFIG.username.type}
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                    />
                    {errors.username && <div className="error-message">{errors.username}</div>}
                </div>

                {/* 用户邮箱 */}
                <div className="form-group">
                    <label htmlFor="email">
                        <span className="icon">{FIELD_CONFIG.email.icon}</span>
                        {FIELD_CONFIG.email.label}
                    </label>
                    <input
                        type={FIELD_CONFIG.email.type}
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {errors.email && <div className="error-message">{errors.email}</div>}
                </div>

                <div className="form-section-header">
                    <h3>
                        <span className="icon"><FiServer/></span>
                        SMTP 服务设置
                    </h3>
                </div>

                {/* 使用用户邮箱作为SMTP账号选项 */}
                <div className="form-group checkbox-group">
                    <input
                        type="checkbox"
                        id="syncWithEmail"
                        checked={syncWithEmail}
                        onChange={handleSyncToggle}
                    />
                    <label htmlFor="syncWithEmail">使用用户邮箱作为 SMTP 账号</label>
                </div>

                {/* SMTP账号 */}
                {!syncWithEmail && (
                    <div className="form-group">
                        <label htmlFor="smtpUsername">
                            <span className="icon">{FIELD_CONFIG.smtpUsername.icon}</span>
                            {FIELD_CONFIG.smtpUsername.label}
                        </label>
                        <input
                            type={FIELD_CONFIG.smtpUsername.type}
                            id="smtpUsername"
                            name="smtpUsername"
                            value={formData.smtpUsername}
                            onChange={handleChange}
                        />
                        {errors.smtpUsername && <div className="error-message">{errors.smtpUsername}</div>}
                    </div>
                )}

                {/* SMTP服务器 */}
                <div className="form-group">
                    <label htmlFor="smtpServer">
                        <span className="icon">{FIELD_CONFIG.smtpServer.icon}</span>
                        {FIELD_CONFIG.smtpServer.label}
                    </label>
                    <input
                        type={FIELD_CONFIG.smtpServer.type}
                        id="smtpServer"
                        name="smtpServer"
                        value={formData.smtpServer}
                        onChange={handleChange}
                        placeholder={FIELD_CONFIG.smtpServer.placeholder}
                    />
                    {errors.smtpServer && <div className="error-message">{errors.smtpServer}</div>}
                </div>

                {/* SMTP端口 */}
                <div className="form-group">
                    <label htmlFor="smtpPort">
                        <span className="icon">{FIELD_CONFIG.smtpPort.icon}</span>
                        {FIELD_CONFIG.smtpPort.label}
                    </label>
                    <input
                        type={FIELD_CONFIG.smtpPort.type}
                        id="smtpPort"
                        name="smtpPort"
                        value={formData.smtpPort}
                        onChange={handleChange}
                        placeholder={FIELD_CONFIG.smtpPort.placeholder}
                    />
                    {errors.smtpPort && <div className="error-message">{errors.smtpPort}</div>}
                </div>

                {/* SMTP密码 */}
                <div className="form-group">
                    <label htmlFor="smtpPassword">
                        <span className="icon">{FIELD_CONFIG.smtpPassword.icon}</span>
                        {FIELD_CONFIG.smtpPassword.label}
                    </label>
                    <input
                        type={FIELD_CONFIG.smtpPassword.type}
                        id="smtpPassword"
                        name="smtpPassword"
                        value={formData.smtpPassword}
                        onChange={handleChange}
                    />
                    {errors.smtpPassword && <div className="error-message">{errors.smtpPassword}</div>}
                </div>

                <div className="form-section-header">
                    <h3>
                        <span className="icon"><FiLock/></span>
                        验证
                    </h3>
                </div>

                {/* 验证码 */}
                <div className="form-group verify-code-group">
                    <label htmlFor="verifyCode">
                        <span className="icon">{FIELD_CONFIG.verifyCode.icon}</span>
                        {FIELD_CONFIG.verifyCode.label}
                    </label>
                    <div className="verify-code-container">
                        <input
                            type="text"
                            id="verifyCode"
                            name="verifyCode"
                            value={formData.verifyCode || ''}
                            onChange={handleChange}
                            placeholder={FIELD_CONFIG.verifyCode.placeholder}
                        />
                        <button
                            type="button"
                            className="verify-code-button"
                            onClick={handleSendVerifyCode}
                            disabled={disableSendCode || loading}
                        >
                            {countdown > 0 ? `${countdown}秒后重试` : '发送验证码'}
                        </button>
                    </div>
                    {errors.verifyCode && <div className="error-message">{errors.verifyCode}</div>}
                </div>

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
                            完成配置并进入管理后台
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

export default UserConfigForm;