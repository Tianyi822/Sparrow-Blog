import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    FiArrowUp,
    FiChevronLeft,
    FiChevronRight,
    FiEdit,
    FiEye,
    FiEyeOff,
    FiSearch,
    FiSettings,
    FiTrash2,
    FiX
} from 'react-icons/fi';
import './Posts.scss';
import { BlogItem, getAllBlogs, changeBlogState, setBlogTop, deleteBlog } from '@/services/adminService';

// 可选的每页条数选项
const pageSizeOptions = [25, 50, 75, 100];

// 格式化日期时间函数
const formatDateTime = (dateStr: string): string => {
    const date = new Date(dateStr);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
};

const Posts: React.FC = () => {
    const [posts, setPosts] = useState<BlogItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTitle, setSearchTitle] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedTag, setSelectedTag] = useState<string>('');
    const [postsPerPage, setPostsPerPage] = useState<number>(25); // 默认每页25条
    const [showPageSizeSelector, setShowPageSizeSelector] = useState<boolean>(false);
    const [isNarrowScreen, setIsNarrowScreen] = useState<boolean>(window.innerWidth <= 1500);
    const [activeTagPopup, setActiveTagPopup] = useState<string | null>(null);
    const [popupPosition, setPopupPosition] = useState<{ top: number, left: number } | null>(null);
    const [isWideScreen, setIsWideScreen] = useState<boolean>(window.innerWidth > 1800);
    const [isClosing, setIsClosing] = useState<boolean>(false);
    const tagsRef = useRef<HTMLDivElement>(null);

    // 获取博客列表数据
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);
                const response = await getAllBlogs();
                if (response.code === 200) {
                    setPosts(response.data || []);
                } else {
                    setError(response.msg || '获取博客列表失败');
                }
            } catch (err) {
                setError('获取博客列表时发生错误');
                console.error('获取博客列表错误:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    // 从所有文章中提取唯一的分类和标签
    const categories = useMemo(() => {
        if (!posts.length) return [];
        const categorySet = new Set(posts.map(post => post.category.category_name));
        return Array.from(categorySet);
    }, [posts]);

    const tags = useMemo(() => {
        if (!posts.length) return [];
        const tagSet = new Set<string>();
        posts.forEach(post => {
            post.tags.forEach(tag => {
                tagSet.add(tag.tag_name);
            });
        });
        return Array.from(tagSet);
    }, [posts]);

    // 过滤文章
    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            // 标题搜索（不区分大小写）
            const titleMatch = searchTitle ? post.blog_title.toLowerCase().includes(searchTitle.toLowerCase()) : true;

            // 分类筛选
            const categoryMatch = selectedCategory ? post.category.category_name === selectedCategory : true;

            // 标签筛选
            const tagMatch = selectedTag ? post.tags.some(tag => tag.tag_name === selectedTag) : true;

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
    const handleTogglePin = async (id: string) => {
        try {
            const response = await setBlogTop(id);
            if (response.code === 200) {
                // 更新本地状态
                setPosts(prevPosts => prevPosts.map(post =>
                    post.blog_id === id ? { ...post, blog_is_top: !post.blog_is_top } : post
                ));
            } else {
                // 显示错误消息
                setError(response.msg || '修改置顶状态失败');
            }
        } catch (err) {
            console.error('修改置顶状态错误:', err);
            setError('修改置顶状态时发生错误');
        }
    };

    // 处理切换文章状态
    const handleToggleStatus = async (id: string) => {
        try {
            const response = await changeBlogState(id);
            if (response.code === 200) {
                // 更新本地状态
                setPosts(prevPosts => prevPosts.map(post =>
                    post.blog_id === id ? { ...post, blog_state: !post.blog_state } : post
                ));
            } else {
                // 显示错误消息
                setError(response.msg || '修改博客状态失败');
            }
        } catch (err) {
            console.error('修改博客状态错误:', err);
            setError('修改博客状态时发生错误');
        }
    };

    // 处理编辑文章
    const handleEditPost = (id: string) => {
        console.log(`编辑文章: ${id}`);
        // 实际项目中这里会跳转到编辑页面
    };

    // 处理删除文章
    const handleDeletePost = async (id: string) => {
        if (window.confirm('确定要删除这篇文章吗？此操作不可恢复。')) {
            try {
                const response = await deleteBlog(id);
                if (response.code === 200) {
                    // 删除成功，更新本地状态
                    setPosts(prevPosts => prevPosts.filter(post => post.blog_id !== id));
                } else {
                    // 显示错误消息
                    setError(response.msg || '删除博客失败');
                }
            } catch (err) {
                console.error('删除博客错误:', err);
                setError('删除博客时发生错误');
            }
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
    const handleMoreTagsClick = (postId: string, event: React.MouseEvent) => {
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
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="搜索文章标题..."
                        value={searchTitle}
                        onChange={(e) => setSearchTitle(e.target.value)}
                        className="search-input"
                    />
                    {searchTitle && (
                        <button className="clear-search" onClick={() => setSearchTitle('')}>
                            <FiX />
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
                    <FiSettings />
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
                        <FiChevronLeft />
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
                        <FiChevronRight />
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

    if (loading) {
        return <div className="loading-container">加载中...</div>;
    }

    if (error) {
        return <div className="error-container">{error}</div>;
    }

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
                        {getCurrentPagePosts().map((post, index) => (
                            <tr key={post.blog_id} className={post.blog_is_top ? 'pinned-row' : ''}>
                                <td className="fixed-column index-column">{(currentPage - 1) * postsPerPage + index + 1}</td>
                                <td className="fixed-column title-column" data-full-title={post.blog_title}>
                                    <div className="title-wrapper">
                                        <span className="post-title" title={post.blog_title}>{post.blog_title}</span>
                                    </div>
                                </td>
                                <td className="status-column">
                                    <span className={`status-badge ${post.blog_state ? 'public' : 'hidden'}`}>
                                        {post.blog_state ? '公开' : '隐藏'}
                                    </span>
                                </td>
                                {!isNarrowScreen && <td className="category-column">{post.category.category_name}</td>}
                                {!isNarrowScreen && (
                                    <td className="tags-column">
                                        <div className="tag-container">
                                            {post.tags.length <= getTagDisplayCount() ? (
                                                post.tags.map(tag => (
                                                    <span key={tag.tag_id} className="tag-badge">{tag.tag_name}</span>
                                                ))
                                            ) : (
                                                <>
                                                    {post.tags.slice(0, getTagLimitCount()).map(tag => (
                                                        <span key={tag.tag_id} className="tag-badge">{tag.tag_name}</span>
                                                    ))}
                                                    <span
                                                        className="tag-badge more-tags"
                                                        onClick={(e) => handleMoreTagsClick(post.blog_id, e)}
                                                    >
                                                        +{post.tags.length - getTagLimitCount()}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                )}
                                {!isNarrowScreen && <td className="word-count-column">{post.blog_words_num}</td>}
                                <td className="date-column created-date-column">{formatDateTime(post.create_time)}</td>
                                {!isNarrowScreen &&
                                    <td className="date-column updated-date-column">{formatDateTime(post.update_time)}</td>}
                                <td className="action-column">
                                    <div className="action-buttons">
                                        <button
                                            className="action-btn toggle-status"
                                            title={post.blog_state ? '隐藏' : '公开'}
                                            onClick={() => handleToggleStatus(post.blog_id)}
                                        >
                                            {post.blog_state ? <FiEye /> : <FiEyeOff />}
                                        </button>
                                        <button
                                            className={`action-btn toggle-pin ${post.blog_is_top ? 'active' : ''}`}
                                            title={post.blog_is_top ? '取消置顶' : '置顶'}
                                            onClick={() => handleTogglePin(post.blog_id)}
                                        >
                                            <FiArrowUp />
                                        </button>
                                        <button
                                            className="action-btn edit"
                                            title="编辑"
                                            onClick={() => handleEditPost(post.blog_id)}
                                        >
                                            <FiEdit />
                                        </button>
                                        <button
                                            className="action-btn delete"
                                            title="删除"
                                            onClick={() => handleDeletePost(post.blog_id)}
                                        >
                                            <FiTrash2 />
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
                    {posts.find(post => post.blog_id === activeTagPopup)?.tags.slice(getTagLimitCount()).map(tag => (
                        <span key={tag.tag_id} className="popup-tag">{tag.tag_name}</span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Posts; 