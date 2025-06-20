import classNames from 'classnames';
import { useState, useEffect, useCallback } from 'react';
import use3DEffect from '@/hooks/use3DEffect';
import { FriendLinkCardSkeleton } from '@/components/ui/skeleton';
import { getFriendLinks, type FriendLink } from '@/services/webService';
import Apply, { FormData } from './Apply/Apply';
import './FriendLink.scss';

interface FriendLinkProps {
    className?: string;
}

// 默认头像图片
const DEFAULT_AVATAR = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNNTAgMTcwYzAtMzMuMTM3IDI2Ljg2My02MCA2MC02MGg0MGMzMy4xMzcgMCA2MCAyNi44NjMgNjAgNjB2MzBINTB2LTMweiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';

// 友链卡片组件 - 参考Gallery的懒加载模式
const FriendLinkCard: React.FC<{ 
    link: FriendLink; 
    onImageError: (e: React.SyntheticEvent<HTMLImageElement>, linkId: string) => void;
}> = ({ link, onImageError }) => {
    const { cardRef } = use3DEffect();
    // 添加图片加载状态跟踪，类似Gallery组件
    const [imageLoaded, setImageLoaded] = useState(false);

    // 处理图片加载完成
    const handleImageLoad = useCallback(() => {
        setImageLoaded(true);
    }, []);

    return (
        <div className={`friend-link-card ${imageLoaded ? 'loaded' : 'loading'}`}>
            <a
                href={link.friend_link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="friend-link-card-link"
            >
                <div 
                    className="friend-card-3d" 
                    ref={cardRef}
                >
                    <div className="card-glow"></div>
                    <div className="card-border-glow"></div>
                    <div className="friend-card-content">
                        {!imageLoaded && <div className="image-placeholder"></div>}
                        <img 
                            src={link.friend_avatar_url || DEFAULT_AVATAR} 
                            alt={link.friend_link_name} 
                            className="friend-avatar"
                            onLoad={handleImageLoad}
                            onError={(e) => onImageError(e, link.friend_link_id)}
                            loading="lazy" // 图片懒加载
                        />
                        <div className="friend-info">
                            <h3 className="friend-name">{link.friend_link_name}</h3>
                            <p className="friend-description">{link.friend_describe}</p>
                        </div>
                        <div className="friend-meta">
                            <span className="friend-category">友链</span>
                        </div>
                    </div>
                </div>
            </a>
        </div>
    );
};

const FriendLink: React.FC<FriendLinkProps> = ({ className }) => {
    const [links, setLinks] = useState<FriendLink[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set()); // 记录加载失败的图片ID，避免重复请求

    // 获取友链数据
    useEffect(() => {
        const fetchFriendLinks = async () => {
            try {
                setLoading(true);
                const friendLinksData = await getFriendLinks();
                if (friendLinksData) {
                    // 只显示可见的友链
                    const visibleLinks = friendLinksData.filter(link => link.display);
                    setLinks(visibleLinks);
                }
            } catch (error) {	
                console.error('获取友链数据失败:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFriendLinks();
    }, []);

    // 过滤链接
    const filteredLinks = links.filter(link => {
        const matchesSearch = link.friend_link_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            link.friend_describe.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    // 处理友链申请提交
    const handleApplySubmit = (formData: FormData) => {
        console.log('提交的友链申请数据:', formData);
    };

    // 处理图片加载错误，确保每个图片只处理一次错误
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, linkId: string) => {
        if (!failedImages.has(linkId)) {
            const img = e.target as HTMLImageElement;
            img.src = DEFAULT_AVATAR;
            setFailedImages(prev => new Set(prev).add(linkId));
        }
    };

    return (
        <div className={classNames('friend-link', className)}>
            <div className="friend-link-header">
                <input
                    type="text"
                    placeholder="搜索友链..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="friend-link-search"
                />
            </div>
            
            <div className="friend-link-grid">
                {loading ? (
                    // 加载状态显示骨架屏
                    Array.from({ length: 6 }).map((_, index) => (
                        <FriendLinkCardSkeleton key={index} />
                    ))
                ) : (
                    filteredLinks.map((link) => (
                        <FriendLinkCard
                            key={link.friend_link_id}
                            link={link}
                            onImageError={handleImageError}
                        />
                    ))
                )}
            </div>

            <Apply
                className="friend-link-apply"
                onSubmit={handleApplySubmit}
            />
        </div>
    );
};

export default FriendLink;