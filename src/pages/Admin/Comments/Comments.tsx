import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import {
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiEdit,
  FiMail,
  FiSearch,
  FiSettings,
  FiTrash2,
  FiX,
} from 'react-icons/fi';
import { deleteComment, getAllComments, updateComment } from '@/services/adminService';
import { CommentItem } from '@/types';
import './Comments.scss';

// 可选的每页条数选项
const pageSizeOptions = [10, 25, 50, 100];

const Comments: React.FC = memo(() => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchContent, setSearchContent] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [commentsPerPage, setCommentsPerPage] = useState<number>(25);
  const [showPageSizeSelector, setShowPageSizeSelector] = useState<boolean>(false);
  const [editingComment, setEditingComment] = useState<CommentItem | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // 获取评论列表数据
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await getAllComments();
        if (response.code === 200) {
          setComments(response.data || []);
        } else {
          setError(response.msg || '获取评论列表失败');
        }
      } catch {
        setError('获取评论列表时发生错误');
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, []);

  // 过滤评论
  const filteredComments = useMemo(() => {
    return comments.filter((comment) =>
      searchContent
        ? comment.content.toLowerCase().includes(searchContent.toLowerCase()) ||
          comment.commenter_email.toLowerCase().includes(searchContent.toLowerCase()) ||
          comment.blog_title.toLowerCase().includes(searchContent.toLowerCase())
        : true
    );
  }, [comments, searchContent]);

  // 计算总页数
  const totalPages = Math.ceil(filteredComments.length / commentsPerPage);

  // 获取当前页的评论
  const getCurrentPageComments = useCallback(() => {
    const startIndex = (currentPage - 1) * commentsPerPage;
    return filteredComments.slice(startIndex, startIndex + commentsPerPage);
  }, [currentPage, filteredComments, commentsPerPage]);

  // 当搜索条件改变时，重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [searchContent]);

  // 当每页显示条数改变时，重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [commentsPerPage]);

  // 处理页码变化
  const handlePageChange = useCallback((page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }, [totalPages]);

  // 处理每页显示条数变化
  const handlePageSizeChange = useCallback((size: number) => {
    setCommentsPerPage(size);
    setShowPageSizeSelector(false);
  }, []);

  // 处理删除评论
  const handleDelete = useCallback(async (id: string, content: string) => {
    const truncatedContent = content.length > 20 ? content.substring(0, 20) + '...' : content;
    if (window.confirm(`确定要删除评论 "${truncatedContent}" 吗？此操作不可恢复。`)) {
      try {
        const response = await deleteComment(id);
        if (response.code === 200) {
          setComments((prev) => prev.filter((comment) => comment.comment_id !== id));
          setError(null);
        } else {
          setError(response.msg || '删除评论失败');
        }
      } catch {
        setError('删除评论时发生错误');
      }
    }
  }, []);

  // 格式化时间
  const formatTime = useCallback((timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return timeString;
    }
  }, []);

  // 移除回复相关逻辑，因为新接口格式中没有回复字段

  // 处理编辑评论
  const handleEdit = useCallback((comment: CommentItem) => {
    setEditingComment(comment);
    setEditContent(comment.content);
    setShowEditModal(true);
  }, []);

  // 关闭编辑模态框
  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setEditingComment(null);
    setEditContent('');
    setIsSaving(false);
  }, []);

  // 保存编辑的评论
  const handleSaveComment = useCallback(async () => {
    if (!editingComment || !editContent.trim()) return;

    try {
      setIsSaving(true);
      const response = await updateComment(editingComment.comment_id, editContent.trim());

      if (response.code === 200 && response.data) {
        // 更新本地评论列表
        setComments((prev) =>
          prev.map((comment) => comment.comment_id === editingComment.comment_id ? response.data : comment)
        );
        setError(null);
        handleCloseEditModal();
      } else {
        setError(response.msg || '更新评论失败');
      }
    } catch {
      setError('更新评论时发生错误');
    } finally {
      setIsSaving(false);
    }
  }, [editingComment, editContent, handleCloseEditModal]);

  // 渲染搜索组件
  const renderSearchComponent = useCallback(() => {
    return (
      <div className='search-container'>
        <div className='search-input-wrapper'>
          <FiSearch className='search-icon' />
          <input
            type='text'
            placeholder='搜索评论内容、邮箱或博客标题...'
            value={searchContent}
            onChange={(e) => setSearchContent(e.target.value)}
            className='search-input'
          />
          {searchContent && (
            <button type='button' className='clear-search' onClick={() => setSearchContent('')}>
              <FiX />
            </button>
          )}
        </div>
      </div>
    );
  }, [searchContent]);

  // 渲染每页显示条数选择器
  const renderPageSizeSelector = useCallback(() => {
    return (
      <div className='page-size-selector'>
        <button
          type='button'
          className='page-size-toggle'
          onClick={() => setShowPageSizeSelector(!showPageSizeSelector)}
          title='设置每页显示数量'
        >
          <FiSettings />
          <span>{commentsPerPage} 条 / 页</span>
        </button>

        {showPageSizeSelector && (
          <div className='page-size-dropdown'>
            {pageSizeOptions.map((size) => (
              <button
                type='button'
                key={size}
                className={`page-size-option ${commentsPerPage === size ? 'active' : ''}`}
                onClick={() => handlePageSizeChange(size)}
              >
                {size}条/页
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }, [handlePageSizeChange, commentsPerPage, showPageSizeSelector]);

  // 生成页码按钮
  const renderPagination = useCallback(() => {
    return (
      <div className='pagination-container'>
        <div className='pagination'>
          <button
            type='button'
            className='pagination-btn prev'
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <FiChevronLeft />
          </button>

          <div className='pagination-info'>
            <span className='current-page'>{currentPage}</span>
            <span className='page-separator'>/</span>
            <span className='total-pages'>{totalPages}</span>
          </div>

          <button
            type='button'
            className='pagination-btn next'
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
      <div className='result-summary'>
        显示 {filteredComments.length} 个结果中的 {Math.min(commentsPerPage, getCurrentPageComments().length)}
        {searchContent && ' (已筛选)'}
      </div>
    );
  }, [filteredComments.length, getCurrentPageComments, commentsPerPage, searchContent]);

  if (loading) {
    return <div className='loading-container'>加载中...</div>;
  }

  if (error) {
    return <div className='error-container'>{error}</div>;
  }

  return (
    <div className='admin-comments'>
      {renderSearchComponent()}

      {renderResultSummary()}

      <div className='comments-table-container'>
        <table className='comments-table'>
          <thead>
            <tr>
              <th className='fixed-column index-column'>序号</th>
              <th className='fixed-column content-column'>评论内容</th>
              <th className='email-column'>评论者邮箱</th>
              <th className='blog-column'>博客标题</th>
              <th className='time-column'>创建时间</th>
              <th className='action-column'>操作</th>
            </tr>
          </thead>
          <tbody>
            {getCurrentPageComments().map((comment, index) => (
              <tr key={comment.comment_id}>
                <td className='fixed-column index-column'>
                  {(currentPage - 1) * commentsPerPage + index + 1}
                </td>
                <td className='fixed-column content-column' data-full-content={comment.content}>
                  <div className='content-wrapper'>
                    <span className='comment-content' title={comment.content}>
                      {comment.content}
                    </span>
                  </div>
                </td>
                <td className='email-column'>
                  <div className='email-info'>
                    <FiMail className='email-icon' />
                    <span className='email-text' title={comment.commenter_email}>
                      {comment.commenter_email}
                    </span>
                  </div>
                </td>
                <td className='blog-column'>
                  <span className='blog-title' title={comment.blog_title}>
                    {comment.blog_title}
                  </span>
                </td>
                <td className='time-column'>
                  <div className='time-info'>
                    <FiCalendar className='time-icon' />
                    <span className='time-text'>
                      {formatTime(comment.create_time)}
                    </span>
                  </div>
                </td>
                <td className='action-column'>
                  <div className='action-buttons'>
                    <button
                      type='button'
                      className='action-btn edit'
                      title='编辑评论'
                      onClick={() => handleEdit(comment)}
                    >
                      <FiEdit />
                    </button>
                    <button
                      type='button'
                      className='action-btn delete'
                      title='删除'
                      onClick={() => handleDelete(comment.comment_id, comment.content)}
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

      {/* 编辑评论模态框 */}
      {showEditModal && editingComment && (
        <div className='modal-overlay' onClick={handleCloseEditModal}>
          <div className='modal-content' onClick={(e) => e.stopPropagation()}>
            <div className='modal-header'>
              <h2>编辑评论</h2>
              <button type='button' className='close-btn' onClick={handleCloseEditModal}>
                <FiX />
              </button>
            </div>
            <div className='comment-details'>
              <div className='detail-item'>
                <label>评论ID:</label>
                <span className='detail-value'>{editingComment.comment_id}</span>
              </div>
              <div className='detail-item'>
                <label>评论者邮箱:</label>
                <span className='detail-value'>{editingComment.commenter_email}</span>
              </div>
              <div className='detail-item'>
                <label>博客标题:</label>
                <span className='detail-value'>{editingComment.blog_title}</span>
              </div>
              <div className='detail-item'>
                <label>创建时间:</label>
                <span className='detail-value'>{formatTime(editingComment.create_time)}</span>
              </div>
              <div className='detail-item full-width'>
                <label>评论内容:</label>
                <textarea
                  className='content-edit-textarea'
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  placeholder='请输入评论内容...'
                  rows={6}
                  disabled={isSaving}
                />
              </div>
            </div>
            <div className='modal-actions'>
              <button
                type='button'
                className='cancel-btn'
                onClick={handleCloseEditModal}
                disabled={isSaving}
              >
                取消
              </button>
              <button
                type='button'
                className='save-btn'
                onClick={handleSaveComment}
                disabled={isSaving || !editContent.trim()}
              >
                {isSaving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

export default Comments;
