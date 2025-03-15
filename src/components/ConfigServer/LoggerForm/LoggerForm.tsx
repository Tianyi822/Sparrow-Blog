import React, { useState } from 'react';
import './LoggerForm.scss';

interface ValidationErrors {
    logLevel?: string;
    logPath?: string;
    maxSize?: string;
    maxBackups?: string;
    maxDays?: string;
    compress?: string;
}

interface LoggerFormProps {
    onSubmit?: (formData: LoggerFormData) => void;
    initialData?: LoggerFormData;
    serverError?: string;
}

export interface LoggerFormData {
    logLevel: string;
    logPath: string;
    maxSize: string;
    maxBackups: string;
    maxDays: string;
    compress: boolean;
}

const LoggerForm: React.FC<LoggerFormProps> = ({ onSubmit, initialData, serverError }) => {
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [formData, setFormData] = useState<LoggerFormData>({
        logLevel: initialData?.logLevel || 'DEBUG',
        logPath: initialData?.logPath || '~/.h2blog',
        maxSize: initialData?.maxSize || '1',
        maxBackups: initialData?.maxBackups || '10',
        maxDays: initialData?.maxDays || '30',
        compress: initialData?.compress !== undefined ? initialData.compress : true
    });

    const validateField = (name: string, value: string | boolean): string => {
        if (typeof value === 'boolean') return '';
        
        switch (name) {
            case 'logLevel':
                if (!['DEBUG', 'INFO', 'WARN', 'ERROR'].includes(value)) {
                    return '请选择有效的日志级别';
                }
                return '';

            case 'logPath':
                if (!value.trim()) {
                    return '日志文件路径不能为空';
                }
                return '';

            case 'maxSize': {
                const size = parseFloat(value);
                if (isNaN(size) || size <= 0) {
                    return '日志文件最大大小必须为正数';
                }
                return '';
            }

            case 'maxBackups': {
                const backups = parseInt(value);
                if (isNaN(backups) || !Number.isInteger(backups) || backups < 0) {
                    return '日志最大备份数量必须为非负整数';
                }
                return '';
            }

            case 'maxDays': {
                const days = parseInt(value);
                if (isNaN(days) || !Number.isInteger(days) || days < 0) {
                    return '日志文件最大保存时间必须为非负整数';
                }
                return '';
            }

            default:
                return '';
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData({
                ...formData,
                [name]: checked
            });
            return;
        }
        
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // 验证所有字段
        const newErrors: ValidationErrors = {};
        Object.entries(formData).forEach(([key, value]) => {
            if (typeof value !== 'boolean') {
                const error = validateField(key, value);
                if (error) {
                    newErrors[key as keyof ValidationErrors] = error;
                }
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
        <div className="logger-form-container">
            <div className="card-glow"></div>
            <div className="card-border-glow"></div>

            <h2>日志配置</h2>

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="logLevel">
                        <span className="icon">🔍</span>
                        日志级别
                    </label>
                    <select
                        id="logLevel"
                        name="logLevel"
                        value={formData.logLevel}
                        onChange={handleChange}
                    >
                        <option value="DEBUG">DEBUG</option>
                        <option value="INFO">INFO</option>
                        <option value="WARN">WARN</option>
                        <option value="ERROR">ERROR</option>
                    </select>
                    {errors.logLevel && <div className="error-message">{errors.logLevel}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="logPath">
                        <span className="icon">📁</span>
                        日志文件路径
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

                <div className="form-group">
                    <label htmlFor="maxSize">
                        <span className="icon">📊</span>
                        日志文件最大大小 (MB)
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

                <div className="form-group">
                    <label htmlFor="maxBackups">
                        <span className="icon">🗃️</span>
                        日志最大备份数量
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

                <div className="form-group">
                    <label htmlFor="maxDays">
                        <span className="icon">📅</span>
                        日志文件最大保存时间 (天)
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

                <div className="form-group checkbox-group">
                    <input
                        type="checkbox"
                        id="compress"
                        name="compress"
                        checked={formData.compress}
                        onChange={handleChange}
                    />
                    <label htmlFor="compress">压缩日志文件</label>
                </div>

                <button type="submit" className="submit-button">保存配置</button>
                {serverError && <div className="server-error-message">{serverError}</div>}
            </form>
        </div>
    );
};

export default LoggerForm;