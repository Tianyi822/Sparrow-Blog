import React, { useState } from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import { FiHome, FiFileText, FiTag, FiFolder, FiSettings, FiUsers, FiMessageCircle, FiLogOut } from 'react-icons/fi';
import './AdminLayout.scss';

const AdminLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // 检查当前路径是否为登录页
  const isLoginPage = location.pathname === '/admin/login';

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
          <h1 className="logo">H2Blog</h1>
          <button className="collapse-btn" onClick={toggleSidebar}>
            {collapsed ? '→' : '←'}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          <ul>
            <li>
              <Link to="/admin" className="nav-item active">
                <FiHome className="nav-icon" />
                <span className="nav-text">仪表盘</span>
              </Link>
            </li>
            <li>
              <Link to="/admin/posts" className="nav-item">
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
        <header className="admin-header">
          <div className="header-left">
            <h2 className="page-title">文章管理</h2>
          </div>
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">管理员</span>
              <img src="https://via.placeholder.com/40" alt="用户头像" className="user-avatar" />
            </div>
          </div>
        </header>
        
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 