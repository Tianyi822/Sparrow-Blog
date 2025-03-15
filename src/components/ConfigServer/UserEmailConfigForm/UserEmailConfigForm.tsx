import React, { useState } from 'react';
import './UserEmailConfigForm.scss';

interface ValidationErrors {
    username?: string;
    email?: string;
    smtpUsername?: string;
    smtpServer?: string;
    smtpPort?: string;
    smtpPassword?: string;
}

interface UserEmailConfigFormProps {
    onSubmit?: (formData: UserEmailConfigFormData) => void;
    initialData?: UserEmailConfigFormData;
    serverError?: string;
}

export interface UserEmailConfigFormData {
    username: string;
    email: string;
    smtpUsername: string;
    smtpServer: string;
    smtpPort: string;
    smtpPassword: string;
}

const UserEmailConfigForm: React.FC<UserEmailConfigFormProps> = ({ onSubmit, initialData, serverError }) => {
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [formData, setFormData] = useState<UserEmailConfigFormData>({
        username: initialData?.username || '',
        email: initialData?.email || '',
        smtpUsername: initialData?.smtpUsername || '',
        smtpServer: initialData?.smtpServer || '',
        smtpPort: initialData?.smtpPort || '465',
        smtpPassword: initialData?.smtpPassword || ''
    });

    // Keep SMTP username in sync with email
    const [syncWithEmail, setSyncWithEmail] = useState<boolean>(
        !initialData?.smtpUsername || initialData.smtpUsername === initialData.email
    );

    const validateField = (name: string, value: string): string => {
        switch (name) {
            case 'username':
                if (!value.trim()) {
                    return '用户名不能为空';
                }
                return '';

            case 'email':
                if (!value.trim()) {
                    return '用户邮箱不能为空';
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return '请输入有效的邮箱地址';
                }
                return '';

            case 'smtpUsername':
                if (!value.trim()) {
                    return 'SMTP 邮箱账号不能为空';
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    return '请输入有效的邮箱地址';
                }
                return '';

            case 'smtpServer':
                if (!value.trim()) {
                    return 'SMTP 服务器地址不能为空';
                }
                return '';

            case 'smtpPort': {
                const port = parseInt(value);
                if (isNaN(port) || !Number.isInteger(port)) {
                    return 'SMTP 端口必须为整数';
                }
                if (port < 0 || port > 65535) {
                    return 'SMTP 端口必须在0~65535之间';
                }
                return '';
            }

            case 'smtpPassword':
                if (!value.trim()) {
                    return 'SMTP 密码不能为空';
                }
                return '';

            default:
                return '';
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        
        // Update form data
        setFormData(prev => {
            const updated = {
                ...prev,
                [name]: value
            };
            
            // If email field is updated and sync is enabled, update SMTP username too
            if (name === 'email' && syncWithEmail) {
                updated.smtpUsername = value;
            }
            
            return updated;
        });

        // Validate the field
        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    const handleSyncToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const isChecked = e.target.checked;
        setSyncWithEmail(isChecked);
        
        if (isChecked) {
            // Update SMTP username to match email
            setFormData(prev => ({
                ...prev,
                smtpUsername: prev.email
            }));
            
            // Clear any errors for SMTP username
            setErrors(prev => ({
                ...prev,
                smtpUsername: validateField('smtpUsername', formData.email)
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Always update SMTP username with email before validation if sync is enabled
        if (syncWithEmail) {
            setFormData(prev => ({
                ...prev,
                smtpUsername: prev.email
            }));
        }

        // 验证所有字段
        const newErrors: ValidationErrors = {};
        Object.entries(formData).forEach(([key, value]) => {
            const error = validateField(key, value);
            if (error) {
                newErrors[key as keyof ValidationErrors] = error;
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
        <div className="user-email-config-form-container">
            <div className="card-glow"></div>
            <div className="card-border-glow"></div>

            <h2>用户与邮箱配置</h2>

            <form onSubmit={handleSubmit}>
                <div className="form-section-header">
                    <h3>
                        <span className="icon">👤</span>
                        用户信息
                    </h3>
                </div>
                
                <div className="form-group">
                    <label htmlFor="username">
                        <span className="icon">👤</span>
                        用户名
                    </label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                    />
                    {errors.username && <div className="error-message">{errors.username}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="email">
                        <span className="icon">📧</span>
                        用户邮箱
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                    />
                    {errors.email && <div className="error-message">{errors.email}</div>}
                </div>

                <div className="form-section-header">
                    <h3>
                        <span className="icon">📨</span>
                        SMTP 服务设置
                    </h3>
                </div>

                <div className="form-group checkbox-group">
                    <input
                        type="checkbox"
                        id="syncWithEmail"
                        checked={syncWithEmail}
                        onChange={handleSyncToggle}
                    />
                    <label htmlFor="syncWithEmail">使用用户邮箱作为 SMTP 账号</label>
                </div>

                {!syncWithEmail && (
                    <div className="form-group">
                        <label htmlFor="smtpUsername">
                            <span className="icon">📧</span>
                            SMTP 邮箱账号
                        </label>
                        <input
                            type="email"
                            id="smtpUsername"
                            name="smtpUsername"
                            value={formData.smtpUsername}
                            onChange={handleChange}
                        />
                        {errors.smtpUsername && <div className="error-message">{errors.smtpUsername}</div>}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="smtpServer">
                        <span className="icon">🖥️</span>
                        SMTP 服务器地址
                    </label>
                    <input
                        type="text"
                        id="smtpServer"
                        name="smtpServer"
                        value={formData.smtpServer}
                        onChange={handleChange}
                        placeholder="例如: smtp.gmail.com"
                    />
                    {errors.smtpServer && <div className="error-message">{errors.smtpServer}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="smtpPort">
                        <span className="icon">🔌</span>
                        SMTP 端口
                    </label>
                    <input
                        type="text"
                        id="smtpPort"
                        name="smtpPort"
                        value={formData.smtpPort}
                        onChange={handleChange}
                    />
                    {errors.smtpPort && <div className="error-message">{errors.smtpPort}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="smtpPassword">
                        <span className="icon">🔑</span>
                        SMTP 密码
                    </label>
                    <input
                        type="password"
                        id="smtpPassword"
                        name="smtpPassword"
                        value={formData.smtpPassword}
                        onChange={handleChange}
                    />
                    {errors.smtpPassword && <div className="error-message">{errors.smtpPassword}</div>}
                </div>

                <button type="submit" className="submit-button">保存配置</button>
                {serverError && <div className="server-error-message">{serverError}</div>}
            </form>
        </div>
    );
};

export default UserEmailConfigForm;