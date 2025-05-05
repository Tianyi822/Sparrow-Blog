import { useState, useRef, useEffect } from 'react';
import './WebsiteRecord.scss';
import SvgIcon, { WebsiteRecord as WebsiteRecordIcon, Small } from '@/components/SvgIcon/SvgIcon';
import classNames from 'classnames';

interface WebsiteRecordProps {
    className?: string;
}

const WebsiteRecord: React.FC<WebsiteRecordProps> = ({ className }) => {
    const [isExpanded, setIsExpanded] = useState<boolean>(false);
    const iconRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    
    // 根据展开状态调整图标位置
    useEffect(() => {
        if (iconRef.current) {
            // 使用 CSS 类名控制图标位置，避免直接操作样式
            if (isExpanded) {
                iconRef.current.classList.remove('centered');
                iconRef.current.classList.add('left-aligned');
            } else {
                iconRef.current.classList.remove('left-aligned');
                iconRef.current.classList.add('centered');
            }
        }
    }, [isExpanded]);
    
    // 初始化时设置为居中
    useEffect(() => {
        if (iconRef.current) {
            iconRef.current.classList.add('centered');
        }
    }, []);

    const websiteRecordStyle = classNames('website-record', className, {
        expanded: isExpanded
    });

    return (
        <div
            ref={containerRef}
            className={websiteRecordStyle}
            onClick={() => window.open('http://beian.miit.gov.cn')}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <div ref={iconRef} className="icon-container">
                <SvgIcon
                    name={WebsiteRecordIcon}
                    size={Small}
                    color="#126bae"
                />
            </div>
            <span className="record-text">黔ICP备18007069号-4</span>
        </div>
    );
};

export default WebsiteRecord;