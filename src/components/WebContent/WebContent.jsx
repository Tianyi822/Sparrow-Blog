import AuthorInfo from '@/components/WebContent/AuthorInfo/AuthorInfo';
import Announcement from '@/components/WebContent/Announcement/Announcement';
import LatestArticles from '@/components/WebContent/LatestArticles/LatestArticles';
import LatestComments from '@/components/WebContent/LatestComments/LatestComments';
import Categories from '@/components/WebContent/Categories/Categories';
import Tags from '@/components/WebContent/Tags/Tags';
import './WebContent.scss';
import PropTypes from "prop-types";

const WebContent = ({className}) => {
    return (
        <div className={`web-content ${className || ''}`}>
            <AuthorInfo className="web-content-author-info"/>
            <Announcement />
            <LatestArticles className="web-content-latest-articles"/>
            <LatestComments className="web-content-latest-comments"/>
            <Categories className="web-content-categories"/>
            <Tags className="web-content-tags"/>
        </div>
    );
};

WebContent.propTypes = {
    className: PropTypes.string.isRequired,
};

export default WebContent; 