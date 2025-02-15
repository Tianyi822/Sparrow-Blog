import { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import SvgIcon, { DownArrow, Normal } from '@/components/SvgIcon/SvgIcon.jsx';
import PagePopup from './PagePopup.jsx';
import './Pagination.scss';

const Pagination = ({ current, total, className, onPageChange }) => {
    const [popupInfo, setPopupInfo] = useState(null);
    const [isClosing, setIsClosing] = useState(false);
    const ellipsisRef = useRef(null);
    const closeTimeoutRef = useRef(null);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 计算要显示的页码
    const displayPages = useMemo(() => {
        const isMobile = windowWidth <= 768;
        const maxVisible = isMobile ? 5 : 7; // 在移动端只显示5个页码

        if (total <= maxVisible) {
            return Array.from({ length: total }, (_, i) => i + 1);
        }

        let pages = [];
        
        // 始终显示第一页
        pages.push(1);

        if (isMobile) {
            // 移动端显示逻辑
            if (current <= 3) {
                // 当前页靠近开始
                pages.push(2, 3);
                pages.push('...');
                pages.push(total);
            } else if (current >= total - 2) {
                // 当前页靠近结束
                pages.push('...');
                pages.push(total - 2, total - 1, total);
            } else {
                // 当前页在中间
                pages.push('...');
                pages.push(current);
                pages.push('...');
                pages.push(total);
            }
        } else {
            // 桌面端显示逻辑（保持原有逻辑）
            if (current <= 4) {
                pages.push(2, 3, 4, 5);
                pages.push('...');
                pages.push(total);
            } else if (current >= total - 3) {
                pages.push('...');
                pages.push(total - 4, total - 3, total - 2, total - 1);
                pages.push(total);
            } else {
                pages.push('...');
                pages.push(current - 1, current, current + 1);
                pages.push('...');
                pages.push(total);
            }
        }

        return pages;
    }, [current, total, windowWidth]); // 添加 windowWidth 作为依赖

    // 将 getEllipsisPages 移入 useMemo
    const getEllipsisPages = useMemo(() => {
        return (index) => {
            const page = displayPages[index];
            if (page !== '...') return null;

            const prevPage = displayPages[index - 1];
            const nextPage = displayPages[index + 1];
            const pages = [];

            for (let i = prevPage + 1; i < nextPage; i++) {
                pages.push(i);
            }

            return pages;
        };
    }, [displayPages]); // 依赖于 displayPages

    // 使用 useCallback 优化回调函数
    const closePopup = useCallback(() => {
        setIsClosing(true);
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
        }
        closeTimeoutRef.current = setTimeout(() => {
            setPopupInfo(null);
            setIsClosing(false);
            closeTimeoutRef.current = null;
        }, 200);
    }, []);

    const openNewPopup = useCallback((event, index) => {
        const pages = getEllipsisPages(index);
        if (pages && pages.length > 0) {
            // 清除可能存在的定时器
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
                closeTimeoutRef.current = null;
            }
            
            const rect = event.currentTarget.getBoundingClientRect();
            const parentRect = event.currentTarget.closest('.pagination').getBoundingClientRect();
            const position = rect.left - parentRect.left + (rect.width / 2);
            
            // 确保状态更新的顺序
            setIsClosing(false);
            setPopupInfo({
                pages,
                position,
                index
            });
        }
    }, [getEllipsisPages]);

    const handleEllipsisClick = useCallback((event, index) => {
        event.stopPropagation();
        
        if (isClosing) return;

        if (popupInfo) {
            if (popupInfo.index === index) {
                closePopup();
                return;
            }
            // 直接调用 openNewPopup，不需要等待关闭
            openNewPopup(event, index);
            return;
        }

        openNewPopup(event, index);
    }, [isClosing, popupInfo, closePopup, openNewPopup]);

    const handlePageSelect = useCallback((page) => {
        closePopup();
        onPageChange?.(page);
    }, [closePopup, onPageChange]);

    const handlePageClick = useCallback((page) => {
        if (page !== current && page !== '...') {
            console.log(`Clicked page: ${page}`);
            onPageChange?.(page);
        }
    }, [current, onPageChange]);

    // 使用 useMemo 优化 PagePopup 的 props
    const popupProps = useMemo(() => {
        if (!popupInfo) return null;
        return {
            pages: popupInfo.pages,
            position: popupInfo.position,
            isClosing,
            onSelect: handlePageSelect,
            onClose: closePopup
        };
    }, [popupInfo, isClosing, handlePageSelect, closePopup]);

    // 清理定时器
    useEffect(() => {
        return () => {
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className={`pagination ${className || ''}`}>
            {/* 左箭头区域 */}
            <div className="pagination-arrow-area">
                {current > 1 && (
                    <div className="pagination-arrow">
                        <SvgIcon
                            name={DownArrow}
                            size={Normal}
                            className="left"
                            onClick={() => handlePageClick(current - 1)}
                        />
                    </div>
                )}
            </div>

            {/* 数字按钮区域 */}
            <div className="pagination-numbers">
                {displayPages.map((page, index) => (
                    <span
                        key={index}
                        ref={page === '...' ? ellipsisRef : null}
                        className={`pagination-number ${page === current ? 'active' : ''} ${page === '...' ? 'ellipsis' : ''}`}
                        onClick={(e) => {
                            if (page === '...') {
                                handleEllipsisClick(e, index);
                            } else {
                                handlePageClick(page);
                            }
                        }}
                    >
                        {page}
                    </span>
                ))}
            </div>

            {/* 右箭头区域 */}
            <div className="pagination-arrow-area">
                {current < total && (
                    <div className="pagination-arrow">
                        <SvgIcon
                            name={DownArrow}
                            size={Normal}
                            className="right"
                            onClick={() => handlePageClick(current + 1)}
                        />
                    </div>
                )}
            </div>

            {/* 弹窗 */}
            {popupInfo && (
                <PagePopup
                    {...popupProps}
                    index={popupInfo.index}
                />
            )}
        </div>
    );
};

Pagination.propTypes = {
    current: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    className: PropTypes.string,
    onPageChange: PropTypes.func
};

export default Pagination; 