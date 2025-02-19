import './BackToTop.scss';
import SvgIcon, { DownArrow, Normal } from '@/components/SvgIcon/SvgIcon.jsx';
import classNames from "classnames";
import PropTypes from "prop-types";

const BackToTop = ({ className, onClick }) => {
    return (
        <div
            className={classNames('back-to-top', className)}
            onClick={onClick}
        >
            <SvgIcon
                name={DownArrow}
                size={Normal}
                className="svg-icon"
                color="#fff"
            />
        </div>
    );
};

BackToTop.propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func,
};

export default BackToTop;