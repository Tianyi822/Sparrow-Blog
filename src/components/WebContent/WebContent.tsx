import AuthorInfo from '@/components/WebContent/AuthorInfo/AuthorInfo';
import LatestArticles from '@/components/WebContent/LatestArticles/LatestArticles';
import LatestComments from '@/components/WebContent/LatestComments/LatestComments';
import Categories from '@/components/WebContent/Categories/Categories';
import './WebContent.scss';
import Tags from './Tags/Tags';
import { useBlogLayoutContext } from '@/layouts/BlogLayoutContext';
import { BlogCategory, BlogTag } from '@/services/adminService';
import { useMemo } from 'react';

interface WebContentProps {
    className?: string;
    authorName?: string;
    authorAvatar?: string;
    authorEmail?: string;
    authorGithub?: string;
    onCategoryClick?: (category: BlogCategory) => void;
    onTagClick?: (tag: BlogTag) => void;
    activeCategoryId?: string | null;
    activeTagId?: string | null;
}

const WebContent: React.FC<WebContentProps> = ({
    className,
    authorName,
    authorAvatar,
    authorEmail,
    authorGithub,
    onCategoryClick,
    onTagClick,
    activeCategoryId,
    activeTagId
}) => {
    const { homeData } = useBlogLayoutContext();

    // 过滤出已发布的博客
    const publishedBlogs = useMemo(() => {
        return homeData?.blogs?.filter(blog => blog.blog_state) || [];
    }, [homeData?.blogs]);

    // 计算文章、标签和分类的数量
    const stats = {
        articles: publishedBlogs.length,
        tags: homeData?.tags?.length || 0,
        categories: homeData?.categories?.length || 0
    };

    console.log('WebContent received activeCategoryId:', activeCategoryId);
    console.log('Published blogs count:', publishedBlogs.length);

    return (
        <div className={`web-content ${className || ''}`}>
            <AuthorInfo 
                name={authorName}
                avatar={authorAvatar}
                stats={stats}
                social={{ 
                    github: authorGithub || 'https://github.com',
                    email: authorEmail ? `mailto:${authorEmail}` : undefined
                }}
            />
            <LatestArticles className="web-content-latest-articles" />
            <LatestComments className="web-content-latest-comments"/>
            <Categories 
                className="web-content-categories"
                categories={homeData?.categories || []}
                blogCounts={publishedBlogs}
                onCategoryClick={onCategoryClick}
                activeCategory={activeCategoryId}
            />
            <Tags 
                className="web-content-tags"
                tags={homeData?.tags || []}
                onTagClick={onTagClick}
                activeTag={activeTagId}
            />
        </div>
    );
};

export default WebContent;