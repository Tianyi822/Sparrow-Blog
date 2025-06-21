import classNames from 'classnames';
import { useState, useEffect } from 'react';
import './ApplyModal.scss';

export interface FriendLinkFormData {
    name: string;
    url: string;
    avatar: string;
    description: string;
}

interface ApplyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: FriendLinkFormData) => void;
}

const ApplyModal: React.FC<ApplyModalProps> = ({ isOpen, onClose, onSubmit }) => {
    const [formData, setFormData] = useState<FriendLinkFormData>({
        name: '',
        url: '',
        avatar: '',
        description: ''
    });

    const [errors, setErrors] = useState<Record<keyof FriendLinkFormData, string>>({
        name: '',
        url: '',
        avatar: '',
        description: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // URL验证函数
    const isValidUrl = (urlString: string): boolean => {
        if (!urlString.trim()) return false;
        try {
            new URL(urlString);
            return true;
        } catch {
            return false;
        }
    };

    // 验证表单字段
    const validateField = (field: keyof FriendLinkFormData, value: string): string => {
        switch (field) {
            case 'name':
                return value.trim() ? '' : '友链名称不能为空';
            case 'url':
                if (!value.trim()) return '友链地址不能为空';
                return isValidUrl(value) ? '' : '请输入有效的网址';
            case 'avatar':
                if (!value.trim()) return '';
                return isValidUrl(value) ? '' : '请输入有效的图片链接';
            case 'description':
                if (!value.trim()) return '简介不能为空';
                return value.trim().length >= 10 ? '' : '简介至少需要10个字符';
            default:
                return '';
        }
    };

    // 处理输入变化
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const field = name as keyof FriendLinkFormData;
        
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // 实时验证
        const error = validateField(field, value);
        setErrors(prev => ({
            ...prev,
            [field]: error
        }));
    };

    // 验证所有字段
    const validateAllFields = (): boolean => {
        const newErrors: Record<keyof FriendLinkFormData, string> = {
            name: validateField('name', formData.name),
            url: validateField('url', formData.url),
            avatar: validateField('avatar', formData.avatar),
            description: validateField('description', formData.description)
        };

        setErrors(newErrors);
        return Object.values(newErrors).every(error => error === '');
    };

    // 处理表单提交
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateAllFields()) return;

        setIsSubmitting(true);
        try {
            await onSubmit(formData);
            // 重置表单
            setFormData({
                name: '',
                url: '',
                avatar: '',
                description: ''
            });
            setErrors({
                name: '',
                url: '',
                avatar: '',
                description: ''
            });
            onClose();
        } catch (error) {
            console.error('提交失败:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // 处理模态框外部点击
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    // 监听ESC键关闭模态框
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="apply-modal-overlay" onClick={handleOverlayClick}>
            <div className="apply-modal">
                <div className="apply-modal-header">
                    <h2 className="apply-modal-title">申请友链</h2>
                    <button
                        className="apply-modal-close"
                        onClick={onClose}
                        type="button"
                    >
                        ✕
                    </button>
                </div>

                <form className="apply-modal-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">友链名称 *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={classNames('form-input', {
                                'error': errors.name
                            })}
                            placeholder="请输入友链名称"
                            required
                        />
                        {errors.name && <div className="error-message">{errors.name}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="url">友链地址 *</label>
                        <input
                            type="url"
                            id="url"
                            name="url"
                            value={formData.url}
                            onChange={handleInputChange}
                            className={classNames('form-input', {
                                'error': errors.url
                            })}
                            placeholder="https://example.com"
                            required
                        />
                        {errors.url && <div className="error-message">{errors.url}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="avatar">头像URL</label>
                        <input
                            type="url"
                            id="avatar"
                            name="avatar"
                            value={formData.avatar}
                            onChange={handleInputChange}
                            className={classNames('form-input', {
                                'error': errors.avatar
                            })}
                            placeholder="https://example.com/avatar.jpg（可选）"
                        />
                        {errors.avatar && <div className="error-message">{errors.avatar}</div>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">简介 *</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            className={classNames('form-textarea', {
                                'error': errors.description
                            })}
                            placeholder="请简单介绍一下您的网站..."
                            rows={4}
                            required
                        />
                        {errors.description && <div className="error-message">{errors.description}</div>}
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-cancel"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            取消
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? '提交中...' : '提交申请'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ApplyModal; 