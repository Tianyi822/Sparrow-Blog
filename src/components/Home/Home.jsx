import { useState } from "react";
import Introduction from "@/components/Introduction/Introduction.jsx";
import SvgIcon, { DownArrow, Large } from "@/components/SvgIcon/SvgIcon";
import "./Home.scss";

const Home = () => {
    // 将背景图片状态移到Home组件
    const [bgImage] = useState("https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/background_image.webp");

    return (
        <div className="home">
            <div className="bg-image" style={{backgroundImage: `url(${bgImage})`}}></div>
            <div className="bg-overlay"></div>
            <Introduction className="app-introduction"/>
            <SvgIcon 
                name={DownArrow} 
                size={Large}
                className="app-down-arrow"
            />
        </div>
    );
};

export default Home; 