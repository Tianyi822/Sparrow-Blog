import './BlogCard.scss';
import use3DEffect from '@/hooks/use3DEffect';

interface BlogCardProps {
    title: string;
    date: string;
    updateDate: string;
    category: string;
    tags?: string[];
    image: string;
    description: string;
    className?: string;
}

const BlogCard: React.FC<BlogCardProps> = ({ title, date, updateDate, category, tags, image, description, className }) => {
    const { cardRef, glowRef, borderGlowRef } = use3DEffect();

    return (
        <article className={`blog-card ${className || ''}`} ref={cardRef}>
            <div className="blog-card-glow" ref={glowRef}/>
            <div className="blog-card-border-glow" ref={borderGlowRef}/>
            <div
                className="blog-card-img"
                style={{backgroundImage: `url(${image})`}}
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