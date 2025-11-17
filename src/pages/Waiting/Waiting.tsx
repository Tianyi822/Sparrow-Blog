import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkSystemStatus } from '@/services/webService';
import './Waiting.scss';

const Waiting: React.FC = () => {
  const [dots, setDots] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  // 动态显示加载点
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        if (prev.length >= 3) return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // 定期检查系统状态
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const { isRuntime } = await checkSystemStatus();

        if (isRuntime) {
          // 使用 navigate 跳转到首页，并替换当前历史记录
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('系统状态检查失败:', error);
        setRetryCount((prev) => prev + 1);
      }
    };

    // 立即执行一次检查
    checkStatus();

    // 每3秒检查一次
    const interval = setInterval(checkStatus, 3000);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className='waiting-container'>
      {/* 背景装饰 */}
      <div className='waiting-background'>
        <div className='floating-shapes'>
          <div className='shape shape-1'></div>
          <div className='shape shape-2'></div>
          <div className='shape shape-3'></div>
          <div className='shape shape-4'></div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className='waiting-content glass'>
        <div className='waiting-icon'>
          <div className='spinner'>
            <div className='spinner-ring'></div>
            <div className='spinner-ring'></div>
            <div className='spinner-ring'></div>
          </div>
        </div>

        <div className='waiting-text'>
          <h1 className='waiting-title'>系统准备中{dots}</h1>
          <p className='waiting-description'>
            系统正在初始化配置和服务，请稍等片刻
          </p>

          {retryCount > 0 && (
            <div className='retry-info'>
              <p className='retry-text'>已重试 {retryCount} 次</p>
            </div>
          )}
        </div>

        <div className='waiting-actions'>
          <button
            className='refresh-btn glass-light'
            onClick={handleRefresh}
            type='button'
          >
            <svg
              className='refresh-icon'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
              />
            </svg>
            刷新页面
          </button>

          <button
            className='home-btn glass-light'
            onClick={handleGoHome}
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
            尝试进入
          </button>
        </div>

        <div className='waiting-footer'>
          <p className='status-text'>
            系统会在准备完成后自动跳转到首页
          </p>
        </div>
      </div>
    </div>
  );
};

export default Waiting;
