import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getImageUrl, searchBlogs } from '@/services/webService';
import { SearchResultItem } from '@/types';
import './SearchModal.scss';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isEmpty, setIsEmpty] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // 防抖计数器
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // 防抖搜索函数
    const debouncedSearch = useCallback((query: string) => {
        // 清除之前的定时器
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        // 如果查询为空，直接清空结果
        if (!query.trim()) {
            setSearchResults([]);
            setIsLoading(false);
            setIsEmpty(false);
            return;
        }

        setIsLoading(true);
        setIsEmpty(false);

        // 设置新的防抖定时器
        debounceTimerRef.current = setTimeout(async () => {
            try {
                const result = await searchBlogs(query.trim());
                if (result) {
                    setSearchResults(result.results);
                    setIsEmpty(result.results.length === 0);
                } else {
                    setSearchResults([]);
                    setIsEmpty(true);
                }
            } catch (error) {
                console.error('搜索出错:', error);
                setSearchResults([]);
                setIsEmpty(true);
            } finally {
                setIsLoading(false);

                // 确保搜索结果中的mark标签样式正确
                setTimeout(() => {
                    const searchModal = document.querySelector('.search-modal');
                    if (searchModal) {
                        const markElements = searchModal.querySelectorAll('mark');
                        markElements.forEach((mark) => {
                            const element = mark as HTMLElement;
                            element.style.setProperty('background', 'rgba(52, 152, 219, 0.5)', 'important');
                            element.style.setProperty('background-color', 'rgba(52, 152, 219, 0.5)', 'important');
                            element.style.setProperty('color', 'rgba(255, 255, 255, 0.95)', 'important');
                            element.style.setProperty('padding', '2px 6px', 'important');
                            element.style.setProperty('border-radius', '0.25rem', 'important');
                            element.style.setProperty('font-weight', '700', 'important');
                            element.style.setProperty('border', '1px solid rgba(52, 152, 219, 0.3)', 'important');
                            element.style.setProperty('box-shadow', '0 1px 2px rgba(52, 152, 219, 0.2)', 'important');
                        });
                    }
                }, 100);
            }
        }, 500); // 500ms防抖延迟
    }, []);

    // 输入变化处理
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        debouncedSearch(value);
    };

    // 结果项点击处理
    const handleResultClick = (item: SearchResultItem) => {
        // 在新标签页打开博客详情页
        window.open(`/blog/${item.id}`, '_blank');
        handleClose();
    };

    // 清空搜索
    const clearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setIsLoading(false);
        setIsEmpty(false);
        searchInputRef.current?.focus();
    };

    // 关闭模态框并清空搜索内容
    const handleClose = useCallback(() => {
        // 清空搜索状态
        setSearchQuery('');
        setSearchResults([]);
        setIsLoading(false);
        setIsEmpty(false);
        // 清除防抖定时器
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        // 调用父组件的关闭函数
        onClose();
    }, [onClose]);

    // 模态框打开时聚焦输入框并完全禁用页面滚动
    useEffect(() => {
        if (isOpen) {
            // 保存当前滚动位置
            const scrollY = window.scrollY;

            // 禁用body滚动
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';

            // 禁用document上的滚动事件
            const preventScroll = (e: Event) => {
                e.preventDefault();
                e.stopPropagation();
            };

            document.addEventListener('wheel', preventScroll, { passive: false });
            document.addEventListener('touchmove', preventScroll, { passive: false });
            document.addEventListener('scroll', preventScroll, { passive: false });

            // 延迟聚焦，确保模态框完全打开
            if (searchInputRef.current) {
                setTimeout(() => {
                    searchInputRef.current?.focus();
                }, 100);
            }

            // 确保SearchModal内的mark标签样式正确应用
            const ensureMarkStyles = () => {
                const searchModal = document.querySelector('.search-modal');
                if (searchModal) {
                    const markElements = searchModal.querySelectorAll('mark');
                    markElements.forEach((mark) => {
                        const element = mark as HTMLElement;
                        element.style.setProperty('background', 'rgba(52, 152, 219, 0.5)', 'important');
                        element.style.setProperty('background-color', 'rgba(52, 152, 219, 0.5)', 'important');
                        element.style.setProperty('color', 'rgba(255, 255, 255, 0.95)', 'important');
                        element.style.setProperty('padding', '2px 6px', 'important');
                        element.style.setProperty('border-radius', '0.25rem', 'important');
                        element.style.setProperty('font-weight', '700', 'important');
                        element.style.setProperty('border', '1px solid rgba(52, 152, 219, 0.3)', 'important');
                        element.style.setProperty('box-shadow', '0 1px 2px rgba(52, 152, 219, 0.2)', 'important');
                    });
                }
            };

            // 初始应用样式
            setTimeout(ensureMarkStyles, 50);

            // 监听DOM变化，确保新添加的mark元素也能正确应用样式
            const observer = new MutationObserver(() => {
                ensureMarkStyles();
            });

            const searchModalElement = document.querySelector('.search-modal');
            if (searchModalElement) {
                observer.observe(searchModalElement, {
                    childList: true,
                    subtree: true
                });
            }

            return () => {
                // 恢复body样式
                document.body.style.overflow = '';
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';

                // 恢复滚动位置
                window.scrollTo(0, scrollY);

                // 移除事件监听
                document.removeEventListener('wheel', preventScroll);
                document.removeEventListener('touchmove', preventScroll);
                document.removeEventListener('scroll', preventScroll);

                // 清理MutationObserver
                observer.disconnect();
            };
        }
    }, [isOpen]);

    // 清理防抖定时器
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    // ESC键关闭模态框
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                handleClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, handleClose]);

    // 点击背景关闭模态框
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    // 完全阻止模态框内的滚动穿透
    const handleModalWheelEvent = (e: React.WheelEvent) => {
        // 完全阻止滚动事件传播到父元素
        e.stopPropagation();
    };

    const handleModalTouchMove = (e: React.TouchEvent) => {
        // 完全阻止触摸移动事件传播到父元素
        e.stopPropagation();
    };

    // 背景层的滚动阻止
    const handleBackdropWheelEvent = (e: React.WheelEvent) => {
        // 阻止背景层的所有滚动
        e.preventDefault();
        e.stopPropagation();
    };

    const handleBackdropTouchMove = (e: React.TouchEvent) => {
        // 阻止背景层的所有触摸移动
        e.preventDefault();
        e.stopPropagation();
    };

    // 搜索结果容器的智能滚动处理
    const handleSearchBodyScroll = (e: React.WheelEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const { scrollTop, scrollHeight, clientHeight } = target;

        // 如果内容不需要滚动（内容高度小于等于容器高度），完全阻止滚动
        if (scrollHeight <= clientHeight) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        // 向上滚动且已经到顶部时，阻止事件传播
        if (e.deltaY < 0 && scrollTop === 0) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        // 向下滚动且已经到底部时，阻止事件传播
        if (e.deltaY > 0 && scrollTop + clientHeight >= scrollHeight) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }

        // 其他情况只阻止传播，允许内部滚动
        e.stopPropagation();
    };

    if (!isOpen) return null;

    return (
        <div
            className="search-modal-backdrop"
            onClick={handleBackdropClick}
            onWheel={handleBackdropWheelEvent}
            onTouchMove={handleBackdropTouchMove}
        >
            <div
                className="search-modal"
                onWheel={handleModalWheelEvent}
                onTouchMove={handleModalTouchMove}
            >
                <div className="search-modal-header">
                    <div className="search-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" />
                        </svg>
                    </div>
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="搜索博客内容..."
                        value={searchQuery}
                        onChange={handleInputChange}
                        className="search-input"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                    />
                    {searchQuery && (
                        <button 
                            className="clear-button" 
                            onClick={clearSearch}
                            type="button"
                            aria-label="清空搜索"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" strokeWidth="2" />
                                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" strokeWidth="2" />
                            </svg>
                        </button>
                    )}
                </div>

                <div
                    className="search-modal-body"
                    onWheel={handleSearchBodyScroll}
                >
                    {isLoading && (
                        <div className="search-loading">
                            <div className="loading-spinner"></div>
                            <span>搜索中...</span>
                        </div>
                    )}

                    {!isLoading && isEmpty && searchQuery && (
                        <div className="search-empty">
                            <div className="empty-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" />
                                </svg>
                            </div>
                            <p>未找到相关结果</p>
                            <span>尝试其他关键词</span>
                        </div>
                    )}

                    {!isLoading && !isEmpty && searchResults.length > 0 && (
                        <div className="search-results">
                            {searchResults.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="search-result-item"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                    onClick={() => handleResultClick(item)}
                                >
                                    {/* 添加发光效果组件 */}
                                    <div className="search-result-glow"></div>
                                    <div className="search-result-border-glow"></div>

                                    <div className="result-image">
                                        {item.img_id && (
                                            <img
                                                src={getImageUrl(item.img_id)}
                                                alt={item.title}
                                                loading="lazy"
                                            />
                                        )}
                                    </div>
                                    <div className="result-content">
                                        <h3
                                            className="result-title"
                                            dangerouslySetInnerHTML={{
                                                __html: item.highlights.Title?.[0] || item.title
                                            }}
                                        />
                                        <div
                                            className="result-snippet"
                                            dangerouslySetInnerHTML={{
                                                __html: item.highlights.Content?.[0] || ''
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!isLoading && !searchQuery && (
                        <div className="search-placeholder">
                            <div className="placeholder-icon">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.5" />
                                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.5" />
                                </svg>
                            </div>
                            <h3>搜索博客内容</h3>
                            <p>输入关键词开始搜索</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SearchModal;