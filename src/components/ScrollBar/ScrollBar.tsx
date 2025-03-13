import { useState, useEffect, useRef } from 'react';
import './ScrollBar.scss';
import classNames from 'classnames';

interface ScrollBarProps {
    className?: string;
    hideDelay?: number; // Add prop for customizing hide delay
}

interface DragStart {
    mouseY: number;
    scrollTop: number;
}

const ScrollBar: React.FC<ScrollBarProps> = ({ className, hideDelay = 1000 }) => {
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [isScrolling, setIsScrolling] = useState<boolean>(false);
    const [bounceDirection, setBounceDirection] = useState<'top' | 'bottom' | null>(null);
    const thumbRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dragStartRef = useRef<DragStart | null>(null);
    const isManualScrollRef = useRef<boolean>(false);
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    // 更新滚动条位置和大小
    const updateScrollThumb = (): void => {
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
            } else if (scrollTop >= scrollHeight - clientHeight - 1) { // Add a small tolerance
                setBounceDirection('bottom');
                setTimeout(() => setBounceDirection(null), 300);
            }
        }
    };

    useEffect(() => {
        const handleScroll = (): void => {
            if (!isDragging) {
                updateScrollThumb();
                setIsScrolling(true);
                
                // Clear previous timeout
                if (scrollTimeoutRef.current) {
                    clearTimeout(scrollTimeoutRef.current);
                }
                
                // Set new timeout to hide the scrollbar
                scrollTimeoutRef.current = setTimeout(() => {
                    setIsScrolling(false);
                    isManualScrollRef.current = false;
                }, hideDelay);
            }
        };

        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', updateScrollThumb);
        
        // Initial update
        updateScrollThumb();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', updateScrollThumb);
            
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, [isDragging, hideDelay]);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
        e.preventDefault();
        if (!thumbRef.current || !containerRef.current) return;

        setIsDragging(true);
        isManualScrollRef.current = true;
        setBounceDirection(null);
        dragStartRef.current = {
            mouseY: e.clientY,
            scrollTop: document.documentElement.scrollTop
        };

        const handleMouseMove = (e: MouseEvent): void => {
            if (!dragStartRef.current) return;

            const { scrollHeight, clientHeight } = document.documentElement;
            const deltaY = e.clientY - dragStartRef.current.mouseY;
            const deltaPercent = deltaY / clientHeight;
            const newScrollTop = Math.max(0, Math.min(
                dragStartRef.current.scrollTop + deltaPercent * scrollHeight,
                scrollHeight - clientHeight
            ));

            window.scrollTo(0, newScrollTop);
            
            if (thumbRef.current) {
                const thumbHeight = thumbRef.current.clientHeight;
                const maxTop = clientHeight - thumbHeight;
                const scrollPercent = newScrollTop / (scrollHeight - clientHeight);
                thumbRef.current.style.top = `${maxTop * scrollPercent}px`;
            }
        };

        const handleMouseUp = (): void => {
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

export default ScrollBar;