import React, { useState, useEffect } from 'react';
import { FiUser, FiSave, FiAlertCircle } from 'react-icons/fi';
import './UserConfig.scss';

interface UserConfigProps {
  onSaveSuccess?: () => void;
}

const UserConfig: React.FC<UserConfigProps> = ({ onSaveSuccess }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 处理倒计时
  useEffect(() => {
    if (countdown === 0) return;

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
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

    if (password && password !== confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致';
    }

    if (codeSent && !verificationCode.trim()) {
      newErrors.verificationCode = '验证码不能为空';
    } else if (codeSent && verificationCode.trim().length !== 6) {
      newErrors.verificationCode = '验证码必须为6位';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // 这里会添加实际的保存逻辑，目前只是模拟
    console.log('保存用户配置:', { username, email, password, verificationCode });

    // 清空密码字段和验证码字段
    setPassword('');
    setConfirmPassword('');
    setVerificationCode('');
    setCodeSent(false);

    // 显示保存成功提示
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    
    // 通知父组件保存成功
    if (onSaveSuccess) {
      onSaveSuccess();
    }
  };

  const handleSendCode = () => {
    // 验证邮箱格式
    if (!email.trim()) {
      setErrors({ ...errors, email: '邮箱不能为空' });
      return;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ ...errors, email: '邮箱格式不正确' });
      return;
    }

    // 清除邮箱相关错误
    clearError('email');

    // 在实际应用中，这里会调用API发送验证码
    console.log('发送验证码到邮箱:', email);

    // 设置已发送状态和倒计时
    setCodeSent(true);
    setCountdown(60);
  };

  return (
    <div className="user-config-module">
      <div className="section-header">
        <h2 className="section-title">
          <FiUser className="section-icon" />
          用户配置
        </h2>
        <button 
          type="button" 
          className="section-save-button" 
          onClick={handleSubmit}
        >
          <FiSave className="button-icon" />
          保存设置
        </button>
      </div>

      {saveSuccess && (
        <div className="save-notification">
          <FiAlertCircle /> 用户设置已保存成功！
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="username">
            用户名
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
            邮箱
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

        <div className="form-group verification-code-group">
          <label htmlFor="verificationCode">
            验证码
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
              {countdown > 0 ? `重新发送(${countdown}s)` : '发送验证码'}
            </button>
          </div>
          {errors.verificationCode && (
            <div className="error-message">{errors.verificationCode}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="password">
            密码
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearError('password');
            }}
            placeholder="请输入新密码（留空表示不修改）"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">
            确认密码
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              clearError('confirmPassword');
            }}
            placeholder="请再次输入新密码"
            className={errors.confirmPassword ? 'has-error' : ''}
          />
          {errors.confirmPassword && (
            <div className="error-message">{errors.confirmPassword}</div>
          )}
        </div>
      </form>
    </div>
  );
};

export default UserConfig; 