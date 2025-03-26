import React, { useState, useEffect } from 'react';
import { FiLock, FiMail } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { 
  sendVerificationCode, 
  loginWithVerificationCode, 
  getUserBasicInfo 
} from '@/services/adminService';
import './Login.scss';

interface LoginFormData {
  email: string;
  verifyCode: string;
}

interface ValidationErrors {
  [key: string]: string;
}

// 本地存储键名
const COUNTDOWN_END_TIME_KEY = 'verify_code_end_time';

const Login: React.FC = () => {
  const navigate = useNavigate();
  
  // 状态定义
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    verifyCode: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [verifyCodeSending, setVerifyCodeSending] = useState<boolean>(false);
  const [userName, setUserName] = useState<string>('');
  const [fetchingUserData, setFetchingUserData] = useState<boolean>(true);

  // 获取用户基本信息
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setFetchingUserData(true);
        const response = await getUserBasicInfo();
        
        if (response.code === 200 && response.data?.user_name) {
          setUserName(response.data.user_name);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      } finally {
        setFetchingUserData(false);
      }
    };

    fetchUserData();
  }, []);

  // 初始化时从localStorage恢复倒计时状态
  useEffect(() => {
    const endTimeStr = localStorage.getItem(COUNTDOWN_END_TIME_KEY);
    if (endTimeStr) {
      const endTime = parseInt(endTimeStr, 10);
      const now = Date.now();
      
      // 如果结束时间还未到，计算剩余时间
      if (endTime > now) {
        const remainingSeconds = Math.ceil((endTime - now) / 1000);
        setCountdown(remainingSeconds);
      } else {
        // 倒计时已结束，清除存储
        localStorage.removeItem(COUNTDOWN_END_TIME_KEY);
      }
    }
  }, []);

  // 倒计时效果
  useEffect(() => {
    if (countdown <= 0) {
      // 倒计时结束，清除存储
      localStorage.removeItem(COUNTDOWN_END_TIME_KEY);
      return;
    }

    // 保存结束时间到localStorage (当前时间 + 剩余秒数)
    const endTime = Date.now() + countdown * 1000;
    localStorage.setItem(COUNTDOWN_END_TIME_KEY, endTime.toString());

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

    if (!formData.email.trim()) {
      newErrors.email = '邮箱不能为空';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '请输入有效的邮箱地址';
    }

    if (!formData.verifyCode.trim()) {
      newErrors.verifyCode = '验证码不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 发送验证码
  const handleSendVerifyCode = async () => {
    // 先验证邮箱
    if (!formData.email.trim()) {
      setErrors(prev => ({
        ...prev,
        email: '邮箱不能为空'
      }));
      return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setErrors(prev => ({
        ...prev,
        email: '请输入有效的邮箱地址'
      }));
      return;
    }

    try {
      setVerifyCodeSending(true);
      // 调用验证码发送接口
      await sendVerificationCode({ 
        user_email: formData.email 
      });

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
      console.log('开始登录请求...');
      // 调用登录接口
      const response = await loginWithVerificationCode({
        user_email: formData.email,
        verified_code: formData.verifyCode
      });

      console.log('登录响应:', response);
      
      // 登录成功直接跳转到管理后台
      if (response.code === 200) {
        console.log('登录成功，准备跳转');
        // 清除倒计时状态
        localStorage.removeItem(COUNTDOWN_END_TIME_KEY);
        
        // 跳转到管理页面
        navigate('/admin');
      } else {
        setSubmitError(response.msg || '登录失败，请稍后再试');
      }
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
          <h1>
            {fetchingUserData ? '验证码登录' : userName ? `欢迎回来，${userName}` : '验证码登录'}
          </h1>
          <p>{userName ? '请输入验证码以安全登录您的管理后台' : '请输入验证码完成登录'}</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">
              <FiMail className="icon" />
              <span>邮箱</span>
            </label>
            <div className="input-container">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="请输入您的邮箱"
              />
            </div>
            {errors.email && <div className="error-message">{errors.email}</div>}
          </div>

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
                placeholder="请输入验证码"
                maxLength={20}
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