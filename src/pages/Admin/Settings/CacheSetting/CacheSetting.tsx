import React, { useState } from 'react';
import { FiDatabase, FiFolder, FiHardDrive, FiZap, FiAlertCircle } from 'react-icons/fi';
import './CacheSetting.scss';

interface CacheFormData {
    aofEnabled: boolean;
    aofPath: string;
    aofMaxSize: string;
    compressEnabled: boolean;
}

interface ValidationErrors {
    [key: string]: string;
}

interface CacheSettingProps {
    onSaveSuccess?: () => void;
}

const CacheSetting: React.FC<CacheSettingProps> = ({onSaveSuccess}) => {
    const [formData, setFormData] = useState<CacheFormData>({
        aofEnabled: true,
        aofPath: '',
        aofMaxSize: '1',
        compressEnabled: true
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const validateField = (name: string, value: string): string => {
        switch (name) {
            case 'aofPath':
                // AOF路径可以为空
                if (value && !value.endsWith('.aof')) {
                    return 'AOF文件路径必须以.aof结尾';
                }
                return '';
            case 'aofMaxSize': {
                const size = parseFloat(value);
                if (isNaN(size) || size <= 0) {
                    return 'AOF文件最大大小必须为正数';
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

        // 只有在AOF持久化启用时才验证相关字段
        if (formData.aofEnabled) {
            // 验证AOF路径和AOF最大大小
            ['aofPath', 'aofMaxSize'].forEach(field => {
                const fieldKey = field as keyof CacheFormData;
                const error = validateField(field, formData[fieldKey] as string);
                if (error) {
                    newErrors[fieldKey] = error;
                    isValid = false;
                }
            });
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, type, checked} = e.target;

        if (type === 'checkbox') {
            setFormData(prev => ({...prev, [name]: checked}));
        } else {
            setFormData(prev => ({...prev, [name]: value}));
        }

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

        setIsSubmitting(true);

        try {
            // 这里应该调用API保存缓存配置
            // 模拟API调用
            await new Promise(resolve => setTimeout(resolve, 1000));

            // 显示成功消息
            setSaveSuccess(true);

            // 如果有回调函数，调用它
            if (onSaveSuccess) {
                onSaveSuccess();
            }
        } catch (error) {
            console.error('保存缓存配置失败:', error);
            // 如果需要，可以处理错误信息
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="cache-setting-card">
            <div className="cache-img-section">
                <div className="cache-info-overlay">
                    <div className="cache-title">
                        <FiDatabase className="cache-icon"/>
                        <h2>缓存配置</h2>
                    </div>
                    <div className="cache-description">
                        <p>
                            在这里配置系统缓存的持久化选项，包括AOF持久化、压缩设置和文件路径。
                            合理的缓存配置可以提高系统性能并确保数据安全。
                        </p>
                        <p>
                            AOF持久化可以记录所有的写操作，在系统重启时用于重建数据。
                            启用压缩可以减少AOF文件大小，但可能会增加CPU使用率。
                        </p>
                    </div>
                </div>
            </div>

            <div className="cache-setting-form-wrapper">
                {saveSuccess && (
                    <div className="save-notification">
                        <FiAlertCircle/>
                        设置已保存成功！
                    </div>
                )}

                <form className="cache-setting-form" onSubmit={handleSubmit}>
                    <div className="form-group checkbox-group">
                        <label htmlFor="aofEnabled" className="checkbox-label">
                            <input
                                type="checkbox"
                                id="aofEnabled"
                                name="aofEnabled"
                                checked={formData.aofEnabled}
                                onChange={handleInputChange}
                            />
                            <span className="checkbox-icon"></span>
                            <span className="label-text">
                <FiDatabase className="input-icon"/>
                启用AOF持久化
              </span>
                        </label>
                    </div>

                    {formData.aofEnabled && (
                        <>
                            <div className="form-group">
                                <label>
                                    <FiFolder className="input-icon"/>
                                    AOF文件目录
                                </label>
                                <input
                                    type="text"
                                    name="aofPath"
                                    id="aofPath"
                                    value={formData.aofPath}
                                    onChange={handleInputChange}
                                    placeholder="可留空，将使用默认路径"
                                    className={errors.aofPath ? 'has-error' : ''}
                                />
                                <div className="help-text">留空时后端将使用默认路径 ~/.h2blog/aof</div>
                                {errors.aofPath && <div className="error-message">{errors.aofPath}</div>}
                            </div>

                            <div className="form-group">
                                <label>
                                    <FiHardDrive className="input-icon"/>
                                    AOF文件最大大小 (MB)
                                </label>
                                <input
                                    type="text"
                                    name="aofMaxSize"
                                    id="aofMaxSize"
                                    value={formData.aofMaxSize}
                                    onChange={handleInputChange}
                                    placeholder="1"
                                    className={errors.aofMaxSize ? 'has-error' : ''}
                                />
                                {errors.aofMaxSize && <div className="error-message">{errors.aofMaxSize}</div>}
                            </div>

                            <div className="form-group checkbox-group">
                                <label htmlFor="compressEnabled" className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        id="compressEnabled"
                                        name="compressEnabled"
                                        checked={formData.compressEnabled}
                                        onChange={handleInputChange}
                                    />
                                    <span className="checkbox-icon"></span>
                                    <span className="label-text">
                    <FiZap className="input-icon"/>
                    启用压缩
                  </span>
                                </label>
                            </div>
                        </>
                    )}

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? '保存中...' : '保存配置'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CacheSetting; 