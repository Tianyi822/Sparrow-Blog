import { useState } from 'react';
import './WebsiteRecord.scss';
import SvgIcon, { WebsiteRecord as WebsiteRecordIcon, Small } from '@/components/SvgIcon/SvgIcon.jsx';

const WebsiteRecord = () => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            className={`website-record ${isExpanded ? 'expanded' : ''}`}
            onClick={() => window.open('http://beian.miit.gov.cn')}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <SvgIcon
                name={WebsiteRecordIcon}
                size={Small}
                color="#126bae"
            />
            <span className="record-text">黔ICP备18007069号-4</span>
        </div>
    );
};

export default WebsiteRecord; 