import { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import './BlogCard.scss';

const BlogCard = ({title, date, updateDate, category, tags, image, description, className}) => {
    const cardRef = useRef(null);
    const glowRef = useRef(null);
    const borderGlowRef = useRef(null);

    useEffect(() => {
        const card = cardRef.current;
        const glow = glowRef.current;
        const borderGlow = borderGlowRef.current;

        const handleMouseMove = (e) => {
            if (!card || !glow || !borderGlow) return;
            
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 计算倾斜角度
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            // 应用3D变换
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

            // 内部光晕
            glow.style.background = `radial-gradient(circle 1000px at ${x}px ${y}px, 
                rgba(255, 255, 255, 0.25) 0%, 
                rgba(255, 255, 255, 0.12) 45%, 
                transparent 100%)`;

            // 边框光晕 - 调整渐变和透明度
            borderGlow.style.background = `radial-gradient(circle 1000px at ${x}px ${y}px, 
                rgba(255, 255, 255, 0.8) 0%, 
                rgba(255, 255, 255, 0.3) 45%, 
                transparent 80%)`;
        };

        const handleMouseLeave = () => {
            if (card) {
                // 重置3D变换
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
            }
            if (glow) {
                glow.style.background = 'transparent';
            }
            if (borderGlow) {
                borderGlow.style.background = 'transparent';
            }
        };

        card?.addEventListener('mousemove', handleMouseMove);
        card?.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            card?.removeEventListener('mousemove', handleMouseMove);
            card?.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <div className={`blog-card ${className || ''}`} ref={cardRef}>
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
        </div>
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
    className: PropTypes.string,
};

export default BlogCard;