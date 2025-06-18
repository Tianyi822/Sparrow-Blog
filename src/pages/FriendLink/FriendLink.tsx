import classNames from 'classnames';
import { useState } from 'react';
import use3DEffect from '@/hooks/use3DEffect';
import useLazyLoad from '@/hooks/useLazyLoad';
import { FriendLinkCardSkeleton } from '@/components/ui/skeleton';
import Apply, { FormData } from './Apply/Apply';
import './FriendLink.scss';

interface FriendLinkProps {
    className?: string;
}

interface LinkItem {
    id: number;
    avatar: string;
    name: string;
    description: string;
    url: string;
    category: string;
}

// 随机开源图片API列表
const randomImageApis = [
    'https://picsum.photos/200/200',
    'https://source.unsplash.com/200x200/?portrait',
    'https://api.dicebear.com/7.x/avataaars/svg',
    'https://api.dicebear.com/7.x/bottts/svg',
    'https://api.dicebear.com/7.x/shapes/svg'
];

// 懒加载3D卡片组件
const LazyFriendLinkCard: React.FC<{ 
    link: LinkItem; 
    onImageError: (e: React.SyntheticEvent<HTMLImageElement>, linkId: number) => void; 
    getRandomImage: (id: number) => string;
}> = ({ link, onImageError, getRandomImage }) => {
    const { cardRef, glowRef, borderGlowRef } = use3DEffect();
    const { elementRef, hasBeenVisible } = useLazyLoad({
        rootMargin: '100px', // 提前100px开始加载
        threshold: 0.1
    });

    // 如果还没有被观察到，显示骨架屏
    if (!hasBeenVisible) {
        return (
            <div ref={elementRef}>
                <FriendLinkCardSkeleton />
            </div>
        );
    }

    return (
        <div ref={elementRef} className="friend-link-card">
            <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="friend-link-card-link"
            >
                <div className="friend-card-3d" ref={cardRef}>
                    <div className="card-glow" ref={glowRef}></div>
                    <div className="card-border-glow" ref={borderGlowRef}></div>
                    <div className="friend-card-content">
                        <img 
                            src={link.avatar || getRandomImage(link.id)} 
                            alt={link.name} 
                            className="friend-avatar"
                            onError={(e) => onImageError(e, link.id)}
                            loading="lazy" // 图片懒加载
                        />
                        <div className="friend-info">
                            <h3 className="friend-name">{link.name}</h3>
                            <p className="friend-description">{link.description}</p>
                        </div>
                        <div className="friend-meta">
                            <span className="friend-category">{link.category}</span>
                        </div>
                    </div>
                </div>
            </a>
        </div>
    );
};

