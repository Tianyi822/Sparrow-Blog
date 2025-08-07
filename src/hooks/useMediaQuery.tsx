import { useEffect, useState } from 'react';

/**
 * 媒体查询自定义钩子
 * 用于检测屏幕尺寸变化，优化移动端性能
 * 
 * @param query - CSS媒体查询字符串
 * @returns 是否匹配媒体查询条件
 */
const useMediaQuery = (query: string): boolean => {
    // 初始状态检查
    const getMatches = (query: string): boolean => {
        // 服务端渲染时返回false
        if (typeof window === 'undefined') {
            return false;
        }
        return window.matchMedia(query).matches;
    };

    const [matches, setMatches] = useState<boolean>(getMatches(query));

    useEffect(() => {
        // 创建媒体查询对象
        const matchMedia = window.matchMedia(query);
        
        // 更新匹配状态
        const handleChange = () => {
            setMatches(matchMedia.matches);
        };

        // 立即检查一次
        handleChange();

        // 添加事件监听器
        if (matchMedia.addListener) {
            // 兼容旧版浏览器
            matchMedia.addListener(handleChange);
        } else {
            // 现代浏览器
            matchMedia.addEventListener('change', handleChange);
        }

        // 清理函数
        return () => {
            if (matchMedia.removeListener) {
                // 兼容旧版浏览器
                matchMedia.removeListener(handleChange);
            } else {
                // 现代浏览器
                matchMedia.removeEventListener('change', handleChange);
            }
        };
    }, [query]);

    return matches;
};

/**
 * 预定义的媒体查询钩子
 */
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');

export default useMediaQuery;