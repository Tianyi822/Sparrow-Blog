import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './PagePopup.scss';

const PagePopup = ({ pages, onSelect, onClose, position, isClosing, index }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [popupStyle, setPopupStyle] = useState({});

    useEffect(() => {
        // 获取所有省略号按钮
        const ellipsisButtons = document.querySelectorAll('.pagination .ellipsis');
        // 找到对应索引的省略号按钮
        const currentEllipsis = Array.from(ellipsisButtons).find((button) => {
            const buttonIndex = Array.from(button.parentNode.children).indexOf(button);
            return buttonIndex === index;
        });

        if (currentEllipsis) {
            const rect = currentEllipsis.getBoundingClientRect();
            setPopupStyle({
                left: `${rect.left + rect.width / 2}px`,  // 使用按钮的中心点
                top: `${rect.top - 8}px`,
                transform: 'translate(-50%, -100%)'
            });
        }

        requestAnimationFrame(() => {
            setIsVisible(true);
        });
    }, [position, index]);

    useEffect(() => {
        if (isClosing) {
            setIsVisible(false);
        }
    }, [isClosing]);

    const handlePopupClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div className={`page-popup-container ${isVisible ? 'visible' : ''} ${isClosing ? 'closing' : ''}`}>
            <div className="page-popup-overlay" onClick={onClose} />
            <div 
                className="page-popup"
                onClick={handlePopupClick}
                style={popupStyle}
            >
                {pages.map(page => (
                    <span
                        key={page}
                        className="popup-page-number"
                        onClick={() => onSelect(page)}
                    >
                        {page}
                    </span>
                ))}
            </div>
        </div>
    );
};

PagePopup.propTypes = {
    pages: PropTypes.arrayOf(PropTypes.number).isRequired,
    onSelect: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    position: PropTypes.number.isRequired,
    isClosing: PropTypes.bool,
    index: PropTypes.number.isRequired
};

export default PagePopup; 