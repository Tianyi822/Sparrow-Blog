import { useEffect, useMemo, useRef, useState } from 'react';
import './TimeLineSlider.scss';

const TimeLineSlider = () => {
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef({ y: 0, scrollTop: 0 });

    // 静态数据
    const testData = useMemo(() => [
        {
            id: 'item-2025-1',
            title: "舞！舞！舞！",
            date: "2025/01/15",
            description: "你要做一个不动声色的大人了，不准情绪化，不准偷偷想念，不准回头看，去过自己另外的生活。你要听话，不是所有的鱼都会生活在同一片海里。",
            imageUrl: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/background_image.webp"
        },
        {
            id: 'item-2024-2',
            title: "挪威的森林",
            date: "2024/06/20",
            description: "每个人都有属于自己的一片森林，也许我们从来不曾去过，但它一直在那里，总会在那里。迷失的人迷失了，相逢的人会再相逢。",
            imageUrl: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/ayaka.jpg"
        },
        {
            id: 'item-2023-3',
            title: "且听风吟",
            date: "2023/03/10",
            description: "我们都是孤独的刺猬，只有在爱的时候，才会暂时降下身上的刺。",
            imageUrl: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/background_image.webp"
        },
        {
            id: 'item-2022-4',
            title: "海边的卡夫卡",
            date: "2022/12/25",
            description: "不管全世界所有人怎么说，我都认为自己的感受才是正确的。无论别人怎么看，我绝不打乱自己的节奏。",
            imageUrl: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/ayaka.jpg"
        },
        {
            id: 'item-2021-5',
            title: "1Q84",
            date: "2021/09/01",
            description: "世界上有些事物是如此美好，以至于让人感到恐惧。",
            imageUrl: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/background_image.webp"
        },
        // ... 可以继续添加更多静态数据
    ], []);

    // 设置初始滚动位置
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !testData.length) return;

        // 等待一帧确保 DOM 完全渲染
        requestAnimationFrame(() => {
            // 获取第一个 timeline-item 的位置
            const firstItem = container.querySelector('.timeline-item');
            if (!firstItem) return;

            // 计算需要滚动的距离
            const containerHeight = container.clientHeight;
            const itemTop = firstItem.offsetTop;
            const itemHeight = firstItem.offsetHeight;
            
            // 将第一个项目滚动到中间位置
            container.scrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2);
        });
    }, [testData.length]);

    // 添加高斯模糊效果处理
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const items = container.querySelectorAll('.timeline-item');
            const containerRect = container.getBoundingClientRect();
            const blurThreshold = containerRect.height * 0.2; // 上下20%区域应用模糊

            items.forEach(item => {
                const rect = item.getBoundingClientRect();
                const distanceFromTop = rect.top - containerRect.top;
                const distanceFromBottom = containerRect.bottom - rect.bottom;

                // 计算模糊度
                let blurAmount = 0;
                let opacity = 1;

                // 处理顶部模糊
                if (distanceFromTop < blurThreshold) {
                    const ratio = distanceFromTop / blurThreshold;
                    blurAmount = 15 * (1 - ratio);
                    opacity = 0.3 + (0.7 * ratio);
                }
                // 处理底部模糊
                else if (distanceFromBottom < blurThreshold) {
                    const ratio = distanceFromBottom / blurThreshold;
                    blurAmount = 15 * (1 - ratio);
                    opacity = 0.3 + (0.7 * ratio);
                }

                // 应用效果
                item.style.filter = `blur(${blurAmount}px)`;
                item.style.opacity = opacity;
            });
        };

        // 初始化效果
        handleScroll();

        // 添加滚动监听
        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    // 鼠标事件处理
    const handleMouseDown = (e) => {
        setIsDragging(true);
        dragStartRef.current = {
            y: e.clientY,
            scrollTop: containerRef.current.scrollTop
        };
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        
        const deltaY = e.clientY - dragStartRef.current.y;
        containerRef.current.scrollTop = dragStartRef.current.scrollTop - deltaY;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // 触摸事件处理
    const handleTouchStart = (e) => {
        setIsDragging(true);
        dragStartRef.current = {
            y: e.touches[0].clientY,
            scrollTop: containerRef.current.scrollTop
        };
    };

    const handleTouchMove = (e) => {
        if (!isDragging) return;
        
        const deltaY = e.touches[0].clientY - dragStartRef.current.y;
        containerRef.current.scrollTop = dragStartRef.current.scrollTop - deltaY;
    };

    return (
        <div className="timeline-slider">
            <div className="timeline-axis-line"></div>
            <div 
                ref={containerRef}
                className="timeline-axis"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
            >
                <div className="timeline-spacer top"></div>

                {testData.map((item, index) => (
                    <div 
                        key={item.id}
                        className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
                        style={{ willChange: 'filter, opacity' }}
                    >
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                            <div className="timeline-media">
                                <div className="timeline-date">{item.date}</div>
                                <img src={item.imageUrl} alt={item.title} />
                                <div className="timeline-info">
                                    <div className="timeline-description">{item.description}</div>
                                </div>
                            </div>
                            <div className="timeline-title">《 {item.title} 》</div>
                        </div>
                    </div>
                ))}

                <div className="timeline-spacer bottom"></div>
            </div>
        </div>
    );
};

export default TimeLineSlider; 