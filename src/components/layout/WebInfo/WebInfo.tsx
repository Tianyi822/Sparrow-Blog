import AuthorInfo from '@/components/layout/WebInfo/AuthorInfo/AuthorInfo';
import ArticleTitle from '@/components/layout/WebInfo/ArticleTitle/ArticleTitle';
import ArticleList from '@/components/layout/WebInfo/ArticleList/ArticleList';
import CommentTitle from '@/components/layout/WebInfo/CommentTitle/CommentTitle';
import CommentList from '@/components/layout/WebInfo/CommentList/CommentList';
import Categories from '@/components/layout/WebInfo/Categories/Categories';
import './WebInfo.scss';
import TagsLazy from './Tags/TagsLazy';
import { useBlogLayoutContext } from '@/layouts/BlogLayoutContext';
import { BlogCategory, BlogTag } from '@/types';
import { useMemo } from 'react';

/**
 * 博客统计信息接口
 */
interface BlogStats {
    articles: number;
    tags: number;
    categories: number;
}

/**
 * 社交媒体链接接口
 */
interface SocialLinks {
    github?: string;
    email?: string;
}

/**
 * 网站内容组件属性接口
 */
interface WebContentProps {
    /** 自定义类名 */
    className?: string;
    /** 作者名称 */
    authorName?: string;
    /** 作者头像URL */
    authorAvatar?: string;
    /** 作者邮箱 */
    authorEmail?: string;
    /** 作者GitHub链接 */
    authorGithub?: string;
    /** 分类点击处理函数 */
    onCategoryClick?: (category: BlogCategory) => void;
    /** 标签点击处理函数 */
    onTagClick?: (tag: BlogTag) => void;
    /** 当前激活的分类ID */
    activeCategoryId?: string | null;
    /** 当前激活的标签ID */
    activeTagId?: string | null;
}

/**
 * 网站信息组件
 * 显示博客侧边栏信息，包括作者信息、最新文章、最新评论、分类和标签云
 */
const WebInfo: React.FC<WebContentProps> = ({
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
    const stats = useMemo<BlogStats>(() => ({
        articles: publishedBlogs.length,
        tags: homeData?.tags?.length || 0,
        categories: homeData?.categories?.length || 0
    }), [publishedBlogs.length, homeData?.tags?.length, homeData?.categories?.length]);

    // 构建社交媒体链接
    const socialLinks = useMemo<SocialLinks>(() => ({ 
        github: authorGithub || 'https://github.com',
        email: authorEmail ? `mailto:${authorEmail}` : undefined
    }), [authorGithub, authorEmail]);

    return (
        <div className={`web-content ${className || ''}`}>
            <AuthorInfo 
                name={authorName}
                avatar={authorAvatar}
                stats={stats}
                social={socialLinks}
            />
            <ArticleTitle className="web-content-article-title" />
            <ArticleList className="web-content-article-list" />
            <CommentTitle className="web-content-comment-title" />
            <CommentList className="web-content-comment-list" />
            <Categories 
                className="web-content-categories"
                categories={homeData?.categories || []}
                blogCounts={publishedBlogs}
                onCategoryClick={onCategoryClick}
                activeCategory={activeCategoryId}
            />
            <TagsLazy 
                className="web-content-tags"
                tags={homeData?.tags || []}
                onTagClick={onTagClick}
                activeTag={activeTagId}
            />
        </div>
    );
};

export default WebInfo;