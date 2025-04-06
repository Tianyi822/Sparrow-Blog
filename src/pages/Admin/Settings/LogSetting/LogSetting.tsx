import React, { useState } from 'react';
import { FiFile, FiCpu, FiAlertCircle, FiType, FiLayers, FiClock, FiArchive } from 'react-icons/fi';
import './LogSetting.scss';

interface LogConfigProps {
    onSaveSuccess?: () => void;
}

const LogSetting: React.FC<LogConfigProps> = ({onSaveSuccess}) => {
    // 表单状态
    const [formData, setFormData] = useState({
        logLevel: 'info',
        logFileDir: '/var/log/h2blog',
        logMaxDays: '30',
        logMaxSize: '10',
        logMaxFiles: '5',
        logCompression: true,
    });

    // 错误状态
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [saveSuccess, setSaveSuccess] = useState(false);

    // 处理输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value, type} = e.target as HTMLInputElement;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData({
                ...formData,
                [name]: checked,
            });
        } else {
            setFormData({
                ...formData,
                [name]: value,
            });
        }

        // 清除对应字段的错误
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: '',
            });
        }
    };

    // 表单验证
    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        // 验证日志目录
        if (!formData.logFileDir) {
            newErrors.logFileDir = '请输入日志目录';
        }

        // 验证最大保存时间
        if (!formData.logMaxDays) {
            newErrors.logMaxDays = '请输入日志最大保存时间';
        } else if (!/^\d+$/.test(formData.logMaxDays)) {
            newErrors.logMaxDays = '日志最大保存时间必须为数字';
        }

        // 验证日志大小
        if (!formData.logMaxSize) {
            newErrors.logMaxSize = '请输入日志最大大小';
        } else if (!/^\d+$/.test(formData.logMaxSize)) {
            newErrors.logMaxSize = '日志最大大小必须为数字';
        }

        // 验证日志文件数量
        if (!formData.logMaxFiles) {
            newErrors.logMaxFiles = '请输入日志最大文件数';
        } else if (!/^\d+$/.test(formData.logMaxFiles)) {
            newErrors.logMaxFiles = '日志最大文件数必须为数字';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 处理表单提交
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            // 这里添加API调用逻辑
            console.log('提交日志配置:', formData);

            // 显示保存成功提示
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);

            // 触发父组件的保存成功回调
            if (onSaveSuccess) {
                onSaveSuccess();
            }
        }
    };

    return (
        <div className="log-setting-card">
            <div className="log-img-section">
                <div className="log-info-overlay">
                    <div className="log-title">
                        <FiCpu className="log-icon"/>
                        <h2>日志设置</h2>
                    </div>
                    <div className="log-description">
                        <p>配置系统日志记录方式、级别和存储选项。</p>
                        <p>日志对于系统监控、问题排查和性能分析至关重要。</p>
                    </div>
                </div>
            </div>

            <div className="log-setting-form-wrapper">
                {saveSuccess && (
                    <div className="save-notification">
                        <FiAlertCircle/>
                        设置已保存成功！
                    </div>
                )}

                <form className="log-setting-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>
                            <FiType className="input-icon"/>
                            日志级别
                        </label>
                        <select
                            name="logLevel"
                            value={formData.logLevel}
                            onChange={handleInputChange}
                            className={errors.logLevel ? 'has-error' : ''}
                        >
                            <option value="debug">Debug</option>
                            <option value="info">Info</option>
                            <option value="warn">Warn</option>
                            <option value="error">Error</option>
                        </select>
                        {errors.logLevel && <div className="error-message">{errors.logLevel}</div>}
                    </div>

                    <div className="form-group">
                        <label>
                            <FiFile className="input-icon"/>
                            日志目录
                        </label>
                        <input
                            type="text"
                            name="logFileDir"
                            value={formData.logFileDir}
                            onChange={handleInputChange}
                            placeholder="输入日志存储目录，如/var/log/h2blog"
                            className={errors.logFileDir ? 'has-error' : ''}
                        />
                        <div className="help-text">留空时后端将使用默认路径 ~/.h2blog/log</div>
                        {errors.logFileDir && <div className="error-message">{errors.logFileDir}</div>}
                    </div>

                    <div className="form-group">
                        <label>
                            <FiClock className="input-icon"/>
                            最大保存时间(天)
                        </label>
                        <input
                            type="text"
                            name="logMaxDays"
                            value={formData.logMaxDays}
                            onChange={handleInputChange}
                            placeholder="输入日志最大保存时间，单位为天"
                            className={errors.logMaxDays ? 'has-error' : ''}
                        />
                        {errors.logMaxDays && <div className="error-message">{errors.logMaxDays}</div>}
                    </div>

                    <div className="form-group">
                        <label>
                            <FiLayers className="input-icon"/>
                            单文件最大容量(MB)
                        </label>
                        <input
                            type="text"
                            name="logMaxSize"
                            value={formData.logMaxSize}
                            onChange={handleInputChange}
                            placeholder="输入单个日志文件最大大小，单位为MB"
                            className={errors.logMaxSize ? 'has-error' : ''}
                        />
                        {errors.logMaxSize && <div className="error-message">{errors.logMaxSize}</div>}
                    </div>

                    <div className="form-group">
                        <label>
                            <FiLayers className="input-icon"/>
                            最大备份数量
                        </label>
                        <input
                            type="text"
                            name="logMaxFiles"
                            value={formData.logMaxFiles}
                            onChange={handleInputChange}
                            placeholder="输入最大保留的日志文件数量"
                            className={errors.logMaxFiles ? 'has-error' : ''}
                        />
                        {errors.logMaxFiles && <div className="error-message">{errors.logMaxFiles}</div>}
                    </div>

                    <div className="form-group checkbox-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="logCompression"
                                checked={formData.logCompression}
                                onChange={handleInputChange}
                            />
                            <span className="checkbox-text">
                <FiArchive className="input-icon"/>
                启用日志压缩
              </span>
                        </label>
                    </div>

                    <button type="submit" className="submit-button">
                        保存配置
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LogSetting; 