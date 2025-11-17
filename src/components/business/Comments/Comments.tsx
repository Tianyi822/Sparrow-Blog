import React, { useCallback, useEffect, useState } from 'react';
import { FiArrowRight, FiClock, FiCornerUpLeft, FiMessageSquare, FiSend, FiUser, FiX } from 'react-icons/fi';
import { addComment, getBlogComments, replyComment } from '@/services/webService';
import { AddCommentData, Comment, ReplyCommentData } from '@/types';
import { formatDate } from '@/utils';
import './Comments.scss';

interface CommentsProps {
  blogId: string;
  isOpen: boolean;
  onClose: () => void;
}

const Comments: React.FC<CommentsProps> = ({ blogId, isOpen, onClose }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [newCommentEmail, setNewCommentEmail] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replyEmail, setReplyEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 提取用户名（邮箱@符号前面的部分）
  const extractUsername = useCallback((email: string) => {
    if (!email) return '';
    const atIndex = email.indexOf('@');
    return atIndex > 0 ? email.substring(0, atIndex) : email;
  }, []);

  // 计算总评论数（包括所有子评论）
  const getTotalCommentsCount = useCallback((comments: Comment[]): number => {
    return comments.reduce((total, comment) => {
      let count = 1; // 主评论本身
      if (comment.sub_comments && comment.sub_comments.length > 0) {
        count += comment.sub_comments.length; // 子评论数量
      }
      return total + count;
    }, 0);
  }, []);

  // 使用统一的日期格式化工具函数

  // 排序评论（按最新时间排序）
  const sortCommentsByTime = useCallback((comments: Comment[]): Comment[] => {
    return comments
      .sort((a, b) => new Date(b.create_time).getTime() - new Date(a.create_time).getTime())
      .map((comment) => ({
        ...comment,
        sub_comments: comment.sub_comments
          ? comment.sub_comments.sort((a, b) => new Date(b.create_time).getTime() - new Date(a.create_time).getTime())
          : [],
      }));
  }, []);

  // 获取评论数据
  const fetchComments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBlogComments(blogId);
      if (data) {
        // 对评论数据进行排序
        const sortedComments = sortCommentsByTime(data);
        setComments(sortedComments);
      }
    } catch (error) {
      console.error('获取评论失败:', error);
    } finally {
      setLoading(false);
    }
  }, [blogId, sortCommentsByTime]);

  // 当面板打开时获取评论
  useEffect(() => {
    if (isOpen) {
      fetchComments();
    } else {
      // 面板关闭时重置一些状态
      setReplyingTo(null);
      setReplyContent('');
      setReplyEmail('');
    }
  }, [isOpen, fetchComments]);

  // 处理Escape键关闭评论面板
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, onClose]);

  // 提交新评论
  const handleSubmitComment = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !newCommentEmail.trim() || submitting) {
      return;
    }

    try {
      setSubmitting(true);
      const commentData: AddCommentData = {
        commenter_email: newCommentEmail.trim(),
        blog_id: blogId,
        content: newComment.trim(),
      };

      const result = await addComment(commentData);
      if (result) {
        await fetchComments();
        setNewComment('');
        setNewCommentEmail('');
      }
    } catch (error) {
      console.error('提交评论失败:', error);
    } finally {
      setSubmitting(false);
    }
  }, [newComment, newCommentEmail, blogId, submitting, fetchComments]);

  // 提交回复
  const handleSubmitReply = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim() || !replyEmail.trim() || !replyingTo || submitting) {
      return;
    }

    try {
      setSubmitting(true);
      const replyData: ReplyCommentData = {
        commenter_email: replyEmail.trim(),
        blog_id: blogId,
        reply_to_comment_id: replyingTo,
        content: replyContent.trim(),
      };

      const result = await replyComment(replyData);
      if (result) {
        await fetchComments();
        setReplyContent('');
        setReplyEmail('');
        setReplyingTo(null);
      }
    } catch (error) {
      console.error('提交回复失败:', error);
    } finally {
      setSubmitting(false);
    }
  }, [replyContent, replyEmail, replyingTo, blogId, submitting, fetchComments]);

  // 开始回复
  const handleStartReply = useCallback((commentId: string) => {
    setReplyingTo(commentId);
    setReplyContent('');
    setReplyEmail('');
  }, []);

  // 取消回复
  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
    setReplyContent('');
    setReplyEmail('');
  }, []);

  // 渲染单个评论
  const renderComment = useCallback(
    (comment: Comment, isSubComment = false) => (
      <div key={comment.comment_id} className={`comment-item ${isSubComment ? 'sub-comment' : ''}`}>
        <div className='comment-glow' />
        <div className='comment-border-glow' />

        <div className='comment-header'>
          <div className='comment-author'>
            <FiUser className='author-icon' />
            <span className='author-email'>{extractUsername(comment.commenter_email)}</span>
            {/* 显示回复对象 */}
            {isSubComment && comment.reply_to_commenter && (
              <span className='reply-to'>
                <FiArrowRight className='reply-to-icon' />
                回复 @{extractUsername(comment.reply_to_commenter)}
              </span>
            )}
          </div>
          <div className='comment-time'>
            <FiClock className='time-icon' />
            <span>{formatDate(comment.create_time)}</span>
          </div>
        </div>

        <div className='comment-content'>
          {comment.content}
        </div>

        <div className='comment-actions'>
          <button
            type='button'
            className='reply-btn'
            onClick={() =>
              handleStartReply(comment.comment_id)}
            disabled={replyingTo === comment.comment_id}
          >
            <FiCornerUpLeft className='reply-icon' />
            回复
          </button>
        </div>

        {/* 回复表单 */}
        {replyingTo === comment.comment_id && (
          <form className='reply-form' onSubmit={handleSubmitReply}>
            <div className='reply-form-glow' />
            <div className='reply-form-border-glow' />

            <div className='form-group'>
              <input
                type='email'
                placeholder='您的邮箱'
                value={replyEmail}
                onChange={(e) => setReplyEmail(e.target.value)}
                required
                disabled={submitting}
              />
            </div>
            <div className='form-group'>
              <textarea
                placeholder='写下您的回复...'
                value={replyContent}
                onChange={(e) =>
                  setReplyContent(e.target.value)}
                required
                disabled={submitting}
                rows={3}
              />
            </div>
            <div className='form-actions'>
              <button type='button' onClick={handleCancelReply} disabled={submitting}>
                取消
              </button>
              <button type='submit' disabled={submitting || !replyContent.trim() || !replyEmail.trim()}>
                <FiSend className='send-icon' />
                {submitting ? '提交中...' : '回复'}
              </button>
            </div>
          </form>
        )}

        {/* 子评论 */}
        {comment.sub_comments && comment.sub_comments.length > 0 && (
          <div className='sub-comments'>
            {comment.sub_comments.map((subComment) => renderComment(subComment, true))}
          </div>
        )}
      </div>
    ),
    [
      formatDate,
      extractUsername,
      handleStartReply,
      replyingTo,
      replyEmail,
      replyContent,
      submitting,
      handleSubmitReply,
      handleCancelReply,
    ],
  );

  return (
    <div className={`comments-panel ${isOpen ? 'open' : ''}`}>
      <div className='comments-container'>
        <div className='comments-container-glow' />
        <div className='comments-container-border-glow' />

        <div className='comments-header'>
          <div className='comments-title'>
            <FiMessageSquare className='title-icon' />
            <h3>评论区 {!loading && `(${getTotalCommentsCount(comments)})`}</h3>
          </div>
          <button type='button' className='close-btn' onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className='comments-content'>
          {loading
            ? (
              <div className='comments-loading'>
                <div className='spinner'></div>
                <span>加载评论中...</span>
              </div>
            )
            : (
              <>
                {/* 添加评论表单 */}
                <form className='add-comment-form' onSubmit={handleSubmitComment}>
                  <div className='add-comment-form-glow' />
                  <div className='add-comment-form-border-glow' />

                  <div className='form-group'>
                    <input
                      type='email'
                      placeholder='您的邮箱'
                      value={newCommentEmail}
                      onChange={(e) => setNewCommentEmail(e.target.value)}
                      required
                      disabled={submitting}
                    />
                  </div>
                  <div className='form-group'>
                    <textarea
                      placeholder='写下您的评论...'
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      required
                      disabled={submitting}
                      rows={4}
                    />
                  </div>
                  <button
                    type='submit'
                    className='submit-btn'
                    disabled={submitting || !newComment.trim() || !newCommentEmail.trim()}
                  >
                    <FiSend className='send-icon' />
                    {submitting ? '提交中...' : '发表评论'}
                  </button>
                </form>

                {/* 评论列表 */}
                <div className='comments-list'>
                  {comments.length === 0
                    ? (
                      <div className='no-comments'>
                        <FiMessageSquare className='no-comments-icon' />
                        <p>暂无评论，来发表第一条评论吧！</p>
                      </div>
                    )
                    : (
                      comments.map((comment) => renderComment(comment))
                    )}
                </div>
              </>
            )}
        </div>
      </div>
    </div>
  );
};

export default Comments;
