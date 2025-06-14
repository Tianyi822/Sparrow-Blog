import classNames from 'classnames';
import { useEffect, useState } from 'react';
import './Apply.scss';

export interface FormData {
    name: string;
    url: string;
    avatar: string;
    description: string;
    category: string;
}

interface ApplyProps {
    className?: string;
    onSubmit: (data: FormData) => void;
}

const Apply: React.FC<ApplyProps> = ({ className, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        avatar: '',
        description: '',
        category: ''
    });

    const [validation, setValidation] = useState<Record<FieldName, boolean | null>>(() => ({
        name: null,
        url: null,
        avatar: null,
        description: null,
        category: null
    }));

    const [errors, setErrors] = useState<Record<FieldName, string>>(() => ({
        name: '',
        url: '',
        avatar: '',
        description: '',
        category: ''
    }));

    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    // URL验证函数
    const isValidUrl = (urlString: string): boolean | null => {
        if (!urlString) return null;
        try {
            new URL(urlString);
            return true;
        } catch {
            return false;
        }
    };

    // 验证URL并设置错误信息
    useEffect(() => {
        if (formData.url) {
            const isValid = isValidUrl(formData.url);
            setValidation(prev => ({
                ...prev,
                url: isValid
            }));
            setErrors(prev => ({
                ...prev,
                url: isValid ? '' : '请输入有效的网址，例如: https://example.com'
            }));
        }
        if (formData.avatar) {
            const isValid = isValidUrl(formData.avatar);
            setValidation(prev => ({
                ...prev,
                avatar: isValid
            }));
            setErrors(prev => ({
                ...prev,
                avatar: isValid ? '' : '请输入有效的图片链接，例如: https://example.com/image.jpg'
            }));
        }
    }, [formData.url, formData.avatar]);

    // 验证文本字段
    interface ValidationResult {
        isValid: boolean;
        error: string;
    }

    type FieldName = keyof FormData;

    const validateText = (text: string, fieldName: FieldName): ValidationResult => {
        if (!text.trim()) {
            return {
                isValid: false,
                error: `${fieldName === 'name' ? '博客名称' : '博客描述'}不能为空`
            };
        }
        if (fieldName === 'description' && text.length < 10) {
            return {
                isValid: false,
                error: '博客描述至少需要10个字符'
            };
        }
        return {
            isValid: true,
            error: ''
        };
    };

    // 申请表单的固定分类选项
    const categoryOptions = ['技术博客', '生活博客'];

    // 处理表单输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const fieldName = name as FieldName;

        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));

        // 实时验证文本字段
        if (fieldName === 'name' || fieldName === 'description') {
            const validationResult = validateText(value, fieldName);
            setValidation(prev => ({
                ...prev,
                [fieldName]: validationResult.isValid
            }));
            setErrors(prev => ({
                ...prev,
                [fieldName]: validationResult.error
            }));
        }

        // 验证分类选择
        if (fieldName === 'category') {
            const isValid = value.trim() !== '';
            setValidation(prev => ({
                ...prev,
                category: isValid
            }));
            setErrors(prev => ({
                ...prev,
                category: isValid ? '' : '请选择博客分类'
            }));
        }
    };

    // 验证所有字段
    const validateAllFields = (): boolean => {
        const validations: Record<FieldName, ValidationResult> = {
            name: validateText(formData.name, 'name'),
            description: validateText(formData.description, 'description'),
            url: { isValid: !!isValidUrl(formData.url), error: '请输入有效的网址' },
            avatar: { isValid: !!isValidUrl(formData.avatar), error: '请输入有效的图片链接' },
            category: { isValid: formData.category.trim() !== '', error: '请选择博客分类' }
        };

        // 更新所有验证状态
        setValidation(prev => ({
            ...prev,
            ...Object.fromEntries(
                Object.entries(validations).map(([key, value]) => [key, value.isValid])
            )
        }));

        // 更新所有错误信息
        setErrors(prev => ({
            ...prev,
            ...Object.fromEntries(
                Object.entries(validations).map(([key, value]) => [key, value.error])
            )
        }));

        return Object.values(validations).every(v => v.isValid);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            url: '',
            avatar: '',
            description: '',
            category: ''
        });
        setValidation({
            name: null,
            url: null,
            avatar: null,
            description: null,
            category: null
        });
        setErrors({
            name: '',
            url: '',
            avatar: '',
            description: '',
            category: ''
        });
        setIsExpanded(false);
    };

    // 处理表单提交
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (validateAllFields()) {
            onSubmit(formData);
            resetForm();
        }
    };

    const toggleExpand = () => {
        if (!isExpanded) {
            setIsExpanded(true);
        } else {
            resetForm();
        }
    };

    return (
        <div className={classNames('apply', className, {
            'expanded': isExpanded
        })}>
            {/* 桌面端的侧边按钮 */}
            <button
                className="apply-toggle"
                onClick={toggleExpand}
            >
                <span className="apply-toggle-text">申请友链</span>
            </button>
            <div className="apply-form-container">
                <div className="apply-header">
                    <h2 className="apply-title">申请友链</h2>
                    <button
                        className="apply-close"
                        onClick={toggleExpand}
                        aria-label="关闭"
                    >
                        <span className="apply-close-icon"></span>
                    </button>
                </div>
                <form className="apply-form" onSubmit={handleSubmit} noValidate>
                    <div className="form-group">
                        <label htmlFor="name">博客名称</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={classNames({
                                'valid': validation.name === true,
                                'invalid': validation.name === false
                            })}
                            placeholder="请输入您的博客名称"
                        />
                        {errors.name && <div className="error-message">{errors.name}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="url">博客地址</label>
                        <input
                            type="url"
                            id="url"
                            name="url"
                            value={formData.url}
                            onChange={handleInputChange}
                            className={classNames({
                                'valid': validation.url === true,
                                'invalid': validation.url === false
                            })}
                            placeholder="请输入您的博客地址，例如: https://example.com"
                        />
                        {errors.url && <div className="error-message">{errors.url}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="avatar">头像地址</label>
                        <input
                            type="url"
                            id="avatar"
                            name="avatar"
                            value={formData.avatar}
                            onChange={handleInputChange}
                            className={classNames({
                                'valid': validation.avatar === true,
                                'invalid': validation.avatar === false
                            })}
                            placeholder="请输入您的头像图片链接，例如: https://example.com/avatar.jpg"
                        />
                        {errors.avatar && <div className="error-message">{errors.avatar}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">博客描述</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className={classNames({
                                'valid': validation.description === true,
                                'invalid': validation.description === false
                            })}
                            placeholder="请输入您的博客描述，至少10个字符"
                        />
                        {errors.description && <div className="error-message">{errors.description}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">博客分类</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className={classNames('category-select', {
                                'valid': validation.category === true,
                                'invalid': validation.category === false
                            })}
                        >
                            <option value="">请选择博客分类</option>
                            {categoryOptions.map(option => (
                                <option key={option} value={option}>
                                    {option}
                                </option>
                            ))}
                        </select>
                        {errors.category && <div className="error-message">{errors.category}</div>}
                    </div>

                    <button
                        type="submit"
                        className="submit-button"
                        disabled={!Object.values(validation).every(v => v === true)}
                    >
                        提交申请
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Apply;