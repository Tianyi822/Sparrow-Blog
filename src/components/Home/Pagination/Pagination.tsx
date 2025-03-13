import { useState, useCallback, useEffect } from 'react';
import PagePopup from './PagePopup';
import './Pagination.scss';
import classNames from 'classnames';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    className?: string;
}

interface PopupInfo {
    pages: number[];
    position: number;
    index: number;
}

const Pagination: React.FC<PaginationProps> = ({ 
    currentPage, 
    totalPages, 
    onPageChange,
    className,
}) => {
    const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
    const [isClosing, setIsClosing] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    
    // Detect mobile screen
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.matchMedia("(max-width: 768px)").matches);
        };
        
        // Check initially
        checkMobile();
        
        // Set up listener for screen resize
        window.addEventListener('resize', checkMobile);
        
        // Clean up
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handlePageSelect = useCallback((page: number) => {
        if (page !== currentPage) {
            onPageChange(page);
        }
        
        // Close the popup after page selection
        if (popupInfo) {
            setPopupInfo(null);
        }
    }, [currentPage, onPageChange, popupInfo]);

    const handleEllipsisClick = useCallback((pages: number[], position: number, index: number) => {
        setPopupInfo({ pages, position, index });
    }, []);

    const handlePopupClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(() => {
            setPopupInfo(null);
            setIsClosing(false);
        }, 200);
    }, []);

    // Handle navigation via arrows
    const handlePrevPage = useCallback(() => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    }, [currentPage, onPageChange]);

    const handleNextPage = useCallback(() => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    }, [currentPage, totalPages, onPageChange]);

    const renderPageNumbers = () => {
        const pageNumbers: (number | string)[] = [];
        
        // Handle special case: few total pages
        if (totalPages <= 5) { // Show all pages if there are 5 or fewer
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
            return pageNumbers;
        }
        
        // Always show first page
        pageNumbers.push(1);
        
        if (isMobile) {
            // Mobile layout with minimum 3 visible page numbers
            
            // Case 1: Current page is near beginning
            if (currentPage <= 2) {
                // Show pages 1, 2, 3
                if (currentPage === 1) {
                    pageNumbers.push(2);
                    pageNumbers.push(3);
                } else { // currentPage === 2
                    pageNumbers.push(2);
                    pageNumbers.push(3);
                }
                
                // Add ellipsis if more pages exist
                if (totalPages > 4) {
                    pageNumbers.push('right-ellipsis');
                } else if (totalPages === 4) {
                    // Special case: show 4 instead of ellipsis when totalPages is 4
                    pageNumbers.push(4);
                }
            }
            // Case 2: Current page is near end
            else if (currentPage >= totalPages - 1) {
                // Add ellipsis for earlier pages
                pageNumbers.push('left-ellipsis');
                
                // Show the three last pages continuously (totalPages-2, totalPages-1, totalPages)
                // But don't duplicate page 1 if totalPages is small
                if (totalPages > 3) pageNumbers.push(totalPages - 2);
                pageNumbers.push(totalPages - 1);
            }
            // Case 3: Current page is in middle
            else {
                // Add left ellipsis if not close to start
                if (currentPage > 3) {
                    pageNumbers.push('left-ellipsis');
                } else {
                    // If close to start, show page 2 instead of ellipsis
                    pageNumbers.push(2);
                }
                
                // Show current page
                pageNumbers.push(currentPage);
                
                // Add right ellipsis if not close to end
                if (currentPage < totalPages - 2) {
                    pageNumbers.push('right-ellipsis');
                } else {
                    // If close to end, show second-last page instead of ellipsis
                    pageNumbers.push(totalPages - 1);
                }
            }
        } else {
            // Desktop layout with more visible pages
            
            // Case 1: Current page is near the beginning
            if (currentPage <= 3) {
                // Show pages 2, 3, 4, 5 without gaps
                for (let i = 2; i <= Math.min(5, totalPages - 1); i++) {
                    pageNumbers.push(i);
                }
                
                // Add right ellipsis if needed
                if (totalPages > 6) {
                    pageNumbers.push('right-ellipsis');
                } else if (totalPages === 6) {
                    // Show last interior page if just one more
                    pageNumbers.push(6);
                }
            }
            // Case 2: Current page is near the end
            else if (currentPage >= totalPages - 2) {
                // Add left ellipsis if not too close to beginning
                if (totalPages > 6) {
                    pageNumbers.push('left-ellipsis');
                }
                
                // Show final interior pages continuously
                const startInterior = Math.max(2, totalPages - 4);
                for (let i = startInterior; i <= totalPages - 1; i++) {
                    pageNumbers.push(i);
                }
            }
            // Case 3: Current page is in the middle
            else {
                // Add left ellipsis
                pageNumbers.push('left-ellipsis');
                
                // Add pages around current page
                pageNumbers.push(currentPage - 1);
                pageNumbers.push(currentPage);
                pageNumbers.push(currentPage + 1);
                
                // Add right ellipsis
                pageNumbers.push('right-ellipsis');
            }
        }
        
        // Last page is always shown (if not already added)
        if (!pageNumbers.includes(totalPages)) {
            pageNumbers.push(totalPages);
        }
        
        return pageNumbers;
    };

    const getEllipsisPages = (type: string): number[] => {
        const pages: number[] = [];
        
        if (type === 'left-ellipsis') {
            // Add all pages between 1 and current-1
            for (let i = 2; i < currentPage; i++) {
                pages.push(i);
            }
        } else {
            // Add all pages between current+1 and totalPages
            for (let i = currentPage + 1; i < totalPages; i++) {
                pages.push(i);
            }
        }
        
        return pages;
    };

    const cls = classNames('pagination', className);

    return (
        <div className={cls}>
            {/* Left arrow button */}
            <div className="pagination-arrow-area">
                <button 
                    className={`pagination-arrow ${currentPage === 1 ? 'disabled' : ''}`}
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16">
                        <path fill="currentColor" d="M10 3L5 8l5 5 1-1-4-4 4-4-1-1z"/>
                    </svg>
                </button>
            </div>

            <div className="pagination-numbers">
                {renderPageNumbers().map((pageNum, index) => {
                    if (typeof pageNum === 'number') {
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

            {/* Right arrow button */}
            <div className="pagination-arrow-area">
                <button 
                    className={`pagination-arrow ${currentPage === totalPages ? 'disabled' : ''}`}
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                >
                    <svg width="16" height="16" viewBox="0 0 16 16">
                        <path fill="currentColor" d="M6 3l5 5-5 5-1-1 4-4-4-4 1-1z"/>
                    </svg>
                </button>
            </div>

            {/* Popup component */}
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