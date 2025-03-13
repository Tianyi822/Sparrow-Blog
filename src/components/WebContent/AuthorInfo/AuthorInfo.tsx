import './AuthorInfo.scss';
import use3DEffect from '@/hooks/use3DEffect';

interface AuthorInfoProps {
  name?: string;
  bio?: string;
  avatar?: string;
  stats?: {
    articles: number;
    tags: number;
    categories: number;
  };
  social?: {
    github?: string;
    email?: string;
  };
  className?: string;
}

const AuthorInfo: React.FC<AuthorInfoProps> = ({ 
  name = 'Tianyi', 
  bio = '一个杯探吾轩梦想的二次元', 
  avatar = 'https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/ayaka.jpg',
  stats = { articles: 41, tags: 25, categories: 6 },
  social = { github: 'https://github.com', email: 'mailto:example@example.com' },
  className
}) => {
  // 使用3D效果hook
  const { cardRef, glowRef, borderGlowRef } = use3DEffect();
  
  return (
    <div className={`author-info-container ${className || ''}`} ref={cardRef}>
      {/* 添加光晕效果元素 */}
      <div className="author-info-glow" ref={glowRef}></div>
      <div className="author-info-border-glow" ref={borderGlowRef}></div>
      
      <img src={avatar} alt={name} className="author-info-avatar" />
      <div className="author-info-details">
        <h2 className="author-info-name">{name}</h2>
        <p className="author-info-bio">{bio}</p>
        
        <div className="author-info-stats">
          <div className="stat-item">
            <span className="stat-value">{stats.articles}</span>
            <span className="stat-label">文章</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.tags}</span>
            <span className="stat-label">标签</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.categories}</span>
            <span className="stat-label">分类</span>
          </div>
        </div>
        
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
      </div>
    </div>
  );
};

export default AuthorInfo;