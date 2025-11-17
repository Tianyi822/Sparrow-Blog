import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * 懒加载自定义钩子
 * 使用Intersection Observer API检测元素是否进入视窗
 *
 * @param options - Intersection Observer 配置选项
 * @returns 包含ref引用和可见状态的对象
 */
const useLazyLoad = (options?: IntersectionObserverInit) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  const defaultOptions: IntersectionObserverInit = {
    root: null,
    rootMargin: '50px', // 提前50px开始加载
    threshold: 0.1, // 当10%的元素可见时触发
    ...options,
  };

  const callback = useCallback((entries: IntersectionObserverEntry[]) => {
    const [entry] = entries;
    if (entry.isIntersecting) {
      setIsVisible(true);
      setHasBeenVisible(true);
    } else {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(callback, defaultOptions);
    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [callback, defaultOptions]);

  return {
    elementRef,
    isVisible,
    hasBeenVisible,
  };
};

export default useLazyLoad;
