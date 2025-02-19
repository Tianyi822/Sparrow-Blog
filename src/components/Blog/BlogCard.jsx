import './BlogCard.scss';
import PropTypes from 'prop-types';
import use3DEffect from '@/hooks/use3DEffect';

const BlogCard = ({ title, date, updateDate, category, tags, image, description, className }) => {
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

BlogCard.propTypes = {
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    updateDate: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string),
    image: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    className: PropTypes.string
};

export default BlogCard;