import { useState, useEffect } from 'react';
import './BackToTop.scss';
import SvgIcon, { DownArrow, Small } from '@/components/SvgIcon/SvgIcon.jsx';
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
                size={Small}
                color="#126bae"
            />
        </div>
    );
};

BackToTop.propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func,
};

export default BackToTop;