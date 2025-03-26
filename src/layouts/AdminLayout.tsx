import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { FiFileText, FiTag, FiFolder, FiSettings, FiUsers, FiMessageCircle, FiLogOut } from 'react-icons/fi';
import { getUserBasicInfo } from '@/services/adminService';
import './AdminLayout.scss';

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
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
    setCollapsed(!collapsed);
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
    <div className={`admin-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h1 className="logo">{userName || '加载中...'}</h1>
          <button className="collapse-btn" onClick={toggleSidebar}>
            {collapsed ? '→' : '←'}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/admin" className="nav-item active">
                <FiFileText className="nav-icon" />
                <span className="nav-text">文章管理</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/categories" className="nav-item">
                <FiFolder className="nav-icon" />
                <span className="nav-text">分类管理</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/tags" className="nav-item">
                <FiTag className="nav-icon" />
                <span className="nav-text">标签管理</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/comments" className="nav-item">
                <FiMessageCircle className="nav-icon" />
                <span className="nav-text">评论管理</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/users" className="nav-item">
                <FiUsers className="nav-icon" />
                <span className="nav-text">用户管理</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/settings" className="nav-item">
                <FiSettings className="nav-icon" />
                <span className="nav-text">系统设置</span>
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut className="nav-icon" />
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
  );
};

export default AdminLayout; 