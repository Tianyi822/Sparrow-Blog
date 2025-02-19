import { useState, useEffect, useRef } from 'react';
import './Announcement.scss';
import PropTypes from 'prop-types';

// 临时的公告内容配置，后续会从后端获取
const ANNOUNCEMENT_CONFIG = {
    content: "联系博主请发邮件到 chentyit@163.com"
};

const Announcement = ({className}) => {
    const [announcementData, setAnnouncementData] = useState(ANNOUNCEMENT_CONFIG);

    // 添加 3D 效果所需的 refs
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

    useEffect(() => {
        // 从后端获取公告内容
        const fetchAnnouncement = async () => {
            try {
                const response = await fetch('/api/announcement');
                const data = await response.json();
                setAnnouncementData(data);
            } catch (error) {
                console.error('Failed to fetch announcement:', error);
                // 使用默认配置作为后备
                setAnnouncementData(ANNOUNCEMENT_CONFIG);
            }
        };

        fetchAnnouncement();
    }, []);

    return (
        <div className={`announcement ${className || ''}`} ref={cardRef}>
            <div className="announcement-glow" ref={glowRef}/>
            <div className="announcement-border-glow" ref={borderGlowRef}/>
            <h3 className="announcement-title">
                <span className="announcement-icon">📢</span>
                公告
            </h3>
            <p className="announcement-content">
                {announcementData.content}
            </p>
        </div>
    );
};

Announcement.propTypes = {
    className: PropTypes.string
};

export default Announcement; 