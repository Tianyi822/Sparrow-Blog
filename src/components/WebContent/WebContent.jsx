import AuthorInfo from '@/components/AuthorInfo/AuthorInfo';
import './WebContent.scss';
import PropTypes from "prop-types";

const WebContent = ({className}) => {
    return (
        <div className={`web-content ${className || ''}`}>
            <AuthorInfo className={"web-content-author-info"}/>
            {/* 这里可以继续添加其他组件 */}
        </div>
    );
};

WebContent.propTypes = {
    className: PropTypes.string.isRequired,
};

export default WebContent; 