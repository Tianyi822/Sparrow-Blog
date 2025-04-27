import BlogCard from '@/components/Blog/BlogCard';
import Clock from '@/components/Home/Clock';
import Introduction from "@/components/Home/Introduction";
import Pagination from '@/components/Home/Pagination';
import SvgIcon, { DownArrow, Large } from "@/components/SvgIcon/SvgIcon";
import WebContent from '@/components/WebContent/WebContent';
import { useBlogLayoutContext } from '@/layouts/BlogLayoutContext';
import { useCallback, useState } from "react";
import "./Home.scss";

interface BlogData {
    title: string;
    date: string;
    updateDate: string;
    category: string;
    tags: string[];
    image: string;
    description: string;
}

const INITIAL_BLOG_DATA: BlogData[] = [
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

const Home: React.FC = () => {
    const [blogData] = useState(INITIAL_BLOG_DATA);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages] = useState(20);
    const { userInfo, getImageUrl } = useBlogLayoutContext();

    // 获取用户头像URL
    const avatarImageUrl = userInfo?.avatar_image
        ? getImageUrl(userInfo.avatar_image)
        : '';

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
    }, []);

    return (
        <div className="home">
            <section className="landing-page">
                <div className="landing-content">
                    <Introduction
                        className="home-introduction"
                        userName={userInfo?.user_name}
                        typeWriterContent={userInfo?.type_writer_content}
                        userHobbies={userInfo?.user_hobbies}
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
                        {blogData.map((blog, index) => (
                            <BlogCard
                                key={index}
                                className={index % 2 === 0 ? 'even' : 'odd'}
                                {...blog}
                            />
                        ))}
                    </div>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        className="blog-pagination"
                        onPageChange={handlePageChange}
                    />
                </div>
                <WebContent 
                    className="home-web-content" 
                    authorName={userInfo?.user_name}
                    authorAvatar={avatarImageUrl}
                    authorEmail={userInfo?.user_email}
                    authorGithub={userInfo?.user_github_address}
                />
            </section>
        </div>
    );
};

export default Home;