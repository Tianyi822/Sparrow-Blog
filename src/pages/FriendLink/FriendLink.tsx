import classNames from 'classnames';
import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { FriendLinkCardSkeleton } from '@/components/ui/skeleton';
import { getFriendLinks, applyFriendLink } from '@/services/webService';
import type { FriendLink as FriendLinkType, FriendLinkApplicationData } from '@/types';
import SvgIcon, { About, Normal } from '@/components/SvgIcon/SvgIcon';
import ApplyModal, { FriendLinkFormData } from './Apply/ApplyModal';
import './FriendLink.scss';

interface FriendLinkProps {
    className?: string;
}

interface FriendLinkCardProps {
    link: FriendLinkType;
    onImageError: (e: React.SyntheticEvent<HTMLImageElement>, linkId: string) => void;
    failedImages: Set<string>;
}

// 友链卡片组件 - 使用memo和懒加载优化性能
const FriendLinkCard = memo<FriendLinkCardProps>(({ link, onImageError, failedImages }) => {
    // 添加图片加载状态跟踪
    const [imageLoaded, setImageLoaded] = useState(false);

    // 处理图片加载完成
    const handleImageLoad = useCallback(() => {
        setImageLoaded(true);
    }, []);

    // 重置图片状态，当头像URL变化时
    useEffect(() => {
        if (link.friend_avatar_url && !failedImages.has(link.friend_link_id)) {
            setImageLoaded(false);
            
            // 添加一个备用的加载检查，确保图片最终能显示
            const fallbackTimer = setTimeout(() => {
                setImageLoaded(true);
            }, 2000); // 2秒后强制显示图片
            
            return () => clearTimeout(fallbackTimer);
        } else {
            setImageLoaded(true); // 默认头像立即显示，无需等待加载
        }
    }, [link.friend_avatar_url, link.friend_link_id, failedImages]);

    // 渲染头像
    const renderAvatar = () => {
        if (link.friend_avatar_url && !failedImages.has(link.friend_link_id)) {
            return (
                <div className="friend-avatar-container">
                    {!imageLoaded && <div className="image-placeholder"></div>}
                    <img 
                        src={link.friend_avatar_url} 
                        alt={link.friend_link_name} 
                        className="friend-avatar"
                        onLoad={handleImageLoad}
                        onError={(e) => onImageError(e, link.friend_link_id)}
                        loading="lazy"
                        style={{ 
                            opacity: imageLoaded ? 1 : 0.8,  // 显示图片时略微透明，加载完成后完全不透明
                            transition: 'opacity 0.3s ease',
                            display: 'block'  // 确保图片始终显示
                        }}
                    />
                </div>
            );
        }
        
        return (
            <div className="friend-avatar friend-avatar-default">
                <SvgIcon 
                    name={About} 
                    size={Normal} 
                    color="white"
                />
            </div>
        );
    };

    return (
        <div className={`friend-link-card ${imageLoaded ? 'loaded' : 'loading'}`}>
            <a
                href={link.friend_link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="friend-link-card-link"
            >
                <div className="friend-card-3d">
                    <div className="friend-card-content">
                        {renderAvatar()}
                        <div className="friend-info">
                            <h3 className="friend-name">{link.friend_link_name}</h3>
                            <p className="friend-description">{link.friend_describe}</p>
                        </div>
                    </div>
                </div>
            </a>
        </div>
    );
});

// 设置memo组件的displayName用于调试
FriendLinkCard.displayName = 'FriendLinkCard';

const FriendLink: React.FC<FriendLinkProps> = ({ className }) => {
    const [links, setLinks] = useState<FriendLinkType[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
    const [failedImages, setFailedImages] = useState<Set<string>>(new Set()); // 记录加载失败的图片ID，避免重复请求
    const [isApplyModalOpen, setIsApplyModalOpen] = useState<boolean>(false);
    const [applyResult, setApplyResult] = useState<{ type: 'success' | 'error', message: string } | null>(null);

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

    // 防抖搜索，减少不必要的过滤计算
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // 使用useMemo优化搜索过滤性能，基于防抖后的搜索词
    const filteredLinks = useMemo(() => {
        if (!debouncedSearchTerm.trim()) return links;
        
        const searchLower = debouncedSearchTerm.toLowerCase();
        return links.filter(link => {
            const matchesName = link.friend_link_name.toLowerCase().includes(searchLower);
            const matchesDesc = link.friend_describe.toLowerCase().includes(searchLower);
            return matchesName || matchesDesc;
        });
    }, [links, debouncedSearchTerm]);

    // 处理友链申请提交
    const handleApplySubmit = async (formData: FriendLinkFormData) => {
        try {
            // 清除之前的结果
            setApplyResult(null);
            
            // 转换表单数据为API所需格式
            const applicationData: FriendLinkApplicationData = {
                friend_link_name: formData.name,
                friend_link_url: formData.url,
                friend_avatar_url: formData.avatar || undefined,
                friend_describe: formData.description || undefined
            };

            // 调用API提交友链申请
            const result = await applyFriendLink(applicationData);
            
            if (result.code === 200) {
                // 申请成功
                setApplyResult({
                    type: 'success',
                    message: result.msg
                });
                
                // 延迟关闭模态框，让用户看到成功消息
                setTimeout(() => {
                    setIsApplyModalOpen(false);
                    setApplyResult(null);
                }, 2000);
            } else {
                // 申请失败，显示错误信息
                setApplyResult({
                    type: 'error',
                    message: result.msg
                });
            }
        } catch (error) {
            console.error('友链申请提交失败:', error);
            setApplyResult({
                type: 'error',
                message: '网络错误，请稍后重试'
            });
        }
    };

    // 处理图片加载错误，使用useCallback优化性能
    const handleImageError = useCallback((_e: React.SyntheticEvent<HTMLImageElement>, linkId: string) => {
        setFailedImages(prev => {
            if (prev.has(linkId)) return prev;
            return new Set(prev).add(linkId);
        });
    }, []);

    const handleModalClose = () => {
        setIsApplyModalOpen(false);
        setApplyResult(null);
    };

    return (
        <div className={classNames('friend-link', className)}>
            <div className="friend-link-header">
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="搜索友链..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="friend-link-search"
                    />
                    <button
                        className="apply-button"
                        onClick={() => setIsApplyModalOpen(true)}
                    >
                        申请友链
                    </button>
                </div>
            </div>
            
            <div className="friend-link-grid">
                {loading ? (
                    // 加载状态显示骨架屏，使用Fragment减少DOM层级
                    <>
                        {Array.from({ length: 6 }, (_, index) => (
                            <FriendLinkCardSkeleton key={`skeleton-${index}`} />
                        ))}
                    </>
                ) : (
                    // 使用Fragment减少DOM层级
                    <>
                        {filteredLinks.map((link) => (
                            <FriendLinkCard
                                key={link.friend_link_id}
                                link={link}
                                onImageError={handleImageError}
                                failedImages={failedImages}
                            />
                        ))}
                    </>
                )}
            </div>

            <ApplyModal
                isOpen={isApplyModalOpen}
                onClose={handleModalClose}
                onSubmit={handleApplySubmit}
                submitResult={applyResult}
            />
        </div>
    );
};

export default FriendLink;