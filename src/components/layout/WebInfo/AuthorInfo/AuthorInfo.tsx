import './AuthorInfo.scss';
import { memo } from 'react';

/**
 * 统计数据接口
 */
interface AuthorStats {
  /** 文章数量 */
  articles?: number;
  /** 标签数量 */
  tags?: number;
  /** 分类数量 */
  categories?: number;
}

/**
 * 社交媒体链接接口
 */
interface SocialLinks {
  /** GitHub链接 */
  github?: string;
  /** 邮箱链接 */
  email?: string;
}

/**
 * 作者信息组件属性接口
 */
interface AuthorInfoProps {
  /** 作者名称 */
  name?: string;
  /** 作者简介 */
  bio?: string;
  /** 作者头像URL */
  avatar?: string;
  /** 博客统计数据 */
  stats?: AuthorStats;
  /** 社交媒体链接 */
  social?: SocialLinks;
  /** 自定义类名 */
  className?: string;
}

/**
 * 作者信息组件
 * 
 * 显示博客作者信息，包括头像、名称、简介、统计数据和社交媒体链接
 */
const AuthorInfo: React.FC<AuthorInfoProps> = memo(({ 
  name, 
  bio, 
  avatar, 
  stats = { articles: 0, tags: 0, categories: 0 }, 
  social, 
  className 
}) => {

  return (
    <div className={`author-info-container ${className || ''}`}>

      {/* 作者头像 */}
      {avatar && <img src={avatar} alt={name} className="author-info-avatar" />}
      
      <div className="author-info-details">
        {/* 作者名称和简介 */}
        {name && <h2 className="author-info-name">{name}</h2>}
        {bio && <p className="author-info-bio">{bio}</p>}

        {/* 统计数据 */}
        {stats && (
          <div className="author-info-stats">
            <div className="stat-item">
              <span className="stat-value">{stats.articles ?? 0}</span>
              <span className="stat-label">文章</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.tags ?? 0}</span>
              <span className="stat-label">标签</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{stats.categories ?? 0}</span>
              <span className="stat-label">分类</span>
            </div>
          </div>
        )}

        {/* 社交媒体链接 */}
        {social && (
          <div className="author-info-social">
            {social.github && (
              <a
                href={social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="github"
              >
                GitHub
              </a>
            )}
            {social.email && (
              <a
                href={social.email}
                className="email"
              >
                Email
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

AuthorInfo.displayName = 'AuthorInfo';

export default AuthorInfo;