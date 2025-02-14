import { useState, useEffect, useRef } from 'react';
import './ScrollBar.scss';
import classNames from 'classnames';
import PropTypes from 'prop-types';

const ScrollBar = ({ className }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isScrolling, setIsScrolling] = useState(false);
    const [bounceDirection, setBounceDirection] = useState(null);
    const thumbRef = useRef(null);
    const containerRef = useRef(null);
    const dragStartRef = useRef(null);
    const isManualScrollRef = useRef(false);  // 添加手动滚动标记
    let scrollTimeout;

    // 更新滚动条位置和大小
    const updateScrollThumb = () => {
        if (!thumbRef.current || !containerRef.current) return;

        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const scrollPercent = scrollTop / (scrollHeight - clientHeight);
        const thumbHeight = Math.max(50, (clientHeight / scrollHeight) * clientHeight);
        
        thumbRef.current.style.height = `${thumbHeight}px`;
        thumbRef.current.style.top = `${(clientHeight - thumbHeight) * scrollPercent}px`;

        // 只在自然滚动时检查边界弹性
        if (!isDragging && !isManualScrollRef.current) {
            if (scrollTop <= 0) {
                setBounceDirection('top');
                setTimeout(() => setBounceDirection(null), 300);
            } else if (scrollTop >= scrollHeight - clientHeight) {
                setBounceDirection('bottom');
                setTimeout(() => setBounceDirection(null), 300);
            }
        }
    };

    useEffect(() => {
        const handleScroll = () => {
            if (!isDragging) {
                updateScrollThumb();
                setIsScrolling(true);
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    setIsScrolling(false);
                    isManualScrollRef.current = false;  // 重置手动滚动标记
                }, 1000);
            }
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', updateScrollThumb);
        updateScrollThumb();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', updateScrollThumb);
            clearTimeout(scrollTimeout);
        };
    }, [isDragging]);

    const handleMouseDown = (e) => {
        e.preventDefault();
        if (!thumbRef.current || !containerRef.current) return;

        setIsDragging(true);
        isManualScrollRef.current = true;  // 设置手动滚动标记
        setBounceDirection(null);
        dragStartRef.current = {
            mouseY: e.clientY,
            scrollTop: document.documentElement.scrollTop
        };

        const handleMouseMove = (e) => {
            if (!dragStartRef.current) return;

            const { scrollHeight, clientHeight } = document.documentElement;
            const deltaY = e.clientY - dragStartRef.current.mouseY;
            const deltaPercent = deltaY / clientHeight;
            const newScrollTop = Math.max(0, Math.min(
                dragStartRef.current.scrollTop + deltaPercent * scrollHeight,
                scrollHeight - clientHeight
            ));

            window.scrollTo(0, newScrollTop);
            
            const thumbHeight = thumbRef.current.clientHeight;
            const maxTop = clientHeight - thumbHeight;
            const scrollPercent = newScrollTop / (scrollHeight - clientHeight);
            thumbRef.current.style.top = `${maxTop * scrollPercent}px`;
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            dragStartRef.current = null;
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            // 延迟重置手动滚动标记，以防止松开鼠标时触发弹性
            setTimeout(() => {
                isManualScrollRef.current = false;
            }, 100);
            updateScrollThumb();
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div 
            ref={containerRef}
            className={classNames('scroll-bar-container', className, {
                'visible': isScrolling || isDragging,
                'bounce-top': !isDragging && !isManualScrollRef.current && bounceDirection === 'top',
                'bounce-bottom': !isDragging && !isManualScrollRef.current && bounceDirection === 'bottom'
            })}
        >
            <div 
                ref={thumbRef}
                className="scroll-bar-thumb"
                onMouseDown={handleMouseDown}
            />
        </div>
    );
};

ScrollBar.propTypes = {
    className: PropTypes.string,
};

export default ScrollBar; 