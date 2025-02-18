import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Apply.scss';
import classNames from 'classnames';

const Apply = ({ className, onSubmit }) => {
    const [formData, setFormData] = useState({
        name: '',
        url: '',
        avatar: '',
        description: '',
        category: ''
    });

    const [validation, setValidation] = useState({
        name: null,
        url: null,
        avatar: null,
        description: null,
        category: null
    });

    const [errors, setErrors] = useState({
        name: '',
        url: '',
        avatar: '',
        description: '',
        category: ''
    });

    const [isExpanded, setIsExpanded] = useState(false);

    // URL验证函数
    const isValidUrl = (urlString) => {
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
    const validateText = (text, fieldName) => {
        if (!text.trim()) {
            return {
                isValid: false,
                error: `${fieldName}不能为空`
            };
        }
        if (fieldName === '博客描述' && text.length < 10) {
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
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // 实时验证文本字段
        if (name === 'name' || name === 'description') {
            const { isValid, error } = validateText(
                value, 
                name === 'name' ? '博客名称' : '博客描述'
            );
            setValidation(prev => ({
                ...prev,
                [name]: isValid
            }));
            setErrors(prev => ({
                ...prev,
                [name]: error
            }));
        }

        // 验证分类选择
        if (name === 'category') {
            const isValid = value.trim() !== '';
            setValidation(prev => ({
                ...prev,
                category: isValid
            }));
            // 如果选择了有效值，立即清除错误信息
            if (isValid) {
                setErrors(prev => ({
                    ...prev,
                    category: ''
                }));
            }
        }
    };

    // 验证所有字段
    const validateAllFields = () => {
        const validations = {
            name: validateText(formData.name, '博客名称'),
            description: validateText(formData.description, '博客描述'),
            url: { isValid: isValidUrl(formData.url), error: '请输入有效的网址' },
            avatar: { isValid: isValidUrl(formData.avatar), error: '请输入有效的图片链接' },
            category: { 
                isValid: formData.category.trim() !== '', 
                error: '请选择博客分类' 
            }
        };

        // 更新所有验证状态
        setValidation({
            name: validations.name.isValid,
            url: validations.url.isValid,
            avatar: validations.avatar.isValid,
            description: validations.description.isValid,
            category: validations.category.isValid
        });

        // 更新所有错误信息
        setErrors({
            name: validations.name.error,
            url: validations.url.error,
            avatar: validations.avatar.error,
            description: validations.description.error,
            category: validations.category.error
        });

        // 返回是否全部验证通过
        return Object.values(validations).every(v => v.isValid);
    };

    // 处理表单提交
    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (validateAllFields()) {
            onSubmit(formData);
            // 清空表单
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
            // 提交成功后折叠表单
            setIsExpanded(false);
        }
    };

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
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
                    {/* 移动端的关闭按钮 */}
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
                            placeholder="请输入您的博客名称"
                            required
                            className={classNames({
                                'valid': validation.name === true,
                                'invalid': validation.name === false
                            })}
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="url">博客地址</label>
                        <input
                            type="url"
                            id="url"
                            name="url"
                            value={formData.url}
                            onChange={handleInputChange}
                            placeholder="请输入您的博客地址"
                            required
                            className={classNames({
                                'valid': validation.url === true,
                                'invalid': validation.url === false
                            })}
                        />
                        {errors.url && <span className="error-message">{errors.url}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="avatar">头像链接</label>
                        <input
                            type="url"
                            id="avatar"
                            name="avatar"
                            value={formData.avatar}
                            onChange={handleInputChange}
                            placeholder="请输入您的头像链接"
                            required
                            className={classNames({
                                'valid': validation.avatar === true,
                                'invalid': validation.avatar === false
                            })}
                        />
                        {errors.avatar && <span className="error-message">{errors.avatar}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">博客描述</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="请简短描述您的博客"
                            required
                            className={classNames({
                                'valid': validation.description === true,
                                'invalid': validation.description === false
                            })}
                        />
                        {errors.description && <span className="error-message">{errors.description}</span>}
                    </div>
                    <div className="form-group">
                        <label htmlFor="category">博客分类</label>
                        <select
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            required
                            className={classNames('category-select', {
                                'valid': validation.category === true,
                                'invalid': validation.category === false
                            })}
                        >
                            <option value="">请选择博客分类</option>
                            {categoryOptions.map(category => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                        {errors.category && <span className="error-message">{errors.category}</span>}
                    </div>
                    <button type="submit" className="submit-button">提交申请</button>
                </form>
            </div>
        </div>
    );
};

Apply.propTypes = {
    className: PropTypes.string,
    onSubmit: PropTypes.func.isRequired
};

export default Apply; 