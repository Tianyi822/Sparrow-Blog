import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiServer, FiLock, FiAlertCircle, FiUpload, FiImage, FiSave } from 'react-icons/fi';
import './UserSetting.scss';
import ImageSelectorModal from '@/components/ImageSelectorModal';
import type { ImageUsageType } from '@/components/ImageSelectorModal/ImageSelectorModal';
import { GalleryImage, UserConfig } from '@/services/adminService';
import { getUserConfig, updateUserConfig, sendSmtpVerificationCode, updateUserImages } from '@/services/adminService';

interface UserConfigProps {
    onSaveSuccess?: () => void;
}

const UserSetting: React.FC<UserConfigProps> = ({ onSaveSuccess }) => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [smtpAccount, setSmtpAccount] = useState('');
    const [smtpAddress, setSmtpAddress] = useState('');
    const [smtpPort, setSmtpPort] = useState('');
    const [smtpAuthCode, setSmtpAuthCode] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [codeSent, setCodeSent] = useState(false);
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

    // 获取用户配置信息
    useEffect(() => {
        const fetchUserConfig = async () => {
            try {
                setLoading(true);
                const response = await getUserConfig();
                if (response.code === 200 && response.data) {
                    const { user_name, user_email, smtp_account, smtp_address, smtp_port, avatar_image, web_logo, background_image } = response.data;

                    // 填充表单字段
                    setUsername(user_name || '');
                    setEmail(user_email || '');
                    setSmtpAccount(smtp_account || '');
                    setSmtpAddress(smtp_address || '');
                    setSmtpPort(smtp_port || '');

                    // 设置图片ID
                    setAvatarImageId(avatar_image || '');
                    setLogoImageId(web_logo || '');
                    setBackgroundImageId(background_image || '');

                    // 设置图片URL
                    if (avatar_image) {
                        setAvatarImage(`${import.meta.env.VITE_BUSINESS_SERVICE_URL}/img/get/${avatar_image}`);
                    }
                    if (web_logo) {
                        setLogoImage(`${import.meta.env.VITE_BUSINESS_SERVICE_URL}/img/get/${web_logo}`);
                    }
                    if (background_image) {
                        setBackgroundImage(`${import.meta.env.VITE_BUSINESS_SERVICE_URL}/img/get/${background_image}`);
                    }
                }
            } catch (error) {
                console.error('获取用户配置失败:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserConfig();
    }, []);

    // 初始化时从localStorage检查倒计时状态
    useEffect(() => {
        const storedEndTime = localStorage.getItem('verificationCodeEndTime');
        const storedEmail = localStorage.getItem('verificationCodeEmail');

        if (storedEndTime && storedEmail) {
            const endTime = parseInt(storedEndTime, 10);
            const now = new Date().getTime();
            const remainingTime = Math.round((endTime - now) / 1000);

            if (remainingTime > 0) {
                setCodeSent(true);
                setCountdown(remainingTime);
            } else {
                // 倒计时已结束，清除localStorage
                localStorage.removeItem('verificationCodeEndTime');
                localStorage.removeItem('verificationCodeEmail');
            }
        }
    }, []);

    // 处理倒计时
    useEffect(() => {
        if (countdown === 0) return;

        const timer = setTimeout(() => {
            setCountdown(countdown - 1);

            // 当倒计时结束时，清除localStorage
            if (countdown === 1) {
                localStorage.removeItem('verificationCodeEndTime');
                localStorage.removeItem('verificationCodeEmail');
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [countdown]);

    const clearError = (field: string) => {
        if (errors[field]) {
            const newErrors = { ...errors };
            delete newErrors[field];
            setErrors(newErrors);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: { [key: string]: string } = {};

        if (!username.trim()) {
            newErrors.username = '用户名不能为空';
        }

        if (!email.trim()) {
            newErrors.email = '邮箱不能为空';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = '邮箱格式不正确';
        }

        if (!smtpAccount.trim()) {
            newErrors.smtp_account = 'SMTP账号不能为空';
        }

        if (!smtpAddress.trim()) {
            newErrors.smtp_address = 'SMTP服务器不能为空';
        }

        if (!smtpPort.trim()) {
            newErrors.smtp_port = 'SMTP端口不能为空';
        } else if (!/^\d+$/.test(smtpPort)) {
            newErrors.smtp_port = '端口必须为数字';
        }

        if (!smtpAuthCode.trim()) {
            newErrors.smtp_auth_code = 'SMTP授权码不能为空';
        }

        if (codeSent && !verificationCode.trim()) {
            newErrors.verificationCode = '验证码不能为空';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            // 准备要更新的用户配置数据，但不包含图片ID
            const userData: Partial<UserConfig> = {
                user_name: username,
                user_email: email,
                smtp_account: smtpAccount,
                smtp_address: smtpAddress,
                smtp_port: smtpPort,
                smtp_auth_code: smtpAuthCode
            };

            // 调用API更新用户配置，如果验证码已发送则将其作为第二个参数传递
            const response = await updateUserConfig(
                userData, 
                codeSent ? verificationCode : undefined
            );
            
            if (response.code === 200) {
                // 清空验证码字段和localStorage
                setVerificationCode('');
                setCodeSent(false);
                localStorage.removeItem('verificationCodeEndTime');
                localStorage.removeItem('verificationCodeEmail');

                // 显示保存成功提示
                setSaveSuccess(true);
                setTimeout(() => setSaveSuccess(false), 3000);

                // 通知父组件保存成功
                if (onSaveSuccess) {
                    onSaveSuccess();
                }
            } else {
                // 处理错误
                console.error('保存失败:', response.msg);
                // 在这里可以添加错误提示，例如：
                alert(`保存失败: ${response.msg}`);
            }
        } catch (error) {
            console.error('保存用户配置时出错:', error);
            alert('保存配置时发生错误，请稍后再试');
        }
    };

    const handleSendCode = async () => {
        // 验证邮箱格式
        if (!email.trim()) {
            setErrors({ ...errors, email: '邮箱不能为空' });
            return;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setErrors({ ...errors, email: '邮箱格式不正确' });
            return;
        }

        // 验证SMTP字段
        if (!smtpAccount.trim()) {
            setErrors({ ...errors, smtp_account: 'SMTP账号不能为空' });
            return;
        }
        if (!smtpAddress.trim()) {
            setErrors({ ...errors, smtp_address: 'SMTP服务器不能为空' });
            return;
        }
        if (!smtpPort.trim()) {
            setErrors({ ...errors, smtp_port: 'SMTP端口不能为空' });
            return;
        }
        if (!smtpAuthCode.trim()) {
            setErrors({ ...errors, smtp_auth_code: 'SMTP授权码不能为空' });
            return;
        }

        // 清除邮箱相关错误
        clearError('email');
        clearError('smtp_account');
        clearError('smtp_address');
        clearError('smtp_port');
        clearError('smtp_auth_code');

        try {
            // 调用API发送验证码
            const response = await sendSmtpVerificationCode(
                smtpAccount,
                smtpAddress,
                smtpPort,
                email,
                smtpAuthCode
            );

            if (response.code === 200) {
                // 设置已发送状态和倒计时
                setCodeSent(true);
                setCountdown(60);

                // 在localStorage中保存结束时间和邮箱
                const endTime = new Date().getTime() + 60 * 1000; // 60秒后的时间戳
                localStorage.setItem('verificationCodeEndTime', endTime.toString());
                localStorage.setItem('verificationCodeEmail', email);
            } else {
                // 处理发送失败
                console.error('验证码发送失败:', response.msg);
                // 可以在这里显示错误提示
            }
        } catch (error) {
            console.error('发送验证码时出错:', error);
            // 可以在这里显示错误提示
        }
    };

    // 打开图片选择器
    const openImageSelector = (type: ImageUsageType) => {
        setSelectedImageType(type);
        setModalOpen(true);
    };

    // 关闭图片选择器
    const closeImageSelector = () => {
        setModalOpen(false);
    };

    // 处理选择图片
    const handleImageSelect = (image: GalleryImage, usageType: ImageUsageType) => {
        // 获取图片URL
        const imageUrl = `${import.meta.env.VITE_BUSINESS_SERVICE_URL}/img/get/${image.img_id}`;

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
    };

    // 处理所有图片一起保存
    const handleSaveImages = async () => {
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
                console.error('保存图片失败:', response.msg);
                setSaveImageError(response.msg || '保存图片失败');
            }
        } catch (error) {
            console.error('保存图片时出错:', error);
            setSaveImageError('保存图片时发生错误，请稍后再试');
        }
    };

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
                        {/* Add aria-label for the background image for screen readers */}
                        {backgroundImage && <span className="visually-hidden" aria-label="网站背景图片"></span>}
                        <div className="user-info-overlay">
                            <div className="user-title">
                                <FiUser className="user-icon" />
                                <h2>用户设置</h2>
                            </div>
                            <div className="user-description">
                                <p>管理您的个人信息、账户安全及网站外观。</p>
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
                            </div>

                            <div className="form-group">
                                <label htmlFor="smtp_account">
                                    <FiServer className="input-icon" />
                                    <span>SMTP账号</span>
                                </label>
                                <input
                                    type="text"
                                    id="smtp_account"
                                    value={smtpAccount}
                                    onChange={(e) => {
                                        setSmtpAccount(e.target.value);
                                        clearError('smtp_account');
                                    }}
                                    placeholder="请输入SMTP账号"
                                    className={errors.smtp_account ? 'has-error' : ''}
                                />
                                {errors.smtp_account && (
                                    <div className="error-message">{errors.smtp_account}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="smtp_address">
                                    <FiServer className="input-icon" />
                                    <span>SMTP服务器</span>
                                </label>
                                <input
                                    type="text"
                                    id="smtp_address"
                                    value={smtpAddress}
                                    onChange={(e) => {
                                        setSmtpAddress(e.target.value);
                                        clearError('smtp_address');
                                    }}
                                    placeholder="例如: smtp.gmail.com"
                                    className={errors.smtp_address ? 'has-error' : ''}
                                />
                                {errors.smtp_address && (
                                    <div className="error-message">{errors.smtp_address}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="smtp_port">
                                    <FiServer className="input-icon" />
                                    <span>SMTP端口</span>
                                </label>
                                <input
                                    type="text"
                                    id="smtp_port"
                                    value={smtpPort}
                                    onChange={(e) => {
                                        setSmtpPort(e.target.value);
                                        clearError('smtp_port');
                                    }}
                                    placeholder="例如: 465 或 587"
                                    className={errors.smtp_port ? 'has-error' : ''}
                                />
                                {errors.smtp_port && (
                                    <div className="error-message">{errors.smtp_port}</div>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="smtp_auth_code">
                                    <FiLock className="input-icon" />
                                    <span>SMTP授权码</span>
                                </label>
                                <input
                                    type="password"
                                    id="smtp_auth_code"
                                    value={smtpAuthCode}
                                    onChange={(e) => {
                                        setSmtpAuthCode(e.target.value);
                                        clearError('smtp_auth_code');
                                    }}
                                    placeholder="请输入SMTP授权码"
                                    className={errors.smtp_auth_code ? 'has-error' : ''}
                                />
                                {errors.smtp_auth_code && (
                                    <div className="error-message">{errors.smtp_auth_code}</div>
                                )}
                            </div>

                            <div className="form-group verification-code-group">
                                <label htmlFor="verificationCode">
                                    <FiLock className="input-icon" />
                                    <span>验证码</span>
                                </label>
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
                                        onClick={handleSendCode}
                                        disabled={countdown > 0}
                                    >
                                        {countdown > 0 ? `重新发送(${countdown}s)` : '获取邮箱验证码'}
                                    </button>
                                </div>
                                {errors.verificationCode && (
                                    <div className="error-message">{errors.verificationCode}</div>
                                )}
                            </div>

                            <button type="submit" className="submit-button">
                                <FiSave /> 保存配置
                            </button>
                        </form>
                    </div>

                    {/* 图片选择器弹窗 */}
                    <ImageSelectorModal
                        isOpen={modalOpen}
                        onClose={closeImageSelector}
                        onImageSelect={handleImageSelect}
                        usageType={selectedImageType}
                        mode="userSetting"
                    />
                </>
            )}
        </div>
    );
};

export default UserSetting;