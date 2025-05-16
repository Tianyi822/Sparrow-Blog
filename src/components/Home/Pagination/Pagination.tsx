import classNames from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import PagePopup from './PagePopup';
import './Pagination.scss';

/**
 * 分页组件属性接口
 */
interface PaginationProps {
    currentPage: number;                    // 当前页码
    totalPages: number;                     // 总页数
    onPageChange: (page: number) => void;   // 页码变更回调
    className?: string;                     // 自定义样式类名
}

/**
 * 弹出层信息接口
 */
interface PopupInfo {
    pages: number[];          // 弹出层显示的页码数组
    position: number;         // 弹出层位置
    index: number;            // 当前省略号索引
}

/**
 * 分页组件
 * 提供灵活的分页导航，支持移动端和桌面端不同显示方式
 */
const Pagination: React.FC<PaginationProps> = ({
    currentPage,
    totalPages,
    onPageChange,
    className,
}) => {
    const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
    const [isClosing, setIsClosing] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);

    // 检测是否为移动设备
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.matchMedia("(max-width: 768px)").matches);
        };

        // 初始检查
        checkMobile();

        // 设置窗口大小变化的监听器
        window.addEventListener('resize', checkMobile);

        // 清理函数
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // 处理页码选择
    const handlePageSelect = useCallback((page: number) => {
        if (page !== currentPage) {
            onPageChange(page);
        }

        // 选择页码后关闭弹出层
        if (popupInfo) {
            setPopupInfo(null);
        }
    }, [currentPage, onPageChange, popupInfo]);

    // 处理省略号点击，显示页码弹出层
    const handleEllipsisClick = useCallback((pages: number[], position: number, index: number) => {
        setPopupInfo({ pages, position, index });
    }, []);

    // 关闭弹出层的处理函数
    const handlePopupClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            setPopupInfo(null);
            setIsClosing(false);
        }, 200);
    }, []);

    // 处理上一页按钮点击
    const handlePrevPage = useCallback(() => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    }, [currentPage, onPageChange]);

    // 处理下一页按钮点击
    const handleNextPage = useCallback(() => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    }, [currentPage, totalPages, onPageChange]);

    /**
     * 生成要显示的页码数字及省略号
     * 根据当前页码、总页数和设备类型决定显示哪些页码
     */
    const renderPageNumbers = () => {
        const pageNumbers: (number | string)[] = [];

        // 特殊情况：总页数较少
        if (totalPages <= 5) { // 总页数小于等于5时显示所有页码
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
            return pageNumbers;
        }

        // 始终显示第一页
        pageNumbers.push(1);

        if (isMobile) {
            // 移动端布局：最少显示3个页码

            // 情况1：当前页靠近开始
            if (currentPage <= 2) {
                // 显示页码1, 2, 3
                if (currentPage === 1) {
                    pageNumbers.push(2);
                    pageNumbers.push(3);
                } else { // currentPage === 2
                    pageNumbers.push(2);
                    pageNumbers.push(3);
                }

                // 如果还有更多页码，添加右侧省略号
                if (totalPages > 4) {
                    pageNumbers.push('right-ellipsis');
                } else if (totalPages === 4) {
                    // 特殊情况：总页数为4时，直接显示第4页而不是省略号
                    pageNumbers.push(4);
                }
            }
            // 情况2：当前页靠近结束
            else if (currentPage >= totalPages - 1) {
                // 添加左侧省略号
                pageNumbers.push('left-ellipsis');

                // 显示最后三页 (totalPages-2, totalPages-1, totalPages)
                // 但如果总页数较小，避免重复显示第1页
                if (totalPages > 3) pageNumbers.push(totalPages - 2);
                pageNumbers.push(totalPages - 1);
            }
            // 情况3：当前页在中间
            else {
                // 如果不靠近开始，添加左侧省略号
                if (currentPage > 3) {
                    pageNumbers.push('left-ellipsis');
                } else {
                    // 如果靠近开始，显示第2页而不是省略号
                    pageNumbers.push(2);
                }

                // 显示当前页
                pageNumbers.push(currentPage);

                // 如果不靠近结束，添加右侧省略号
                if (currentPage < totalPages - 2) {
                    pageNumbers.push('right-ellipsis');
                } else {
                    // 如果靠近结束，显示倒数第二页而不是省略号
                    pageNumbers.push(totalPages - 1);
                }
            }
        } else {
            // 桌面端布局：显示更多页码

            // 情况1：当前页靠近开始
            if (currentPage <= 3) {
                // 连续显示页码2, 3, 4, 5
                for (let i = 2; i <= Math.min(5, totalPages - 1); i++) {
                    pageNumbers.push(i);
                }

                // 如果需要，添加右侧省略号
                if (totalPages > 6) {
                    pageNumbers.push('right-ellipsis');
                } else if (totalPages === 6) {
                    // 如果总页数为6，直接显示第6页
                    pageNumbers.push(6);
                }
            }
            // 情况2：当前页靠近结束
            else if (currentPage >= totalPages - 2) {
                // 如果不太靠近开始，添加左侧省略号
                if (totalPages > 6) {
                    pageNumbers.push('left-ellipsis');
                }

                // 连续显示结尾内部页码
                const startInterior = Math.max(2, totalPages - 4);
                for (let i = startInterior; i <= totalPages - 1; i++) {
                    pageNumbers.push(i);
                }
            }
            // 情况3：当前页在中间
            else {
                // 添加左侧省略号
                pageNumbers.push('left-ellipsis');

                // 显示当前页及其前后页
                pageNumbers.push(currentPage - 1);
                pageNumbers.push(currentPage);
                pageNumbers.push(currentPage + 1);

                // 添加右侧省略号
                pageNumbers.push('right-ellipsis');
            }
        }

        // 始终显示最后一页（如果尚未添加）
        if (!pageNumbers.includes(totalPages)) {
            pageNumbers.push(totalPages);
        }

        return pageNumbers;
    };

    /**
     * 获取省略号对应的页码
     * @param type 省略号类型（左侧或右侧）
     * @returns 省略号代表的页码数组
     */
    const getEllipsisPages = (type: string): number[] => {
        const pages: number[] = [];

        if (type === 'left-ellipsis') {
            // 添加第1页和当前页之间的所有页码
            for (let i = 2; i < currentPage; i++) {
                pages.push(i);
            }
        } else {
            // 添加当前页和最后页之间的所有页码
            for (let i = currentPage + 1; i < totalPages; i++) {
                pages.push(i);
            }
        }

        return pages;
    };

    const cls = classNames('pagination', className);

    return (
        <div className={cls}>
            {/* 左箭头按钮 */}
            <div className="pagination-arrow-area">
                <button
                    className={`pagination-arrow ${currentPage === 1 ? 'disabled' : ''}`}
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16">
                        <path fill="currentColor" d="M10 3L5 8l5 5 1-1-4-4 4-4-1-1z" />
                    </svg>
                </button>
            </div>

            {/* 页码显示区域 */}
            <div className="pagination-numbers">
                {renderPageNumbers().map((pageNum, index) => {
                    if (typeof pageNum === 'number') {
                        // 渲染数字页码
                        return (
                            <button
                                key={pageNum}
                                className={`pagination-number ${pageNum === currentPage ? 'active' : ''}`}
                                onClick={() => handlePageSelect(pageNum)}
                            >
                                {pageNum}
                            </button>
                        );
                    } else {
                        // 渲染省略号
                        const pages = getEllipsisPages(pageNum as string);
                        return (
                            <button
                                key={`${pageNum}-${index}`}
                                className="pagination-number ellipsis"
                                onClick={() => handleEllipsisClick(pages, pageNum === 'left-ellipsis' ? -1 : 1, index)}
                            />
                        );
                    }
                })}
            </div>

            {/* 右箭头按钮 */}
            <div className="pagination-arrow-area">
                <button
                    className={`pagination-arrow ${currentPage === totalPages ? 'disabled' : ''}`}
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16">
                        <path fill="currentColor" d="M6 3l5 5-5 5-1-1 4-4-4-4 1-1z" />
                    </svg>
                </button>
            </div>

            {/* 页码弹出层 */}
            {popupInfo && (
                <PagePopup
                    pages={popupInfo.pages}
                    onSelect={handlePageSelect}
                    onClose={handlePopupClose}
                    position={popupInfo.position}
                    isClosing={isClosing}
                    index={popupInfo.index}
                    currentPage={currentPage}
                />
            )}
        </div>
    );
};

export default Pagination;