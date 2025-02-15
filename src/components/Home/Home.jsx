import { useState, useEffect, useCallback, useMemo } from "react";
import Introduction from "@/components/Introduction/Introduction.jsx";
import BlogCard from "@/components/Blog/BlogCard.jsx";
import SvgIcon, { DownArrow, Large } from "@/components/SvgIcon/SvgIcon";
import Pagination from '@/components/Pagination/Pagination';
import WebContent from '@/components/WebContent/WebContent';
import "./Home.scss";

const INITIAL_BLOG_DATA = [
    {
        title: "MacBook M1平台使用 C++ 连接 MySQL",
        date: "2021-12-27",
        updateDate: "2021-12-27",
        category: "教程",
        tags: ["CPP", "MySQL", "教程库"],
        image: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/ayaka.jpg",
        description: "Photo by Igor Miske on Unsplash 原本以为上一篇博客就是今年最后一篇博客了，今天突然想想，想用C++操作下MySQL，然后就折腾了好久，一度想放弃，最后..."
    },
    {
        title: "2021 回顾",
        date: "2021-12-26",
        updateDate: "2022-2-4",
        category: "生活",
        tags: ["生活", "年"],
        image: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/ayaka.jpg",
        description: "去年12月份，我重新搭建了新的博客，想以此为新在2021年的新起点。同时也告别2020这让我铭记的一年。同样的时间，不同的地点，一年中我又走过了很多地方..."
    },
    {
        title: "C++的智能指针笔记",
        date: "2021-12-26",
        updateDate: "2021-12-26",
        category: "智能指针",
        tags: ["智能指针", "CPP"],
        image: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/ayaka.jpg",
        description: "Photo by Ryan Stone on Unsplash 在之前红黑树的中使用了了智能指针，所谓智能指针就是能够自己进行内存的释放，不需要像普通指针一样手动 delete，红黑树的代码中使用..."
    },
    {
        title: "数据结构基础（C++语言实现）- 红黑树",
        date: "2021-12-25",
        updateDate: "2022-1-2",
        category: "数据结构",
        tags: ["智能指针", "CPP", "数据结构"],
        image: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/ayaka.jpg",
        description: "2-3树 基本性质 满足二分搜索树的基本性质：节点可以存放一个元素或者两个元素；在基础之上，红黑树其实可以看成是2-3数，只不过红黑树的节点只放了一个元素..."
    }
];

const Home = () => {
    const [bgImage] = useState("https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/background_image.webp");
    const [blurAmount, setBlurAmount] = useState(0);
    const [previewBlog, setPreviewBlog] = useState(null);
    const [isPreviewClosing, setIsPreviewClosing] = useState(false);
    const [blogData, setBlogData] = useState(INITIAL_BLOG_DATA);
    const [currentPage, setCurrentPage] = useState(4);
    const [totalPages, setTotalPages] = useState(20);

    // 修改 handleScroll 函数，抽取计算模糊度的逻辑
    const calculateBlur = useCallback(() => {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        
        const progress = Math.min(scrollPosition / windowHeight, 1);
        const eased = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        const blur = eased * 20;
        setBlurAmount(blur);
    }, []);

    const handleScroll = useCallback(() => {
        calculateBlur();
    }, [calculateBlur]);

    useEffect(() => {
        // 在组件挂载时立即计算一次模糊效果
        calculateBlur();
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll, calculateBlur]);

    // 使用 useCallback 优化点击处理函数
    const handleScrollDown = useCallback(() => {
        const mainSection = document.querySelector('.main-content');
        if (mainSection) {
            const offsetTop = mainSection.offsetTop;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }, []);

    const handlePreview = useCallback((blog) => {
        setIsPreviewClosing(false);
        setPreviewBlog(blog);
    }, []);

    const handleClosePreview = useCallback(() => {
        setIsPreviewClosing(true);
        setTimeout(() => {
            setPreviewBlog(null);
            setIsPreviewClosing(false);
        }, 300);
    }, []);

    // 使用 useMemo 优化样式对象
    const overlayStyle = useMemo(() => ({
        backdropFilter: `blur(${blurAmount}px)`,
        WebkitBackdropFilter: `blur(${blurAmount}px)`,
        transition: 'backdrop-filter 0.1s linear'
    }), [blurAmount]);

    // 将预览组件提取为 memo 组件
    const PreviewOverlay = useMemo(() => {
        if (!previewBlog) return null;
        return (
            <div 
                className={`preview-overlay ${isPreviewClosing ? 'closing' : ''}`}
                onClick={handleClosePreview}
            >
                <div 
                    className="preview-content"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="preview-card-container">
                        {/* 空白预览卡片 */}
                    </div>
                </div>
            </div>
        );
    }, [previewBlog, isPreviewClosing, handleClosePreview]);

    const handlePageChange = useCallback((page) => {
        console.log(`Page changed to: ${page}`);
        setCurrentPage(page);
    }, []);

    return (
        <div className="home">
            <div className="background-container">
                <div 
                    className="bg-image" 
                    style={{backgroundImage: `url(${bgImage})`}}
                />
                <div 
                    className="bg-overlay"
                    style={overlayStyle}
                />
            </div>
            <section className="landing-page">
                <Introduction className="home-introduction"/>
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
                        {blogData.map((blog, index) => (
                            <BlogCard
                                key={index}
                                className={index % 2 === 0 ? 'even' : 'odd'}
                                {...blog}
                                onPreview={() => handlePreview(blog)}
                            />
                        ))}
                    </div>
                    <Pagination 
                        current={currentPage}
                        total={totalPages}
                        className="blog-pagination"
                        onPageChange={handlePageChange}
                    />
                </div>
                <WebContent />
            </section>
            {PreviewOverlay}
        </div>
    );
};

export default Home; 