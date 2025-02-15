import AuthorInfo from '@/components/AuthorInfo/AuthorInfo';
import Announcement from '@/components/Announcement/Announcement';
import LatestArticles from '@/components/LatestArticles/LatestArticles';
import LatestComments from '@/components/LatestComments/LatestComments';
import Categories from '@/components/Categories/Categories';
import Tags from '@/components/Tags/Tags';
import './WebContent.scss';
import PropTypes from "prop-types";

const WebContent = ({className}) => {
    return (
        <div className={`web-content ${className || ''}`}>
            <AuthorInfo className="web-content-author-info"/>
            <Announcement className="web-content-announcement"/>
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