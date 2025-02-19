import { useRef, useEffect } from 'react';
import './Categories.scss';
import PropTypes from 'prop-types';

const CATEGORIES = [
    {id: 1, name: "博客版本记录", count: 1},
    {id: 2, name: "大数据", count: 10},
    {id: 3, name: "奇技淫巧", count: 3},
    {id: 4, name: "学习笔记", count: 23},
    {id: 5, name: "小工具开发", count: 1},
    {id: 6, name: "生活", count: 3}
];

const Categories = ({className}) => {
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
        <div className={`categories ${className || ''}`} ref={cardRef}>
            <div className="categories-glow" ref={glowRef}/>
            <div className="categories-border-glow" ref={borderGlowRef}/>
            <h3 className="categories-title">
                <span className="categories-icon">📂</span>
                分类
            </h3>
            <div className="categories-list">
                {CATEGORIES.map(category => (
                    <div key={category.id} className="category-item">
                        <span className="category-name">{category.name}</span>
                        <span className="category-count">{category.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

Categories.propTypes = {
    className: PropTypes.string
};

export default Categories; 