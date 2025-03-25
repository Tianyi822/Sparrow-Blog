import { Outlet } from "react-router-dom";
import { FC, useEffect, useState } from "react";
import Background from "@/components/Background/Background";
import Navigator from "@/components/Navigator/Navigator";
import Tools from "@/components/Tools/Tools";
import ScrollBar from "@/components/ScrollBar/ScrollBar";
import "./BlogLayout.scss";

const BlogLayout: FC = () => {
    const [navIndex, setNavIndex] = useState<number>(1);
    const [bgImage] = useState<string>("https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/background_image.webp");

    useEffect(() => {
        document.title = "Tianyi's Blog";
    }, []);

    return (
        <div className="blog-layout">
            <Background backgroundImage={bgImage}/>
            <Navigator className="blog-layout-navigator" index={navIndex} setIndex={setNavIndex}/>
            <div className="blog-content">
                <Outlet/> {/* 这里会渲染子路由组件 */}
            </div>
            <Tools className="app-tools"/>
            <ScrollBar className="app-scroll-bar"/>
        </div>
    );
};

export default BlogLayout;