import AuthorInfo from '@/components/WebContent/AuthorInfo/AuthorInfo';
import LatestArticles from '@/components/WebContent/LatestArticles/LatestArticles';
import LatestComments from '@/components/WebContent/LatestComments/LatestComments';
import Categories from '@/components/WebContent/Categories/Categories';
import './WebContent.scss';
import Tags from './Tags/Tags';

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
    return (
        <div className={`web-content ${className || ''}`}>
            <AuthorInfo 
                name={authorName}
                avatar={authorAvatar}
                social={{ 
                    github: authorGithub || 'https://github.com',
                    email: authorEmail ? `mailto:${authorEmail}` : undefined
                }}
            />
            <LatestArticles className="web-content-latest-articles"/>
            <LatestComments className="web-content-latest-comments"/>
            <Categories className="web-content-categories"/>
            <Tags className="web-content-tags"/>
        </div>
    );
};

export default WebContent;