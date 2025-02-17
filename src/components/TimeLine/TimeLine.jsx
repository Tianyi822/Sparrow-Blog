import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import './TimeLine.scss';
import ContributionGraph from './ContributionGraph/ContributionGraph';
import Slider from './Slider/Slider.jsx';

// 定义数据类型
const BlogType = PropTypes.shape({
    id: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    imageUrl: PropTypes.string.isRequired,
});

const CollectionType = PropTypes.shape({
    id: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    blogs: PropTypes.arrayOf(BlogType).isRequired,
});

const TimeLine = () => {
    const [isWideScreen, setIsWideScreen] = useState(window.innerWidth > 1480);
    const sliderRef = useRef(null);
    
    /** @type {Array<{id: string, date: string, blogs: Array<{id: string, date: string, title: string, description: string, imageUrl: string}>}>} */
    const [timelineData] = useState([
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
                    description: "每个人都有属于自己的一片森林，也许我们从来不曾去过，但它一直在那里，总会在那里。迷失的人迷失了，相逢的人会再相逢。",
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
                    description: "每个人都有属于自己的一片森林，也许我们从来不曾去过，但它一直在那里，总会在那里。迷失的人迷失了，相逢的人会再相逢。",
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
    ]);

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

    return (
        <div className="timeline">
            {isWideScreen ? (
                <div className="timeline-container">
                    <Slider 
                        ref={sliderRef}
                        className="time-line-slider"
                        data={timelineData}
                    />
                    <ContributionGraph 
                        className="time-line-contribution-graph"
                        onDayClick={handleDayClick}
                    />
                </div>
            ) : (
                <Slider 
                    ref={sliderRef}
                    className="time-line-slider"
                    data={timelineData}
                />
            )}
        </div>
    );
};

TimeLine.propTypes = {
    collections: PropTypes.arrayOf(CollectionType)
};

export default TimeLine; 