import './CommentList.scss';
import { useEffect, useState } from 'react';
import { getLatestComments } from '@/services/webService';
import { Comment } from '@/types';
import { formatDate } from '@/utils';

interface CommentListProps {
  className?: string;
}

const CommentList: React.FC<CommentListProps> = ({ className }) => {
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

  // 生成头像（使用评论者名称的首字母）
  const generateAvatar = (name: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const colorIndex = name.charCodeAt(0) % colors.length;
    return {
      backgroundColor: colors[colorIndex],
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: 'bold',
    };
  };

  return (
    <div className={`comment-list-container ${className || ''}`}>
      <div className='comment-list-border-glow' />
      <div className='comment-list'>
        {loading
          ? (
            <div className='comment-item'>
              <div className='comment-avatar' style={generateAvatar('L')}>L</div>
              <div className='comment-info'>
                <h4 className='comment-content'>加载中...</h4>
                <span className='comment-meta'>请稍候</span>
                <span className='comment-date'></span>
              </div>
            </div>
          )
          : comments.length > 0
          ? (
            comments.map((comment) => {
              const commenterName = getCommenterName(comment.commenter_email);
              return (
                <div
                  key={comment.comment_id}
                  className='comment-item'
                  onClick={() => handleCommentClick(comment.blog_id)}
                  style={{ cursor: 'pointer' }}
                  title={`点击查看博客《${comment.blog_title}》`}
                >
                  <div className='comment-avatar' style={generateAvatar(commenterName)}>
                    {commenterName.charAt(0).toUpperCase()}
                  </div>
                  <div className='comment-info'>
                    <h4 className='comment-content'>{comment.content}</h4>
                    <span className='comment-meta'>
                      {commenterName} · {comment.blog_title || '未知博客'}
                    </span>
                    <span className='comment-date'>
                      {formatDate(comment.create_time)}
                    </span>
                  </div>
                </div>
              );
            })
          )
          : (
            <div className='comment-item'>
              <div className='comment-avatar' style={generateAvatar('N')}>N</div>
              <div className='comment-info'>
                <h4 className='comment-content'>暂无评论</h4>
                <span className='comment-meta'>还没有人评论</span>
                <span className='comment-date'></span>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default CommentList;
