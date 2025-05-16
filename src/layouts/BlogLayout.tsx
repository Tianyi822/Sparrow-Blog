import { Outlet, useLocation } from "react-router-dom";
import { FC, useEffect, useState } from "react";
import Background from "@/components/Background/Background";
import Navigator from "@/components/Navigator/Navigator";
import Tools from "@/components/Tools/Tools";
import ScrollBar from "@/components/ScrollBar/ScrollBar";
import { BasicData, getBasicData, getImageUrl } from "@/services/webService";
import "./BlogLayout.scss";

const BlogLayout: FC = () => {
    const [navIndex, setNavIndex] = useState<number>(1);
    const [userName, setUserName] = useState<string>("Blog");
    const [bgImage, setBgImage] = useState<string>("");
    const [homeData, setHomeData] = useState<BasicData | null>(null);
    const location = useLocation();
    
    // 检查是否在博客内容页
    const isBlogContentPage = location.pathname.startsWith('/blog/');

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
        getImageUrl
    };

    return (
        <div className="blog-layout">
            {bgImage && <Background backgroundImage={bgImage} />}
            <Navigator 
                className="blog-layout-navigator" 
                index={isBlogContentPage ? -1 : navIndex} 
                setIndex={setNavIndex} 
                userName={userName} 
            />
            <div className="blog-content">
                <Outlet context={contextValue} />
            </div>
            <Tools className="app-tools" homeData={homeData} />
            <ScrollBar className="app-scroll-bar" />
        </div>
    );
};

export default BlogLayout;