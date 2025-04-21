import { Outlet, useOutletContext } from "react-router-dom";
import { FC, useEffect, useState } from "react";
import Background from "@/components/Background/Background";
import Navigator from "@/components/Navigator/Navigator";
import Tools from "@/components/Tools/Tools";
import ScrollBar from "@/components/ScrollBar/ScrollBar";
import { BlogUserInfo, getBlogUserInfo, getImageUrl } from "@/services/webService";
import "./BlogLayout.scss";

// Define the type for our context
export type BlogLayoutContext = {
  userInfo: BlogUserInfo | null;
  getImageUrl: (imageId: string) => string;
};

// Create a hook for child components to access the context
export function useBlogLayoutContext() {
  return useOutletContext<BlogLayoutContext>();
}

const BlogLayout: FC = () => {
    const [navIndex, setNavIndex] = useState<number>(1);
    const [userName, setUserName] = useState<string>("Blog");
    const [bgImage, setBgImage] = useState<string>("");
    const [userInfo, setUserInfo] = useState<BlogUserInfo | null>(null);

    useEffect(() => {
        // 获取用户信息
        const fetchUserInfo = async () => {
            try {
                const userInfo = await getBlogUserInfo();
                if (userInfo) {
                    // 保存用户信息用于传递给子组件
                    setUserInfo(userInfo);
                    
                    // 设置用户名
                    setUserName(userInfo.user_name || "H2Blog");
                    
                    // 设置背景图片
                    if (userInfo.background_image) {
                        setBgImage(getImageUrl(userInfo.background_image));
                    }
                    
                    // 设置网站标题
                    document.title = `${userInfo.user_name}'s Blog`;
                    
                    // 设置网站图标
                    if (userInfo.web_logo) {
                        const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
                        if (favicon) {
                            favicon.href = getImageUrl(userInfo.web_logo);
                        } else {
                            // 如果不存在favicon，则创建一个
                            const newFavicon = document.createElement('link');
                            newFavicon.rel = 'icon';
                            newFavicon.href = getImageUrl(userInfo.web_logo);
                            document.head.appendChild(newFavicon);
                        }
                    }
                }
            } catch (error) {
                console.error("获取用户信息失败:", error);
            }
        };

        fetchUserInfo();
    }, []);

    // Create the context value to be passed to children
    const contextValue: BlogLayoutContext = {
        userInfo,
        getImageUrl
    };

    return (
        <div className="blog-layout">
            {bgImage && <Background backgroundImage={bgImage}/>}
            <Navigator className="blog-layout-navigator" index={navIndex} setIndex={setNavIndex} userName={userName}/>
            <div className="blog-content">
                <Outlet context={contextValue}/> {/* 传递上下文给子路由组件 */}
            </div>
            <Tools className="app-tools"/>
            <ScrollBar className="app-scroll-bar"/>
        </div>
    );
};

export default BlogLayout;