import './LatestComments.scss';
import { useEffect, useState } from 'react';
import { getLatestComments } from '@/services/webService';
import { Comment } from '@/types';
import { formatDate } from '@/utils';

interface LatestCommentsProps {
  className?: string;
}

const LatestComments: React.FC<LatestCommentsProps> = ({ className }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // 获取评论者名称（邮箱@前的部分）
  const getCommenterName = (email: string): string => {
    return email.split('@')[0];
  };

  // 处理评论点击，跳转到对应博客页面
  const handleCommentClick = (blogId: string) => {
    const blogUrl = `/blog/${blogId}`;
    window.open(blogUrl, '_blank', 'noopener,noreferrer');
  };

  // 获取最新评论
  const fetchLatestComments = async () => {
    try {
      setLoading(true);
      const latestComments = await getLatestComments();
      if (latestComments) {
        setComments(latestComments);
      }
    } catch (error) {
      console.error('获取最新评论失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLatestComments();
  }, []);

  return (
    <div className={`latest-comments ${className || ''}`}>
      <div className='latest-comments-border-glow' />
      <h3 className='latest-comments-title'>
        <span className='latest-comments-icon'>💬</span>
        最新评论
      </h3>
      <div className='latest-comments-list'>
        {loading
          ? (
            <div className='comment-item'>
              <p className='comment-content'>加载中...</p>
            </div>
          )
          : comments.length > 0
          ? (
            comments.map((comment) => (
              <div
                key={comment.comment_id}
                className='comment-item clickable'
                onClick={() => handleCommentClick(comment.blog_id)}
                title={`点击查看博客《${comment.blog_title}》`}
              >
                <p className='comment-content'>{comment.content}</p>
                <div className='comment-meta'>
                  <span className='comment-commenter'>{getCommenterName(comment.commenter_email)}</span>
                  <span className='comment-article'>{comment.blog_title || '未知博客'}</span>
                  <span className='comment-date'>{formatDate(comment.create_time)}</span>
                </div>
              </div>
            ))
          )
          : (
            <div className='comment-item'>
              <p className='comment-content'>暂无评论</p>
            </div>
          )}
      </div>
    </div>
  );
};

export default LatestComments;
