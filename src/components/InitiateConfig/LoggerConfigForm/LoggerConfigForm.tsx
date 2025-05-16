import { saveInitiatedLoggerConfig } from '@/services/initiateConfigService.ts';
import { AxiosError } from 'axios';
import React, { useEffect, useState, useCallback } from 'react';
import { FiArchive, FiCalendar, FiDatabase, FiFileText, FiFolder, FiZap } from 'react-icons/fi';
import './LoggerConfigForm.scss';

/**
 * 表单验证错误接口
 */
interface ValidationErrors {
    [key: string]: string;
}

/**
 * 日志配置表单数据接口
 */
export interface LoggerFormData {
    logLevel: string;      // 日志级别 (DEBUG, INFO, WARN, ERROR)
    logPath: string;       // 日志文件保存路径
    maxSize: string;       // 单个日志文件最大大小(MB)
    maxBackups: string;    // 最大备份文件数量
    maxDays: string;       // 日志文件保存天数
    compress: boolean;     // 是否压缩日志文件
}

/**
 * 日志配置表单组件属性接口
 */
interface LoggerConfigFormProps {
    initialData?: LoggerFormData;   // 初始表单数据
    onSubmit?: (data: LoggerFormData) => void;  // 提交回调
    isSubmitted?: boolean;          // 是否已提交
    onNext?: () => void;            // 下一步回调
}

/**
 * 字段映射配置对象
 * 包含每个字段的标签、图标、验证规则等信息
 */
const FIELD_CONFIG = {
    logLevel: {
        label: '日志级别',
        icon: <FiFileText/>,
        name: 'logLevel',
        type: 'select',
        options: ['DEBUG', 'INFO', 'WARN', 'ERROR'],
        validate: (value: string) => {
            if (!['DEBUG', 'INFO', 'WARN', 'ERROR'].includes(value)) {
                return '请选择有效的日志级别';
            }
            return '';
        }
    },
    logPath: {
        label: '日志目录路径',
        icon: <FiFolder/>,
        name: 'logPath',
        type: 'text',
        placeholder: '可留空，后端将使用默认路径',
        validate: () => {
            // 允许为空
            return '';
        }
    },
    maxSize: {
        label: '日志文件最大大小 (MB)',
        icon: <FiDatabase/>,
        name: 'maxSize',
        type: 'text',
        validate: (value: string) => {
            const size = parseFloat(value);
            if (isNaN(size) || size <= 0) {
                return '日志文件最大大小必须为正数';
            }
            return '';
        }
    },
    maxBackups: {
        label: '日志最大备份数量',
        icon: <FiArchive/>,
        name: 'maxBackups',
        type: 'text',
        validate: (value: string) => {
            const backups = parseInt(value);
            if (isNaN(backups) || !Number.isInteger(backups) || backups < 0) {
                return '日志最大备份数量必须为非负整数';
            }
            return '';
        }
    },
    maxDays: {
        label: '日志文件最大保存时间 (天)',
        icon: <FiCalendar/>,
        name: 'maxDays',
        type: 'text',
        placeholder: '7',
        validate: (value: string) => {
            const days = parseInt(value);
            if (isNaN(days) || !Number.isInteger(days) || days < 0) {
                return '日志文件最大保存时间必须为非负整数';
            }
            return '';
        }
    },
    compress: {
        label: '压缩日志文件',
        icon: <FiZap/>,
        name: 'compress',
        type: 'checkbox',
        validate: () => ''
    }
};

/**
 * 日志配置表单组件
 * 用于配置系统日志相关设置，包括日志级别、路径、轮转策略等
 */
