import React, { useState } from 'react';
import './CacheConfigForm.scss';

interface ValidationErrors {
    aofEnabled?: string;
    aofPath?: string;
    aofMaxSize?: string;
    compressEnabled?: string;
}

interface CacheConfigFormProps {
    onSubmit?: (formData: CacheConfigFormData) => void;
    initialData?: CacheConfigFormData;
    serverError?: string;
}

export interface CacheConfigFormData {
    aofEnabled: boolean;
    aofPath: string;
    aofMaxSize: string;
    compressEnabled: boolean;
}

const CacheConfigForm: React.FC<CacheConfigFormProps> = ({ onSubmit, initialData, serverError }) => {
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [formData, setFormData] = useState<CacheConfigFormData>({
        aofEnabled: initialData?.aofEnabled !== undefined ? initialData.aofEnabled : true,
        aofPath: initialData?.aofPath || '~/.h2blog/aof/h2blog.aof',
        aofMaxSize: initialData?.aofMaxSize || '1',
        compressEnabled: initialData?.compressEnabled !== undefined ? initialData.compressEnabled : true
    });

    const validateField = (name: string, value: string | boolean): string => {
        if (typeof value === 'boolean') return '';
        
        switch (name) {
            case 'aofPath':
                if (!value.trim()) {
                    return 'AOF 文件路径不能为空';
                }
                if (!value.endsWith('.aof')) {
                    return 'AOF 文件路径必须以 .aof 结尾';
                }
                return '';

            case 'aofMaxSize': {
                const size = parseFloat(value);
                if (isNaN(size) || size <= 0) {
                    return 'AOF 文件最大大小必须为正数';
                }
                return '';
            }

            default:
                return '';
        }
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const checked = e.target.checked;
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
        <div className="cache-config-form-container">
            <div className="card-glow"></div>
            <div className="card-border-glow"></div>

            <h2>缓存配置</h2>

            <form onSubmit={handleSubmit}>
                <div className="form-group checkbox-group">
                    <input
                        type="checkbox"
                        id="aofEnabled"
                        name="aofEnabled"
                        checked={formData.aofEnabled}
                        onChange={handleChange}
                    />
                    <label htmlFor="aofEnabled">开启 AOF 持久化</label>
                </div>

                {formData.aofEnabled && (
                    <>
                        <div className="form-group">
                            <label htmlFor="aofPath">
                                <span className="icon">📂</span>
                                AOF 文件路径
                            </label>
                            <input
                                type="text"
                                id="aofPath"
                                name="aofPath"
                                value={formData.aofPath}
                                onChange={handleChange}
                            />
                            {errors.aofPath && <div className="error-message">{errors.aofPath}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="aofMaxSize">
                                <span className="icon">📊</span>
                                AOF 文件最大大小 (MB)
                            </label>
                            <input
                                type="text"
                                id="aofMaxSize"
                                name="aofMaxSize"
                                value={formData.aofMaxSize}
                                onChange={handleChange}
                            />
                            {errors.aofMaxSize && <div className="error-message">{errors.aofMaxSize}</div>}
                        </div>

                        <div className="form-group checkbox-group">
                            <input
                                type="checkbox"
                                id="compressEnabled"
                                name="compressEnabled"
                                checked={formData.compressEnabled}
                                onChange={handleChange}
                            />
                            <label htmlFor="compressEnabled">开启压缩</label>
                        </div>
                    </>
                )}

                <button type="submit" className="submit-button">保存配置</button>
                {serverError && <div className="server-error-message">{serverError}</div>}
            </form>
        </div>
    );
};

export default CacheConfigForm; 