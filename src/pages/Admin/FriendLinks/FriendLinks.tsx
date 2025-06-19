import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiEdit,
  FiEye,
  FiEyeOff,
  FiSearch,
  FiTrash2,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiSettings
} from 'react-icons/fi';
import { FriendLinkItem, getAllFriendLinks, updateFriendLink, deleteFriendLink, toggleFriendLinkDisplay } from '@/services/adminService';
import './FriendLinks.scss';

// 可选的每页条数选项
const pageSizeOptions = [10, 25, 50, 100];

const FriendLinks: React.FC = memo(() => {
  const [friendLinks, setFriendLinks] = useState<FriendLinkItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchName, setSearchName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [linksPerPage, setLinksPerPage] = useState<number>(25);
  const [showPageSizeSelector, setShowPageSizeSelector] = useState<boolean>(false);
  const [editingLink, setEditingLink] = useState<FriendLinkItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    friend_link_name: '',
    friend_link_url: '',
    friend_avatar_url: '',
    friend_describe: '',
    display: true
  });

  // 获取友链列表数据
  useEffect(() => {
    const fetchFriendLinks = async () => {
      try {
        setLoading(true);
        const response = await getAllFriendLinks();
        if (response.code === 200) {
          setFriendLinks(response.data || []);
        } else {
          setError(response.msg || '获取友链列表失败');
        }
      } catch (err) {
        setError('获取友链列表时发生错误');
      } finally {
        setLoading(false);
      }
    };

    fetchFriendLinks();
  }, []);

  // 过滤友链
  const filteredFriendLinks = useMemo(() => {
    return friendLinks.filter(link =>
      searchName ? link.friend_link_name.toLowerCase().includes(searchName.toLowerCase()) : true
    );
  }, [friendLinks, searchName]);

  // 计算总页数
  const totalPages = Math.ceil(filteredFriendLinks.length / linksPerPage);

  // 获取当前页的友链
  const getCurrentPageLinks = useCallback(() => {
    const startIndex = (currentPage - 1) * linksPerPage;
    return filteredFriendLinks.slice(startIndex, startIndex + linksPerPage);
  }, [currentPage, filteredFriendLinks, linksPerPage]);

  // 当搜索条件改变时，重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [searchName]);

  // 当每页显示条数改变时，重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [linksPerPage]);

  // 处理页码变化
  const handlePageChange = useCallback((page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }, [totalPages]);

  // 处理每页显示条数变化
  const handlePageSizeChange = useCallback((size: number) => {
    setLinksPerPage(size);
    setShowPageSizeSelector(false);
  }, []);

  // 重置表单
  const resetForm = useCallback(() => {
    setFormData({
      friend_link_name: '',
      friend_link_url: '',
      friend_avatar_url: '',
      friend_describe: '',
      display: true
    });
    setEditingLink(null);
  }, []);

  // 处理编辑友链
  const handleEdit = useCallback((link: FriendLinkItem) => {
    setFormData({
      friend_link_name: link.friend_link_name,
      friend_link_url: link.friend_link_url,
      friend_avatar_url: link.friend_avatar_url,
      friend_describe: link.friend_describe,
      display: link.display
    });
    setEditingLink(link);
    setShowEditModal(true);
  }, []);

  // 处理表单提交
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.friend_link_name.trim() || !formData.friend_link_url.trim()) {
      setError('友链名称和链接地址不能为空');
      return;
    }

    if (!editingLink) return;

    try {
      const updateData = {
        friend_link_id: editingLink.friend_link_id,
        friend_link_name: formData.friend_link_name,
        friend_link_url: formData.friend_link_url,
        friend_avatar_url: formData.friend_avatar_url,
        friend_describe: formData.friend_describe
      };
      
      const response = await updateFriendLink(updateData);
      if (response.code === 200) {
        setFriendLinks(prev => prev.map(link =>
          link.friend_link_id === editingLink.friend_link_id
            ? { ...link, ...formData }
            : link
        ));
        setShowEditModal(false);
        resetForm();
        setError(null);
      } else {
        setError(response.msg || '更新友链失败');
      }
    } catch (err) {
      setError('更新友链时发生错误');
    }
  }, [formData, editingLink, resetForm]);

  // 处理删除友链
  const handleDelete = useCallback(async (id: string, name: string) => {
    if (window.confirm(`确定要删除友链 "${name}" 吗？此操作不可恢复。`)) {
      try {
        const response = await deleteFriendLink(id);
        if (response.code === 200) {
          setFriendLinks(prev => prev.filter(link => link.friend_link_id !== id));
          setError(null);
        } else {
          setError(response.msg || '删除友链失败');
        }
      } catch (err) {
        setError('删除友链时发生错误');
      }
    }
  }, []);

  // 处理显示状态切换
  const handleToggleDisplay = useCallback(async (id: string) => {
    try {
      const response = await toggleFriendLinkDisplay(id);
      if (response.code === 200 && response.data) {
        setFriendLinks(prev => prev.map(link =>
          link.friend_link_id === id
            ? { ...link, display: response.data.display }
            : link
        ));
        setError(null);
      } else {
        setError(response.msg || '切换显示状态失败');
      }
    } catch (err) {
      setError('切换显示状态时发生错误');
    }
  }, []);

  // 渲染搜索组件
  const renderSearchComponent = useCallback(() => {
    return (
      <div className="search-container">
        <div className="search-input-wrapper">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="搜索友链名称..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="search-input"
          />
          {searchName && (
            <button className="clear-search" onClick={() => setSearchName('')}>
              <FiX />
            </button>
          )}
        </div>
      </div>
    );
  }, [searchName]);

  // 渲染每页显示条数选择器
  const renderPageSizeSelector = useCallback(() => {
    return (
      <div className="page-size-selector">
        <button
          className="page-size-toggle"
          onClick={() => setShowPageSizeSelector(!showPageSizeSelector)}
          title="设置每页显示数量"
        >
          <FiSettings />
          <span>{linksPerPage} 条 / 页</span>
        </button>

        {showPageSizeSelector && (
          <div className="page-size-dropdown">
            {pageSizeOptions.map(size => (
              <button
                key={size}
                className={`page-size-option ${linksPerPage === size ? 'active' : ''}`}
                onClick={() => handlePageSizeChange(size)}
              >
                {size}条/页
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }, [handlePageSizeChange, linksPerPage, showPageSizeSelector]);

  // 生成页码按钮
  const renderPagination = useCallback(() => {
    return (
      <div className="pagination-container">
        <div className="pagination">
          <button
            className="pagination-btn prev"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FiChevronLeft />
          </button>

          <div className="pagination-info">
            <span className="current-page">{currentPage}</span>
            <span className="page-separator">/</span>
            <span className="total-pages">{totalPages}</span>
          </div>

          <button
            className="pagination-btn next"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <FiChevronRight />
          </button>
        </div>

        {renderPageSizeSelector()}
      </div>
    );
  }, [currentPage, handlePageChange, renderPageSizeSelector, totalPages]);

  // 渲染结果统计
  const renderResultSummary = useCallback(() => {
    return (
      <div className="result-summary">
        显示 {filteredFriendLinks.length} 个结果中的 {Math.min(linksPerPage, getCurrentPageLinks().length)}
        {searchName && ' (已筛选)'}
      </div>
    );
  }, [filteredFriendLinks.length, getCurrentPageLinks, linksPerPage, searchName]);

  if (loading) {
    return <div className="loading-container">加载中...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="admin-friend-links">
      {renderSearchComponent()}

      {renderResultSummary()}

      <div className="friend-links-table-container">
        <table className="friend-links-table">
          <thead>
            <tr>
              <th className="fixed-column index-column">序号</th>
              <th className="fixed-column name-column">友链名称</th>
              <th className="url-column">链接地址</th>
              <th className="avatar-column">头像地址</th>
              <th className="describe-column">描述</th>
              <th className="status-column">状态</th>
              <th className="action-column">操作</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentPageLinks().map((link, index) => (
              <tr key={link.friend_link_id}>
                <td className="fixed-column index-column">{(currentPage - 1) * linksPerPage + index + 1}</td>
                <td className="fixed-column name-column" data-full-name={link.friend_link_name}>
                  <div className="name-wrapper">
                    <span className="friend-name" title={link.friend_link_name}>{link.friend_link_name}</span>
                  </div>
                </td>
                <td className="url-column">
                  <a href={link.friend_link_url} target="_blank" rel="noopener noreferrer" title={link.friend_link_url}>
                    {link.friend_link_url}
                  </a>
                </td>
                <td className="avatar-column">
                  <span className="avatar-url" title={link.friend_avatar_url}>{link.friend_avatar_url}</span>
                </td>
                <td className="describe-column">
                  <span className="describe-text" title={link.friend_describe}>{link.friend_describe}</span>
                </td>
                <td className="status-column">
                  <span className={`status-badge ${link.display ? 'public' : 'hidden'}`}>
                    {link.display ? '显示' : '隐藏'}
                  </span>
                </td>
                <td className="action-column">
                  <div className="action-buttons">
                    <button
                      className="action-btn toggle-status"
                      title={link.display ? '隐藏' : '显示'}
                      onClick={() => handleToggleDisplay(link.friend_link_id)}
                    >
                      {link.display ? <FiEye /> : <FiEyeOff />}
                    </button>
                    <button
                      className="action-btn edit"
                      title="编辑"
                      onClick={() => handleEdit(link)}
                    >
                      <FiEdit />
                    </button>
                    <button
                      className="action-btn delete"
                      title="删除"
                      onClick={() => handleDelete(link.friend_link_id, link.friend_link_name)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {renderPagination()}

      {/* 编辑友链模态框 */}
      {showEditModal && editingLink && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>编辑友链</h2>
              <button className="close-btn" onClick={() => setShowEditModal(false)}>
                <FiX />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="friend_link_name">友链名称 *</label>
                <input
                  type="text"
                  id="friend_link_name"
                  value={formData.friend_link_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, friend_link_name: e.target.value }))}
                  placeholder="请输入友链名称"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="friend_link_url">链接地址 *</label>
                <input
                  type="url"
                  id="friend_link_url"
                  value={formData.friend_link_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, friend_link_url: e.target.value }))}
                  placeholder="https://example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="friend_avatar_url">头像地址</label>
                <input
                  type="url"
                  id="friend_avatar_url"
                  value={formData.friend_avatar_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, friend_avatar_url: e.target.value }))}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <div className="form-group">
                <label htmlFor="friend_describe">描述</label>
                <textarea
                  id="friend_describe"
                  value={formData.friend_describe}
                  onChange={(e) => setFormData(prev => ({ ...prev, friend_describe: e.target.value }))}
                  placeholder="请输入友链描述"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.display}
                    onChange={(e) => setFormData(prev => ({ ...prev, display: e.target.checked }))}
                  />
                  显示友链
                </label>
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowEditModal(false)}>
                  取消
                </button>
                <button type="submit">
                  更新
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
});

export default FriendLinks; 