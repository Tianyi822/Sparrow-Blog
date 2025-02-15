import React, { useState, useEffect } from 'react';
import './Announcement.scss';
import PropTypes from 'prop-types';

// 临时的公告内容配置，后续会从后端获取
const ANNOUNCEMENT_CONFIG = {
    content: "联系博主请发邮件到 chentyit@163.com"
};

const Announcement = ({ className }) => {
    const [announcementData, setAnnouncementData] = useState(ANNOUNCEMENT_CONFIG);
    
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
        <div className={`announcement ${className || ''}`}>
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