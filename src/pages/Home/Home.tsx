import BlogCard from '@/components/Blog/BlogCard';
import Clock from '@/components/Home/Clock';
import Introduction from "@/components/Home/Introduction";
import Pagination from '@/components/Home/Pagination';
import SvgIcon, { DownArrow, Large } from "@/components/SvgIcon/SvgIcon";
import WebContent from '@/components/WebContent/WebContent';
import { useBlogLayoutContext } from '@/layouts/BlogLayoutContext';
import { useCallback, useState, useEffect, useMemo } from "react";
import "./Home.scss";
import { BlogCategory, BlogTag } from '@/services/adminService';

interface BlogData {
    title: string;
    date: string;
    updateDate: string;
    category: string;
    categoryId: string; // Changed to string to match BlogInfo
    tags: string[];
    tagIds: string[]; // Changed to string[] to match BlogTag.tag_id
    image: string;
    description: string;
    isTop: boolean;
}

const Home: React.FC = () => {
    const [blogData, setBlogData] = useState<BlogData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
    const [activeTagId, setActiveTagId] = useState<string | null>(null);
    const [activeFilterName, setActiveFilterName] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<'category' | 'tag' | null>(null);
    const { homeData, getImageUrl } = useBlogLayoutContext();
    const BLOGS_PER_PAGE = 8; // 每页显示8条博客

    // 获取用户头像URL
    const avatarImageUrl = homeData?.avatar_image
        ? getImageUrl(homeData.avatar_image)
        : '';

    // 处理博客数据
    useEffect(() => {
        if (homeData && homeData.blogs) {
            try {
                console.log('Received homeData.blogs structure:', 
                    homeData.blogs.length > 0 ? homeData.blogs[0] : 'No blogs');
                console.log('First blog category structure:', 
                    homeData.blogs.length > 0 ? homeData.blogs[0].category : 'No category');
                
                // 过滤出 blog_state 为 true 的文章（表示需要显示的文章）
                const displayBlogs = homeData.blogs.filter(blog => blog.blog_state);
                
                // 将API返回的博客数据转换为组件需要的格式
                const formattedBlogs: BlogData[] = displayBlogs.map(blog => {
                    // 安全地访问可能为空的属性
                    const categoryId = blog.category && blog.category.category_id 
                        ? blog.category.category_id.toString() 
                        : '';
                    const categoryName = blog.category && blog.category.category_name 
                        ? blog.category.category_name 
                        : '';
                    
                    // 安全地处理标签
                    const tags = blog.tags && Array.isArray(blog.tags) 
                        ? blog.tags.map(tag => tag && tag.tag_name ? tag.tag_name : '')
                        : [];
                    
                    const tagIds = blog.tags && Array.isArray(blog.tags) 
                        ? blog.tags.map(tag => tag && tag.tag_id ? tag.tag_id.toString() : '')
                        : [];
                    
                    return {
                        title: blog.blog_title || '',
                        date: blog.create_time ? new Date(blog.create_time).toLocaleDateString() : '',
                        updateDate: blog.update_time && blog.update_time !== "0001-01-01T00:00:00Z" 
                            ? new Date(blog.update_time).toLocaleDateString() 
                            : (blog.create_time ? new Date(blog.create_time).toLocaleDateString() : ''),
                        category: categoryName,
                        categoryId: categoryId,
                        tags: tags,
                        tagIds: tagIds,
                        image: blog.blog_image_id ? getImageUrl(blog.blog_image_id) : '',
                        description: blog.blog_brief || '',
                        isTop: blog.blog_is_top
                    };
                });
                
                // 根据置顶状态和创建时间排序
                formattedBlogs.sort((a, b) => {
                    // 首先按置顶状态排序
                    if (a.isTop && !b.isTop) return -1;
                    if (!a.isTop && b.isTop) return 1;
                    
                    // 如果置顶状态相同，则按创建时间排序（较新的排在前面）
                    const dateA = a.date ? new Date(a.date).getTime() : 0;
                    const dateB = b.date ? new Date(b.date).getTime() : 0;
                    return dateB - dateA;
                });
                
                setBlogData(formattedBlogs);
                
                // 重置当前页为第一页
                setCurrentPage(1);
            } catch (error) {
                console.error("Error processing blog data:", error);
                // 出错时设置空数组，避免应用完全崩溃
                setBlogData([]);
            }
        }
    }, [homeData, getImageUrl]);

    // 处理分类点击
    const handleCategoryClick = useCallback((category: BlogCategory) => {
        console.log('Home received category click:', category);
        
        // 确保ID是字符串类型
        const categoryId = String(category.category_id);
        
        // 如果点击当前激活的分类，则取消选择
        if (activeCategoryId === categoryId) {
            console.log('Deactivating category');
            setActiveCategoryId(null);
            setActiveFilterName(null);
            setFilterType(null);
        } else {
            console.log('Activating category:', category.category_name, 'with ID:', categoryId);
            setActiveCategoryId(categoryId);
            setActiveTagId(null); // 清除标签选择
            setActiveFilterName(category.category_name);
            setFilterType('category');
        }
        // 重置到第一页
        setCurrentPage(1);
    }, [activeCategoryId]);

    // 处理标签点击
    const handleTagClick = useCallback((tag: BlogTag) => {
        console.log('Home received tag click:', tag);
        
        // 确保ID是字符串类型
        const tagId = String(tag.tag_id);
        
        // 如果点击当前激活的标签，则取消选择
        if (activeTagId === tagId) {
            console.log('Deactivating tag');
            setActiveTagId(null);
            setActiveFilterName(null);
            setFilterType(null);
        } else {
            console.log('Activating tag:', tag.tag_name, 'with ID:', tagId);
            setActiveTagId(tagId);
            setActiveCategoryId(null); // 清除分类选择
            setActiveFilterName(tag.tag_name);
            setFilterType('tag');
        }
        // 重置到第一页
        setCurrentPage(1);
    }, [activeTagId]);

    // 过滤博客
    const filteredBlogs = useMemo(() => {
        try {
            let filtered = [...blogData];
            
            // 按分类过滤
            if (activeCategoryId !== null) {
                console.log('Active Category ID:', activeCategoryId, 'Type:', typeof activeCategoryId);
                
                // 确保使用字符串比较
                filtered = filtered.filter(blog => {
                    if (!blog.categoryId) return false;
                    
                    // 确保两边都是字符串类型
                    const blogCategoryId = String(blog.categoryId);
                    const activeId = String(activeCategoryId);
                    const match = blogCategoryId === activeId;
                    
                    console.log(`Comparing blog.categoryId (${blogCategoryId}) with activeCategoryId (${activeId}): ${match}`);
                    return match;
                });
            }
            
            // 按标签过滤
            if (activeTagId !== null) {
                // 确保使用字符串比较
                filtered = filtered.filter(blog => {
                    if (!blog.tagIds || !Array.isArray(blog.tagIds)) return false;
                    
                    // 将标签ID转换为字符串数组进行比较
                    const tagIds = blog.tagIds.map(id => id ? String(id) : '');
                    return tagIds.includes(String(activeTagId));
                });
            }
            
            console.log('Filtered blogs length:', filtered.length);
            return filtered;
        } catch (error) {
            console.error("Error filtering blogs:", error);
            return [];
        }
    }, [blogData, activeCategoryId, activeTagId]);

    // 计算分页
    useEffect(() => {
        const pages = Math.ceil(filteredBlogs.length / BLOGS_PER_PAGE);
        setTotalPages(pages > 0 ? pages : 1);
    }, [filteredBlogs, BLOGS_PER_PAGE]);

    // 使用 useMemo 获取当前页的博客数据
    const currentPageBlogs = useMemo(() => {
        const startIndex = (currentPage - 1) * BLOGS_PER_PAGE;
        const endIndex = startIndex + BLOGS_PER_PAGE;
        return filteredBlogs.slice(startIndex, endIndex);
    }, [filteredBlogs, currentPage, BLOGS_PER_PAGE]);

    // 使用 useCallback 优化点击处理函数
    const handleScrollDown = useCallback(() => {
        const mainSection = document.querySelector('.main-content');
        if (mainSection) {
            const offsetTop = (mainSection as HTMLElement).offsetTop;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }, []);

    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        // 滚动到内容顶部
        const mainSection = document.querySelector('.main-content');
        if (mainSection) {
            const offsetTop = (mainSection as HTMLElement).offsetTop;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }, []);

    // 清除筛选
    const handleClearFilter = useCallback(() => {
        setActiveCategoryId(null);
        setActiveTagId(null);
        setActiveFilterName(null);
        setFilterType(null);
        setCurrentPage(1);
    }, []);

    return (
        <div className="home">
            <section className="landing-page">
                <div className="landing-content">
                    <Introduction
                        className="home-introduction"
                        userName={homeData?.user_name}
                        typeWriterContent={homeData?.type_writer_content}
                        userHobbies={homeData?.user_hobbies}
                    />
                    <Clock
                        className="home-clock"
                        profileImage={avatarImageUrl}
                        backgroundImage={avatarImageUrl}
                    />
                </div>
                <SvgIcon
                    name={DownArrow}
                    size={Large}
                    className="home-down-arrow"
                    onClick={handleScrollDown}
                />
            </section>
            <section className="main-content" id="main-content">
                <div className="blog-content">
                    {activeFilterName && (
                        <div className="active-filter">
                            <div className="filter-info">
                                当前显示: <span className="filter-type">{filterType === 'category' ? '分类' : '标签'}</span> 
                                <span className="filter-name">{activeFilterName}</span>
                            </div>
                            <button className="clear-filter" onClick={handleClearFilter}>清除筛选</button>
                        </div>
                    )}
                    <div className="blog-cards-container">
                        {currentPageBlogs.length > 0 ? (
                            currentPageBlogs.map((blog, index) => (
                                <BlogCard
                                    key={index}
                                    className={`${index % 2 === 0 ? 'even' : 'odd'} ${blog.isTop ? 'top' : ''}`}
                                    {...blog}
                                />
                            ))
                        ) : (
                            <div className="no-blogs-message">
                                没有找到相关文章
                            </div>
                        )}
                    </div>
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            className="blog-pagination"
                            onPageChange={handlePageChange}
                        />
                    )}
                </div>
                <WebContent 
                    className="home-web-content" 
                    authorName={homeData?.user_name}
                    authorAvatar={avatarImageUrl}
                    authorEmail={homeData?.user_email}
                    authorGithub={homeData?.user_github_address}
                    onCategoryClick={handleCategoryClick}
                    onTagClick={handleTagClick}
                    activeCategoryId={activeCategoryId}
                    activeTagId={activeTagId}
                />
            </section>
        </div>
    );
};

export default Home;