const FriendLink: React.FC<FriendLinkProps> = ({ className }) => {
    const [links] = useState<LinkItem[]>([
        {
            id: 1,
            avatar: 'https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240225192355.webp',
            name: 'TechMaster',
            description: '专注于前端开发技术分享，React、Vue、Node.js技术深度解析',
            url: 'https://example.com/blog1',
            category: '技术博客'
        },
        {
            id: 2,
            avatar: 'https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240225192352.webp',
            name: '生活美学家',
            description: '记录生活点滴与思考，分享美食、旅行、读书心得',
            url: 'https://example.com/blog2',
            category: '生活博客'
        },
        {
            id: 3,
            avatar: '',
            name: '设计师小张',
            description: 'UI/UX设计师，分享设计心得与创意灵感，Figma使用技巧。专注用户体验设计，从用户研究到界面设计，从原型制作到交互设计，全流程设计经验分享。',
            url: 'https://example.com/blog3',
            category: '设计博客'
        },
        {
            id: 4,
            avatar: 'invalid-url',
            name: '镜头下的世界',
            description: '用镜头记录世界的美好瞬间，风光摄影与人像摄影技巧分享',
            url: 'https://example.com/blog4',
            category: '摄影博客'
        },
        {
            id: 5,
            avatar: '',
            name: 'CodeNinja',
            description: '全栈开发工程师，Python、Java、Go语言实战教程',
            url: 'https://example.com/blog5',
            category: '技术博客'
        },
        {
            id: 6,
            avatar: '',
            name: '小清新日记',
            description: '90后文艺青年，分享小清新生活方式和心情随笔',
            url: 'https://example.com/blog6',
            category: '生活博客'
        },
        {
            id: 7,
            avatar: '',
            name: 'DesignStudio',
            description: '品牌设计工作室，Logo设计、VI设计案例分享。服务过多家知名企业，擅长品牌形象设计、包装设计、网站设计等。',
            url: 'https://example.com/blog7',
            category: '设计博客'
        },
        {
            id: 8,
            avatar: '',
            name: '街头摄影师',
            description: '专注街头摄影，捕捉城市生活中的精彩瞬间',
            url: 'https://example.com/blog8',
            category: '摄影博客'
        },
        {
            id: 9,
            avatar: '',
            name: 'AI探索者',
            description: '人工智能技术研究，机器学习、深度学习前沿资讯',
            url: 'https://example.com/blog9',
            category: '技术博客'
        },
        {
            id: 10,
            avatar: '',
            name: '咖啡与诗',
            description: '慢生活倡导者，咖啡文化、诗歌创作与生活哲学',
            url: 'https://example.com/blog10',
            category: '生活博客'
        },
        {
            id: 11,
            avatar: '',
            name: '像素艺术家',
            description: '数字艺术创作者，插画设计、像素艺术教程分享',
            url: 'https://example.com/blog11',
            category: '设计博客'
        },
        {
            id: 12,
            avatar: '',
            name: '旅行摄影日记',
            description: '环球旅行摄影师，分享世界各地的美景与文化。足迹遍布五大洲，用镜头记录不同文化的魅力，分享旅行摄影技巧和装备推荐。',
            url: 'https://example.com/blog12',
            category: '摄影博客'
        },
        {
            id: 13,
            avatar: '',
            name: 'DevOps工程师',
            description: '云计算、容器化技术、CI/CD流程优化实践分享',
            url: 'https://example.com/blog13',
            category: '技术博客'
        },
        {
            id: 14,
            avatar: '',
            name: '书香生活',
            description: '阅读爱好者，好书推荐、读书笔记与思考感悟',
            url: 'https://example.com/blog14',
            category: '生活博客'
        },
        {
            id: 15,
            avatar: '',
            name: '创意设计师',
            description: '创意总监，品牌策划、广告设计、创意思维训练',
            url: 'https://example.com/blog15',
            category: '设计博客'
        },
        {
            id: 16,
            avatar: '',
            name: '自然摄影师',
            description: '野生动物摄影师，自然生态保护与摄影技巧分享',
            url: 'https://example.com/blog16',
            category: '摄影博客'
        },
        {
            id: 17,
            avatar: '',
            name: '区块链开发者',
            description: 'Web3开发工程师，智能合约、DeFi项目开发经验分享。深入研究以太坊、Solana等区块链技术，参与多个DeFi协议开发，分享Web3开发最佳实践。',
            url: 'https://example.com/blog17',
            category: '技术博客'
        },
        {
            id: 18,
            avatar: '',
            name: '极简生活家',
            description: '极简主义生活方式倡导者，断舍离与高效生活技巧',
            url: 'https://example.com/blog18',
            category: '生活博客'
        },
        {
            id: 19,
            avatar: '',
            name: '交互设计师',
            description: '用户体验设计师，交互设计原理与可用性测试方法',
            url: 'https://example.com/blog19',
            category: '设计博客'
        },
        {
            id: 20,
            avatar: '',
            name: '婚礼摄影师',
            description: '专业婚礼摄影师，记录爱情最美好的时刻',
            url: 'https://example.com/blog20',
            category: '摄影博客'
        }
    ]);

    const [searchTerm, setSearchTerm] = useState<string>('');
    const [selectedCategory, setSelectedCategory] = useState<string>('全部');

    // 获取随机开源图片
    const getRandomImage = (id: number) => {
        const index = id % randomImageApis.length;
        return `${randomImageApis[index]}?seed=${id}`;
    };

    // 获取所有分类
    const categories = ['全部', ...new Set(links.map(link => link.category))];

    // 过滤链接
    const filteredLinks = links.filter(link => {
        const matchesSearch = link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            link.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === '全部' || link.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // 处理友链申请提交
    const handleApplySubmit = (formData: FormData) => {
        console.log('提交的友链申请数据:', formData);
    };

    // 处理图片加载错误
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, linkId: number) => {
        const img = e.target as HTMLImageElement;
        img.src = getRandomImage(linkId);
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
                <div className="friend-link-categories">
                    {categories.map(category => (
                        <button
                            key={category}
                            className={classNames('category-button', {
                                'active': category === selectedCategory
                            })}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>
            
            <div className="friend-link-grid">
                {filteredLinks.map((link) => (
                    <LazyFriendLinkCard
                        key={link.id}
                        link={link}
                        onImageError={handleImageError}
                        getRandomImage={getRandomImage}
                    />
                ))}
            </div>

            <Apply
                className="friend-link-apply"
                onSubmit={handleApplySubmit}
            />
        </div>
    );
};

export default FriendLink;