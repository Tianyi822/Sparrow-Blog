import { FC, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './NotFound.scss';

const NotFound: FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    document.title = '404 - 页面未找到 | Tianyi\'s Blog';
  }, []);

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    window.history.back();
  };

  return (
    <div className="not-found-container">
      <div className="background-decoration">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
        <div className="blur-patch blur-patch-1"></div>
        <div className="blur-patch blur-patch-2"></div>
      </div>
      
      <div className="not-found-content">
        <div className="not-found-code">404</div>
        <h1 className="not-found-title">页面未找到</h1>
        <p className="not-found-message">
          抱歉，您访问的页面不存在或已被移除。
        </p>
        <div className="not-found-actions">
          <button 
            className="not-found-button primary" 
            onClick={handleBackToHome}
          >
            返回首页
          </button>
          <button 
            className="not-found-button secondary" 
            onClick={handleGoBack}
          >
            返回上页
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound; 