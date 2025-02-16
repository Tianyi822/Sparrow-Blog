import { useEffect, useRef } from 'react';
import './TimeLineSlider.scss';

const TimeLineSlider = () => {
    const rafRef = useRef(null);

    useEffect(() => {
        const updateItemStyle = (element, rootBounds) => {
            const rect = element.getBoundingClientRect();
            const elementCenter = rect.top + rect.height / 2;
            
            // 调整区域比例
            const visibleAreaTop = rootBounds.top + rootBounds.height * 0.05; // 顶部 5%
            const visibleAreaBottom = rootBounds.top + rootBounds.height * 0.95; // 底部 5%
            const clearAreaTop = rootBounds.top + rootBounds.height * 0.2; // 清晰区域开始
            const clearAreaBottom = rootBounds.top + rootBounds.height * 0.8; // 清晰区域结束

            let blurAmount = 0;
            let opacity = 1;

            // 如果在顶部或底部的模糊区域
            if (elementCenter < visibleAreaTop || elementCenter > visibleAreaBottom) {
                blurAmount = 15;
                opacity = 0.4;
            }
            // 如果在过渡区域
            else if (elementCenter < clearAreaTop) {
                const transitionRatio = (elementCenter - visibleAreaTop) / (clearAreaTop - visibleAreaTop);
                const easedRatio = transitionRatio * transitionRatio; // 使用二次方缓动
                blurAmount = 15 * (1 - easedRatio);
                opacity = 0.4 + (0.6 * easedRatio);
            }
            else if (elementCenter > clearAreaBottom) {
                const transitionRatio = (visibleAreaBottom - elementCenter) / (visibleAreaBottom - clearAreaBottom);
                const easedRatio = transitionRatio * transitionRatio; // 使用二次方缓动
                blurAmount = 15 * (1 - easedRatio);
                opacity = 0.4 + (0.6 * easedRatio);
            }

            element.style.filter = `blur(${blurAmount}px)`;
            element.style.opacity = opacity;
        };

        const container = document.querySelector('.timeline-axis');
        const items = document.querySelectorAll('.timeline-item');

        const updateAllItems = () => {
            if (!container) return;
            const rootBounds = container.getBoundingClientRect();
            items.forEach(item => updateItemStyle(item, rootBounds));
            rafRef.current = requestAnimationFrame(updateAllItems);
        };

        updateAllItems();

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, []);

    // 测试数据
    const testData = [
        {
            id: 1,
            title: "舞！舞！舞！",
            date: "2025/01/01",
            description: "你要做一个不动声色的大人了，不准情绪化，不准偷偷想念，不准回头看，去过自己另外的生活。你要听话，不是所有的鱼都会生活在同一片海里。你要听话，不是所有的鱼都会生活在同一片海里。",
            imageUrl: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/background_image.webp"
        },
        {
            id: 2,
            title: "挪威的森林",
            date: "2002/01/01",
            description: "每个人都有属于自己的一片森林，也许我们从来不曾去过，但它一直在那里，总会在那里。迷失的人迷失了，相逢的人会再相逢。",
            imageUrl: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/ayaka.jpg"
        },
        {
            id: 3,
            title: "且听风吟",
            date: "2003/01/01",
            description: "我们都是孤独的刺猬，只有在爱的时候，才会暂时降下身上的刺。",
            imageUrl: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/background_image.webp"
        },
        {
            id: 4,
            title: "海边的卡夫卡",
            date: "2004/01/01",
            description: "不管全世界所有人怎么说，我都认为自己的感受才是正确的。无论别人怎么看，我绝不打乱自己的节奏。",
            imageUrl: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/ayaka.jpg"
        }
    ];

    return (
        <div className="timeline-slider">
            <div className="timeline-axis-line"></div>
            <div className="timeline-axis">
                {testData.map((item, index) => (
                    <div key={item.id} className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}>
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
            </div>
        </div>
    );
};

export default TimeLineSlider; 