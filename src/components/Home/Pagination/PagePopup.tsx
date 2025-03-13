import { useEffect, useState } from 'react';
import './PagePopup.scss';

interface PagePopupProps {
    pages: number[];
    onSelect: (page: number) => void;
    onClose: () => void;
    position: number;
    isClosing?: boolean;
    index: number;
    currentPage: number;
}

const PagePopup: React.FC<PagePopupProps> = ({ pages, onSelect, onClose, position, isClosing, index, currentPage }) => {
    const [isVisible, setIsVisible] = useState<boolean>(false);
    const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});

    useEffect(() => {
        // 获取所有省略号按钮
        const ellipsisButtons = document.querySelectorAll('.pagination .ellipsis');
        // 找到对应索引的省略号按钮
        const currentEllipsis = Array.from(ellipsisButtons).find((button) => {
            const buttonIndex = Array.from(button.parentNode!.children).indexOf(button);
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

    const handlePopupClick = (e: React.MouseEvent) => {
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
                        className={`popup-page-number ${page === currentPage ? 'active' : ''}`}
                        onClick={() => {
                            onSelect(page);
                            onClose();
                        }}
                    >
                        {page}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default PagePopup;