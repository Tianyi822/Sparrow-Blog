import { saveInitiatedMySQLConfig } from '@/services/initiateConfigService.ts';
import { AxiosError } from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import { FiClock, FiDatabase, FiLock, FiRefreshCw, FiServer, FiSettings, FiUser } from 'react-icons/fi';
import './MySqlConfigForm.scss';

/**
 * 表单验证错误接口
 */
interface ValidationErrors {
    [key: string]: string;
}

/**
 * MySQL数据库配置表单数据接口
 */
export interface MySQLFormData {
    username: string;      // 数据库用户名
    password: string;      // 数据库密码
    host: string;          // 数据库主机地址
    port: string;          // 数据库端口号
    database: string;      // 数据库名称
    maxOpenConns: string;  // 最大数据库连接数
    maxIdleConns: string;  // 最大空闲连接数
}

/**
 * MySQL配置表单组件属性接口
 */
export interface MySqlConfigFormProps {
    initialData?: MySQLFormData;  // 初始表单数据
    onSubmit?: (data: MySQLFormData) => void;  // 提交回调
    isSubmitted?: boolean;        // 是否已提交
    onNext?: () => void;          // 下一步回调
}

/**
 * 字段映射配置对象
 * 定义表单字段的标签、图标、验证规则等
 */
const FIELD_CONFIG = {
    username: {
        label: '数据库用户名',
        icon: <FiUser/>,
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
        icon: <FiLock/>,
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
        icon: <FiServer/>,
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
        icon: <FiSettings/>,
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
        icon: <FiDatabase/>,
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
        icon: <FiRefreshCw/>,
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
        icon: <FiClock/>,
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

/**
 * MySQL数据库配置表单组件
 * 用于配置系统MySQL数据库连接相关设置
 */
const MySqlConfigForm: React.FC<MySqlConfigFormProps> = ({initialData, onSubmit, isSubmitted, onNext}) => {
    // 表单数据状态
    const [formData, setFormData] = useState<MySQLFormData>({
        username: initialData?.username || '',
        password: initialData?.password || '',
        host: initialData?.host || '127.0.0.1',
        port: initialData?.port || '3306',
        database: initialData?.database || 'H2_BLOG_SERVER',
        maxOpenConns: initialData?.maxOpenConns || '10',
        maxIdleConns: initialData?.maxIdleConns || '5'
    });
    
    // 其他状态定义
    const [errors, setErrors] = useState<ValidationErrors>({});             // 验证错误信息
    const [submitError, setSubmitError] = useState<string>('');             // 提交错误信息
    const [errorData, setErrorData] = useState<Record<string, unknown> | null>(null); // 详细错误数据
    const [loading, setLoading] = useState<boolean>(false);                 // 加载状态
    const [successMessage, setSuccessMessage] = useState<string>('');       // 成功消息
    const [submitSuccess, setSubmitSuccess] = useState<boolean>(isSubmitted || false); // 提交成功状态

    /**
     * 当initialData变化时更新表单数据
     */
    useEffect(() => {
        if (initialData) {
            setFormData(prevFormData => ({
                host: initialData.host || prevFormData.host,
                port: initialData.port || prevFormData.port,
                username: initialData.username || prevFormData.username,
                password: initialData.password || prevFormData.password,
                database: initialData.database || prevFormData.database,
                maxOpenConns: initialData.maxOpenConns || prevFormData.maxOpenConns,
                maxIdleConns: initialData.maxIdleConns || prevFormData.maxIdleConns
            }));
        }
    }, [initialData]);

    /**
     * 清除指定字段的错误信息
     * @param fieldKey 字段名称
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
     * 清除全局消息(错误和成功)
     */
    const clearMessages = useCallback(() => {
        if (submitError) setSubmitError('');
        if (successMessage) setSuccessMessage('');
    }, [submitError, successMessage]);

    /**
     * 处理表单输入变化
     * @param e 输入事件
     */
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;

        // 找出对应的字段
        const fieldKey = Object.keys(FIELD_CONFIG).find(
            key => FIELD_CONFIG[key as keyof typeof FIELD_CONFIG].name === name
        ) as keyof MySQLFormData | undefined;

        if (!fieldKey) return;

        // 特殊处理数字类型的输入
        let processedValue = value;
        if (fieldKey === 'port' || fieldKey === 'maxOpenConns' || fieldKey === 'maxIdleConns') {
            // 确保只接受数字输入
            processedValue = value.replace(/\D/g, '');
        }

        setFormData(prev => ({...prev, [fieldKey]: processedValue}));

        // 清除该字段的错误
        clearFieldError(fieldKey);

        // 清除错误消息和成功消息
        clearMessages();
    }, [clearFieldError, clearMessages]);

    /**
     * 验证单个字段
     * @param field 要验证的字段名
     * @returns 验证错误信息，无错误则返回空字符串
     */
    const validateField = useCallback((field: keyof MySQLFormData): string => {
        const config = FIELD_CONFIG[field];
        // 部分字段的验证需要整个formData作为上下文
        return typeof config.validate === 'function'
            ? config.validate(formData[field], formData)
            : '';
    }, [formData]);

    /**
     * 验证整个表单
     * @returns 表单是否有效
     */
    const validateForm = useCallback((): boolean => {
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
    }, [validateField]);

    /**
     * 格式化错误数据显示
     * @param data 错误数据对象
     * @returns 格式化后的错误信息字符串
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
     * @param e 表单提交事件
     */
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError('');
        setErrorData(null);
        // 不清除成功消息
        // setSuccessMessage('');

        // 表单验证
        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const response = await saveInitiatedMySQLConfig(formData);

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
            setSubmitSuccess(true);

            // 调用父组件的onSubmit回调函数
            if (onSubmit) {
                onSubmit(formData);
            }
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
                        <div className="form-group" key={key}>
                            <label htmlFor={config.name}>
                                <span className="icon">{config.icon}</span>
                                {config.label}
                            </label>
                            <input
                                type={fieldKey === 'password' ? 'password' : 'text'}
                                id={config.name}
                                name={config.name}
                                value={formData[fieldKey]}
                                onChange={handleChange}
                                placeholder={config.placeholder}
                            />
                            {errors[fieldKey] && <div className="error-message">{errors[fieldKey]}</div>}
                        </div>
                    );
                })}

                {/* 操作按钮区域 */}
                <div className="form-actions">
                    <button
                        type="submit"
                        className="submit-button"
                        disabled={loading}
                    >
                        {loading ? '提交中...' : '保存配置'}
                    </button>

                    {/* 提交成功时显示下一步按钮 */}
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
                        {/* 显示详细错误数据 */}
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