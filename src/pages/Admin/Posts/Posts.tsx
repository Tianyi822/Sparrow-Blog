import React, {useState, useEffect, useMemo, useRef} from 'react';
import {
    FiEdit,
    FiTrash2,
    FiArrowUp,
    FiEye,
    FiEyeOff,
    FiChevronLeft,
    FiChevronRight,
    FiSearch,
    FiX,
    FiSettings
} from 'react-icons/fi';
import './Posts.scss';

// Mock data for posts
interface Post {
    id: number;
    title: string;
    status: 'public' | 'hidden';
    description: string;
    category: string;
    tags: string[];
    wordCount: number;
    createdAt: string;
    updatedAt: string;
    pinned: boolean;
}

// 格式化日期时间函数
const formatDateTime = (dateStr: string): string => {
    const date = new Date(dateStr);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

// 可选的每页条数选项
const pageSizeOptions = [25, 50, 75, 100];

const mockPosts: Post[] = Array.from({length: 100}, (_, index) => {
    // 生成随机数量的标签，限制最多5个标签
    const tagCount = Math.min(Math.floor(Math.random() * 5) + 1, 5); // 1到5个标签
    const tags = [];
    for (let i = 0; i < tagCount; i++) {
        tags.push(`标签${(index + i) % 10 + 1}`);
    }

    return {
        id: index + 1,
        title: `文章标题 ${index + 1} ${index % 3 === 0 ? '这是一个较长的标题用来测试标题显示效果' : ''}`,
        status: index % 4 === 0 ? 'hidden' : 'public',
        description: `这是文章 ${index + 1} 的简介，简要描述了文章的主要内容和亮点。`,
        category: `分类${index % 5 + 1}`,
        tags: tags,
        wordCount: Math.floor(Math.random() * 5000) + 500,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
        updatedAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString(),
        pinned: index % 10 === 0
    };
});

const Posts: React.FC = () => {
    const [posts, setPosts] = useState<Post[]>(mockPosts);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTitle, setSearchTitle] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedTag, setSelectedTag] = useState<string>('');
    const [postsPerPage, setPostsPerPage] = useState<number>(25); // 默认每页25条
    const [showPageSizeSelector, setShowPageSizeSelector] = useState<boolean>(false);
    const [isNarrowScreen, setIsNarrowScreen] = useState<boolean>(window.innerWidth <= 1500);
    const [activeTagPopup, setActiveTagPopup] = useState<number | null>(null);
    const [popupPosition, setPopupPosition] = useState<{top: number, left: number} | null>(null);
    const [isWideScreen, setIsWideScreen] = useState<boolean>(window.innerWidth > 1800);
    const [isClosing, setIsClosing] = useState<boolean>(false);
    const tagsRef = useRef<HTMLDivElement>(null);

    // 从所有文章中提取唯一的分类和标签
    const categories = useMemo(() => {
        const categorySet = new Set(mockPosts.map(post => post.category));
        return Array.from(categorySet);
    }, []);

    const tags = useMemo(() => {
        const tagSet = new Set(mockPosts.flatMap(post => post.tags));
        return Array.from(tagSet);
    }, []);

    // 过滤文章
    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            // 标题搜索（不区分大小写）
            const titleMatch = searchTitle ? post.title.toLowerCase().includes(searchTitle.toLowerCase()) : true;

            // 分类筛选
            const categoryMatch = selectedCategory ? post.category === selectedCategory : true;

            // 标签筛选
            const tagMatch = selectedTag ? post.tags.includes(selectedTag) : true;

            return titleMatch && categoryMatch && tagMatch;
        });
    }, [posts, searchTitle, selectedCategory, selectedTag]);

    // 重置所有筛选条件
    const resetFilters = () => {
        setSearchTitle('');
        setSelectedCategory('');
        setSelectedTag('');
        setCurrentPage(1);
    };

    // 计算总页数
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

    // 获取当前页的文章
    const getCurrentPagePosts = () => {
        const startIndex = (currentPage - 1) * postsPerPage;
        return filteredPosts.slice(startIndex, startIndex + postsPerPage);
    };

    // 当筛选条件改变时，重置到第一页
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTitle, selectedCategory, selectedTag]);

    // 当每页显示条数改变时，重置到第一页
    useEffect(() => {
        setCurrentPage(1);
    }, [postsPerPage]);

    // 处理页码变化
    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    // 处理每页显示条数变化
    const handlePageSizeChange = (size: number) => {
        setPostsPerPage(size);
        setShowPageSizeSelector(false);
    };

    // 处理置顶文章
    const handleTogglePin = (id: number) => {
        setPosts(prevPosts => prevPosts.map(post =>
            post.id === id ? {...post, pinned: !post.pinned} : post
        ));
    };

    // 处理切换文章状态
    const handleToggleStatus = (id: number) => {
        setPosts(prevPosts => prevPosts.map(post =>
            post.id === id ? {...post, status: post.status === 'public' ? 'hidden' : 'public'} : post
        ));
    };

    // 处理编辑文章
    const handleEditPost = (id: number) => {
        console.log(`编辑文章: ${id}`);
        // 实际项目中这里会跳转到编辑页面
    };

    // 处理删除文章
    const handleDeletePost = (id: number) => {
        if (window.confirm('确定要删除这篇文章吗？此操作不可恢复。')) {
            setPosts(prevPosts => prevPosts.filter(post => post.id !== id));
        }
    };

    // 监听窗口大小变化
    useEffect(() => {
        const handleResize = () => {
            setIsNarrowScreen(window.innerWidth <= 1500);
            setIsWideScreen(window.innerWidth > 1800);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 获取标签显示数量
    const getTagDisplayCount = () => {
        return isWideScreen ? 5 : 3;
    };

    // 获取标签限制展示数量
    const getTagLimitCount = () => {
        return isWideScreen ? 4 : 2;
    };

    // 处理点击more-tags显示弹窗
    const handleMoreTagsClick = (postId: number, event: React.MouseEvent) => {
        event.stopPropagation(); // 阻止事件冒泡
        
        if (activeTagPopup === postId) {
            closePopup();
        } else {
            setIsClosing(false);
            const target = event.currentTarget as HTMLElement;
            const rect = target.getBoundingClientRect();
            setPopupPosition({
                top: rect.top,
                left: rect.left + rect.width + 5
            });
            setActiveTagPopup(postId);
        }
    };
    
    // 处理弹窗关闭
    const closePopup = () => {
        setIsClosing(true);
        setTimeout(() => {
            setActiveTagPopup(null);
            setPopupPosition(null);
            setIsClosing(false);
        }, 200); // 动画持续时间
    };

    // 渲染搜索组件
    const renderSearchComponent = () => {
        return (
            <div className="search-container">
                <div className="search-input-wrapper">
                    <FiSearch className="search-icon"/>
                    <input
                        type="text"
                        placeholder="搜索文章标题..."
                        value={searchTitle}
                        onChange={(e) => setSearchTitle(e.target.value)}
                        className="search-input"
                    />
                    {searchTitle && (
                        <button className="clear-search" onClick={() => setSearchTitle('')}>
                            <FiX/>
                        </button>
                    )}
                </div>

                <div className="filter-section">
                    <div className="filter-item">
                        <label htmlFor="category-filter">分类:</label>
                        <select
                            id="category-filter"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">全部分类</option>
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-item">
                        <label htmlFor="tag-filter">标签:</label>
                        <select
                            id="tag-filter"
                            value={selectedTag}
                            onChange={(e) => setSelectedTag(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">全部标签</option>
                            {tags.map(tag => (
                                <option key={tag} value={tag}>{tag}</option>
                            ))}
                        </select>
                    </div>

                    {(searchTitle || selectedCategory || selectedTag) && (
                        <button className="reset-filters" onClick={resetFilters}>
                            重置筛选
                        </button>
                    )}
                </div>
            </div>
        );
    };

    // 渲染每页显示条数选择器
    const renderPageSizeSelector = () => {
        return (
            <div className="page-size-selector">
                <button
                    className="page-size-toggle"
                    onClick={() => setShowPageSizeSelector(!showPageSizeSelector)}
                    title="设置每页显示数量"
                >
                    <FiSettings/>
                    <span>{postsPerPage} 条 / 页</span>
                </button>

                {showPageSizeSelector && (
                    <div className="page-size-dropdown">
                        {pageSizeOptions.map(size => (
                            <button
                                key={size}
                                className={`page-size-option ${postsPerPage === size ? 'active' : ''}`}
                                onClick={() => handlePageSizeChange(size)}
                            >
                                {size}条/页
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // 生成页码按钮
    const renderPagination = () => {
        return (
            <div className="pagination-container">
                <div className="pagination">
                    <button
                        className="pagination-btn prev"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        <FiChevronLeft/>
                    </button>

                    <div className="pagination-info">
                        <span className="current-page">{currentPage}</span>
                        <span className="page-separator">/</span>
                        <span className="total-pages">{totalPages}</span>
                    </div>

                    <button
                        className="pagination-btn next"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        <FiChevronRight/>
                    </button>
                </div>

                {renderPageSizeSelector()}
            </div>
        );
    };

    // 渲染结果统计
    const renderResultSummary = () => {
        return (
            <div className="result-summary">
                显示 {filteredPosts.length} 个结果中的 {Math.min(postsPerPage, getCurrentPagePosts().length)}
                {(searchTitle || selectedCategory || selectedTag) && ' (已筛选)'}
            </div>
        );
    };

    // 点击页面其他地方关闭标签弹窗
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (activeTagPopup !== null) {
                const popupElement = document.querySelector('.tags-popup');
                const clickedElement = event.target as Node;
                
                // 检查是否点击的是more-tags按钮
                const isMoreTagsButton = (target: EventTarget | null): boolean => {
                    if (!target || !(target instanceof Element)) return false;
                    return target.classList.contains('more-tags');
                };
                
                if (popupElement && !popupElement.contains(clickedElement) && 
                    !isMoreTagsButton(event.target)) {
                    closePopup();
                }
            }
        };
        
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [activeTagPopup]);

    return (
        <div className="admin-posts">
            {renderSearchComponent()}

            {renderResultSummary()}

            <div className="posts-table-container" ref={tagsRef}>
                <table className="posts-table">
                    <thead>
                    <tr>
                        <th className="fixed-column index-column">序号</th>
                        <th className="fixed-column title-column">标题</th>
                        <th className="status-column">状态</th>
                        {!isNarrowScreen && <th className="category-column">分类</th>}
                        {!isNarrowScreen && <th className="tags-column">标签</th>}
                        {!isNarrowScreen && <th className="word-count-column">字数</th>}
                        <th className="date-column created-date-column">创建时间</th>
                        {!isNarrowScreen && <th className="date-column updated-date-column">修改时间</th>}
                        <th className="action-column">操作</th>
                    </tr>
                    </thead>
                    <tbody>
                    {getCurrentPagePosts().map(post => (
                        <tr key={post.id} className={post.pinned ? 'pinned-row' : ''}>
                            <td className="fixed-column index-column">{post.id}</td>
                            <td className="fixed-column title-column" data-full-title={post.title}>
                                <div className="title-wrapper">
                                    <span className="post-title" title={post.title}>{post.title}</span>
                                </div>
                            </td>
                            <td className="status-column">
                              <span className={`status-badge ${post.status}`}>
                                {post.status === 'public' ? '公开' : '隐藏'}
                              </span>
                            </td>
                            {!isNarrowScreen && <td className="category-column">{post.category}</td>}
                            {!isNarrowScreen && (
                                <td className="tags-column">
                                    <div className="tag-container">
                                    {post.tags.length <= getTagDisplayCount() ? (
                                        post.tags.map(tag => (
                                            <span key={tag} className="tag-badge">{tag}</span>
                                        ))
                                    ) : (
                                        <>
                                            {post.tags.slice(0, getTagLimitCount()).map(tag => (
                                                <span key={tag} className="tag-badge">{tag}</span>
                                            ))}
                                            <span 
                                                className="tag-badge more-tags" 
                                                onClick={(e) => handleMoreTagsClick(post.id, e)}
                                            >
                                                +{post.tags.length - getTagLimitCount()}
                                            </span>
                                        </>
                                    )}
                                    </div>
                                </td>
                            )}
                            {!isNarrowScreen && <td className="word-count-column">{post.wordCount}</td>}
                            <td className="date-column created-date-column">{formatDateTime(post.createdAt)}</td>
                            {!isNarrowScreen && <td className="date-column updated-date-column">{formatDateTime(post.updatedAt)}</td>}
                            <td className="action-column">
                                <div className="action-buttons">
                                    <button
                                        className="action-btn toggle-status"
                                        title={post.status === 'public' ? '隐藏' : '公开'}
                                        onClick={() => handleToggleStatus(post.id)}
                                    >
                                        {post.status === 'public' ? <FiEye/> : <FiEyeOff/>}
                                    </button>
                                    <button
                                        className={`action-btn toggle-pin ${post.pinned ? 'active' : ''}`}
                                        title={post.pinned ? '取消置顶' : '置顶'}
                                        onClick={() => handleTogglePin(post.id)}
                                    >
                                        <FiArrowUp/>
                                    </button>
                                    <button
                                        className="action-btn edit"
                                        title="编辑"
                                        onClick={() => handleEditPost(post.id)}
                                    >
                                        <FiEdit/>
                                    </button>
                                    <button
                                        className="action-btn delete"
                                        title="删除"
                                        onClick={() => handleDeletePost(post.id)}
                                    >
                                        <FiTrash2/>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {renderPagination()}
            
            {/* 独立的弹窗容器 */}
            {activeTagPopup !== null && popupPosition && (
                <div 
                    className={`tags-popup ${isClosing ? 'closing' : ''}`}
                    style={{
                        position: 'fixed',
                        top: `${popupPosition.top}px`,
                        left: `${popupPosition.left}px`
                    }}
                >
                    {getCurrentPagePosts().find(post => post.id === activeTagPopup)?.tags.slice(getTagLimitCount()).map(tag => (
                        <span key={tag} className="popup-tag">{tag}</span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Posts; 