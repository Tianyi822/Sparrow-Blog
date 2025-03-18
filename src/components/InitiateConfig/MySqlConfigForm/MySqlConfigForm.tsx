import { saveMySQLConfig } from '@/services/configService.ts';
import { AxiosError } from 'axios';
import React, { useState } from 'react';
import { FiDatabase, FiLock, FiServer, FiSettings, FiUser, FiRefreshCw, FiClock } from 'react-icons/fi';
import './MySqlConfigForm.scss';

interface ValidationErrors {
    [key: string]: string;
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

// 字段映射配置
const FIELD_CONFIG = {
    username: {
        label: '数据库用户名',
        icon: <FiUser />,
        name: 'username',
        placeholder: 'root',
        validate: (value: string) => {
            if (!value.trim()) {
                return '数据库用户名不能为空';
            }
            return '';
        }
    },
    password: {
        label: '数据库密码',
        icon: <FiLock />,
        name: 'password',
        placeholder: '请输入数据库密码',
        validate: (value: string) => {
            if (!value.trim()) {
                return '数据库密码不能为空';
            }
            return '';
        }
    },
    host: {
        label: '数据库主机地址',
        icon: <FiServer />,
        name: 'host',
        placeholder: '127.0.0.1',
        validate: (value: string) => {
            if (!value.trim()) {
                return '数据库主机地址不能为空';
            }
            return '';
        }
    },
    port: {
        label: '数据库端口号',
        icon: <FiSettings />,
        name: 'port',
        placeholder: '3306',
        validate: (value: string) => {
            const portNum = parseInt(value);
            if (isNaN(portNum) || !Number.isInteger(portNum)) {
                return '端口号必须为整数';
            }
            if (portNum < 0 || portNum > 65535) {
                return '端口号必须在0~65535之间';
            }
            return '';
        }
    },
    database: {
        label: '数据库名称',
        icon: <FiDatabase />,
        name: 'database',
        placeholder: 'H2_BLOG_SERVER',
        validate: (value: string) => {
            if (!value.trim()) {
                return '数据库名称不能为空';
            }
            return '';
        }
    },
    maxOpenConns: {
        label: '最大数据库连接数',
        icon: <FiRefreshCw />,
        name: 'maxOpenConns',
        placeholder: '10',
        validate: (value: string) => {
            const conns = parseInt(value);
            if (isNaN(conns) || !Number.isInteger(conns)) {
                return '最大连接数必须为整数';
            }
            if (conns <= 0) {
                return '最大连接数必须大于0';
            }
            return '';
        }
    },
    maxIdleConns: {
        label: '最大空闲连接数',
        icon: <FiClock />,
        name: 'maxIdleConns',
        placeholder: '5',
        validate: (value: string, formData: MySQLFormData) => {
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
    }
};

const MySqlConfigForm: React.FC = () => {
    // 状态定义
    const [formData, setFormData] = useState<MySQLFormData>({
        username: '',
        password: '',
        host: '127.0.0.1',
        port: '3306',
        database: 'H2_BLOG_SERVER',
        maxOpenConns: '10',
        maxIdleConns: '5'
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [submitError, setSubmitError] = useState<string>('');
    const [errorData, setErrorData] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [successMessage, setSuccessMessage] = useState<string>('');

    // 处理输入变化
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        
        // 找出对应的字段
        const fieldKey = Object.keys(FIELD_CONFIG).find(
            key => FIELD_CONFIG[key as keyof typeof FIELD_CONFIG].name === name
        ) as keyof MySQLFormData | undefined;
        
        if (!fieldKey) return;
        
        let processedValue = value;
        
        // 特殊处理端口字段，确保只有数字
        if (fieldKey === 'port') {
            processedValue = value.replace(/\D/g, '');
            const numValue = parseInt(processedValue, 10);
            // 范围检查
            if (!isNaN(numValue) && numValue > 65535) {
                processedValue = '65535';
            }
        }
        
        // 处理maxOpenConns和maxIdleConns字段，确保只有数字
        if (fieldKey === 'maxOpenConns' || fieldKey === 'maxIdleConns') {
            processedValue = value.replace(/\D/g, '');
        }

        setFormData(prev => ({ ...prev, [fieldKey]: processedValue }));

        // 清除该字段的错误
        if (errors[fieldKey]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldKey];
                return newErrors;
            });
        }
        
        // 清除成功和错误消息
        if (successMessage) setSuccessMessage('');
        if (submitError) setSubmitError('');
    };

    // 验证单个字段
    const validateField = (field: keyof MySQLFormData): string => {
        const config = FIELD_CONFIG[field];
        if (!config) return '';
        
        // 处理特殊字段（maxIdleConns需要传递formData进行比较）
        if (field === 'maxIdleConns') {
            return config.validate(formData[field], formData);
        }
        
        return (config.validate as (value: string) => string)(formData[field]);
    };

    // 验证所有字段
    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        let isValid = true;

        // 遍历所有字段进行验证
        Object.keys(FIELD_CONFIG).forEach(field => {
            const fieldKey = field as keyof MySQLFormData;
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
            const response = await saveMySQLConfig(formData);

            // 处理非200响应
            if (response && response.code !== 200) {
                setSubmitError(response.msg || '数据库配置保存失败，请检查输入内容');
                if (response.data !== null && response.data !== undefined) {
                    setErrorData(response.data as unknown as Record<string, unknown>);
                }
                return;
            }

            // 成功提交
            setSuccessMessage('数据库配置保存成功！');
        } catch (error: unknown) {
            console.error('Failed to save MySQL config:', error);
            
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
        <div className="mysql-config-form-container">
            <h2>数据库配置</h2>
            
            <form onSubmit={handleSubmit}>
                {/* 动态生成表单字段 */}
                {Object.entries(FIELD_CONFIG).map(([key, config]) => {
                    const fieldKey = key as keyof MySQLFormData;
                    return (
                        <div className="form-group" key={fieldKey}>
                            <label htmlFor={fieldKey}>
                                <span className="icon">{config.icon}</span>
                                {config.label}
                            </label>
                            <input
                                type={fieldKey === 'password' ? 'password' : 'text'}
                                id={fieldKey}
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
        </div>
    );
};

export default MySqlConfigForm;