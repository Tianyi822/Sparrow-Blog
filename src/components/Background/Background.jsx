import './Background.scss';
import PropTypes from 'prop-types';

const Background = ({backgroundImage}) => {
    return (
        <div className="background-container">
            <div
                className="bg-image"
                style={{backgroundImage: `url(${backgroundImage})`}}
            />
            <div className="bg-overlay" />
        </div>
    );
};

Background.propTypes = {
    backgroundImage: PropTypes.string.isRequired
};

export default Background;