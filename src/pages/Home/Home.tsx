import BlogCard from '@/components/Blog/BlogCard';
import Clock from '@/components/Home/Clock';
import Introduction from "@/components/Home/Introduction";
import Pagination from '@/components/Home/Pagination';
import SvgIcon, { DownArrow, Large } from "@/components/SvgIcon/SvgIcon";
import WebContent from '@/components/WebContent/WebContent';
import { useBlogLayoutContext } from '@/layouts/BlogLayoutContext';
import { useCallback, useState, useEffect, useMemo } from "react";
import "./Home.scss";

interface BlogData {
    title: string;
    date: string;
    updateDate: string;
    category: string;
    tags: string[];
    image: string;
    description: string;
    isTop: boolean;
}

const Home: React.FC = () => {
    const [blogData, setBlogData] = useState<BlogData[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const { homeData, getImageUrl } = useBlogLayoutContext();
    const BLOGS_PER_PAGE = 8; // 每页显示8条博客

    // 获取用户头像URL
    const avatarImageUrl = homeData?.avatar_image
        ? getImageUrl(homeData.avatar_image)
        : '';

    // 处理博客数据
    useEffect(() => {
        if (homeData && homeData.blogs) {
            // 过滤出 blog_state 为 true 的文章（表示需要显示的文章）
            const displayBlogs = homeData.blogs.filter(blog => blog.blog_state);
            
            // 将API返回的博客数据转换为组件需要的格式
            const formattedBlogs: BlogData[] = displayBlogs.map(blog => ({
                title: blog.blog_title,
                date: new Date(blog.create_time).toLocaleDateString(),
                updateDate: blog.update_time && blog.update_time !== "0001-01-01T00:00:00Z" 
                    ? new Date(blog.update_time).toLocaleDateString() 
                    : new Date(blog.create_time).toLocaleDateString(),
                category: blog.category.category_name,
                tags: blog.tags.map(tag => tag.tag_name),
                image: blog.blog_image_id ? getImageUrl(blog.blog_image_id) : '',
                description: blog.blog_brief,
                isTop: blog.blog_is_top || false
            }));
            
            // 根据置顶状态和创建时间排序
            formattedBlogs.sort((a, b) => {
                // 首先按置顶状态排序
                if (a.isTop && !b.isTop) return -1;
                if (!a.isTop && b.isTop) return 1;
                
                // 如果置顶状态相同，则按创建时间排序（较新的排在前面）
                const dateA = new Date(a.date).getTime();
                const dateB = new Date(b.date).getTime();
                return dateB - dateA;
            });
            
            setBlogData(formattedBlogs);
            
            // 计算总页数 (每页10篇文章)
            const pages = Math.ceil(formattedBlogs.length / BLOGS_PER_PAGE);
            setTotalPages(pages > 0 ? pages : 1);
        }
    }, [homeData, getImageUrl]);

    // 使用 useMemo 获取当前页的博客数据
    const currentPageBlogs = useMemo(() => {
        const startIndex = (currentPage - 1) * BLOGS_PER_PAGE;
        const endIndex = startIndex + BLOGS_PER_PAGE;
        const blogs = blogData.slice(startIndex, endIndex);
        
        return blogs;
    }, [blogData, currentPage, BLOGS_PER_PAGE]);

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
        console.log(`Page changed to: ${page}`);
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
                    <div className="blog-cards-container">
                        {currentPageBlogs.map((blog, index) => (
                            <BlogCard
                                key={index}
                                className={`${index % 2 === 0 ? 'even' : 'odd'} ${blog.isTop ? 'top' : ''}`}
                                {...blog}
                            />
                        ))}
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
                />
            </section>
        </div>
    );
};

export default Home;