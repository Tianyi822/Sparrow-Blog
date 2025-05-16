import './BlogCard.scss';
import use3DEffect from '@/hooks/use3DEffect';
import { useEffect } from 'react';

interface BlogCardProps {
    title: string;
    date: string;
    updateDate: string;
    category: string;
    tags?: string[];
    image: string;
    description: string;
    className?: string;
    blogId?: string;
}

const BlogCard: React.FC<BlogCardProps> = ({ title, date, updateDate, category, tags, image, description, className, blogId }) => {
    const { cardRef, glowRef, borderGlowRef } = use3DEffect();
    const isTop = className?.includes('top');

    // 调试图片URL
    useEffect(() => {
        console.log('BlogCard Image URL:', image);
    }, [image]);

    // 处理点击事件，导航到博客详情页
    const handleCardClick = (e: React.MouseEvent) => {
        // 阻止默认事件
        e.preventDefault();
        
        if (blogId) {
            // 使用 window.open 在新标签页打开链接
            window.open(`/blog/${blogId}`, '_blank');
        }
    };

    return (
        <article 
            className={`blog-card ${className || ''}`} 
            ref={cardRef}
            onClick={handleCardClick}
            style={{ cursor: blogId ? 'pointer' : 'default' }}
        >
            <div className="blog-card-glow" ref={glowRef}/>
            <div className="blog-card-border-glow" ref={borderGlowRef}/>
            {isTop && (
                <div className="blog-card-top-badge">
                    <div className="blog-card-top-badge-triangle"></div>
                </div>
            )}
            <div
                className="blog-card-img"
                style={{
                    backgroundImage: `url(${image})`,
                    height: '250px', // 添加固定高度
                    minHeight: '200px' // 添加最小高度
                }}
            />
            <div className="blog-card-content">
                <div className="blog-card-header">
                    <h3 className="blog-card-title">{title}</h3>
                    <div className="blog-card-meta">
                        <span className="blog-card-time">
                            创建于 {date}
                        </span>
                        <span className="blog-card-time">
                            更新于 {updateDate}
                        </span>
                    </div>
                    <div className="blog-card-tags">
                        <span className="blog-card-category">
                            {category}
                        </span>
                        {tags && tags.map((tag, index) => (
                            <span key={index} className="blog-card-tag">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="blog-card-brief">
                    {description}
                </div>
            </div>
        </article>
    );
};

export default BlogCard;