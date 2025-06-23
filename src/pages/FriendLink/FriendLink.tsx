import classNames from 'classnames';
import { useState, useEffect, useCallback } from 'react';
import { FriendLinkCardSkeleton } from '@/components/ui/skeleton';
import { getFriendLinks, applyFriendLink, type FriendLink, type FriendLinkApplicationData } from '@/services/webService';
import SvgIcon, { About, Normal } from '@/components/SvgIcon/SvgIcon';
import ApplyModal, { FriendLinkFormData } from './Apply/ApplyModal';
import './FriendLink.scss';

interface FriendLinkProps {
    className?: string;
}



// 友链卡片组件 - 参考Gallery的懒加载模式
const FriendLinkCard: React.FC<{ 
    link: FriendLink; 
    onImageError: (e: React.SyntheticEvent<HTMLImageElement>, linkId: string) => void;
    failedImages: Set<string>;
}> = ({ link, onImageError, failedImages }) => {
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
                >
                    <div className="friend-card-content">
                        {link.friend_avatar_url && !failedImages.has(link.friend_link_id) ? (
                            <>
                                {!imageLoaded && <div className="image-placeholder"></div>}
                                <img 
                                    src={link.friend_avatar_url} 
                                    alt={link.friend_link_name} 
                                    className="friend-avatar"
                                    onLoad={handleImageLoad}
                                    onError={(e) => onImageError(e, link.friend_link_id)}
                                    loading="lazy"
                                />
                            </>
                        ) : (
                            <div className="friend-avatar friend-avatar-default">
                                <SvgIcon 
                                    name={About} 
                                    size={Normal} 
                                    color="white"
                                />
                            </div>
                        )}
                        <div className="friend-info">
                            <h3 className="friend-name">{link.friend_link_name}</h3>
                            <p className="friend-description">{link.friend_describe}</p>
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

    // 过滤链接
    const filteredLinks = links.filter(link => {
        const matchesSearch = link.friend_link_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            link.friend_describe.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

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

    // 处理图片加载错误，确保每个图片只处理一次错误
    const handleImageError = (_e: React.SyntheticEvent<HTMLImageElement>, linkId: string) => {
        if (!failedImages.has(linkId)) {
            setFailedImages(prev => new Set(prev).add(linkId));
        }
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
                            failedImages={failedImages}
                        />
                    ))
                )}
            </div>

            <ApplyModal
                isOpen={isApplyModalOpen}
                onClose={() => {
                    setIsApplyModalOpen(false);
                    setApplyResult(null);
                }}
                onSubmit={handleApplySubmit}
                submitResult={applyResult}
            />
        </div>
    );
};

export default FriendLink;