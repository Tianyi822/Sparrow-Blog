import AuthorInfo from '@/components/WebContent/AuthorInfo/AuthorInfo';
import Announcement from '@/components/WebContent/Announcement/Announcement';
import LatestArticles from '@/components/WebContent/LatestArticles/LatestArticles';
import LatestComments from '@/components/WebContent/LatestComments/LatestComments';
import Categories from '@/components/WebContent/Categories/Categories';
import './WebContent.scss';
import Tags from './Tags/Tags';

interface WebContentProps {
    className?: string;
}

const WebContent: React.FC<WebContentProps> = ({className}) => {
    return (
        <div className={`web-content ${className || ''}`}>
            <AuthorInfo />
            <Announcement />
            <LatestArticles className="web-content-latest-articles"/>
            <LatestComments className="web-content-latest-comments"/>
            <Categories className="web-content-categories"/>
            <Tags className="web-content-tags"/>
        </div>
    );
};

export default WebContent;