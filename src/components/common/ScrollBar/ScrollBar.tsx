import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './ScrollBar.scss';
import classNames from 'classnames';

/**
 * 滚动条组件属性接口
 */
interface ScrollBarProps {
  /** 自定义类名 */
  className?: string;
  /** 滚动条隐藏延迟时间（毫秒） */
  hideDelay?: number;
}

/**
 * 拖动开始状态接口
 */
interface DragStart {
  /** 鼠标Y坐标 */
  mouseY: number;
  /** 页面滚动位置 */
  scrollTop: number;
}

/**
 * 自定义滚动条组件
 * 提供一个可自定义的页面滚动条，支持拖动、自动隐藏和边界弹性效果
 */
const ScrollBar: React.FC<ScrollBarProps> = ({ className, hideDelay = 1000 }) => {
  // 状态定义
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const [bounceDirection, setBounceDirection] = useState<'top' | 'bottom' | null>(null);

  // ref定义
  const thumbRef = useRef<HTMLDivElement>(null); // 滚动条滑块引用
  const containerRef = useRef<HTMLDivElement>(null); // 滚动条容器引用
  const dragStartRef = useRef<DragStart | null>(null); // 拖动开始数据引用
  const isManualScrollRef = useRef<boolean>(false); // 手动滚动标记引用
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined); // 滚动超时引用

  /**
   * 更新滚动条滑块的位置和大小
   * 根据页面滚动位置计算滑块高度和位置
   */
  const updateScrollThumb = useCallback((): void => {
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
      } else if (scrollTop >= scrollHeight - clientHeight - 1) { // 添加小宽容误差
        setBounceDirection('bottom');
        setTimeout(() => setBounceDirection(null), 300);
      }
    }
  }, [isDragging]);

  /**
   * 滚动事件处理函数
   * 更新滚动条位置并控制滚动条显示隐藏
   */
  const handleScroll = useCallback((): void => {
    if (!isDragging) {
      updateScrollThumb();
      setIsScrolling(true);

      // 清除之前的超时
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // 设置新的超时以隐藏滚动条
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
        isManualScrollRef.current = false;
      }, hideDelay);
    }
  }, [isDragging, hideDelay, updateScrollThumb]);

  // 监听滚动和调整窗口大小事件
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateScrollThumb);

    // 初始化更新
    updateScrollThumb();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateScrollThumb);

      // 清除超时
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll, updateScrollThumb]);

  /**
   * 处理鼠标按下事件，开始拖动滚动条
   */
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>): void => {
    e.preventDefault();
    if (!thumbRef.current || !containerRef.current) return;

    setIsDragging(true);
    isManualScrollRef.current = true;
    setBounceDirection(null);
    dragStartRef.current = {
      mouseY: e.clientY,
      scrollTop: document.documentElement.scrollTop,
    };

    /**
     * 处理鼠标移动事件，计算并更新滚动位置
     */
    const handleMouseMove = (e: MouseEvent): void => {
      if (!dragStartRef.current) return;

      const { scrollHeight, clientHeight } = document.documentElement;
      const deltaY = e.clientY - dragStartRef.current.mouseY;
      const deltaPercent = deltaY / clientHeight;
      const newScrollTop = Math.max(
        0,
        Math.min(
          dragStartRef.current.scrollTop + deltaPercent * scrollHeight,
          scrollHeight - clientHeight,
        ),
      );

      window.scrollTo(0, newScrollTop);

      if (thumbRef.current) {
        const thumbHeight = thumbRef.current.clientHeight;
        const maxTop = clientHeight - thumbHeight;
        const scrollPercent = newScrollTop / (scrollHeight - clientHeight);
        thumbRef.current.style.top = `${maxTop * scrollPercent}px`;
      }
    };

    /**
     * 处理鼠标松开事件，结束拖动状态
     */
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
  }, [updateScrollThumb]);

  /**
   * 计算滚动条类名
   */
  const scrollBarClasses = useMemo(() => {
    return classNames('scroll-bar-container', className, {
      'visible': isScrolling || isDragging,
      'bounce-top': !isDragging && !isManualScrollRef.current && bounceDirection === 'top',
      'bounce-bottom': !isDragging && !isManualScrollRef.current && bounceDirection === 'bottom',
    });
  }, [className, isScrolling, isDragging, bounceDirection]);

  return (
    <div
      ref={containerRef}
      className={scrollBarClasses}
    >
      <div
        ref={thumbRef}
        className='scroll-bar-thumb'
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};

export { ScrollBar as default, type ScrollBarProps };
