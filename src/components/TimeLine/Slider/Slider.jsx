import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './TimeLineSlider.scss';

const Slider = ({ className }) => {
    const containerRef = useRef(null);
    const [currentBackground, setCurrentBackground] = useState('');
    const [isTransitioning, setIsTransitioning] = useState(false);

    // 静态数据
    const testData = useMemo(() => [
        {
            id: 'item-2025-1',
            title: "舞！舞！舞！",
            date: "2025/01",
            description: "你要做一个不动声色的大人了，不准情绪化，不准偷偷想念，不准回头看，去过自己另外的生活。你要听话，不是所有的鱼都会生活在同一片海里。",
            imageUrl: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240225120610.webp"
        },
        {
            id: 'item-2024-2',
            title: "挪威的森林",
            date: "2024/06",
            description: "每个人都有属于自己的一片森林，也许我们从来不曾去过，但它一直在那里，总会在那里。迷失的人迷失了，相逢的人会再相逢。",
            imageUrl: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240225192352.webp"
        },
        {
            id: 'item-2023-3',
            title: "且听风吟",
            date: "2023/03",
            description: "我们都是孤独的刺猬，只有在爱的时候，才会暂时降下身上的刺。",
            imageUrl: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240225192355.webp"
        },
        {
            id: 'item-2022-4',
            title: "海边的卡夫卡asdfadsfg",
            date: "2022/12",
            description: "不管全世界所有人怎么说，我都认为自己的感受才是正确的。无论别人怎么看，我绝不打乱自己的节奏。",
            imageUrl: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240624110431.webp"
        },
        {
            id: 'item-2021-5',
            title: "1Q84",
            date: "2021/09",
            description: "世界上有些事物是如此美好，以至于让人感到恐惧。",
            imageUrl: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240225120610.webp"
        },
        // ... 可以继续添加更多静态数据
    ], []);

    // 设置初始滚动位置
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !testData.length) return;

        requestAnimationFrame(() => {
            const firstItem = container.querySelector('.timeline-item');
            if (!firstItem) return;

            const containerHeight = container.clientHeight;
            const itemTop = firstItem.offsetTop;
            const itemHeight = firstItem.offsetHeight;
            
            container.scrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2);
        });
    }, [testData.length]);

    // 检测中间项目并更新背景
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const items = container.querySelectorAll('.timeline-item');
            const containerRect = container.getBoundingClientRect();
            const containerCenter = containerRect.top + containerRect.height / 2;

            let closestItem = null;
            let minDistance = Infinity;

            items.forEach(item => {
                const rect = item.getBoundingClientRect();
                const itemCenter = rect.top + rect.height / 2;
                const distance = Math.abs(containerCenter - itemCenter);

                if (distance < minDistance) {
                    minDistance = distance;
                    closestItem = item;
                }
            });

            if (closestItem) {
                const index = Array.from(items).indexOf(closestItem);
                const newImageUrl = testData[index].imageUrl;
                if (newImageUrl !== currentBackground) {
                    setIsTransitioning(true);
                    setTimeout(() => {
                        setCurrentBackground(newImageUrl);
                        setTimeout(() => setIsTransitioning(false), 1000);
                    }, 50);
                }
            }
        };

        handleScroll();
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, [testData, currentBackground]);

    return (
        <div 
            className={classNames('timeline-slider', className, {
                'transitioning': isTransitioning
            })}
            style={{
                backgroundImage: `url(${currentBackground})`
            }}
        >
            <div className="timeline-axis-line"></div>
            <div ref={containerRef} className="timeline-axis">
                <div className="timeline-spacer top"></div>
                {testData.map((item, index) => (
                    <div 
                        key={item.id}
                        className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
                    >
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                            <div className="timeline-media">
                                <div className="media-content">
                                    <div className="timeline-title">{item.title}</div>
                                    <img src={item.imageUrl} alt={item.title} />
                                    <div className="timeline-info">
                                        <div className="timeline-description">{item.description}</div>
                                    </div>
                                </div>
                                <div className="media-stack-layer layer-1"></div>
                                <div className="media-stack-layer layer-2"></div>
                            </div>
                            <div className="timeline-date">
                                <div className="date-content">{item.date}</div>
                            </div>
                        </div>
                    </div>
                ))}
                <div className="timeline-spacer bottom"></div>
            </div>
        </div>
    );
};

Slider.propTypes = {
    className: PropTypes.string
};

Slider.defaultProps = {
    className: ''
};

export default Slider;