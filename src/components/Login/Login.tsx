import React, { useState, useEffect } from 'react';
import { FiLock } from 'react-icons/fi';
import './Login.scss';

interface LoginFormData {
  verifyCode: string;
}

interface ValidationErrors {
  [key: string]: string;
}

const Login: React.FC = () => {
  // 状态定义
  const [formData, setFormData] = useState<LoginFormData>({
    verifyCode: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [verifyCodeSending, setVerifyCodeSending] = useState<boolean>(false);

  // 倒计时效果
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  // 表单输入变更处理
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // 清除该字段的错误
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    // 清除提交错误
    if (submitError) setSubmitError('');
  };

  // 验证表单字段
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.verifyCode.trim()) {
      newErrors.verifyCode = '验证码不能为空';
    } else if (formData.verifyCode.length !== 6) {
      newErrors.verifyCode = '验证码必须是6位数字';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 发送验证码
  const handleSendVerifyCode = async () => {
    try {
      setVerifyCodeSending(true);
      // TODO: 实际发送验证码的API调用
      // const response = await sendVerificationCode();

      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCountdown(60); // 设置60秒倒计时
      // 成功提示可以在这里添加
    } catch (error) {
      console.error('发送验证码失败:', error);
      setSubmitError('发送验证码失败，请稍后重试');
    } finally {
      setVerifyCodeSending(false);
    }
  };

  // 提交登录
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      // TODO: 实际验证码登录的API调用
      // const response = await verifyCodeLogin(formData);

      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 模拟登录成功后的重定向
      // window.location.href = '/dashboard';

      // 测试错误显示
      throw new Error('验证码错误或已过期，请重新获取');

    } catch (error) {
      console.error('登录失败:', error);
      setSubmitError(error instanceof Error ? error.message : '登录失败，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>验证码登录</h1>
          <p>请输入验证码完成登录</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group verify-code-group">
            <label htmlFor="verifyCode">
              <FiLock className="icon" />
              <span>验证码</span>
            </label>
            <div className="verify-code-container">
              <input
                type="text"
                id="verifyCode"
                name="verifyCode"
                value={formData.verifyCode}
                onChange={handleChange}
                placeholder="6位验证码"
                maxLength={6}
              />
              <button
                type="button"
                className="verify-code-button"
                onClick={handleSendVerifyCode}
                disabled={countdown > 0 || verifyCodeSending}
              >
                {verifyCodeSending
                  ? '发送中...'
                  : countdown > 0
                    ? `${countdown}秒后重试`
                    : '获取验证码'}
              </button>
            </div>
            {errors.verifyCode && <div className="error-message">{errors.verifyCode}</div>}
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? '登录中...' : '登录'}
          </button>

          {submitError && (
            <div className="submit-error-container">
              <div className="submit-error">{submitError}</div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Login; 