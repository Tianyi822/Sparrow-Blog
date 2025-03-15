import React, { useState } from 'react';
import './MySqlConfigForm.scss';

interface ValidationErrors {
    username?: string;
    password?: string;
    host?: string;
    port?: string;
    database?: string;
    maxOpenConns?: string;
    maxIdleConns?: string;
}

interface MySQLFormProps {
    onSubmit?: (formData: MySQLFormData) => void;
    initialData?: MySQLFormData;
    serverError?: string;
}

export interface MySQLFormData {
    username: string;
    password: string;
    host: string;
    port: string;
    database: string;
    maxOpenConns: string;
    maxIdleConns: string;
}

const MySqlConfigForm: React.FC<MySQLFormProps> = ({ onSubmit, initialData, serverError }) => {
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [formData, setFormData] = useState<MySQLFormData>({
        username: initialData?.username || '',
        password: initialData?.password || '',
        host: initialData?.host || 'localhost',
        port: initialData?.port || '3306',
        database: initialData?.database || 'H2_BLOG_SERVER',
        maxOpenConns: initialData?.maxOpenConns || '10',
        maxIdleConns: initialData?.maxIdleConns || '5'
    });

    const validateField = (name: string, value: string): string => {
        switch (name) {
            case 'username':
                if (!value.trim()) {
                    return '数据库用户名不能为空';
                }
                return '';

            case 'password':
                // Password can be empty in some local development environments,
                // but we'll generally warn users if it's empty
                if (!value.trim()) {
                    return '数据库密码不能为空';
                }
                return '';

            case 'host':
                if (!value.trim()) {
                    return '数据库主机地址不能为空';
                }
                return '';

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

            case 'database':
                if (!value.trim()) {
                    return '数据库名称不能为空';
                }
                return '';

            case 'maxOpenConns': {
                const conns = parseInt(value);
                if (isNaN(conns) || !Number.isInteger(conns)) {
                    return '最大连接数必须为整数';
                }
                if (conns <= 0) {
                    return '最大连接数必须大于0';
                }
                return '';
            }

            case 'maxIdleConns': {
                const conns = parseInt(value);
                if (isNaN(conns) || !Number.isInteger(conns)) {
                    return '最大空闲连接数必须为整数';
                }
                if (conns < 0) {
                    return '最大空闲连接数不能为负数';
                }
                
                const maxOpen = parseInt(formData.maxOpenConns);
                if (!isNaN(maxOpen) && conns > maxOpen) {
                    return '最大空闲连接数不能大于最大连接数';
                }
                
                return '';
            }

            default:
                return '';
        }
    };

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
        
        // Special case for maxIdleConns which depends on maxOpenConns
        if (name === 'maxOpenConns') {
            const idleError = validateField('maxIdleConns', formData.maxIdleConns);
            setErrors(prev => ({
                ...prev,
                maxIdleConns: idleError
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

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
        <div className="mysql-form-container">
            <div className="card-glow"></div>
            <div className="card-border-glow"></div>

            <h2>数据库配置</h2>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">
                        <span className="icon">👤</span>
                        数据库用户名
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
                    <label htmlFor="password">
                        <span className="icon">🔒</span>
                        数据库密码
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                    />
                    {errors.password && <div className="error-message">{errors.password}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="host">
                        <span className="icon">🖥️</span>
                        数据库主机地址
                    </label>
                    <input
                        type="text"
                        id="host"
                        name="host"
                        value={formData.host}
                        onChange={handleChange}
                    />
                    {errors.host && <div className="error-message">{errors.host}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="port">
                        <span className="icon">🔌</span>
                        数据库端口号
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

                <div className="form-group">
                    <label htmlFor="database">
                        <span className="icon">💾</span>
                        数据库名称
                    </label>
                    <input
                        type="text"
                        id="database"
                        name="database"
                        value={formData.database}
                        onChange={handleChange}
                    />
                    {errors.database && <div className="error-message">{errors.database}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="maxOpenConns">
                        <span className="icon">🔄</span>
                        最大数据库连接数
                    </label>
                    <input
                        type="text"
                        id="maxOpenConns"
                        name="maxOpenConns"
                        value={formData.maxOpenConns}
                        onChange={handleChange}
                    />
                    {errors.maxOpenConns && <div className="error-message">{errors.maxOpenConns}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="maxIdleConns">
                        <span className="icon">⏳</span>
                        最大空闲连接数
                    </label>
                    <input
                        type="text"
                        id="maxIdleConns"
                        name="maxIdleConns"
                        value={formData.maxIdleConns}
                        onChange={handleChange}
                    />
                    {errors.maxIdleConns && <div className="error-message">{errors.maxIdleConns}</div>}
                </div>

                <button type="submit" className="submit-button">保存配置</button>
                {serverError && <div className="server-error-message">{serverError}</div>}
            </form>
        </div>
    );
};

export default MySqlConfigForm;