import AuthorInfo from '@/components/WebContent/AuthorInfo/AuthorInfo';
import LatestArticles from '@/components/WebContent/LatestArticles/LatestArticles';
import LatestComments from '@/components/WebContent/LatestComments/LatestComments';
import Categories from '@/components/WebContent/Categories/Categories';
import './WebContent.scss';
import Tags from './Tags/Tags';
import { useBlogLayoutContext } from '@/layouts/BlogLayoutContext';

interface WebContentProps {
    className?: string;
    authorName?: string;
    authorAvatar?: string;
    authorEmail?: string;
    authorGithub?: string;
}

const WebContent: React.FC<WebContentProps> = ({
    className,
    authorName,
    authorAvatar,
    authorEmail,
    authorGithub
}) => {
    const { homeData } = useBlogLayoutContext();

    // 计算文章、标签和分类的数量
    const stats = {
        articles: homeData?.blogs?.length || 0,
        tags: homeData?.tags?.length || 0,
        categories: homeData?.categories?.length || 0
    };

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
                blogCounts={homeData?.blogs || []}
            />
            <Tags 
                className="web-content-tags"
                tags={homeData?.tags || []}
            />
        </div>
    );
};

export default WebContent;