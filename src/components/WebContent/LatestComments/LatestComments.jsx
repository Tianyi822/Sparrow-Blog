import { useRef, useEffect } from 'react';
import './LatestComments.scss';
import PropTypes from 'prop-types';

const LATEST_COMMENTS = [
    {
        id: 1,
        content: "无法获取评论，请确认相关配置是否正确",
        date: "2023-09-10",
        article: "文章标题"
    }
];

const LatestComments = ({ className }) => {
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
        <div className={`latest-comments ${className || ''}`} ref={cardRef}>
            <div className="latest-comments-glow" ref={glowRef}/>
            <div className="latest-comments-border-glow" ref={borderGlowRef}/>
            <h3 className="latest-comments-title">
                <span className="latest-comments-icon">💬</span>
                最新评论
            </h3>
            <div className="latest-comments-list">
                {LATEST_COMMENTS.map(comment => (
                    <div key={comment.id} className="comment-item">
                        <p className="comment-content">{comment.content}</p>
                        <div className="comment-meta">
                            <span className="comment-article">{comment.article}</span>
                            <span className="comment-date">{comment.date}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

LatestComments.propTypes = {
    className: PropTypes.string
};

export default LatestComments; 