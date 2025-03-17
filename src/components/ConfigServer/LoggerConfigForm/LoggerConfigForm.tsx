import { getLoggerConfig, saveLoggerConfig } from '@/services/configService';
import React, { useEffect, useState } from 'react';
import { FiArchive, FiCalendar, FiDatabase, FiFileText, FiFolder, FiZap } from 'react-icons/fi';
import './LoggerConfigForm.scss';

interface ValidationErrors {
    [key: string]: string;
}

export interface LoggerFormData {
    logLevel: string;
    logPath: string;
    maxSize: string;
    maxBackups: string;
    maxDays: string;
    compress: boolean;
}

// 字段映射配置
const FIELD_CONFIG = {
    logLevel: {
        label: '日志级别',
        icon: <FiFileText />,
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
        label: '日志文件路径',
        icon: <FiFolder />,
        name: 'logPath',
        type: 'text',
        validate: (value: string) => {
            if (!value.trim()) {
                return '日志文件路径不能为空';
            }
            return '';
        }
    },
    maxSize: {
        label: '日志文件最大大小 (MB)',
        icon: <FiDatabase />,
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
        icon: <FiArchive />,
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
        icon: <FiCalendar />,
        name: 'maxDays',
        type: 'text',
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
        icon: <FiZap />,
        name: 'compress',
        type: 'checkbox',
        validate: () => ''
    }
};

const LoggerConfigForm: React.FC = () => {
    // 状态定义
    const [formData, setFormData] = useState<LoggerFormData>({
        logLevel: 'DEBUG',
        logPath: '~/.h2blog',
        maxSize: '1',
        maxBackups: '10',
        maxDays: '30',
        compress: true
    });
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [submitError, setSubmitError] = useState<string>('');
    const [errorData, setErrorData] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState<boolean>(false);

    // 初始化加载数据
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const data = await getLoggerConfig();
                if (data) {
                    setFormData({
                        logLevel: data.logLevel || 'DEBUG',
                        logPath: data.logPath || '~/.h2blog',
                        maxSize: data.maxSize || '1',
                        maxBackups: data.maxBackups || '10',
                        maxDays: data.maxDays || '30',
                        compress: data.compress !== undefined ? data.compress : true
                    });
                }
            } catch (error) {
                console.error('Failed to fetch logger config:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // 处理输入变化
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({
                ...prev,
                [name]: checked
            }));
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
        if (errors[name]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    // 验证单个字段
    const validateField = (field: keyof LoggerFormData): string => {
        const config = FIELD_CONFIG[field];
        return config.validate(formData[field] as string);
    };

    // 验证所有字段
    const validateForm = (): boolean => {
        const newErrors: ValidationErrors = {};
        let isValid = true;

        // 遍历所有字段进行验证
        Object.keys(FIELD_CONFIG).forEach(field => {
            const fieldKey = field as keyof LoggerFormData;
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

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            const response = await saveLoggerConfig(formData);

            // 处理非200响应
            if (response && response.code !== 200) {
                setSubmitError(response.msg || '提交失败');
                if (response.data) {
                    // 将response.data转换为Record<string, unknown>类型
                    setErrorData(response.data as unknown as Record<string, unknown>);
                }
                return;
            }

            // 成功提交
            alert('配置保存成功');
        } catch (error) {
            console.error('Failed to save logger config:', error);
            setSubmitError('提交过程中发生错误');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="logger-form-container">
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
                            <option key={option} value={option}>{option}</option>
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
                    />
                    {errors.logPath && <div className="error-message">{errors.logPath}</div>}
                </div>

                {/* 日志文件最大大小 */}
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
                    />
                    {errors.maxDays && <div className="error-message">{errors.maxDays}</div>}
                </div>

                {/* 压缩日志文件 */}
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

                <button
                    type="submit"
                    className="submit-button"
                    disabled={loading}
                >
                    {loading ? '提交中...' : '保存配置'}
                </button>

                {/* 显示提交错误信息 */}
                {submitError && (
                    <div className="error-message-container">
                        <div className="error-message">{submitError}</div>
                        {errorData && (
                            <div className="error-details">
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