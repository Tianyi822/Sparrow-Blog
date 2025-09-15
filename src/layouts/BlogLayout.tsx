import { Outlet, useLocation } from "react-router-dom";
import { FC, useEffect, useState } from "react";
import Background from "@/components/layout/Background/Background";
import Navigator from "@/components/layout/Navigator/Navigator";
import Tools from "@/components/business/Tools/Tools";
import ScrollBar from "@/components/common/ScrollBar/ScrollBar";
import Comments from "@/components/business/Comments/Comments";
import { getBasicData, getImageUrl } from "@/services/webService";
import { BasicData } from "@/types";
import { localStorage } from "@/utils";
import type { TOCItem } from "@/components/business/Tools/TOCModal/TOCModal";
import "./BlogLayout.scss";

// 导航索引缓存键
const NAV_INDEX_STORAGE_KEY = 'nav_index';

// 路径到导航索引的映射
const pathToNavIndex: Record<string, number> = {
    '/': 1,           // 首页
    '/friends': 2,    // 友链
    // 其他路径可以在这里添加
};

// 根据路径获取导航索引
const getNavIndexFromPath = (pathname: string): number => {
    // 精确匹配
    if (pathToNavIndex[pathname]) {
        return pathToNavIndex[pathname];
    }

    // 博客详情页不高亮任何导航项
    if (pathname.startsWith('/blog/')) {
        return -1;
    }

    // 默认返回首页索引
    return 1;
};

// 从localStorage获取保存的导航索引
const getSavedNavIndex = (): number | null => {
    try {
        const saved = localStorage.getItem(NAV_INDEX_STORAGE_KEY);
        return saved ? parseInt(saved, 10) : null;
    } catch {
        return null;
    }
};

// 保存导航索引到localStorage
const saveNavIndex = (index: number): void => {
    try {
        localStorage.setItem(NAV_INDEX_STORAGE_KEY, index.toString());
    } catch {
        // 忽略存储错误
    }
};

const BlogLayout: FC = () => {
    const location = useLocation();

    // 初始化导航索引：优先使用路由匹配，其次是保存的状态，最后是默认值
    const initNavIndex = (): number => {
        const pathIndex = getNavIndexFromPath(location.pathname);
        if (pathIndex !== -1) {
            return pathIndex;
        }

        const savedIndex = getSavedNavIndex();
        if (savedIndex !== null) {
            return savedIndex;
        }

        return 1; // 默认首页
    };

    const [navIndex, setNavIndex] = useState<number>(initNavIndex);
    const [userName, setUserName] = useState<string>("BlogCard");
    const [bgImage, setBgImage] = useState<string>("");
    const [homeData, setHomeData] = useState<BasicData | null>(null);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [tocItems, setTocItems] = useState<TOCItem[]>([]);

    // 检查是否在博客内容页
    const isBlogContentPage = location.pathname.startsWith('/blog/');
    
    // 从路径中提取博客ID
    const blogId = isBlogContentPage ? location.pathname.split('/blog/')[1] : null;

    // 监听路由变化，自动更新导航索引
    useEffect(() => {
        const newIndex = getNavIndexFromPath(location.pathname);
        setNavIndex(newIndex);
        // 只有非博客详情页才保存到localStorage
        if (newIndex !== -1) {
            saveNavIndex(newIndex);
        }
        
        // 路由变化时关闭评论面板并清空目录
        setCommentsOpen(false);
        setTocItems([]);
    }, [location.pathname]);

    // 导航索引变化时保存到localStorage
    const handleNavIndexChange = (newIndex: number): void => {
        setNavIndex(newIndex);
        saveNavIndex(newIndex);
    };

    // 处理评论按钮点击
    const handleCommentsClick = (): void => {
        setCommentsOpen(true);
    };

    // 处理评论面板关闭
    const handleCommentsClose = (): void => {
        setCommentsOpen(false);
    };

    useEffect(() => {
        // 获取主页数据
        const fetchBasicData = async () => {
            try {
                const data = await getBasicData();
                if (data) {
                    // 保存主页数据用于传递给子组件
                    setHomeData(data);

                    // 设置用户名
                    setUserName(data.user_name || "H2Blog");

                    // 设置背景图片
                    if (data.background_image) {
                        setBgImage(getImageUrl(data.background_image));
                    }

                    // 设置网站标题
                    document.title = `${data.user_name}'s Blog`;

                    // 设置网站图标
                    if (data.web_logo) {
                        const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
                        if (favicon) {
                            favicon.href = getImageUrl(data.web_logo);
                        } else {
                            // 如果不存在favicon，则创建一个
                            const newFavicon = document.createElement('link');
                            newFavicon.rel = 'icon';
                            newFavicon.href = getImageUrl(data.web_logo);
                            document.head.appendChild(newFavicon);
                        }
                    }
                }
            } catch (error) {
                console.error("获取主页数据失败:", error);
            }
        };

        fetchBasicData();
    }, []);

    // 准备传递给子组件的上下文数据
    const contextValue = {
        homeData,
        getImageUrl,
        tocItems,
        setTocItems
    };

    return (
        <div className="blog-layout">
            {bgImage && <Background backgroundImage={bgImage} />}
            <Navigator
                className="blog-layout-navigator"
                index={isBlogContentPage ? -1 : navIndex}
                setIndex={handleNavIndexChange}
                userName={userName}
            />
            <div className="blog-content">
                <Outlet context={contextValue} />
            </div>
            <Tools 
                className="app-tools" 
                homeData={homeData}
                showCommentsButton={isBlogContentPage}
                onCommentsClick={handleCommentsClick}
                showTOCButton={isBlogContentPage}
                tocItems={tocItems}
            />
            <ScrollBar className="app-scroll-bar" />
            
            {/* 评论面板 */}
            {isBlogContentPage && blogId && (
                <Comments 
                    blogId={blogId}
                    isOpen={commentsOpen}
                    onClose={handleCommentsClose}
                />
            )}
        </div>
    );
};

export default BlogLayout;