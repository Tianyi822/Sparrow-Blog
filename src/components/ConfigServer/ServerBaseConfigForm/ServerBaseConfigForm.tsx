import React, { useState } from 'react';
import './ServerBaseConfigForm.scss';

interface ValidationErrors {
    port?: string;
    tokenSecret?: string;
    tokenExpiration?: string;
    corsOrigin?: string;
}

/**
 * 检查给定的字符串是否为有效的URL
 *
 * @param url 待检查的URL字符串
 * @returns 如果字符串是有效的URL则返回true，否则返回false
 */
const isValidUrl = (url: string): boolean => {
    try {
        // 尝试使用URL构造函数解析传入的字符串
        new URL(url);
        // 如果解析成功，则说明字符串是一个有效的URL
        return true;
    } catch {
        // 如果解析失败，则说明字符串不是一个有效的URL
        return false;
    }
};

interface ServerBaseFormProps {
    onSubmit?: (formData: ServerBaseFormData) => void;
    initialData?: ServerBaseFormData;
    serverError?: string; // 添加后端错误信息属性
}

export interface ServerBaseFormData {
    port: string;
    tokenSecret: string;
    tokenExpiration: string;
    corsOrigin: string;
}

/**
 * ServerBaseConfigForm 是一个 React 函数组件，用于配置服务的基础信息。
 *
 * @param {ServerBaseFormProps} props - 组件的属性对象。
 *   - onSubmit: 表单提交时的回调函数，接收表单数据作为参数。
 *   - initialData: 表单的初始数据，用于填充表单字段。
 *   - serverError: 服务器端错误信息，用于显示在表单下方。
 * @returns {JSX.Element} 返回一个包含表单的 JSX 元素，用于配置服务基础信息。
 */
const ServerBaseConfigForm: React.FC<ServerBaseFormProps> = ({ onSubmit, initialData, serverError }) => {
    // 使用 useState 管理表单验证错误和表单数据状态
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [formData, setFormData] = useState<ServerBaseFormData>({
        port: initialData?.port || '3000',
        tokenSecret: initialData?.tokenSecret || '',
        tokenExpiration: initialData?.tokenExpiration || '7',
        corsOrigin: initialData?.corsOrigin || 'http://localhost:3000'
    });

    /**
     * 验证单个表单字段的值是否符合规则。
     *
     * @param {string} name - 字段名称。
     * @param {string} value - 字段值。
     * @returns {string} 返回验证错误信息，如果无错误则返回空字符串。
     */
    const validateField = (name: string, value: string): string => {
        switch (name) {
            case 'port': {
                const portNum = parseInt(value);
                if (isNaN(portNum) || !Number.isInteger(portNum)) {
                    return '端口号必须为整数';
                }
                if (portNum < 0 || portNum > 65535) {
                    return '端口号必须在0~65535之间';
                }
                return '';
            }

            case 'tokenSecret':
                if (!value.trim()) {
                    return 'Token密钥不能为空';
                }
                if (value.includes(' ')) {
                    return 'Token密钥不能包含空格';
                }
                if (value.length < 20) {
                    return 'Token密钥长度必须大于20个字符';
                }
                return '';

            case 'tokenExpiration': {
                const days = parseInt(value);
                if (isNaN(days) || !Number.isInteger(days)) {
                    return 'Token过期时间必须为整数';
                }
                if (days < 0 || days > 30) {
                    return 'Token过期时间必须在0~30天之间';
                }
                return '';
            }

            case 'corsOrigin': {
                if (!value.trim()) {
                    return '跨域源不能为空';
                }
                if (value.includes('，')) {
                    return '请使用英文逗号(,)分隔多个跨域源';
                }
                if (value.includes('*')) {
                    return '不允许使用通配符(*)，请指定具体的域名';
                }
                const origins = value.split(',').map(o => o.trim());
                const invalidOrigins = origins.filter(o => !isValidUrl(o));
                if (invalidOrigins.length > 0) {
                    return '存在无效的跨域源URL格式';
                }
                return '';
            }

            default:
                return '';
        }
    };

    /**
     * 处理表单字段的变更事件，更新表单数据并验证字段。
     *
     * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - 输入事件对象。
     */
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        const error = validateField(name, value);
        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };

    /**
     * 处理表单提交事件，验证所有字段并在无错误时调用 onSubmit 回调。
     *
     * @param {React.FormEvent} e - 表单提交事件对象。
     */
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 验证所有字段并收集错误信息
        const newErrors: ValidationErrors = {};
        Object.entries(formData).forEach(([key, value]) => {
            const error = validateField(key, value);
            if (error) {
                newErrors[key as keyof ValidationErrors] = error;
            }
        });

        setErrors(newErrors);

        // 如果没有错误，则调用 onSubmit 提交表单数据
        if (Object.keys(newErrors).length === 0) {
            if (onSubmit) {
                onSubmit(formData);
            }
        }
    };

    return (
        <div className="server-base-form-container">
            <div className="card-glow"></div>
            <div className="card-border-glow"></div>

            <h2>服务基础配置</h2>

            <form onSubmit={handleSubmit}>
                {/* 端口号输入框 */}
                <div className="form-group">
                    <label htmlFor="port">
                        <span className="icon">🌐</span>
                        服务端口号
                    </label>
                    <input
                        type="text"
                        id="port"
                        name="port"
                        value={formData.port}
                        onChange={handleChange}
                    />
                    {errors.port && <div className="error-message">{errors.port}</div>}
                </div>

                {/* Token 密钥输入框 */}
                <div className="form-group">
                    <label htmlFor="tokenSecret">
                        <span className="icon">🔑</span>
                        Token 密钥 ( 至少20个随机字符 )
                    </label>
                    <input
                        type="text"
                        id="tokenSecret"
                        name="tokenSecret"
                        value={formData.tokenSecret}
                        onChange={handleChange}
                    />
                    {errors.tokenSecret && <div className="error-message">{errors.tokenSecret}</div>}
                </div>

                {/* Token 过期时间输入框 */}
                <div className="form-group">
                    <label htmlFor="tokenExpiration">
                        <span className="icon">⏱️</span>
                        Token 过期时间（天）
                    </label>
                    <input
                        type="text"
                        id="tokenExpiration"
                        name="tokenExpiration"
                        value={formData.tokenExpiration}
                        onChange={handleChange}
                    />
                    {errors.tokenExpiration && <div className="error-message">{errors.tokenExpiration}</div>}
                </div>

                {/* 跨域源输入框 */}
                <div className="form-group">
                    <label htmlFor="corsOrigin">
                        <span className="icon">🌍</span>
                        跨域源 ( 请使用英文逗号分隔 )
                    </label>
                    <input
                        type="text"
                        id="corsOrigin"
                        name="corsOrigin"
                        value={formData.corsOrigin}
                        onChange={handleChange}
                    />
                    {errors.corsOrigin && <div className="error-message">{errors.corsOrigin}</div>}
                </div>

                {/* 提交按钮 */}
                <button type="submit" className="submit-button">保存配置</button>
                {serverError && <div className="server-error-message">{serverError}</div>}
            </form>
        </div>
    );
};


export default ServerBaseConfigForm;