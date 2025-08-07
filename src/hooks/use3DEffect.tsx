import { useCallback, useEffect, useRef } from 'react';
import { useIsMobile } from './useMediaQuery';

/**
 * 3D效果自定义钩子
 * 为卡片元素添加基于鼠标位置的3D旋转效果
 * 在移动端自动禁用3D效果以优化性能
 * 
 * @returns 包含元素引用的对象，用于绑定到DOM元素
 */
const use3DEffect = () => {
    // DOM元素引用
    const cardRef = useRef<HTMLDivElement | null>(null);

    // 检测是否为移动端
    const isMobile = useIsMobile();

    // 动画相关引用
    const frameRef = useRef<number | null>(null);
    const lastMouseEvent = useRef<MouseEvent | null>(null);
    const lastUpdate = useRef<number>(0);

    /**
     * 重置卡片样式到初始状态
     */
    const resetCardStyle = useCallback(() => {
        const card = cardRef.current;

        if (card) {
            card.style.transform = 'perspective(1000px) translate3d(0,0,0) rotateX(0deg) rotateY(0deg)';
            card.style.setProperty('--rotateX', '0deg');
            card.style.setProperty('--rotateY', '0deg');
        }
    }, []);

    /**
     * 更新卡片变换效果
     * 根据鼠标位置计算旋转角度
     */
    const updateCardTransform = useCallback(() => {
        if (!lastMouseEvent.current || !cardRef.current) return;

        const now = Date.now();
        // 限制更新频率为每16ms一次（约60fps）
        if (now - lastUpdate.current < 16) {
            frameRef.current = requestAnimationFrame(updateCardTransform);
            return;
        }

        const card = cardRef.current;
        const e = lastMouseEvent.current;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // 计算旋转角度，添加负号使鼠标位置翘起
        const rotateX = -20 * (0.5 - (y / rect.height));
        const rotateY = -20 * ((x / rect.width) - 0.5);

        // 使用CSS变量优化性能
        card.style.setProperty('--rotateX', `${rotateX}deg`);
        card.style.setProperty('--rotateY', `${rotateY}deg`);
        
        // 应用变换
        card.style.transform = `
            perspective(1000px) 
            translate3d(0,0,0) 
            rotateX(var(--rotateX)) 
            rotateY(var(--rotateY))
        `;

        lastUpdate.current = now;
        frameRef.current = requestAnimationFrame(updateCardTransform);
    }, []);

    /**
     * 处理鼠标移动事件
     * 更新最后鼠标事件并开始动画帧循环
     * 在移动端禁用3D效果
     */
    const handleMouseMove = useCallback((e: MouseEvent) => {
        // 移动端不执行3D效果
        if (isMobile) return;
        
        lastMouseEvent.current = e;
        if (!frameRef.current) {
            frameRef.current = requestAnimationFrame(updateCardTransform);
        }
    }, [updateCardTransform, isMobile]);

    /**
     * 处理鼠标离开事件
     * 停止动画循环并重置卡片样式
     */
    const handleMouseLeave = useCallback(() => {
        lastMouseEvent.current = null;
        if (frameRef.current) {
            cancelAnimationFrame(frameRef.current);
            frameRef.current = null;
        }

        requestAnimationFrame(resetCardStyle);
    }, [resetCardStyle]);

    // 设置事件监听器并在组件卸载时清理
    useEffect(() => {
        const card = cardRef.current;

        if (card && !isMobile) {
            card.addEventListener('mousemove', handleMouseMove, { passive: true });
            card.addEventListener('mouseleave', handleMouseLeave);
        }

        return () => {
            // 清理动画帧和事件监听器
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }

            if (card) {
                card.removeEventListener('mousemove', handleMouseMove);
                card.removeEventListener('mouseleave', handleMouseLeave);
            }
        };
    }, [handleMouseMove, handleMouseLeave, isMobile]);

    // 当切换到移动端时，重置3D效果
    useEffect(() => {
        if (isMobile && cardRef.current) {
            resetCardStyle();
        }
    }, [isMobile, resetCardStyle]);

    return { cardRef };
};

export default use3DEffect;