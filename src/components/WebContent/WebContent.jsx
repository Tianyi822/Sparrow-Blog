import AuthorInfo from '@/components/AuthorInfo/AuthorInfo';
import Announcement from '@/components/Announcement/Announcement';
import './WebContent.scss';
import PropTypes from "prop-types";

const WebContent = ({className}) => {
    return (
        <div className={`web-content ${className || ''}`}>
            <AuthorInfo className={"web-content-author-info"}/>
            <Announcement className={"web-content-announcement"}/>
            {/* 这里可以继续添加其他组件 */}
        </div>
    );
};

WebContent.propTypes = {
    className: PropTypes.string.isRequired,
};

export default WebContent; 