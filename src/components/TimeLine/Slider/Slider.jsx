import { useEffect, useMemo, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './Slider.scss';
import BlogCollections from '../BlogCollections/BlogCollections';

const Slider = ({ className, data }, ref) => {
    const containerRef = useRef(null);
    const [currentBackground, setCurrentBackground] = useState('');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [selectedBlogs, setSelectedBlogs] = useState(null);
    const [showMask, setShowMask] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    // 重命名为 blogCollectionData
    const blogCollectionData = useMemo(() => data || [], [data]);

    // 设置初始滚动位置
    useEffect(() => {
        const container = containerRef.current;
        if (!container || !blogCollectionData.length) return;

        requestAnimationFrame(() => {
            const firstItem = container.querySelector('.timeline-item');
            if (!firstItem) return;

            const containerHeight = container.clientHeight;
            const itemTop = firstItem.offsetTop;
            const itemHeight = firstItem.offsetHeight;
            
            container.scrollTop = itemTop - (containerHeight / 2) + (itemHeight / 2);
        });
    }, [blogCollectionData.length]);

    // 修改背景图片更新逻辑
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
                const newImageUrl = blogCollectionData[index]?.blogs[0]?.imageUrl;
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
    }, [blogCollectionData, currentBackground]);

    // 暴露滚动方法给父组件
    useImperativeHandle(ref, () => ({
        scrollToDate: (date) => {
            const targetMonth = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
            const targetItem = blogCollectionData.find(item => item.date === targetMonth);
            
            if (targetItem && containerRef.current) {
                const itemElement = containerRef.current.querySelector(`[data-id="${targetItem.id}"]`);
                if (itemElement) {
                    const containerHeight = containerRef.current.clientHeight;
                    const itemTop = itemElement.offsetTop;
                    const itemHeight = itemElement.offsetHeight;
                    
                    containerRef.current.scrollTo({
                        top: itemTop - (containerHeight / 2) + (itemHeight / 2),
                        behavior: 'smooth'
                    });
                }
            }
        }
    }));

    // 处理点击timeline-item
    const handleItemClick = (blogs) => {
        setSelectedBlogs(blogs);
        setShowMask(true);
        // 禁用body滚动
        document.body.style.overflow = 'hidden';
    };

    // 处理关闭BlogCollection
    const handleCloseBlogCollection = (e) => {
        e.preventDefault()
        setIsClosing(true);
        // 等待动画完成后再隐藏
        setTimeout(() => {
            setSelectedBlogs(null);
            setShowMask(false);
            setIsClosing(false);
            // 恢复body滚动
            document.body.style.overflow = 'auto';
        }, 300);
    };

    return (
        <>
            <div 
                className={classNames('timeline-slider', className, {
                    'transitioning': isTransitioning,
                    'empty': !blogCollectionData.length
                })}
                style={{
                    backgroundImage: blogCollectionData.length ? `url(${currentBackground})` : 'none'
                }}
            >
                <div className="timeline-axis-line"></div>
                <div ref={containerRef} className="timeline-axis">
                    <div className="timeline-spacer top"></div>
                    {blogCollectionData.map((collection, index) => (
                        <div 
                            key={collection.id}
                            data-id={collection.id}
                            className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`}
                            onClick={() => handleItemClick(collection.blogs)}
                        >
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                                <div className="timeline-media">
                                    <div className="media-content">
                                        <div className="timeline-title">{collection.blogs[0]?.title}</div>
                                        <img src={collection.blogs[0]?.imageUrl} alt={collection.blogs[0]?.title} />
                                        <div className="timeline-info">
                                            <div className="timeline-description">{collection.blogs[0]?.description}</div>
                                        </div>
                                    </div>
                                    <div className="media-stack-layer layer-1"></div>
                                    <div className="media-stack-layer layer-2"></div>
                                </div>
                                <div className="timeline-date">
                                    <div className="date-content">{collection.date}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="timeline-spacer bottom"></div>
                </div>
            </div>

            {/* 遮罩层和BlogCollections */}
            {showMask && (
                <div className={`blog-collection-mask ${isClosing ? 'closing' : ''}`} onClick={handleCloseBlogCollection}>
                    {selectedBlogs && (
                        <BlogCollections 
                            blogs={selectedBlogs} 
                            onClose={handleCloseBlogCollection}
                        />
                    )}
                </div>
            )}
        </>
    );
}

Slider.propTypes = {
    className: PropTypes.string,
    data: PropTypes.array  // 添加 data 的类型检查
};

Slider.defaultProps = {
    className: '',
    data: []  // 添加 data 的默认值
};

export default forwardRef(Slider);