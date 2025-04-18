import React, { useState, useEffect } from 'react';
import { FiDatabase, FiUser, FiLock, FiServer, FiSettings, FiRefreshCw, FiClock, FiAlertCircle } from 'react-icons/fi';
import './DatabaseSetting.scss';
import { getMySQLConfig, updateMySQLConfig } from '@/services/adminService';

interface DatabaseFormData {
    username: string;
    password: string;
    host: string;
    port: string;
    database: string;
    maxOpenConns: string;
    maxIdleConns: string;
}

interface ValidationErrors {
    [key: string]: string;
}

interface DatabaseConfigProps {
    onSaveSuccess?: () => void;
}

const DatabaseSetting: React.FC<DatabaseConfigProps> = ({onSaveSuccess}) => {
    const [formData, setFormData] = useState<DatabaseFormData>({
        username: '',
        password: '',
        host: '127.0.0.1',
        port: '3306',
        database: 'H2_BLOG_SERVER',
        maxOpenConns: '10',
        maxIdleConns: '5'
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // 加载数据库配置
    useEffect(() => {
        const fetchDatabaseConfig = async () => {
            try {
                setLoading(true);
                setSubmitError(null);

                const response = await getMySQLConfig();

                if (response.code === 200 && response.data) {
                    const { user, host, port, database, max_open, max_idle } = response.data;

                    // 设置表单数据
                    setFormData({
                        username: user || '',
                        password: '', // 密码通常不会从后端返回
                        host: host || '127.0.0.1',
                        port: port ? port.toString() : '3306',
                        database: database || '',
                        maxOpenConns: max_open ? max_open.toString() : '10',
                        maxIdleConns: max_idle ? max_idle.toString() : '5'
                    });
                } else {
                    // 显示后端返回的错误信息
                    setSubmitError(`获取数据库配置失败: ${response.msg}`);
                    console.error('获取数据库配置失败:', response.msg);
                }
            } catch (error) {
                console.error('获取数据库配置时出错:', error);
                setSubmitError('获取数据库配置时发生错误，请稍后再试');
            } finally {
                setLoading(false);
            }
        };

        fetchDatabaseConfig();
    }, []);

    const validateField = (name: string, value: string): string => {
        switch (name) {
            case 'username':
                return value.trim() ? '' : '数据库用户名不能为空';
            case 'password':
                return value.trim() ? '' : '数据库密码不能为空';
            case 'host':
                return value.trim() ? '' : '数据库主机地址不能为空';
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
                return value.trim() ? '' : '数据库名称不能为空';
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
                const idleConns = parseInt(value);
                if (isNaN(idleConns) || !Number.isInteger(idleConns)) {
                    return '最大空闲连接数必须为整数';
                }
                if (idleConns < 0) {
                    return '最大空闲连接数不能为负数';
                }
                const maxOpen = parseInt(formData.maxOpenConns);
                if (!isNaN(maxOpen) && idleConns > maxOpen) {
                    return '最大空闲连接数不能大于最大连接数';
                }
                return '';
            }
            default:
                return '';
        }
    };

    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        let isValid = true;

        Object.entries(formData).forEach(([key, value]) => {
            const error = validateField(key, value);
            if (error) {
                newErrors[key] = error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;

        // 处理数字输入
        let processedValue = value;
        if (name === 'port' || name === 'maxOpenConns' || name === 'maxIdleConns') {
            processedValue = value.replace(/\D/g, '');
        }

        setFormData(prev => ({...prev, [name]: processedValue}));

        // 清除错误
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[name];
                return newErrors;
            });
        }

        // 如果有成功消息，清除它
        if (saveSuccess) {
            setSaveSuccess(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitError(null);
        setIsSubmitting(true);

        try {
            // 准备数据
            const user = formData.username;
            const password = formData.password;
            const host = formData.host;
            const port = parseInt(formData.port);
            const database = formData.database;
            const maxOpen = parseInt(formData.maxOpenConns);
            const maxIdle = parseInt(formData.maxIdleConns);

            // 调用API更新数据库配置
            const response = await updateMySQLConfig(
                user,
                password,
                host,
                port,
                database,
                maxOpen,
                maxIdle
            );

            if (response.code === 200) {
                // 显示成功消息
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);

                // 如果有回调函数，调用它
                if (onSaveSuccess) {
                    onSaveSuccess();
                }
            } else {
                // 显示后端返回的错误信息
                setSubmitError(`${response.msg}`);
                console.error('保存失败:', response.msg);
            }
        } catch (error) {
            console.error('保存数据库配置时出错:', error);
            setSubmitError('保存配置时发生错误，请稍后再试');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="database-setting-card">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>加载数据库配置中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="database-setting-card">
            <div className="database-img-section">
                <div className="database-info-overlay">
                    <div className="database-title">
                        <FiDatabase className="database-icon"/>
                        <h2>数据库配置</h2>
                    </div>
                    <div className="database-description">
                        <p>
                            在这里配置您的数据库连接信息，包括用户名、密码、主机地址、端口等。这些配置将用于建立与数据库的连接，确保您的博客能够正常存储和检索数据。
                        </p>
                        <p>
                            请确保提供正确的数据库连接信息，以避免连接问题。所有字段均为必填项。
                        </p>
                    </div>
                </div>
            </div>

            <div className="database-setting-form-wrapper">
                {saveSuccess && (
                    <div className="save-notification">
                        <FiAlertCircle/>
                        设置已保存成功！
                    </div>
                )}

                <form className="database-setting-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>
                            <FiUser className="input-icon"/>
                            数据库用户名
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder="root"
                            className={errors.username ? 'has-error' : ''}
                        />
                        {errors.username && <div className="error-message">{errors.username}</div>}
                    </div>

                    <div className="form-group">
                        <label>
                            <FiLock className="input-icon"/>
                            数据库密码
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="请输入数据库密码"
                            className={errors.password ? 'has-error' : ''}
                        />
                        {errors.password && <div className="error-message">{errors.password}</div>}
                    </div>

                    <div className="form-group">
                        <label>
                            <FiServer className="input-icon"/>
                            数据库主机地址
                        </label>
                        <input
                            type="text"
                            name="host"
                            value={formData.host}
                            onChange={handleInputChange}
                            placeholder="127.0.0.1"
                            className={errors.host ? 'has-error' : ''}
                        />
                        {errors.host && <div className="error-message">{errors.host}</div>}
                    </div>

                    <div className="form-group">
                        <label>
                            <FiSettings className="input-icon"/>
                            数据库端口
                        </label>
                        <input
                            type="text"
                            name="port"
                            value={formData.port}
                            onChange={handleInputChange}
                            placeholder="3306"
                            className={errors.port ? 'has-error' : ''}
                        />
                        {errors.port && <div className="error-message">{errors.port}</div>}
                    </div>

                    <div className="form-group">
                        <label>
                            <FiDatabase className="input-icon"/>
                            数据库名称
                        </label>
                        <input
                            type="text"
                            name="database"
                            value={formData.database}
                            onChange={handleInputChange}
                            placeholder="H2_BLOG_SERVER"
                            className={errors.database ? 'has-error' : ''}
                        />
                        {errors.database && <div className="error-message">{errors.database}</div>}
                    </div>

                    <div className="form-group">
                        <label>
                            <FiRefreshCw className="input-icon"/>
                            最大连接数
                        </label>
                        <input
                            type="text"
                            name="maxOpenConns"
                            value={formData.maxOpenConns}
                            onChange={handleInputChange}
                            placeholder="10"
                            className={errors.maxOpenConns ? 'has-error' : ''}
                        />
                        {errors.maxOpenConns && <div className="error-message">{errors.maxOpenConns}</div>}
                    </div>

                    <div className="form-group">
                        <label>
                            <FiClock className="input-icon"/>
                            最大空闲连接数
                        </label>
                        <input
                            type="text"
                            name="maxIdleConns"
                            value={formData.maxIdleConns}
                            onChange={handleInputChange}
                            placeholder="5"
                            className={errors.maxIdleConns ? 'has-error' : ''}
                        />
                        {errors.maxIdleConns && <div className="error-message">{errors.maxIdleConns}</div>}
                    </div>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '保存中...' : '保存配置'}
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

export default DatabaseSetting;
