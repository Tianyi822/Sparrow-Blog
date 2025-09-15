import { getUserConfig } from '@/services/adminService';
import { businessApiRequest } from '@/services/api';
import { ApiResponse } from '@/types';
import React, { useCallback, useEffect, useMemo } from 'react';
import { FiChevronLeft, FiChevronRight, FiEdit, FiFileText, FiImage, FiLogOut, FiMessageCircle, FiSettings, FiUsers } from 'react-icons/fi';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useUserStore, useUIStore } from '@/stores';
import './AdminLayout.scss';
import { LayoutContext } from './LayoutContext';

/**
 * 管理后台布局组件
 * 提供侧边栏导航、登录状态管理和内容区域布局
 */
const AdminLayout: React.FC = () => {
  // 使用 Zustand 状态管理
  const { user, setUser, logout: userLogout } = useUserStore();
  const { sidebarCollapsed, isLayoutTransitioning, setSidebarCollapsed, setLayoutTransitioning } = useUIStore();

  // 路由相关hook
  const navigate = useNavigate();
  const location = useLocation();

  // 检查当前路径是否为登录页
  const isLoginPage = useMemo(() => location.pathname === '/admin/login', [location.pathname]);

  /**
   * 获取用户信息
   * 从服务器获取当前登录用户的配置信息
   */
  useEffect(() => {
    // 如果是登录页面，不需要获取用户信息
    if (isLoginPage) return;

    const fetchUserData = async () => {
      try {
        const response = await getUserConfig();

        if (response.code === 200 && response.data) {
          setUser({
            id: '',
            username: response.data.user_name,
            email: response.data.user_email,
            avatar: response.data.avatar_image,
            role: 'admin',
            createdAt: '',
            updatedAt: ''
          });
        }
      } catch (error) {
        // 错误已记录，避免向控制台输出
        console.error('获取用户信息失败:', error);
      }
    };

    fetchUserData();
  }, [isLoginPage, setUser]);

  /**
   * 处理退出登录
   * 发送退出请求并清除本地认证信息
   */
  const handleLogout = useCallback(async () => {
    try {
      // 发起退出登录请求
      const response = await businessApiRequest<ApiResponse<null>>({
        method: 'GET',
        url: '/admin/logout',
        // 请求会自动带上 token，因为 businessApiRequest 已经配置了 token
      });

      if (response.code === 200) {
        // 使用 store 的 logout 方法清除状态
        userLogout();
        // 跳转到根路由
        navigate('/');
      } else {
        alert('退出登录失败: ' + response.msg);
      }
    } catch (error) {
      alert('退出登录请求失败，请稍后重试: ' + error);

      // 即使请求失败，也使用 store 的 logout 方法清除状态
      userLogout();
      navigate('/');
    }
  }, [navigate, userLogout]);

  /**
   * 切换侧边栏展开/折叠状态
   * 包含过渡动画处理
   */
  const toggleSidebar = useCallback(() => {
    // 标记过渡开始
    setLayoutTransitioning(true);

    // 切换折叠状态
    setSidebarCollapsed(!sidebarCollapsed);

    // 过渡结束后解除标记（使用与CSS过渡相同的持续时间）
    setTimeout(() => {
      setLayoutTransitioning(false);
    }, 300); // 300ms应该与AdminLayout.scss中的过渡时间匹配
  }, [sidebarCollapsed, setSidebarCollapsed, setLayoutTransitioning]);

  /**
   * 计算当前路由项是否激活
   * @param path - 要检查的路径
   * @param exact - 是否精确匹配
   */
  const isActive = useCallback((path: string, exact = false): boolean => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  }, [location.pathname]);

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

  // 正常管理界面布局
  return (
    <LayoutContext.Provider value={{ collapsed: sidebarCollapsed, isLayoutTransitioning }}>
      <div className={`admin-layout ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* 侧边栏 */}
        <aside className="admin-sidebar">
          <div className="sidebar-header">
            <h1 className="logo">{user?.username || '加载中...'}</h1>
            <button className="collapse-btn" onClick={toggleSidebar} aria-label="折叠菜单">
              {sidebarCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
            </button>
          </div>

          {/* 导航菜单 */}
          <nav className="sidebar-nav">
            <ul>
              <li>
                <Link to="/admin" className={`nav-item ${isActive('/admin', true) ? 'active' : ''}`}>
                  <FiFileText className="nav-icon" />
                  <span className="nav-text">文章管理</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/edit" className={`nav-item ${isActive('/admin/edit', true) ? 'active' : ''}`}>
                  <FiEdit className="nav-icon" />
                  <span className="nav-text">文章编辑</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/gallery" className={`nav-item ${isActive('/admin/gallery') ? 'active' : ''}`}>
                  <FiImage className="nav-icon" />
                  <span className="nav-text">图库管理</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/comments" className={`nav-item ${isActive('/admin/comments', true) ? 'active' : ''}`}>
                  <FiMessageCircle className="nav-icon" />
                  <span className="nav-text">评论管理</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/friend-links" className={`nav-item ${isActive('/admin/friend-links') ? 'active' : ''}`}>
                  <FiUsers className="nav-icon" />
                  <span className="nav-text">友链管理</span>
                </Link>
              </li>
              <li>
                <Link to="/admin/settings" className={`nav-item ${isActive('/admin/settings', true) ? 'active' : ''}`}>
                  <FiSettings className="nav-icon" />
                  <span className="nav-text">系统设置</span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* 底部操作区 */}
          <div className="sidebar-footer">
            <button className="logout-btn" onClick={handleLogout}>
              <FiLogOut className="nav-icon" style={{ display: 'block', minWidth: '1.2rem' }} />
              <span className="nav-text">退出登录</span>
            </button>
          </div>
        </aside>

        {/* 主内容区域 */}
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