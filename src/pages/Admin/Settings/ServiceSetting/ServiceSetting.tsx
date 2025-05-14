import React, { useState, useEffect } from 'react';
import { FiServer, FiGlobe, FiClock, FiAlertCircle, FiPlus, FiX, FiKey, FiRefreshCw, FiMail, FiSend } from 'react-icons/fi';
import './ServiceSetting.scss';
import { getServerConfig, sendSMTPVerificationCode } from '@/services/adminService';
import { businessApiRequest } from '@/services/api';
import { ApiResponse } from '@/services/api.ts';

interface ServiceConfigProps {
    onSaveSuccess?: () => void;
}

const ServiceSetting: React.FC<ServiceConfigProps> = ({ onSaveSuccess }) => {
    // 表单状态
    const [formData, setFormData] = useState({
        tokenExpireDuration: '',
        tokenKey: '',
        smtpAccount: '',
        smtpAddress: '',
        smtpPort: '',
        smtpAuthCode: '',
        verificationCode: '',
    });

    // 跨域列表
    const [corsOrigins, setCorsOrigins] = useState<string[]>([]);
    const [newCorsOrigin, setNewCorsOrigin] = useState('');

    // 端口（只读）
    const [port, setPort] = useState<number | null>(null);

    // 错误状态
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // 初始SMTP账号，用于跟踪是否修改过
    const [initialSmtpAccount, setInitialSmtpAccount] = useState('');

    // 控制验证码界面显示
    const [smtpModified, setSmtpModified] = useState(false);
    const [smtpVerifying, setSmtpVerifying] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);

    // 获取服务器配置
    useEffect(() => {
        const fetchServerConfig = async () => {
            try {
                setLoading(true);
                setSubmitError(null); // 清除之前的错误

                const response = await getServerConfig();

                if (response.code === 200 && response.data) {
                    const {
                        port,
                        token_expire_duration,
                        cors_origins,
                        token_key,
                        smtp_account,
                        smtp_address,
                        smtp_port
                    } = response.data;

                    // 设置端口（只读）
                    setPort(port);

                    // 设置表单数据
                    setFormData({
                        tokenExpireDuration: token_expire_duration.toString(),
                        tokenKey: token_key || '',
                        smtpAccount: smtp_account || '',
                        smtpAddress: smtp_address || '',
                        smtpPort: smtp_port ? smtp_port.toString() : '',
                        smtpAuthCode: '',
                        verificationCode: '',
                    });

                    // 保存初始SMTP账号
                    setInitialSmtpAccount(smtp_account || '');

                    // 设置跨域来源列表
                    setCorsOrigins(cors_origins || []);
                } else {
                    // 显示后端返回的错误信息
                    setSubmitError(`获取服务器配置失败: ${response.msg}`);
                    console.error('获取服务器配置失败:', response.msg);
                }
            } catch (error) {
                console.error('获取服务器配置失败:', error);
                setSubmitError('获取服务器配置时发生错误，请稍后再试');
            } finally {
                setLoading(false);
            }
        };

        fetchServerConfig();
    }, []);

    // 处理输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // 检查SMTP账号是否被修改
        if (name === 'smtpAccount' && value !== initialSmtpAccount) {
            setSmtpModified(true);
        } else if (name === 'smtpAccount' && value === initialSmtpAccount) {
            setSmtpModified(false);
        }

        // 清除对应字段的错误
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: '',
            });
        }
    };

    // 处理新增跨域来源
    const handleAddCorsOrigin = () => {
        if (!newCorsOrigin.trim()) return;

        if (!/^(http|https):\/\//.test(newCorsOrigin)) {
            setErrors({
                ...errors,
                newCorsOrigin: '跨域来源必须以http://或https://开头',
            });
            return;
        }

        setCorsOrigins([...corsOrigins, newCorsOrigin.trim()]);
        setNewCorsOrigin('');

        // 清除错误
        if (errors.newCorsOrigin) {
            const newErrors = { ...errors };
            delete newErrors.newCorsOrigin;
            setErrors(newErrors);
        }
    };

    // 处理删除跨域来源
    const handleRemoveCorsOrigin = (index: number) => {
        const newOrigins = [...corsOrigins];
        newOrigins.splice(index, 1);
        setCorsOrigins(newOrigins);
    };

    // 生成随机令牌密钥
    const generateRandomTokenKey = () => {
        const length = 32;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';

        // 确保生成的字符串恰好是32个字符
        while (result.length < length) {
            const randomChar = chars.charAt(Math.floor(Math.random() * chars.length));
            result += randomChar;
        }

        setFormData({
            ...formData,
            tokenKey: result,
        });
    };

    // 发送SMTP验证码
    const handleSendSMTPVerificationCode = async () => {
        // 验证SMTP字段
        if (!formData.smtpAccount || !formData.smtpAddress || !formData.smtpPort || !formData.smtpAuthCode) {
            setErrors({
                ...errors,
                smtpVerification: '请完整填写SMTP配置信息和授权码'
            });
            return;
        }

        try {
            setSmtpVerifying(true);

            const response = await sendSMTPVerificationCode(
                formData.smtpAccount,
                formData.smtpAddress,
                formData.smtpPort,
                formData.smtpAuthCode
            );

            if (response.code === 200) {
                setVerificationSent(true);
                // 清除错误
                const newErrors = { ...errors };
                delete newErrors.smtpVerification;
                setErrors(newErrors);
            } else {
                setErrors({
                    ...errors,
                    smtpVerification: `发送验证码失败: ${response.msg}`
                });
            }
        } catch (error) {
            console.error('发送SMTP验证码失败:', error);
            setErrors({
                ...errors,
                smtpVerification: '发送验证码时发生错误，请稍后再试'
            });
        } finally {
            setSmtpVerifying(false);
        }
    };

    // 表单验证
    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        // 验证JWT令牌过期时间
        if (!formData.tokenExpireDuration) {
            newErrors.tokenExpireDuration = '请输入令牌过期时间';
        } else if (!/^\d+$/.test(formData.tokenExpireDuration)) {
            newErrors.tokenExpireDuration = '令牌过期时间必须为数字';
        }

        // 验证令牌密钥
        if (!formData.tokenKey) {
            newErrors.tokenKey = '请输入令牌密钥';
        }

        // 验证跨域来源列表
        if (corsOrigins.length === 0) {
            newErrors.corsOrigins = '请至少添加一个跨域来源';
        }

        // 验证SMTP端口格式
        if (formData.smtpPort && !/^\d+$/.test(formData.smtpPort)) {
            newErrors.smtpPort = 'SMTP端口必须为数字';
        }

        // 如果SMTP账号被修改，验证是否已验证
        if (smtpModified && !formData.verificationCode) {
            newErrors.verificationCode = '修改SMTP账号后必须进行验证';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 处理表单提交
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 清空所有错误
        setErrors({});
        setSubmitError(null);

        if (validateForm()) {
            try {
                // 将跨域来源转换为数组
                const corsOriginsArray = corsOrigins.filter(item => item !== '');

                // 确保tokenKey为确切的32个字符
                let tokenKeyToSend = formData.tokenKey;
                if (tokenKeyToSend && tokenKeyToSend.length !== 32) {
                    // 如果长度不足32，则填充到32个字符
                    if (tokenKeyToSend.length < 32) {
                        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
                        while (tokenKeyToSend.length < 32) {
                            tokenKeyToSend += chars.charAt(Math.floor(Math.random() * chars.length));
                        }
                    }
                    // 如果长度超过32，则截断到32个字符
                    else if (tokenKeyToSend.length > 32) {
                        tokenKeyToSend = tokenKeyToSend.substring(0, 32);
                    }
                }

                // 构建请求数据
                const requestData: Record<string, string | number | string[]> = {
                    'server.token_key': tokenKeyToSend || '',
                    'server.token_expire_duration': parseInt(formData.tokenExpireDuration),
                    'server.cors_origins': corsOriginsArray
                };

                // 如果修改了SMTP配置，添加SMTP相关数据和验证码
                if (smtpModified) {
                    requestData['server.verification_code'] = formData.verificationCode;
                    requestData['server.smtp_account'] = formData.smtpAccount;
                    requestData['server.smtp_address'] = formData.smtpAddress;
                    requestData['server.smtp_port'] = formData.smtpPort;
                    requestData['server.smtp_auth_code'] = formData.smtpAuthCode;
                }

                // 发起API请求
                const response = await businessApiRequest<ApiResponse<null>>({
                    method: 'PUT',
                    url: '/admin/setting/server/config',
                    data: requestData,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.code === 200) {
                    // 显示保存成功提示
                    setSaveSuccess(true);
                    setTimeout(() => setSaveSuccess(false), 3000);

                    // 重置SMTP修改状态
                    setSmtpModified(false);
                    setVerificationSent(false);
                    setInitialSmtpAccount(formData.smtpAccount);

                    // 触发父组件的保存成功回调
                    if (onSaveSuccess) {
                        onSaveSuccess();
                    }
                } else {
                    // 显示后端返回的错误信息
                    setSubmitError(`${response.msg}`);
                    console.error('保存失败:', response.msg);
                }
            } catch (error) {
                console.error('保存服务配置时出错:', error);
                setSubmitError('保存配置时发生错误，请稍后再试');
            }
        }
    };

    if (loading) {
        return (
            <div className="service-setting-card">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>加载服务配置中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="service-setting-card">
            <div className="service-img-section">
                <div className="service-info-overlay">
                    <div className="service-title">
                        <FiServer className="service-icon" />
                        <h2>服务配置</h2>
                    </div>
                    <div className="service-description">
                        <p>配置API服务的基本参数，包括跨域设置、令牌过期时间和SMTP邮件服务。</p>
                        <p>SMTP配置已从用户设置移至此处，用于发送验证码和通知邮件。</p>
                    </div>
                </div>
            </div>

            <div className="service-setting-form-wrapper">
                {saveSuccess && (
                    <div className="save-notification">
                        <FiAlertCircle />
                        设置已保存成功！
                    </div>
                )}

                <form className="service-setting-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>
                            <FiServer className="input-icon" />
                            服务端口
                        </label>
                        <div className="readonly-value">{port}</div>
                        <p className="port-note">修改服务端口会导致系统无法响应，不可更改</p>
                    </div>

                    <div className="form-group">
                        <div className="label-with-button">
                            <label>
                                <FiGlobe className="input-icon" />
                                跨域来源
                            </label>
                            <button
                                type="button"
                                className="icon-button add-button"
                                onClick={handleAddCorsOrigin}
                                title="添加跨域来源"
                            >
                                <FiPlus />
                            </button>
                        </div>

                        <div className="add-origin-container">
                            <input
                                type="text"
                                value={newCorsOrigin}
                                onChange={(e) => setNewCorsOrigin(e.target.value)}
                                placeholder="输入新的跨域来源，例如: http://localhost:5173"
                                className={errors.newCorsOrigin ? 'has-error' : ''}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleAddCorsOrigin();
                                    }
                                }}
                            />
                            {errors.newCorsOrigin && <div className="error-message">{errors.newCorsOrigin}</div>}
                        </div>

                        {corsOrigins.length > 0 ? (
                            <ul className="origins-list">
                                {corsOrigins.map((origin, index) => (
                                    <li key={index} className="origin-item">
                                        <span>{origin}</span>
                                        <button
                                            type="button"
                                            className="remove-button"
                                            onClick={() => handleRemoveCorsOrigin(index)}
                                            title="删除此跨域来源"
                                        >
                                            <FiX />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="no-origins">暂无跨域来源配置</p>
                        )}
                        {errors.corsOrigins && <div className="error-message">{errors.corsOrigins}</div>}
                    </div>

                    <div className="form-group">
                        <label>
                            <FiKey className="input-icon" />
                            令牌密钥
                        </label>
                        <div className="input-with-button">
                            <input
                                type="text"
                                name="tokenKey"
                                value={formData.tokenKey}
                                onChange={handleInputChange}
                                placeholder="输入令牌密钥或点击右侧按钮自动生成"
                                className={errors.tokenKey ? 'has-error' : ''}
                            />
                            <button
                                type="button"
                                className="generate-button"
                                onClick={generateRandomTokenKey}
                                title="生成随机密钥"
                            >
                                <FiRefreshCw />
                            </button>
                        </div>
                        {errors.tokenKey && <div className="error-message">{errors.tokenKey}</div>}
                    </div>

                    <div className="form-group">
                        <label>
                            <FiClock className="input-icon" />
                            令牌过期时间(小时)
                        </label>
                        <input
                            type="text"
                            name="tokenExpireDuration"
                            value={formData.tokenExpireDuration}
                            onChange={handleInputChange}
                            placeholder="输入令牌过期时间，单位为小时"
                            className={errors.tokenExpireDuration ? 'has-error' : ''}
                        />
                        {errors.tokenExpireDuration && <div className="error-message">{errors.tokenExpireDuration}</div>}
                    </div>

                    <div className="form-group">
                        <label>
                            <FiMail className="input-icon" />
                            SMTP账号
                        </label>
                        <input
                            type="text"
                            name="smtpAccount"
                            value={formData.smtpAccount}
                            onChange={handleInputChange}
                            placeholder="输入SMTP账号"
                            className={errors.smtpAccount ? 'has-error' : ''}
                        />
                        {errors.smtpAccount && <div className="error-message">{errors.smtpAccount}</div>}
                    </div>

                    <div className="form-group">
                        <label>
                            <FiGlobe className="input-icon" />
                            SMTP地址
                        </label>
                        <input
                            type="text"
                            name="smtpAddress"
                            value={formData.smtpAddress}
                            onChange={handleInputChange}
                            placeholder="输入SMTP地址"
                            className={errors.smtpAddress ? 'has-error' : ''}
                        />
                        {errors.smtpAddress && <div className="error-message">{errors.smtpAddress}</div>}
                    </div>

                    <div className="form-group">
                        <label>
                            <FiClock className="input-icon" />
                            SMTP端口
                        </label>
                        <input
                            type="text"
                            name="smtpPort"
                            value={formData.smtpPort}
                            onChange={handleInputChange}
                            placeholder="输入SMTP端口"
                            className={errors.smtpPort ? 'has-error' : ''}
                        />
                        {errors.smtpPort && <div className="error-message">{errors.smtpPort}</div>}
                    </div>

                    {smtpModified && (
                        <>
                            <div className="form-group">
                                <label>
                                    <FiKey className="input-icon" />
                                    SMTP授权码
                                </label>
                                <input
                                    type="password"
                                    name="smtpAuthCode"
                                    value={formData.smtpAuthCode}
                                    onChange={handleInputChange}
                                    placeholder="输入SMTP授权码"
                                    className={errors.smtpAuthCode ? 'has-error' : ''}
                                />
                                {errors.smtpAuthCode && <div className="error-message">{errors.smtpAuthCode}</div>}
                            </div>

                            <div className="form-group">
                                <div className="verification-container">
                                    <input
                                        type="text"
                                        name="verificationCode"
                                        value={formData.verificationCode}
                                        onChange={handleInputChange}
                                        placeholder="请输入验证码"
                                        className={`verification-input ${errors.verificationCode ? 'has-error' : ''}`}
                                    />
                                    <button
                                        type="button"
                                        className="send-code-button"
                                        onClick={handleSendSMTPVerificationCode}
                                        disabled={smtpVerifying || !formData.smtpAuthCode}
                                    >
                                        <FiSend className="button-icon" />
                                        {smtpVerifying ? '发送中...' : '获取验证码'}
                                    </button>
                                </div>
                                {verificationSent && <div className="success-message">验证码已发送，请检查您的邮箱</div>}
                                {errors.smtpVerification && <div className="error-message">{errors.smtpVerification}</div>}
                                {errors.verificationCode && <div className="error-message">{errors.verificationCode}</div>}
                            </div>
                        </>
                    )}

                    <button type="submit" className="submit-button">
                        保存配置
                    </button>

                    {submitError && (
                        <div className="submit-error">
                            <FiAlertCircle className="error-icon" />
                            {submitError}
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ServiceSetting; 