import './AuthorInfo.scss';
import use3DEffect from '@/hooks/use3DEffect';

interface AuthorInfoProps {
  name?: string;
  bio?: string;
  avatar?: string;
  stats?: {
    articles?: number;
    tags?: number;
    categories?: number;
  };
  social?: {
    github?: string;
    email?: string;
  };
  className?: string;
}

const AuthorInfo: React.FC<AuthorInfoProps> = ({ name, bio, avatar, stats = { articles: 0, tags: 0, categories: 0 }, social, className }) => {
  // 使用3D效果hook
  const { cardRef, glowRef, borderGlowRef } = use3DEffect();

  return (
    <div className={`author-info-container ${className || ''}`} ref={cardRef}>
      {/* 添加光晕效果元素 */}
      <div className="author-info-glow" ref={glowRef}></div>
      <div className="author-info-border-glow" ref={borderGlowRef}></div>

      {avatar && <img src={avatar} alt={name} className="author-info-avatar" />}
      <div className="author-info-details">
        {name && <h2 className="author-info-name">{name}</h2>}
        {bio && <p className="author-info-bio">{bio}</p>}

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
};

export default AuthorInfo;