import './ArticleList.scss';
import { useBlogLayoutContext } from '@/layouts/BlogLayoutContext';
import { useMemo } from 'react';

interface ArticleListProps {
    className?: string;
}

const ArticleList: React.FC<ArticleListProps> = ({ className }) => {
    const { homeData, getImageUrl } = useBlogLayoutContext();

    // 获取最新的5篇文章
    const latestArticles = useMemo(() => {
        if (!homeData?.blogs) return [];
        
        // 按创建时间排序（从新到旧）
        return [...homeData.blogs]
            .sort((a, b) => {
                const dateA = new Date(a.create_time).getTime();
                const dateB = new Date(b.create_time).getTime();
                return dateB - dateA; // 降序排列，最新的在前
            })
            .slice(0, 5) // 只取前5条
            .map(blog => ({
                id: blog.blog_id,
                title: blog.blog_title,
                date: new Date(blog.create_time).toLocaleDateString('zh-CN'),
                image: blog.blog_image_id ? getImageUrl(blog.blog_image_id) : ''
            }));
    }, [homeData, getImageUrl]);

    // 处理文章点击，导航到博客内容页
    const handleArticleClick = (blogId: string) => {
        window.open(`/blog/${blogId}`, '_blank');
    };

    return (
        <div className={`article-list-container ${className || ''}`}>
            <div className="article-list-border-glow" />
            <div className="article-list">
                {latestArticles.map(article => (
                    <div 
                        key={article.id} 
                        className="article-item"
                        onClick={() => handleArticleClick(article.id)}
                        style={{ cursor: 'pointer' }}
                    >
                        <img src={article.image} alt={article.title} className="article-image"/>
                        <div className="article-info">
                            <h4 className="article-title">{article.title}</h4>
                            <span className="article-date">{article.date}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ArticleList;