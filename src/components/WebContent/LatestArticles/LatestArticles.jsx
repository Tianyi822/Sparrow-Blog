import { useRef, useEffect } from 'react';
import './LatestArticles.scss';
import PropTypes from 'prop-types';

const LATEST_ARTICLES = [
    {
        id: 1,
        title: "Vite+React 没有 ReactComponent 解决方案",
        date: "2023-09-10",
        image: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/ayaka.jpg"
    },
    {
        id: 2,
        title: "MacBook M1平台使用 C++ 连接 MySQL",
        date: "2021-12-27",
        image: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/ayaka.jpg"
    },
    // ... 其他文章
];

const LatestArticles = ({className}) => {
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
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = -(centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
            
            glow.style.background = `radial-gradient(circle 500px at ${x}px ${y}px, 
                rgba(255, 255, 255, 0.25) 0%, 
                rgba(255, 255, 255, 0.12) 45%, 
                transparent 100%)`;

            borderGlow.style.background = `
                radial-gradient(circle 1000px at ${x}px ${y}px, 
                    rgba(255, 255, 255, 1) 0%, 
                    rgba(255, 255, 255, 0.7) 20%, 
                    rgba(255, 255, 255, 0.3) 40%,
                    transparent 65%)`;
        };

        const handleMouseLeave = () => {
            if (card) {
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
        <div className={`latest-articles ${className || ''}`} ref={cardRef}>
            <div className="latest-articles-glow" ref={glowRef}/>
            <div className="latest-articles-border-glow" ref={borderGlowRef}/>
            <h3 className="latest-articles-title">
                <span className="latest-articles-icon">🕒</span>
                最新文章
            </h3>
            <div className="latest-articles-list">
                {LATEST_ARTICLES.map(article => (
                    <div key={article.id} className="article-item">
                        <img src={article.image} alt={article.title} className="article-image"/>
                        <div className="article-info">
                            <h4 className="article-title">{article.title}</h4>
                            <span className="article-date">{article.date}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

LatestArticles.propTypes = {
    className: PropTypes.string
};

export default LatestArticles; 