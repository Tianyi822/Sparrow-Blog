import { useState } from 'react';
import './WebsiteRecord.scss';
import SvgIcon, { WebsiteRecord as WebsiteRecordIcon, Small } from '@/components/SvgIcon/SvgIcon.jsx';
import classNames from 'classnames';
import PropTypes from 'prop-types';

const WebsiteRecord = (props) => {
    const { className } = props;
    const [isExpanded, setIsExpanded] = useState(false);

    const websiteRecordStyle = classNames('website-record', className, {
        expanded: isExpanded
    });

    return (
        <div
            className={websiteRecordStyle}
            onClick={() => window.open('http://beian.miit.gov.cn')}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            <SvgIcon
                name={WebsiteRecordIcon}
                size={Small}
                color="#126bae"
            />
            <span className="record-text">黔ICP备18007069号-4</span>
        </div>
    );
};

WebsiteRecord.propTypes = {
    className: PropTypes.string,
};

export default WebsiteRecord; 