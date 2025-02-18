import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './ArchiveRoom.scss';
import ContributionGraph from './ContributionGraph/ContributionGraph';
import Slider from './Slider/Slider.jsx';
import { BlogType } from './types';
import UnfoldCollection from './UnfoldCollection/UnfoldCollection.jsx';
import Category from './Category/Category.jsx';

const CollectionType = PropTypes.shape({
    id: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    blogs: PropTypes.arrayOf(BlogType).isRequired,
});

const ArchiveRoom = () => {
    const [isWideScreen, setIsWideScreen] = useState(window.innerWidth > 1480);
    const sliderRef = useRef(null);
    const [selectedBlogs, setSelectedBlogs] = useState(null);
    const [showMask, setShowMask] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    /** @type {Array<{id: string, date: string, blogs: Array<{id: string, date: string, title: string, description: string, imageUrl: string}>}>} */
    const [timelineData] = useState(
        {
            categories: [
                {
                    name: "前端开发",
                    count: 15
                },
                {
                    name: "后端开发",
                    count: 12
                },
                {
                    name: "数据库",
                    count: 8
                },
                {
                    name: "算法与数据结构",
                    count: 10
                },
                {
                    name: "人工智能",
                    count: 7
                },
                {
                    name: "云计算",
                    count: 6
                },
                {
                    name: "DevOps",
                    count: 5
                },
                {
                    name: "网络安全",
                    count: 9
                },
                {
                    name: "区块链",
                    count: 4
                },
                {
                    name: "微服务",
                    count: 8
                },
                {
                    name: "容器技术",
                    count: 6
                },
                {
                    name: "操作系统",
                    count: 7
                },
                {
                    name: "移动开发",
                    count: 11
                },
                {
                    name: "测试与质量",
                    count: 5
                },
                {
                    name: "系统架构",
                    count: 8
                },
                {
                    name: "大数据",
                    count: 9
                },
                {
                    name: "编程语言",
                    count: 14
                },
                {
                    name: "开发工具",
                    count: 7
                },
                {
                    name: "性能优化",
                    count: 6
                },
                {
                    name: "项目管理",
                    count: 5
                }
            ],
            contributionData: [
                {
                    date: "2025-1-1",
                    wordCount: 100
                },
                {
                    date: "2025-1-2",
                    wordCount: 200
                },
                {
                    date: "2025-1-3",
                    wordCount: 800
                },
                {
                    date: "2025-1-4",
                    wordCount: 4000
                },
                {
                    date: "2025-1-5",
                    wordCount: 800
                },
                {
                    date: "2025-1-6",
                    wordCount: 900
                },
                {
                    date: "2025-2-1",
                    wordCount: 1000
                },
                {
                    date: "2025-2-2",
                    wordCount: 200
                },
                {
                    date: "2025-2-3",
                    wordCount: 690
                },
                {
                    date: "2025-2-4",
                    wordCount: 400
                },
                {
                    date: "2025-2-5",
                    wordCount: 500
                },
                {
                    date: "2025-2-6",
                    wordCount: 600
                },
            ],
            collections: [
                {
                    id: "collection-2025-1",
                    date: "2025/01",
                    blogs: [
                        {
                            id: "item-2025-1-1",
                            date: "2025-1-1",
                            title: "舞！舞！舞！",
                            description: "你要做一个不动声色的大人了，不准情绪化，不准偷偷想念，不准回头看，去过自己另外的生活。你要听话，不是所有的鱼都会生活在同一片海里。",
                            imageUrl: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240225120610.webp"
                        },
                        {
                            id: "item-2025-1-2",
                            date: "2025-1-2",
                            title: "挪威的森林",
                            description: "每个人都有属于自己的一片森林，也许我们从来不会去过，但它一直在那里，总会在那里。迷失的人迷失了，相逢的人会再相逢。",
                            imageUrl: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240225192352.webp"
                        },
                        {
                            id: "item-2025-1-3",
                            date: "2025-1-3",
                            title: "且听风吟",
                            description: "我们都是孤独的刺猬，只有在爱的时候，才会暂时降下身上的刺。",
                            imageUrl: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240225192355.webp"
                        },
                        {
                            id: "item-2025-1-4",
                            date: "2025-1-4",
                            title: "舞！舞！舞！",
                            description: "你要做一个不动声色的大人了，不准情绪化，不准偷偷想念，不准回头看，去过自己另外的生活。你要听话，不是所有的鱼都会生活在同一片海里。",
                            imageUrl: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240225120610.webp"
                        },
                        {
                            id: "item-2025-1-5",
                            date: "2025-1-5",
                            title: "海边的卡夫卡asdfadsfg",
                            description: "不管全世界所有人怎么说，我都认为自己的感受才是正确的。无论别人怎么看，我绝不打乱自己的节奏。",
                            imageUrl: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240624110431.webp"
                        },
                        {
                            id: "item-2025-1-6",
                            date: "2025-1-6",
                            title: "1Q84",
                            description: "世界上有些事物是如此美好，以至于让人感到恐惧。",
                            imageUrl: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240225120610.webp"
                        },
                    ]
                },
                {
                    id: "collection-2025-2",
                    date: "2025/02",
                    blogs: [
                        {
                            id: "item-2025-2-1",
                            date: "2025-1-1",
                            title: "舞！舞！舞！",
                            description: "你要做一个不动声色的大人了，不准情绪化，不准偷偷想念，不准回头看，去过自己另外的生活。你要听话，不是所有的鱼都会生活在同一片海里。",
                            imageUrl: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240225192355.webp"
                        },
                        {
                            id: "item-2025-2-2",
                            date: "2025-1-2",
                            title: "挪威的森林",
                            description: "每个人都有属于自己的一片森林，也许我们从来不会去过，但它一直在那里，总会在那里。迷失的人迷失了，相逢的人会再相逢。",
                            imageUrl: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240225192352.webp"
                        },
                        {
                            id: "item-2025-2-3",
                            date: "2025-1-3",
                            title: "且听风吟",
                            description: "我们都是孤独的刺猬，只有在爱的时候，才会暂时降下身上的刺。",
                            imageUrl: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240225120610.webp"
                        },
                        {
                            id: "item-2025-2-4",
                            date: "2025-1-4",
                            title: "舞！舞！舞！",
                            description: "你要做一个不动声色的大人了，不准情绪化，不准偷偷想念，不准回头看，去过自己另外的生活。你要听话，不是所有的鱼都会生活在同一片海里。",
                            imageUrl: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240225120610.webp"
                        },
                        {
                            id: "item-2025-2-5",
                            date: "2025-1-5",
                            title: "海边的卡夫卡asdfadsfg",
                            description: "不管全世界所有人怎么说，我都认为自己的感受才是正确的。无论别人怎么看，我绝不打乱自己的节奏。",
                            imageUrl: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240624110431.webp"
                        },
                        {
                            id: "item-2025-2-6",
                            date: "2025-1-6",
                            title: "1Q84",
                            description: "世界上有些事物是如此美好，以至于让人感到恐惧。",
                            imageUrl: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240225120610.webp"
                        },
                    ]
                }
            ],
        },
    );

    useEffect(() => {
        const handleResize = () => {
            setIsWideScreen(window.innerWidth > 1480);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 处理格子点击事件
    const handleDayClick = (date) => {
        if (sliderRef.current) {
            sliderRef.current.scrollToDate(date);
        }
    };

    // 处理博客点击
    const handleBlogsClick = (blogs) => {
        setSelectedBlogs(blogs);
        setShowMask(true);
        document.body.style.overflow = 'hidden';
    };

    // 处理关闭
    const handleCloseBlogCollection = (e) => {
        e.preventDefault();
        setIsClosing(true);
        setTimeout(() => {
            setSelectedBlogs(null);
            setShowMask(false);
            setIsClosing(false);
            document.body.style.overflow = 'auto';
        }, 300);
    };

    return (
        <div className="archive-room">
            {isWideScreen ? (
                <>
                    <div className="archive-room-container">
                        <Slider
                            ref={sliderRef}
                            className="archive-room-slider"
                            data={timelineData.collections}
                            onBlogsClick={handleBlogsClick}
                        />
                        <ContributionGraph
                            className="time-line-contribution-graph"
                            onDayClick={handleDayClick}
                            data={timelineData.contributionData}
                        />
                    </div>
                    <Category categories={timelineData.categories} />
                </>
            ) : (
                <>
                    <Slider
                        ref={sliderRef}
                        className="archive-room-slider"
                        data={timelineData.collections}
                        onBlogsClick={handleBlogsClick}
                    />
                    <Category categories={timelineData.categories} />
                </>
            )}

            {/* 遮罩层和BlogCollections移到这里 */}
            {showMask && (
                <div
                    className={`blog-collection-mask ${isClosing ? 'closing' : ''}`}
                    onClick={handleCloseBlogCollection}
                >
                    {selectedBlogs && (
                        <UnfoldCollection
                            blogs={selectedBlogs}
                            onClose={handleCloseBlogCollection}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

ArchiveRoom.propTypes = {
    collections: PropTypes.arrayOf(CollectionType)
};

export default ArchiveRoom;