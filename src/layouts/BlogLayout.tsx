import { Outlet } from "react-router-dom";
import { FC, useEffect, useState } from "react";
import Background from "@/components/Background/Background";
import Navigator from "@/components/Navigator/Navigator";
import Tools from "@/components/Tools/Tools";
import ScrollBar from "@/components/ScrollBar/ScrollBar";
import { getBlogUserInfo, getImageUrl } from "@/services/webService";
import "./BlogLayout.scss";

const BlogLayout: FC = () => {
    const [navIndex, setNavIndex] = useState<number>(1);
    const [userName, setUserName] = useState<string>("Blog");
    const [bgImage, setBgImage] = useState<string>("");

    useEffect(() => {
        // 获取用户信息
        const fetchUserInfo = async () => {
            try {
                const userInfo = await getBlogUserInfo();
                if (userInfo) {
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

    return (
        <div className="blog-layout">
            {bgImage && <Background backgroundImage={bgImage}/>}
            <Navigator className="blog-layout-navigator" index={navIndex} setIndex={setNavIndex} userName={userName}/>
            <div className="blog-content">
                <Outlet/> {/* 这里会渲染子路由组件 */}
            </div>
            <Tools className="app-tools"/>
            <ScrollBar className="app-scroll-bar"/>
        </div>
    );
};

export default BlogLayout;