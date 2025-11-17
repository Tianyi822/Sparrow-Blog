import React, { useState, useEffect, useCallback, memo } from 'react';
import {
    FiBox,
    FiCloud,
    FiFile,
    FiGlobe,
    FiImage,
    FiKey,
    FiLock,
    FiAlertCircle
} from 'react-icons/fi';
import './OssSetting.scss';
import { getOSSConfig, updateOSSConfig } from '@/services/adminService';

// OSS表单数据接口
interface OssFormData {
    endpoint: string;
    region: string;
    accessKeyId: string;
    accessKeySecret: string;
    bucketName: string;
    imagePath: string;
    blogPath: string;
}

// 表单验证错误接口
interface ValidationErrors {
    [key: string]: string;
}

// 组件属性接口
interface OssConfigProps {
    onSaveSuccess?: () => void;
}

const OssSetting: React.FC<OssConfigProps> = memo(({onSaveSuccess}) => {
    const [formData, setFormData] = useState<OssFormData>({
        endpoint: '',
        region: '',
        accessKeyId: '',
        accessKeySecret: '',
        bucketName: '',
        imagePath: 'images/',
        blogPath: 'blogs/'
    });

    const [errors, setErrors] = useState<ValidationErrors>({});
    const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // 加载OSS配置
    useEffect(() => {
        const fetchOssConfig = async () => {
            try {
                setLoading(true);
                setSubmitError(null);

                const response = await getOSSConfig();

                if (response.code === 200 && response.data) {
                    const { endpoint, region, bucket, image_oss_path, blog_oss_path } = response.data;

                    // 设置表单数据
                    setFormData({
                        endpoint: endpoint || '',
                        region: region || '',
                        accessKeyId: '', // 密钥通常不会从后端返回
                        accessKeySecret: '', // 密钥通常不会从后端返回
                        bucketName: bucket || '',
                        imagePath: image_oss_path || 'images/',
                        blogPath: blog_oss_path || 'blogs/'
                    });
                } else {
                    // 显示后端返回的错误信息
                    setSubmitError(`获取OSS配置失败: ${response.msg}`);
                }
            } catch {
                setSubmitError('获取OSS配置时发生错误，请稍后再试');
            } finally {
                setLoading(false);
            }
        };

        fetchOssConfig();
    }, []);

    // 验证单个字段
    const validateField = useCallback((name: string, value: string): string => {
        switch (name) {
            case 'endpoint':
                return value.trim() ? '' : 'Endpoint 不能为空';
            case 'region':
                return value.trim() ? '' : '区域不能为空';
            case 'accessKeyId':
                return value.trim() ? '' : 'AccessKey ID不能为空';
            case 'accessKeySecret':
                return value.trim() ? '' : 'AccessKey Secret不能为空';
            case 'bucketName':
                return value.trim() ? '' : 'Bucket名称不能为空';
            case 'imagePath':
                if (!value.trim()) return '图片路径不能为空';
                if (!value.endsWith('/')) return '路径必须以 / 结尾';
                return '';
            case 'blogPath':
                if (!value.trim()) return '博客路径不能为空';
                if (!value.endsWith('/')) return '路径必须以 / 结尾';
                return '';
            default:
                return '';
        }
    }, []);

    // 验证整个表单
    const validateForm = useCallback((): boolean => {
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
    }, [formData, validateField]);

    // 处理输入变更
    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;

        setFormData(prev => ({...prev, [name]: value}));

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
    }, [errors, saveSuccess]);

    // 提交表单
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSubmitError(null);
        setIsSubmitting(true);

        try {
            // 处理路径以斜杠结尾
            const imagePath = formData.imagePath.endsWith('/') ? formData.imagePath : formData.imagePath + '/';
            const blogPath = formData.blogPath.endsWith('/') ? formData.blogPath : formData.blogPath + '/';

            // 调用API更新OSS配置
            const response = await updateOSSConfig(
                formData.endpoint,
                formData.region,
                formData.accessKeyId,
                formData.accessKeySecret,
                formData.bucketName,
                imagePath,
                blogPath
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
            }
        } catch {
            setSubmitError('保存配置时发生错误，请稍后再试');
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, onSaveSuccess, validateForm]);

    // 根据字段名获取对应的图标
    const getIconByFieldName = useCallback((name: string) => {
        switch (name) {
            case 'endpoint':
                return <FiCloud className="input-icon"/>;
            case 'region':
                return <FiGlobe className="input-icon"/>;
            case 'accessKeyId':
                return <FiKey className="input-icon"/>;
            case 'accessKeySecret':
                return <FiLock className="input-icon"/>;
            case 'bucketName':
                return <FiBox className="input-icon"/>;
            case 'imagePath':
                return <FiImage className="input-icon"/>;
            case 'blogPath':
                return <FiFile className="input-icon"/>;
            default:
                return null;
        }
    }, []);

    // 根据字段名获取对应的标签文本
    const getFieldLabel = useCallback((name: string) => {
        switch (name) {
            case 'endpoint':
                return 'OSS Endpoint';
            case 'region':
                return '区域';
            case 'accessKeyId':
                return 'AccessKey ID';
            case 'accessKeySecret':
                return 'AccessKey Secret';
            case 'bucketName':
                return 'Bucket名称';
            case 'imagePath':
                return '图片OSS路径';
            case 'blogPath':
                return '博客OSS路径';
            default:
                return name;
        }
    }, []);

    // 根据字段名获取对应的占位符文本
    const getFieldPlaceholder = useCallback((name: string) => {
        switch (name) {
            case 'endpoint':
                return 'oss-cn-guangzhou.aliyuncs.com';
            case 'region':
                return 'cn-guangzhou';
            case 'accessKeyId':
                return '请输入AccessKey ID';
            case 'accessKeySecret':
                return '请输入AccessKey Secret';
            case 'bucketName':
                return '请输入Bucket名称';
            case 'imagePath':
                return 'images/';
            case 'blogPath':
                return 'blogs/';
            default:
                return '';
        }
    }, []);

    // 根据字段名获取对应的输入类型
    const getFieldType = useCallback((name: string) => {
        switch (name) {
            case 'accessKeyId':
            case 'accessKeySecret':
                return 'password';
            default:
                return 'text';
        }
    }, []);

    // 表单字段列表
    const formFields = [
        'endpoint',
        'region',
        'accessKeyId',
        'accessKeySecret',
        'bucketName',
        'imagePath',
        'blogPath'
    ];

    // 显示加载中状态
    if (loading) {
        return (
            <div className="oss-setting-card">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>加载OSS配置中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="oss-setting-card">
            <div className="oss-img-section">
                <div className="oss-info-overlay">
                    <div className="oss-title">
                        <FiCloud className="oss-icon"/>
                        <h2>OSS存储配置</h2>
                    </div>
                    <div className="oss-description">
                        <p>
                            在这里配置您的对象存储服务(OSS)信息，包括访问密钥、存储区域和路径设置。这些配置将用于存储和访问您的博客图片和其他资源。
                        </p>
                        <p>
                            请确保提供正确的OSS连接信息，以确保资源能够正常上传和访问。所有字段均为必填项。
                        </p>
                    </div>
                </div>
            </div>

            <div className="oss-setting-form-wrapper">
                {saveSuccess && (
                    <div className="save-notification">
                        <FiAlertCircle/>
                        设置已保存成功！
                    </div>
                )}

                <form className="oss-setting-form" onSubmit={handleSubmit}>
                    {formFields.map((field) => (
                        <div className="form-group" key={field}>
                            <label>
                                {getIconByFieldName(field)}
                                {getFieldLabel(field)}
                            </label>
                            <input
                                type={getFieldType(field)}
                                name={field}
                                value={formData[field as keyof OssFormData]}
                                onChange={handleInputChange}
                                placeholder={getFieldPlaceholder(field)}
                                className={errors[field] ? 'has-error' : ''}
                            />
                            {errors[field] && <div className="error-message">{errors[field]}</div>}
                        </div>
                    ))}

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
});

export default OssSetting; 