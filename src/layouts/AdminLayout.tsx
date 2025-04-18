import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { FiFileText, FiEdit, FiSettings, FiMessageCircle, FiLogOut, FiImage, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { getUserBasicInfo } from '@/services/adminService';
import { LayoutContext } from './LayoutContext';
import './AdminLayout.scss';

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isLayoutTransitioning, setIsLayoutTransitioning] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // 检查当前路径是否为登录页
  const isLoginPage = location.pathname === '/admin/login';

  // 获取用户信息
  useEffect(() => {
    if (isLoginPage) return;
    
    const fetchUserData = async () => {
      try {
        const response = await getUserBasicInfo();
        
        if (response.code === 200 && response.data?.user_name) {
          setUserName(response.data.user_name);
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };

    fetchUserData();
  }, [isLoginPage]);

  const handleLogout = () => {
    // 清除登录状态
    localStorage.removeItem('auth_token');
    // 跳转到登录页
    navigate('/admin/login');
  };

  const toggleSidebar = () => {
    // 标记过渡开始
    setIsLayoutTransitioning(true);
    
    // 切换折叠状态
    setCollapsed(!collapsed);
    
    // 过渡结束后解除标记（使用与CSS过渡相同的持续时间）
    setTimeout(() => {
      setIsLayoutTransitioning(false);
    }, 300); // 300ms应该与AdminLayout.scss中的过渡时间匹配
  };

  // 如果是登录页，则只渲染Outlet部分，不显示侧边栏和导航
  if (isLoginPage) {
    return (
      <div className="admin-layout login-only">
        <main className="admin-main full-width">
          <Outlet />
        </main>
      </div>
    );
  }

  return (
    <LayoutContext.Provider value={{ collapsed, isLayoutTransitioning }}>
      <div className={`admin-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="sidebar-header">
            <h1 className="logo">{userName || '加载中...'}</h1>
            <button className="collapse-btn" onClick={toggleSidebar}>
              {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
          </div>
          
          <nav className="sidebar-nav">
            <ul>
              <li>
                <Link to="/admin" className={`nav-item ${location.pathname === '/admin' ? 'active' : ''}`}>
                  <FiFileText className="nav-icon" />
                  <span className="nav-text">文章管理</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/edit" className={`nav-item ${location.pathname === '/admin/edit' ? 'active' : ''}`}>
                  <FiEdit className="nav-icon" />
                  <span className="nav-text">文章编辑</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/gallery" className={`nav-item ${location.pathname.startsWith('/admin/gallery') ? 'active' : ''}`}>
                  <FiImage className="nav-icon" />
                  <span className="nav-text">图库管理</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/comments" className={`nav-item ${location.pathname === '/admin/comments' ? 'active' : ''}`}>
                  <FiMessageCircle className="nav-icon" />
                  <span className="nav-text">评论管理</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/settings" className={`nav-item ${location.pathname === '/admin/settings' ? 'active' : ''}`}>
                  <FiSettings className="nav-icon" />
                  <span className="nav-text">系统设置</span>
                </Link>
              </li>
            </ul>
          </nav>
          
          <div className="sidebar-footer">
            <button className="logout-btn" onClick={handleLogout}>
              <FiLogOut className="nav-icon" style={{ display: 'block', minWidth: '1.2rem' }} />
              <span className="nav-text">退出登录</span>
            </button>
          </div>
        </aside>
        
        {/* Main content */}
        <div className="admin-content">
          <main className="admin-main">
            <Outlet />
          </main>
        </div>
      </div>
    </LayoutContext.Provider>
  );
};

export default AdminLayout; 