const LoggerConfigForm: React.FC<LoggerConfigFormProps> = ({initialData, onSubmit, isSubmitted, onNext}) => {
    // 表单数据状态
    const [formData, setFormData] = useState<LoggerFormData>({
        logLevel: initialData?.logLevel || 'DEBUG',
        logPath: initialData?.logPath || '',
        maxSize: initialData?.maxSize || '10',
        maxBackups: initialData?.maxBackups || '5',
        maxDays: initialData?.maxDays || '7',
        compress: initialData?.compress !== undefined ? initialData.compress : true
    });
    
    // 其他状态定义
    const [errors, setErrors] = useState<ValidationErrors>({});             // 验证错误信息
    const [submitError, setSubmitError] = useState<string>('');             // 提交错误信息
    const [errorData, setErrorData] = useState<Record<string, unknown> | null>(null); // 详细错误数据
    const [loading, setLoading] = useState<boolean>(false);                 // 加载状态
    const [successMessage, setSuccessMessage] = useState<string>('');       // 成功消息
    const [submitSuccess, setSubmitSuccess] = useState<boolean>(isSubmitted || false); // 提交成功状态

    /**
     * 初始数据变更时更新表单
     * 当传入的initialData更改时同步更新表单状态
     */
    useEffect(() => {
        if (initialData) {
            setFormData(prevFormData => ({
                logLevel: initialData.logLevel || 'DEBUG',
                logPath: initialData.logPath || prevFormData.logPath,
                maxSize: initialData.maxSize || prevFormData.maxSize,
                maxBackups: initialData.maxBackups || prevFormData.maxBackups,
                maxDays: initialData.maxDays || prevFormData.maxDays,
                compress: initialData.compress !== undefined ? initialData.compress : prevFormData.compress
            }));
        }
    }, [initialData]);

    /**
     * 清除指定字段的错误信息
     * @param fieldName 字段名称
     */
    const clearFieldError = useCallback((fieldName: string) => {
        if (errors[fieldName]) {
            setErrors(prev => {
                const newErrors = {...prev};
                delete newErrors[fieldName];
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
     * 支持文本输入、选择框和复选框
     * @param e 输入事件
     */
    const handleChange = useCallback((
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const {name, value, type} = e.target;

        // 处理复选框
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));

            // 清除成功和错误消息
            clearFieldError(name);
            clearMessages();
            return;
        }

        let processedValue = value;

        // 处理数字输入字段
        if (name === 'maxSize' || name === 'maxBackups' || name === 'maxDays') {
            // 对于maxSize允许小数点
            if (name === 'maxSize') {
                processedValue = value.replace(/[^\d.]/g, '');
                // 确保只有一个小数点
                const parts = processedValue.split('.');
                if (parts.length > 2) {
                    processedValue = parts[0] + '.' + parts.slice(1).join('');
                }
            } else {
                // 对于maxBackups和maxDays只允许整数
                processedValue = value.replace(/\D/g, '');
            }
        }

        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));

        // 清除该字段的错误
        clearFieldError(name);
        
        // 清除成功和错误消息
        clearMessages();
    }, [clearFieldError, clearMessages]);

    /**
     * 验证单个字段
     * @param field 要验证的字段名
     * @returns 验证错误信息，无错误则返回空字符串
     */
    const validateField = useCallback((field: keyof LoggerFormData): string => {
        const config = FIELD_CONFIG[field];
        if (typeof formData[field] === 'boolean') {
            return '';
        }
        return config.validate(formData[field] as string);
    }, [formData]);

    /**
     * 验证整个表单
     * @returns 表单是否有效
     */
    const validateForm = useCallback((): boolean => {
        const newErrors: ValidationErrors = {};
        let isValid = true;

        // 验证所有字段
        Object.keys(formData).forEach(key => {
            const fieldKey = key as keyof LoggerFormData;
            const errorMessage = validateField(fieldKey);
            if (errorMessage) {
                newErrors[fieldKey] = errorMessage;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    }, [formData, validateField]);

    /**
     * 格式化错误数据显示
     * @param data 错误数据对象
     * @returns 格式化后的JSON字符串
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
            const response = await saveInitiatedLoggerConfig(formData);

            // 处理非200响应
            if (response && response.code !== 200) {
                setSubmitError(response.msg || '日志配置保存失败，请检查输入内容');
                if (response.data !== null && response.data !== undefined) {
                    setErrorData(response.data as unknown as Record<string, unknown>);
                }
                return;
            }

            // 成功提交
            setSuccessMessage('日志配置保存成功！');
            setSubmitSuccess(true);

            // 调用父组件的onSubmit回调函数
            if (onSubmit) {
                onSubmit(formData);
            }
        } catch (error: unknown) {
            console.error('Failed to save logger config:', error);

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
        <div className="logger-config-form-container">
            <h2>日志配置</h2>

            <form onSubmit={handleSubmit}>
                {/* 日志级别选择 */}
                <div className="form-group">
                    <label htmlFor="logLevel">
                        <span className="icon">{FIELD_CONFIG.logLevel.icon}</span>
                        {FIELD_CONFIG.logLevel.label}
                    </label>
                    <select
                        id="logLevel"
                        name="logLevel"
                        value={formData.logLevel}
                        onChange={handleChange}
                    >
                        {FIELD_CONFIG.logLevel.options.map(option => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                    {errors.logLevel && <div className="error-message">{errors.logLevel}</div>}
                </div>

                {/* 日志文件路径 */}
                <div className="form-group">
                    <label htmlFor="logPath">
                        <span className="icon">{FIELD_CONFIG.logPath.icon}</span>
                        {FIELD_CONFIG.logPath.label}
                    </label>
                    <input
                        type="text"
                        id="logPath"
                        name="logPath"
                        value={formData.logPath}
                        onChange={handleChange}
                        placeholder={FIELD_CONFIG.logPath.placeholder}
                    />
                    {errors.logPath && <div className="error-message">{errors.logPath}</div>}
                </div>

                {/* 日志文件最大大小设置 */}
                <div className="form-group">
                    <label htmlFor="maxSize">
                        <span className="icon">{FIELD_CONFIG.maxSize.icon}</span>
                        {FIELD_CONFIG.maxSize.label}
                    </label>
                    <input
                        type="text"
                        id="maxSize"
                        name="maxSize"
                        value={formData.maxSize}
                        onChange={handleChange}
                    />
                    {errors.maxSize && <div className="error-message">{errors.maxSize}</div>}
                </div>

                {/* 日志最大备份数量 */}
                <div className="form-group">
                    <label htmlFor="maxBackups">
                        <span className="icon">{FIELD_CONFIG.maxBackups.icon}</span>
                        {FIELD_CONFIG.maxBackups.label}
                    </label>
                    <input
                        type="text"
                        id="maxBackups"
                        name="maxBackups"
                        value={formData.maxBackups}
                        onChange={handleChange}
                    />
                    {errors.maxBackups && <div className="error-message">{errors.maxBackups}</div>}
                </div>

                {/* 日志文件最大保存时间 */}
                <div className="form-group">
                    <label htmlFor="maxDays">
                        <span className="icon">{FIELD_CONFIG.maxDays.icon}</span>
                        {FIELD_CONFIG.maxDays.label}
                    </label>
                    <input
                        type="text"
                        id="maxDays"
                        name="maxDays"
                        value={formData.maxDays}
                        onChange={handleChange}
                        placeholder={FIELD_CONFIG.maxDays.placeholder}
                    />
                    {errors.maxDays && <div className="error-message">{errors.maxDays}</div>}
                </div>

                {/* 是否压缩日志文件 */}
                <div className="form-group checkbox-group">
                    <input
                        type="checkbox"
                        id="compress"
                        name="compress"
                        checked={formData.compress}
                        onChange={handleChange}
                    />
                    <label htmlFor="compress">
                        <span className="icon">{FIELD_CONFIG.compress.icon}</span>
                        {FIELD_CONFIG.compress.label}
                    </label>
                </div>

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

export default LoggerConfigForm;
