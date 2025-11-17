import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.scss';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);
  const [autoRedirect, setAutoRedirect] = useState(true);

  useEffect(() => {
    document.title = '404 - 页面未找到 | H2Blog';
  }, []);

  // 自动倒计时跳转
  useEffect(() => {
    if (!autoRedirect) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, autoRedirect]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    window.history.back();
  };

  const toggleAutoRedirect = () => {
    setAutoRedirect(!autoRedirect);
    if (!autoRedirect) {
      setCountdown(10);
    }
  };

  return (
    <div className='not-found-container'>
      {/* 背景装饰 */}
      <div className='not-found-background'>
        <div className='floating-shapes'>
          <div className='shape shape-1'></div>
          <div className='shape shape-2'></div>
          <div className='shape shape-3'></div>
          <div className='shape shape-4'></div>
          <div className='shape shape-5'></div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className='not-found-content glass'>
        <div className='not-found-icon'>
          <div className='error-code'>
            <span className='four'>4</span>
            <div className='zero-container'>
              <div className='zero'>
                <div className='zero-inner'></div>
              </div>
            </div>
            <span className='four'>4</span>
          </div>
        </div>

        <div className='not-found-text'>
          <h1 className='not-found-title'>页面走丢了</h1>
          <p className='not-found-description'>
            抱歉，您访问的页面可能已被移除、重命名或暂时不可用
          </p>

          {autoRedirect && (
            <div className='countdown-info'>
              <p className='countdown-text'>
                {countdown} 秒后自动返回首页
              </p>
            </div>
          )}
        </div>

        <div className='not-found-actions'>
          <button
            className='home-btn glass-light'
            onClick={handleBackToHome}
            type='button'
          >
            <svg
              className='home-icon'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
              />
            </svg>
            返回首页
          </button>

          <button
            className='back-btn glass-light'
            onClick={handleGoBack}
            type='button'
          >
            <svg
              className='back-icon'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 19l-7-7 7-7'
              />
            </svg>
            返回上页
          </button>

          <button
            className={`timer-btn glass-light ${autoRedirect ? 'active' : ''}`}
            onClick={toggleAutoRedirect}
            type='button'
          >
            <svg
              className='timer-icon'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
            >
              <circle cx='12' cy='12' r='10' />
              <polyline points='12,6 12,12 16,14' />
            </svg>
            {autoRedirect ? '关闭' : '开启'}倒计时
          </button>
        </div>

        <div className='not-found-footer'>
          <p className='status-text'>
            如果这个问题持续出现，请联系网站管理员
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
