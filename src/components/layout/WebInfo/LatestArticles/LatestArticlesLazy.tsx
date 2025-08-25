import { lazy, Suspense } from 'react';
import { useIsMobile } from '@/hooks/useMediaQuery';

// 动态导入LatestArticles组件
const LatestArticlesComponent = lazy(() => import('./LatestArticles'));

// LatestArticles的props类型
interface LatestArticlesProps {
    className?: string;
}

/**
 * LatestArticles懒加载包装组件
 * 在移动端使用动态加载以优化性能
 */
const LatestArticlesLazy: React.FC<LatestArticlesProps> = (props) => {
    const isMobile = useIsMobile();

    // 移动端加载占位符
    const MobileFallback = () => (
        <div className="latest-articles-loading" style={{
            width: '100%',
            height: '150px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '14px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            padding: '16px',
            boxSizing: 'border-box'
        }}>
            <div style={{ marginBottom: '8px' }}>📄</div>
            <div>加载最新文章...</div>
        </div>
    );

    // 桌面端加载占位符
    const DesktopFallback = () => (
        <div className="latest-articles-loading" style={{
            width: '100%',
            height: '200px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'rgba(255, 255, 255, 0.7)',
            fontSize: '16px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)',
            padding: '20px',
            boxSizing: 'border-box'
        }}>
            <div style={{ marginBottom: '12px', fontSize: '20px' }}>📄</div>
            <div>加载最新文章...</div>
        </div>
    );

    return (
        <Suspense fallback={isMobile ? <MobileFallback /> : <DesktopFallback />}>
            <LatestArticlesComponent {...props} />
        </Suspense>
    );
};

export default LatestArticlesLazy;