import { ApiResponse } from '@/services/api.ts';
import {
    saveInitiatedUserConfig,
    sendInitiatedVerificationCode,
    UserConfigData,
    VerificationCodeData
} from '@/services/initiateConfigService.ts';
import { AxiosError } from 'axios';
import React, { KeyboardEvent, useEffect, useState } from 'react';
import './UserConfigForm.scss';
import { FiHeart, FiLock, FiMail, FiType, FiUser, FiX } from 'react-icons/fi';

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
    githubAddress?: string;
    hobbies?: string[];
    typeWriterContent?: string[];
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
    githubAddress: {
        label: 'GitHub 地址',
        icon: <FiUser/>,
        name: 'githubAddress',
        type: 'text',
        placeholder: 'https://github.com/username',
        validate: (value: string) => {
            if (value && !value.trim().startsWith('https://github.com/')) {
                return 'GitHub 地址必须以 https://github.com/ 开头';
            }
            return '';
        }
    },
    hobby: {
        label: '爱好',
        icon: <FiHeart/>,
        name: 'hobby',
        type: 'text',
        placeholder: '输入爱好后按回车添加',
        validate: () => '' // 爱好是可选的，不需要验证
    },
    typeWriterContent: {
        label: '打字机内容',
        icon: <FiType/>,
        name: 'typeWriterContent',
        type: 'text',
        placeholder: '输入打字机内容后按回车添加',
        validate: () => '' // 打字机内容是可选的，不需要验证
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
        verifyCode: '',
        githubAddress: initialData?.githubAddress || '',
        hobbies: initialData?.hobbies || [],
        typeWriterContent: initialData?.typeWriterContent || []
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [submitError, setSubmitError] = useState<string>('');
    const [errorData, setErrorData] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [submitSuccess, setSubmitSuccess] = useState<boolean>(isSubmitted || false);

    // 验证码相关状态
    const [countdown, setCountdown] = useState<number>(0);
    const [disableSendCode, setDisableSendCode] = useState<boolean>(false);

    // 临时输入值状态
    const [tempHobby, setTempHobby] = useState<string>('');
    const [tempTypeWriterContent, setTempTypeWriterContent] = useState<string>('');

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
                githubAddress: initialData.githubAddress || prevData.githubAddress,
                hobbies: initialData.hobbies || prevData.hobbies,
                typeWriterContent: initialData.typeWriterContent || prevData.typeWriterContent
            }));
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

        // 处理特殊字段
        if (name === 'hobby') {
            setTempHobby(value);
            return;
        }

        if (name === 'typeWriterContent') {
            setTempTypeWriterContent(value);
            return;
        }

        setFormData(prev => {
            const updated = {
                ...prev,
                [name]: value
            };

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

    // 处理列表项的键盘事件
    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, type: 'hobby' | 'typeWriterContent') => {
        if (e.key === 'Enter') {
            e.preventDefault();

            const value = type === 'hobby' ? tempHobby.trim() : tempTypeWriterContent.trim();

            if (!value) return;

            if (type === 'hobby') {
                setFormData(prev => ({
                    ...prev,
                    hobbies: [...(prev.hobbies || []), value]
                }));
                setTempHobby('');
            } else {
                setFormData(prev => ({
                    ...prev,
                    typeWriterContent: [...(prev.typeWriterContent || []), value]
                }));
                setTempTypeWriterContent('');
            }
        }
    };

    // 删除列表项
    const handleRemoveItem = (index: number, type: 'hobby' | 'typeWriterContent') => {
        if (type === 'hobby') {
            setFormData(prev => ({
                ...prev,
                hobbies: prev.hobbies?.filter((_, i) => i !== index) || []
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                typeWriterContent: prev.typeWriterContent?.filter((_, i) => i !== index) || []
            }));
        }
    };

    // 处理发送验证码
    const handleSendVerifyCode = async () => {
        // 先验证email字段
        const emailError = validateField('email', formData.email);
        if (emailError) {
            setErrors(prev => ({
                ...prev,
                email: emailError
            }));
            return;
        }

        try {
            setDisableSendCode(true);

            // 准备发送验证码的数据
            const verifyData: VerificationCodeData = {
                'user.user_email': formData.email
            };

            // 发送验证码请求
            const response = await sendInitiatedVerificationCode(verifyData);

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
                'user.user_email': formData.email,
                'user.user_github_address': formData.githubAddress || '',
                'user.user_hobbies': formData.hobbies || [],
                'user.type_writer_content': formData.typeWriterContent || [],
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
                    githubAddress: formData.githubAddress,
                    hobbies: formData.hobbies,
                    typeWriterContent: formData.typeWriterContent
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

    // 格式化错误数据显示
    const formatErrorData = (data: Record<string, unknown> | null): string => {
        if (!data) return '';

        try {
            return JSON.stringify(data, null, 2);
        } catch {
            return String(data);
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

                {/* GitHub地址 */}
                <div className="form-group">
                    <label htmlFor="githubAddress">
                        <span className="icon">{FIELD_CONFIG.githubAddress.icon}</span>
                        {FIELD_CONFIG.githubAddress.label}
                    </label>
                    <input
                        type={FIELD_CONFIG.githubAddress.type}
                        id="githubAddress"
                        name="githubAddress"
                        placeholder={FIELD_CONFIG.githubAddress.placeholder}
                        value={formData.githubAddress || ''}
                        onChange={handleChange}
                    />
                    {errors.githubAddress && <div className="error-message">{errors.githubAddress}</div>}
                </div>

                {/* 爱好配置 */}
                <div className="form-group">
                    <label htmlFor="hobby">
                        <span className="icon">{FIELD_CONFIG.hobby.icon}</span>
                        {FIELD_CONFIG.hobby.label}
                    </label>
                    <input
                        type={FIELD_CONFIG.hobby.type}
                        id="hobby"
                        name="hobby"
                        placeholder={FIELD_CONFIG.hobby.placeholder}
                        value={tempHobby}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, 'hobby')}
                    />
                    {formData.hobbies && formData.hobbies.length > 0 && (
                        <div className="tag-list">
                            {formData.hobbies.map((hobby, index) => (
                                <div className="tag-item" key={index}>
                                    <span>{hobby}</span>
                                    <button
                                        type="button"
                                        className="delete-tag"
                                        onClick={() => handleRemoveItem(index, 'hobby')}
                                    >
                                        <FiX/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* 打字机内容配置 */}
                <div className="form-group">
                    <label htmlFor="typeWriterContent">
                        <span className="icon">{FIELD_CONFIG.typeWriterContent.icon}</span>
                        {FIELD_CONFIG.typeWriterContent.label}
                    </label>
                    <input
                        type={FIELD_CONFIG.typeWriterContent.type}
                        id="typeWriterContent"
                        name="typeWriterContent"
                        placeholder={FIELD_CONFIG.typeWriterContent.placeholder}
                        value={tempTypeWriterContent}
                        onChange={handleChange}
                        onKeyDown={(e) => handleKeyDown(e, 'typeWriterContent')}
                    />
                    {formData.typeWriterContent && formData.typeWriterContent.length > 0 && (
                        <div className="tag-list">
                            {formData.typeWriterContent.map((content, index) => (
                                <div className="tag-item" key={index}>
                                    <span>{content}</span>
                                    <button
                                        type="button"
                                        className="delete-tag"
                                        onClick={() => handleRemoveItem(index, 'typeWriterContent')}
                                    >
                                        <FiX/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="form-section-header">
                    <h3>
                        <span className="icon"><FiLock/></span>
                        邮箱验证
                    </h3>
                </div>

                {/* 验证码 */}
                <div className="form-group">
                    <label htmlFor="verifyCode">
                        <span className="icon">{FIELD_CONFIG.verifyCode.icon}</span>
                        {FIELD_CONFIG.verifyCode.label}
                    </label>
                    <div className="verify-code-input-container">
                        <input
                            type={FIELD_CONFIG.verifyCode.type}
                            id="verifyCode"
                            name="verifyCode"
                            value={formData.verifyCode || ''}
                            onChange={handleChange}
                            placeholder={FIELD_CONFIG.verifyCode.placeholder}
                        />
                        <button
                            type="button"
                            className="send-code-button"
                            onClick={handleSendVerifyCode}
                            disabled={disableSendCode}
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

export default UserConfigForm;