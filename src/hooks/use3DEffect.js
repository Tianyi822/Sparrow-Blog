import { useEffect, useRef } from 'react';

const use3DEffect = () => {
    const cardRef = useRef(null);
    const glowRef = useRef(null);
    const borderGlowRef = useRef(null);
    const frameRef = useRef(null);
    const lastMouseEvent = useRef(null);
    const lastUpdate = useRef(0);

    useEffect(() => {
        const card = cardRef.current;
        const glow = glowRef.current;
        const borderGlow = borderGlowRef.current;

        const updateCardTransform = () => {
            if (!lastMouseEvent.current || !card || !glow || !borderGlow) return;

            const now = Date.now();
            // 限制更新频率为每16ms一次（约60fps）
            if (now - lastUpdate.current < 16) {
                frameRef.current = requestAnimationFrame(updateCardTransform);
                return;
            }

            const e = lastMouseEvent.current;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 修改旋转角度计算方式
            const rotateX = -20 * (0.5 - (y / rect.height)); // 添加负号使鼠标位置翘起
            const rotateY = -20 * ((x / rect.width) - 0.5); // 添加负号使鼠标位置翘起

            // 使用CSS变量优化性能
            card.style.setProperty('--rotateX', `${rotateX}deg`);
            card.style.setProperty('--rotateY', `${rotateY}deg`);
            card.style.transform = `
                perspective(1000px) 
                translate3d(0,0,0) 
                rotateX(var(--rotateX)) 
                rotateY(var(--rotateY))
            `;

            // 优化光晕渲染
            const glowX = Math.round(x);
            const glowY = Math.round(y);

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
        };

        const handleMouseMove = (e) => {
            lastMouseEvent.current = e;
            if (!frameRef.current) {
                frameRef.current = requestAnimationFrame(updateCardTransform);
            }
        };

        const handleMouseLeave = () => {
            lastMouseEvent.current = null;
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
                frameRef.current = null;
            }

            requestAnimationFrame(() => {
                if (card) {
                    card.style.transform = 'perspective(1000px) translate3d(0,0,0) rotateX(0deg) rotateY(0deg)';
                }
                if (glow) {
                    glow.style.background = 'transparent';
                }
                if (borderGlow) {
                    borderGlow.style.background = 'transparent';
                }
            });
        };

        card?.addEventListener('mousemove', handleMouseMove, { passive: true });
        card?.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            if (frameRef.current) {
                cancelAnimationFrame(frameRef.current);
            }
            card?.removeEventListener('mousemove', handleMouseMove);
            card?.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return { cardRef, glowRef, borderGlowRef };
};

export default use3DEffect; 