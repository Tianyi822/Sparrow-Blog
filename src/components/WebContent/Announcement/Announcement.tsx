import { useState, useEffect } from 'react';
import './Announcement.scss';
import use3DEffect from '@/hooks/use3DEffect';

interface AnnouncementProps {
    className?: string;
}

interface AnnouncementData {
    content: string;
}

// 临时的公告内容配置，后续会从后端获取
const ANNOUNCEMENT_CONFIG: AnnouncementData = {
    content: "联系博主请发邮件到 chentyit@163.com"
};

const Announcement: React.FC<AnnouncementProps> = ({className}) => {
    const { cardRef, glowRef, borderGlowRef } = use3DEffect();
    const [announcementData, setAnnouncementData] = useState<AnnouncementData>(ANNOUNCEMENT_CONFIG);

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

        // 暂时注释掉API调用，使用默认配置
        // fetchAnnouncement();
    }, []);

    return (
        <div className={`announcement ${className || ''}`} ref={cardRef}>
            <div className="announcement-glow" ref={glowRef}></div>
            <div className="announcement-border-glow" ref={borderGlowRef}></div>
            <h3 className="announcement-title">
                <span className="announcement-icon">📢</span>
                公告
            </h3>
            <div className="announcement-content">
                {announcementData.content}
            </div>
        </div>
    );
};

export default Announcement;