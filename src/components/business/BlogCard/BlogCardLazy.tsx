import { lazy, Suspense } from 'react';
import { useIsMobile } from '@/hooks/useMediaQuery';

// 动态导入BlogCard组件
const BlogCardComponent = lazy(() => import('./BlogCard'));

// BlogCard的props类型
interface BlogCardProps {
  className?: string;
  blogId: string;
  title: string;
  date: string;
  updateDate: string;
  category: string;
  categoryId: string;
  tags: string[];
  tagIds: string[];
  image: string;
  description: string;
  isTop: boolean;
}

/**
 * BlogCard懒加载包装组件
 * 在移动端使用动态加载以优化性能
 */
const BlogCardLazy: React.FC<BlogCardProps> = (props) => {
  const isMobile = useIsMobile();

  // 移动端加载占位符
  const MobileFallback = () => (
    <div
      className='blog-card-loading'
      style={{
        width: '100%',
        height: '200px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '14px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
      }}
    >
      加载中...
    </div>
  );

  // 桌面端加载占位符
  const DesktopFallback = () => (
    <div
      className='blog-card-loading'
      style={{
        width: '100%',
        height: '300px',
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '16px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)',
      }}
    >
      加载中...
    </div>
  );

  return (
    <Suspense fallback={isMobile ? <MobileFallback /> : <DesktopFallback />}>
      <BlogCardComponent {...props} />
    </Suspense>
  );
};

export default BlogCardLazy;
