import React from 'react';
import './skeleton.scss';

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    className?: string;
}

/**
 * 骨架屏组件
 * 用于内容加载时的占位符
 */
const Skeleton: React.FC<SkeletonProps> = ({
    width = '100%',
    height = '20px',
    borderRadius = '4px',
    className = ''
}) => {
    const style = {
        width,
        height,
        borderRadius
    };

    return (
        <div 
            className={`skeleton ${className}`}
            style={style}
        />
    );
};

/**
 * 友链卡片骨架屏
 */
export const FriendLinkCardSkeleton: React.FC = () => {
    return (
        <div className="friend-link-card-skeleton">
            <div className="skeleton-content">
                <Skeleton 
                    width="60px" 
                    height="60px" 
                    borderRadius="50%" 
                    className="skeleton-avatar"
                />
                <Skeleton 
                    width="80%" 
                    height="16px" 
                    className="skeleton-name"
                />
                <Skeleton 
                    width="100%" 
                    height="12px" 
                    className="skeleton-description"
                />
                <Skeleton 
                    width="100%" 
                    height="12px" 
                    className="skeleton-description"
                />
                <Skeleton 
                    width="60px" 
                    height="20px" 
                    borderRadius="10px"
                    className="skeleton-category"
                />
            </div>
        </div>
    );
};

export default Skeleton; 