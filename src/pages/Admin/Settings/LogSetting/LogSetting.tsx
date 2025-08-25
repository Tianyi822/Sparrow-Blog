import React, { useState, useEffect, useCallback, memo } from 'react';
import { FiFile, FiCpu, FiAlertCircle, FiType, FiLayers, FiClock, FiArchive } from 'react-icons/fi';
import './LogSetting.scss';
import { getLoggerConfig, updateLoggerConfig } from '@/services/adminService';
import { LOG_LEVELS, DEFAULT_VALUES } from '@/constants';

// 组件属性接口
interface LogConfigProps {
    onSaveSuccess?: () => void;
}

const LogSetting: React.FC<LogConfigProps> = memo(({ onSaveSuccess }) => {
    // 表单状态
    const [formData, setFormData] = useState({
        logLevel: DEFAULT_VALUES.LOG_LEVEL as 'info',
        logFileDir: DEFAULT_VALUES.LOG_FILE_DIR as '/var/log/h2blog',
        logMaxDays: '30',
        logMaxSize: '10',
        logMaxFiles: '5',
        logCompression: true,
    });

    // 错误状态
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // 获取日志配置
    useEffect(() => {
        const fetchLoggerConfig = async () => {
            try {
                setLoading(true);
                setSubmitError(null);

                const response = await getLoggerConfig();

                if (response.code === 200 && response.data) {
                    const { level, dir_path, max_age, max_size, max_backups, compress } = response.data;

                    // 设置表单数据
                    setFormData({
                        logLevel: level.toLowerCase() as 'info',
                        logFileDir: (dir_path || '') as '/var/log/h2blog',
                        logMaxDays: max_age.toString(),
                        logMaxSize: max_size.toString(),
                        logMaxFiles: max_backups.toString(),
                        logCompression: compress
                    });
                } else {
                    // 显示后端返回的错误信息
                    setSubmitError(`获取日志配置失败: ${response.msg}`);
                }
            } catch (error) {
                setSubmitError('获取日志配置时发生错误，请稍后再试');
            } finally {
                setLoading(false);
            }
        };

        fetchLoggerConfig();
    }, []);

    // 处理输入变化
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prevData => ({
                ...prevData,
                [name]: checked,
            }));
        } else {
            setFormData(prevData => ({
                ...prevData,
                [name]: value,
            }));
        }

        // 清除对应字段的错误
        if (errors[name]) {
            setErrors(prevErrors => ({
                ...prevErrors,
                [name]: '',
            }));
        }
    }, [errors]);

    // 表单验证
    const validateForm = useCallback(() => {
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
    }, [formData]);

    // 处理表单提交
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        // 清空所有错误
        setErrors({});
        setSubmitError(null);

        if (validateForm()) {
            try {
                // 准备数据
                const level = formData.logLevel;
                const dirPath = formData.logFileDir;
                const maxAge = parseInt(formData.logMaxDays);
                const maxSize = parseInt(formData.logMaxSize);
                const maxBackups = parseInt(formData.logMaxFiles);
                const compress = formData.logCompression;
                
                // 调用API更新日志配置
                const response = await updateLoggerConfig(
                    level,
                    dirPath,
                    maxAge,
                    maxSize,
                    maxBackups,
                    compress
                );
                
                if (response.code === 200) {
                    // 显示保存成功提示
                    setSaveSuccess(true);
                    setTimeout(() => setSaveSuccess(false), 3000);

                    // 触发父组件的保存成功回调
                    if (onSaveSuccess) {
                        onSaveSuccess();
                    }
                } else {
                    // 显示后端返回的错误信息
                    setSubmitError(`${response.msg}`);
                }
            } catch (error) {
                setSubmitError('保存配置时发生错误，请稍后再试');
            }
        }
    }, [formData, onSaveSuccess, validateForm]);

    // 显示加载中状态
    if (loading) {
        return (
            <div className="log-setting-card">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>加载日志配置中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="log-setting-card">
            <div className="log-img-section">
                <div className="log-info-overlay">
                    <div className="log-title">
                        <FiCpu className="log-icon" />
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
                        <FiAlertCircle />
                        设置已保存成功！
                    </div>
                )}

                <form className="log-setting-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>
                            <FiType className="input-icon" />
                            日志级别
                        </label>
                        <select
                            name="logLevel"
                            value={formData.logLevel}
                            onChange={handleInputChange}
                            className={errors.logLevel ? 'has-error' : ''}
                        >
                            <option value={LOG_LEVELS.DEBUG}>DEBUG</option>
                            <option value={LOG_LEVELS.INFO}>INFO</option>
                            <option value={LOG_LEVELS.WARN}>WARN</option>
                            <option value={LOG_LEVELS.ERROR}>ERROR</option>
                        </select>
                        {errors.logLevel && <div className="error-message">{errors.logLevel}</div>}
                    </div>

                    <div className="form-group">
                        <label>
                            <FiFile className="input-icon" />
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
                            <FiClock className="input-icon" />
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
                            <FiLayers className="input-icon" />
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
                            <FiLayers className="input-icon" />
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
                                <FiArchive className="input-icon" />
                                启用日志压缩
                            </span>
                        </label>
                    </div>

                    <button type="submit" className="submit-button">
                        保存配置
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
});

export default LogSetting;