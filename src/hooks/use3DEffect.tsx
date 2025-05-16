import { useCallback, useEffect, useRef } from 'react';

/**
 * 3D效果自定义钩子
 * 为卡片元素添加基于鼠标位置的3D旋转和光晕效果
 * 
 * @returns 包含元素引用的对象，用于绑定到DOM元素
 */
const use3DEffect = () => {
    // DOM元素引用
    const cardRef = useRef<HTMLDivElement | null>(null);
    const glowRef = useRef<HTMLDivElement | null>(null);
    const borderGlowRef = useRef<HTMLDivElement | null>(null);

    // 动画相关引用
    const frameRef = useRef<number | null>(null);
    const lastMouseEvent = useRef<MouseEvent | null>(null);
    const lastUpdate = useRef<number>(0);

    /**
     * 重置卡片样式到初始状态
     */
    const resetCardStyle = useCallback(() => {
        const card = cardRef.current;
        const glow = glowRef.current;
        const borderGlow = borderGlowRef.current;

        if (card) {
            card.style.transform = 'perspective(1000px) translate3d(0,0,0) rotateX(0deg) rotateY(0deg)';
        }
        if (glow) {
            glow.style.background = 'transparent';
        }
        if (borderGlow) {
            borderGlow.style.background = 'transparent';
        }
    }, []);

    /**
     * 更新卡片变换效果
     * 根据鼠标位置计算旋转角度和光晕效果
     */
    const updateCardTransform = useCallback(() => {
        if (!lastMouseEvent.current || !cardRef.current || !glowRef.current || !borderGlowRef.current) return;

        const now = Date.now();
        // 限制更新频率为每16ms一次（约60fps）
        if (now - lastUpdate.current < 16) {
            frameRef.current = requestAnimationFrame(updateCardTransform);
            return;
        }

        const card = cardRef.current;
        const glow = glowRef.current;
        const borderGlow = borderGlowRef.current;
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
        card.style.transform = `
            perspective(1000px) 
            translate3d(0,0,0) 
            rotateX(var(--rotateX)) 
            rotateY(var(--rotateY))
        `;

        // 优化光晕渲染，确保位置值为整数以减少重绘
        const glowX = Math.round(x);
        const glowY = Math.round(y);

        // 定义光晕渐变效果
        const glowGradient = `radial-gradient(
            circle 500px at ${glowX}px ${glowY}px, 
            rgba(255, 255, 255, 0.25) 0%, 
            rgba(255, 255, 255, 0.12) 45%, 
            transparent 100%
        )`;

        const borderGlowGradient = `radial-gradient(
            circle 1000px at ${glowX}px ${glowY}px, 
            rgba(255, 255, 255, 1) 0%, 
            rgba(255, 255, 255, 0.7) 20%, 
            rgba(255, 255, 255, 0.3) 40%,
            transparent 65%
        )`;

        // 使用CSS变量优化渐变更新
        glow.style.setProperty('--gradient', glowGradient);
        borderGlow.style.setProperty('--gradient', borderGlowGradient);
        glow.style.background = 'var(--gradient)';
        borderGlow.style.background = 'var(--gradient)';

        lastUpdate.current = now;
        frameRef.current = requestAnimationFrame(updateCardTransform);
    }, []);

    /**
     * 处理鼠标移动事件
     * 更新最后鼠标事件并开始动画帧循环
     */
    const handleMouseMove = useCallback((e: MouseEvent) => {
        lastMouseEvent.current = e;
        if (!frameRef.current) {
            frameRef.current = requestAnimationFrame(updateCardTransform);
        }
    }, [updateCardTransform]);

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

        if (card) {
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
    }, [handleMouseMove, handleMouseLeave]);

    return { cardRef, glowRef, borderGlowRef };
};

export default use3DEffect;