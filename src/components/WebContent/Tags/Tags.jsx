import { useRef, useEffect } from 'react';
import './Tags.scss';
import PropTypes from 'prop-types';

const TAGS = [
    "Bilibili World", "C", "CPP", "ClickHouse",
    "ElasticSearch", "Flink", "HDFS", "Hexo", "JVM",
    "Java源码", "Linux", "Maven", "MySQL", "Python",
    "SQL", "Spark", "Twikoo", "VSCode", "Zookeeper",
    "年", "数据库", "数据结构", "智能指针", "算法",
    "骚年商城开发系列"
];

const Tags = ({className}) => {
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
        <div className={`tags ${className || ''}`} ref={cardRef}>
            <div className="tags-glow" ref={glowRef}/>
            <div className="tags-border-glow" ref={borderGlowRef}/>
            <h3 className="tags-title">
                <span className="tags-icon">🏷️</span>
                标签
            </h3>
            <div className="tags-list">
                {TAGS.map((tag, index) => (
                    <span key={index} className="tag-item">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
};

Tags.propTypes = {
    className: PropTypes.string
};

export default Tags; 