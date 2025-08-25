import React, { useState, useEffect, useCallback, memo, Suspense } from 'react';
import { FiUser, FiMail, FiAlertCircle, FiUpload, FiImage, FiSave, FiGithub, FiCode, FiType, FiPlus, FiLock, FiSend, FiLoader } from 'react-icons/fi';
import './UserSetting.scss';
import type { ImageUsageType } from '@/components/business/ImageSelectorModal/ImageSelectorModal';
import { getImageUrl } from '@/services/adminService';
import { getUserConfig, updateUserConfig, updateUserImages, sendEmailVerificationCode } from '@/services/adminService';
import { UserConfig, GalleryImage } from '@/types';

// 懒加载ImageSelectorModal组件
const ImageSelectorModal = React.lazy(() => import('@/components/business/ImageSelectorModal'));

// 图片选择器的加载指示器
const ImageSelectorLoading = () => (
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        color: 'white',
        fontSize: '18px'
    }}>
        <FiLoader style={{ marginRight: '8px', animation: 'spin 1s linear infinite' }} />
        加载图片选择器...
    </div>
);

interface UserConfigProps {
    onSaveSuccess?: () => void;
}

const UserSetting: React.FC<UserConfigProps> = memo(({ onSaveSuccess }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [originalEmail, setOriginalEmail] = useState(''); // 保存原始邮箱
    const [verificationCode, setVerificationCode] = useState('');
    const [countdown, setCountdown] = useState(0);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveImageError, setSaveImageError] = useState<string | null>(null);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [selectedImageType, setSelectedImageType] = useState<ImageUsageType>('avatar');
    const [loading, setLoading] = useState<boolean>(true);

    // 添加状态来跟踪已选择的图片
    const [avatarImage, setAvatarImage] = useState<string | null>(null);
    const [logoImage, setLogoImage] = useState<string | null>(null);
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

    // 添加状态来追踪图片ID
    const [avatarImageId, setAvatarImageId] = useState<string>('');
    const [logoImageId, setLogoImageId] = useState<string>('');
    const [backgroundImageId, setBackgroundImageId] = useState<string>('');

    // 添加新字段的状态
    const [typewriterContent, setTypewriterContent] = useState<string[]>([]);
    const [githubAddress, setGithubAddress] = useState<string>('');
    const [icpFilingNumber, setIcpFilingNumber] = useState<string>('');
    const [userHobbies, setUserHobbies] = useState<string[]>([]);
    const [newTypewriterContent, setNewTypewriterContent] = useState<string>('');
    const [newHobby, setNewHobby] = useState<string>('');

    // 检查邮箱是否被修改
    const isEmailChanged = email !== originalEmail && originalEmail !== '';

    // 获取用户配置信息
    useEffect(() => {
        const fetchUserConfig = async () => {
            try {
                setLoading(true);
                const response = await getUserConfig();
                if (response.code === 200 && response.data) {
                    const {
                        user_name,
                        user_email,
                        avatar_image,
                        web_logo,
                        background_image,
                        user_github_address,
                        user_hobbies,
                        type_writer_content,
                        icp_filing_number
                    } = response.data;

                    // 填充表单字段
                    setUsername(user_name || '');
                    setEmail(user_email || '');
                    setOriginalEmail(user_email || ''); // 保存原始邮箱
                    setGithubAddress(user_github_address || '');
                    setIcpFilingNumber(icp_filing_number || '');
                    setUserHobbies(user_hobbies || []);
                    setTypewriterContent(type_writer_content || []);

                    // 设置图片ID
                    setAvatarImageId(avatar_image || '');
                    setLogoImageId(web_logo || '');
                    setBackgroundImageId(background_image || '');

                    // 设置图片URL
                    if (avatar_image) {
                        setAvatarImage(getImageUrl(avatar_image));
                    }
                    if (web_logo) {
                        setLogoImage(getImageUrl(web_logo));
                    }
                    if (background_image) {
                        setBackgroundImage(getImageUrl(background_image));
                    }
                }
            } catch (error) {
                console.error('获取用户配置失败:', error instanceof Error ? error.message : '未知错误');
                // 获取用户配置失败
            } finally {
                setLoading(false);
            }
        };

        fetchUserConfig();
    }, []);

    // 处理倒计时
    useEffect(() => {
        if (countdown <= 0) return;

        const timer = setTimeout(() => {
            setCountdown(prevCount => prevCount - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown]);

    // 清除表单项错误
    const clearError = useCallback((field: string) => {
        if (errors[field]) {
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors[field];
                return newErrors;
            });
        }
    }, [errors]);

    // 验证表单
    const validateForm = useCallback((): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!username.trim()) {
            newErrors.username = '用户名不能为空';
        }

        if (!email.trim()) {
            newErrors.email = '邮箱不能为空';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = '邮箱格式不正确';
        }

        if (githubAddress && !githubAddress.trim().startsWith('https://github.com/')) {
            newErrors.github = 'GitHub地址格式不正确';
        }

        // 如果邮箱已修改，需要验证码
        if (isEmailChanged && !verificationCode) {
            newErrors.verificationCode = '修改邮箱需要验证码';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [username, email, githubAddress, isEmailChanged, verificationCode]);

    // 发送邮箱验证码
    const handleSendVerificationCode = useCallback(async () => {
        if (!email.trim()) {
            setErrors(prevErrors => ({ ...prevErrors, email: '邮箱不能为空' }));
            return;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErrors(prevErrors => ({ ...prevErrors, email: '邮箱格式不正确' }));
            return;
        }

        try {
            const response = await sendEmailVerificationCode(email);
            if (response.code === 200) {
                setCountdown(60); // 60秒倒计时
                // 显示发送成功提示
                alert('验证码发送成功，请查收邮件');
            } else {
                alert(`验证码发送失败: ${response.msg}`);
            }
        } catch (error) {
            console.error('发送验证码失败:', error instanceof Error ? error.message : '未知错误');
            alert('发送验证码失败，请稍后再试');
        }
    }, [email]);

    // 提交表单
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            // 准备要更新的用户配置数据
            const userData: Partial<UserConfig> = {
                user_name: username,
                user_email: email,
                user_github_address: githubAddress,
                icp_filing_number: icpFilingNumber,
                user_hobbies: userHobbies,
                type_writer_content: typewriterContent
            };

            // 调用API更新用户配置，如果邮箱修改需要传验证码
            const response = await updateUserConfig(
                userData,
                isEmailChanged ? verificationCode : undefined,
                isEmailChanged
            );

            if (response.code === 200) {
                // 更新原始邮箱
                setOriginalEmail(email);
                // 清空验证码
                setVerificationCode('');

                // 显示保存成功提示
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);

                // 通知父组件保存成功
                if (onSaveSuccess) {
                    onSaveSuccess();
                }
            } else {
                // 处理错误
                alert(`保存失败: ${response.msg}`);
            }
        } catch (error) {
            console.error('保存配置失败:', error instanceof Error ? error.message : '未知错误');
            alert('保存配置时发生错误，请稍后再试');
        }
    }, [username, email, githubAddress, icpFilingNumber, userHobbies, typewriterContent, isEmailChanged, verificationCode, validateForm, onSaveSuccess]);

    // 打开图片选择器
    const openImageSelector = useCallback((type: ImageUsageType) => {
        setSelectedImageType(type);
        setModalOpen(true);
    }, []);

    // 关闭图片选择器
    const closeImageSelector = useCallback(() => {
        setModalOpen(false);
    }, []);

    // 处理选择图片
    const handleImageSelect = useCallback((image: GalleryImage, usageType: ImageUsageType) => {
        // 获取图片URL
        const imageUrl = getImageUrl(image.img_id);

        // 根据不同的用途类型更新不同的图片
        if (usageType === 'avatar') {
            setAvatarImage(imageUrl);
            setAvatarImageId(image.img_id);
        } else if (usageType === 'logo') {
            setLogoImage(imageUrl);
            setLogoImageId(image.img_id);
        } else if (usageType === 'background') {
            setBackgroundImage(imageUrl);
            setBackgroundImageId(image.img_id);
        }

        closeImageSelector();
    }, [closeImageSelector]);

    // 处理所有图片一起保存
    const handleSaveImages = useCallback(async () => {
        // 清除之前的错误信息
        setSaveImageError(null);

        try {
            // 调用API更新图片配置
            const response = await updateUserImages(
                avatarImageId,
                logoImageId,
                backgroundImageId
            );

            if (response.code === 200) {
                // 显示保存成功提示
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);
            } else {
                // 显示错误信息
                setSaveImageError(response.msg || '保存图片失败');
            }
        } catch (error) {
            console.error('保存图片失败:', error instanceof Error ? error.message : '未知错误');
            setSaveImageError('保存图片时发生错误，请稍后再试');
        }
    }, [avatarImageId, logoImageId, backgroundImageId]);

    // 添加打字机内容
    const handleAddTypewriterContent = useCallback(() => {
        if (newTypewriterContent.trim()) {
            setTypewriterContent(prev => [...prev, newTypewriterContent.trim()]);
            setNewTypewriterContent('');
        }
    }, [newTypewriterContent]);

    // 处理打字机内容输入框按键事件
    const handleTypewriterKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTypewriterContent();
        }
    }, [handleAddTypewriterContent]);

    // 删除打字机内容
    const handleRemoveTypewriterContent = useCallback((index: number) => {
        setTypewriterContent(prevContent => {
            const updatedContent = [...prevContent];
            updatedContent.splice(index, 1);
            return updatedContent;
        });
    }, []);

    // 添加爱好
    const handleAddHobby = useCallback(() => {
        if (newHobby.trim() && !userHobbies.includes(newHobby.trim()) && userHobbies.length < 10) {
            setUserHobbies(prev => [...prev, newHobby.trim()]);
            setNewHobby('');
        }
    }, [newHobby, userHobbies]);

    // 处理爱好输入框按键事件
    const handleHobbyKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (userHobbies.length < 10) {
                handleAddHobby();
            }
        }
    }, [handleAddHobby, userHobbies.length]);

    // 删除爱好
    const handleRemoveHobby = useCallback((index: number) => {
        setUserHobbies(prevHobbies => {
            const updatedHobbies = [...prevHobbies];
            updatedHobbies.splice(index, 1);
            return updatedHobbies;
        });
    }, []);

    return (
        <div className="user-setting-card">
            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>加载用户配置中...</p>
                </div>
            ) : (
                <>
                    <div className="user-imgs-setting" style={backgroundImage ? {
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    } : {}}>
                        {/* 为屏幕阅读器添加背景图片的aria-label */}
                        {backgroundImage && <span className="visually-hidden" aria-label="网站背景图片"></span>}
                        <div className="user-info-overlay">
                            <div className="user-title">
                                <FiUser className="user-icon" />
                                <h2>用户设置</h2>
                            </div>
                            <div className="user-description">
                                <p>管理您的个人信息及网站外观。</p>
                                <p>上传头像、网站Logo和背景图片让您的网站更具个性化。</p>
                            </div>
                        </div>

                        {/* 桌面版上传组件区域，在窄屏模式下隐藏 */}
                        <div className="upload-container desktop-upload-container">
                            <div className="upload-items-row">
                                <div className="upload-item">
                                    <div className="upload-circle" onClick={() => openImageSelector('avatar')}>
                                        {avatarImage ? (
                                            <img
                                                src={avatarImage}
                                                alt="用户头像"
                                                className="selected-image"
                                                aria-label="用户头像"
                                                onError={(e) => {
                                                    const target = e.target as HTMLElement;
                                                    target.style.fontSize = '0.85rem';
                                                    target.style.display = 'flex';
                                                    target.style.alignItems = 'center';
                                                    target.style.justifyContent = 'center';
                                                    target.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                                                    target.style.color = 'white';
                                                    target.style.padding = '5px';
                                                    target.style.textAlign = 'center';
                                                    target.innerText = '用户头像';
                                                }}
                                            />
                                        ) : (
                                            <FiUser className="avatar-icon" />
                                        )}
                                        <div className="upload-overlay">
                                            <FiUpload />
                                            <span className="upload-label-inner">上传头像</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="upload-item">
                                    <div className="upload-circle" onClick={() => openImageSelector('logo')}>
                                        {logoImage ? (
                                            <img
                                                src={logoImage}
                                                alt="网站Logo"
                                                className="selected-image"
                                                aria-label="网站Logo"
                                                onError={(e) => {
                                                    const target = e.target as HTMLElement;
                                                    target.style.fontSize = '0.85rem';
                                                    target.style.display = 'flex';
                                                    target.style.alignItems = 'center';
                                                    target.style.justifyContent = 'center';
                                                    target.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                                                    target.style.color = 'white';
                                                    target.style.padding = '5px';
                                                    target.style.textAlign = 'center';
                                                    target.innerText = '网站Logo';
                                                }}
                                            />
                                        ) : (
                                            <FiImage className="logo-icon" />
                                        )}
                                        <div className="upload-overlay">
                                            <FiUpload />
                                            <span className="upload-label-inner">上传Logo</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-upload-container">
                                <button
                                    className="bg-upload-button"
                                    onClick={() => openImageSelector('background')}
                                >
                                    <FiUpload className="upload-icon" />
                                    上传背景图片
                                </button>
                            </div>
                            <button
                                className="save-images-button"
                                onClick={handleSaveImages}
                            >
                                <FiSave className="save-icon" />
                                保存图片
                            </button>
                        </div>
                    </div>

                    <div className="user-setting-form-wrapper">
                        {/* 移动端上传组件区域，仅在窄屏模式下显示 */}
                        <div className="mobile-upload-container">
                            <div className="upload-items-row">
                                <div className="upload-item">
                                    <div className="upload-circle" onClick={() => openImageSelector('avatar')}>
                                        {avatarImage ? (
                                            <img
                                                src={avatarImage}
                                                alt="用户头像"
                                                className="selected-image"
                                                aria-label="用户头像"
                                                onError={(e) => {
                                                    const target = e.target as HTMLElement;
                                                    target.style.fontSize = '0.85rem';
                                                    target.style.display = 'flex';
                                                    target.style.alignItems = 'center';
                                                    target.style.justifyContent = 'center';
                                                    target.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                                                    target.style.color = 'white';
                                                    target.style.padding = '5px';
                                                    target.style.textAlign = 'center';
                                                    target.innerText = '用户头像';
                                                }}
                                            />
                                        ) : (
                                            <FiUser className="avatar-icon" />
                                        )}
                                        <div className="upload-overlay">
                                            <FiUpload />
                                            <span className="upload-label-inner">上传头像</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="upload-item">
                                    <div className="upload-circle" onClick={() => openImageSelector('logo')}>
                                        {logoImage ? (
                                            <img
                                                src={logoImage}
                                                alt="网站Logo"
                                                className="selected-image"
                                                aria-label="网站Logo"
                                                onError={(e) => {
                                                    const target = e.target as HTMLElement;
                                                    target.style.fontSize = '0.85rem';
                                                    target.style.display = 'flex';
                                                    target.style.alignItems = 'center';
                                                    target.style.justifyContent = 'center';
                                                    target.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
                                                    target.style.color = 'white';
                                                    target.style.padding = '5px';
                                                    target.style.textAlign = 'center';
                                                    target.innerText = '网站Logo';
                                                }}
                                            />
                                        ) : (
                                            <FiImage className="logo-icon" />
                                        )}
                                        <div className="upload-overlay">
                                            <FiUpload />
                                            <span className="upload-label-inner">上传Logo</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-upload-container">
                                <button
                                    className="bg-upload-button"
                                    onClick={() => openImageSelector('background')}
                                >
                                    <FiUpload className="upload-icon" />
                                    上传背景图片
                                </button>
                            </div>
                            <button
                                className="save-images-button"
                                onClick={handleSaveImages}
                            >
                                <FiSave className="save-icon" />
                                保存图片
                            </button>
                        </div>

                        {saveSuccess && (
                            <div className="save-notification">
                                <FiAlertCircle /> 用户设置已保存成功！
                            </div>
                        )}

                        {saveImageError && (
                            <div className="error-notification">
                                <FiAlertCircle /> {saveImageError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="user-setting-form">
                            <div className="form-group">
                                <label htmlFor="username">
                                    <FiUser className="input-icon" />
                                    <span>用户名</span>
                                </label>
                                <input
                                    type="text"
                                    id="username"
                                    value={username}
                                    onChange={(e) => {
                                        setUsername(e.target.value);
                                        clearError('username');
                                    }}
                                    placeholder="请输入用户名"
                                    className={errors.username ? 'has-error' : ''}
                                />
                                {errors.username && (
                                    <div className="error-message">{errors.username}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">
                                    <FiMail className="input-icon" />
                                    <span>邮箱</span>
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        clearError('email');
                                    }}
                                    placeholder="请输入邮箱"
                                    className={errors.email ? 'has-error' : ''}
                                />
                                {errors.email && (
                                    <div className="error-message">{errors.email}</div>
                                )}
                                {isEmailChanged && (
                                    <div className="email-change-notice">
                                        <FiAlertCircle className="notice-icon" />
                                        您修改了邮箱地址，需要验证
                                    </div>
                                )}
                            </div>

                            {/* 验证码输入区域 - 仅当邮箱被修改时显示 */}
                            {isEmailChanged && (
                                <div className="form-group verification-code-group">
                                    <label htmlFor="verificationCode">
                                        <FiLock className="input-icon" />
                                        <span>验证码</span>
                                    </label>
                                    <p className="input-description">
                                        修改邮箱需要进行验证，请获取验证码
                                    </p>
                                    <div className="verification-code-container">
                                        <input
                                            type="text"
                                            id="verificationCode"
                                            value={verificationCode}
                                            onChange={(e) => {
                                                setVerificationCode(e.target.value);
                                                clearError('verificationCode');
                                            }}
                                            placeholder="请输入验证码"
                                            className={errors.verificationCode ? 'has-error' : ''}
                                        />
                                        <button
                                            type="button"
                                            className="send-code-button"
                                            onClick={handleSendVerificationCode}
                                            disabled={countdown > 0}
                                        >
                                            <FiSend />
                                            {countdown > 0 ? `重新发送(${countdown}s)` : '获取验证码'}
                                        </button>
                                    </div>
                                    {errors.verificationCode && (
                                        <div className="error-message">{errors.verificationCode}</div>
                                    )}
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="github">
                                    <FiGithub className="input-icon" />
                                    <span>GitHub 地址</span>
                                </label>
                                <input
                                    type="text"
                                    id="github"
                                    value={githubAddress}
                                    onChange={(e) => {
                                        setGithubAddress(e.target.value);
                                        clearError('github');
                                    }}
                                    placeholder="请输入 GitHub 地址"
                                    className={errors.github ? 'has-error' : ''}
                                />
                                {errors.github && (
                                    <div className="error-message">{errors.github}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="icpFilingNumber">
                                    <FiCode className="input-icon" />
                                    <span>网站备案号</span>
                                </label>
                                <input
                                    type="text"
                                    id="icpFilingNumber"
                                    value={icpFilingNumber}
                                    onChange={(e) => setIcpFilingNumber(e.target.value)}
                                    placeholder="请输入网站备案号（选填）"
                                />
                            </div>

                            {/* 打字机内容 */}
                            <div className="form-group">
                                <label htmlFor="typewriter">
                                    <FiType className="input-icon" />
                                    <span>打字机内容</span>
                                </label>
                                <p className="input-description">
                                    添加显示在首页的打字效果文本，可添加多条，将随机展示。
                                </p>
                                <div className="tag-input-container">
                                    <input
                                        type="text"
                                        id="typewriter"
                                        value={newTypewriterContent}
                                        onChange={(e) => setNewTypewriterContent(e.target.value)}
                                        onKeyDown={handleTypewriterKeyDown}
                                        placeholder="请输入打字机内容，按回车添加"
                                    />
                                    <button
                                        type="button"
                                        className="add-tag-button"
                                        onClick={handleAddTypewriterContent}
                                    >
                                        <FiPlus /> 添加
                                    </button>
                                </div>
                                <div className="tags-container">
                                    {typewriterContent.length === 0 && (
                                        <div className="empty-tag-hint">暂无内容，请添加</div>
                                    )}
                                    {typewriterContent.map((content, index) => (
                                        <div key={index} className="tag">
                                            {content}
                                            <button
                                                type="button"
                                                className="remove-tag"
                                                onClick={() => handleRemoveTypewriterContent(index)}
                                                aria-label="删除该内容"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 用户爱好 */}
                            <div className="form-group">
                                <label htmlFor="hobbies">
                                    <FiCode className="input-icon" />
                                    <span>用户爱好</span>
                                </label>
                                <p className="input-description">
                                    添加您的技术栈或个人爱好，将显示在个人简介中。最多可添加10个。
                                    {userHobbies.length > 0 && (
                                        <span className="hobby-count"> 当前已添加：{userHobbies.length}/10</span>
                                    )}
                                </p>
                                <div className="tag-input-container">
                                    <input
                                        type="text"
                                        id="hobbies"
                                        value={newHobby}
                                        onChange={(e) => setNewHobby(e.target.value)}
                                        onKeyDown={handleHobbyKeyDown}
                                        placeholder={userHobbies.length >= 10 ? "已达到最大数量限制" : "请输入用户爱好，按回车添加"}
                                        disabled={userHobbies.length >= 10}
                                    />
                                    <button
                                        type="button"
                                        className="add-tag-button"
                                        onClick={handleAddHobby}
                                        disabled={userHobbies.length >= 10 || !newHobby.trim()}
                                    >
                                        <FiPlus /> 添加
                                    </button>
                                </div>
                                {userHobbies.length >= 10 && (
                                    <div className="hobby-limit-notice">
                                        <FiAlertCircle className="notice-icon" />
                                        已达到最大数量限制（10个），请删除后再添加新的爱好
                                    </div>
                                )}
                                <div className="tags-container">
                                    {userHobbies.length === 0 && (
                                        <div className="empty-tag-hint">暂无内容，请添加</div>
                                    )}
                                    {userHobbies.map((hobby, index) => (
                                        <div key={index} className="tag">
                                            {hobby}
                                            <button
                                                type="button"
                                                className="remove-tag"
                                                onClick={() => handleRemoveHobby(index)}
                                                aria-label="删除该爱好"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button type="submit" className="submit-button">
                                <FiSave /> 保存配置
                            </button>
                        </form>
                    </div>

                    {/* 图片选择器弹窗 */}
                    <Suspense fallback={<ImageSelectorLoading />}>
                        <ImageSelectorModal
                            isOpen={modalOpen}
                            onClose={closeImageSelector}
                            onImageSelect={handleImageSelect}
                            usageType={selectedImageType}
                            mode="userSetting"
                        />
                    </Suspense>
                </>
            )}
        </div>
    );
});

export default UserSetting;