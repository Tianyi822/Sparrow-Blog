import { useState, useEffect, Fragment } from "react";
import "./App.scss"
import Navigator from "@/components/Navigator/Navigator.jsx";
import Introduction from "@/components/Introduction/Introduction.jsx";
import SvgIcon, { DownArrow, Large } from "./components/SvgIcon/SvgIcon";

function App() {
    const [navIndex, setNavIndex] = useState(1);
    // 模拟从后端获取的背景图片地址
    const [bgImage] = useState("https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/background_image.webp");

    useEffect(() => {
        document.title = "Tianyi's Blog";
    }, []);

    return (
        <Fragment>
            <Navigator className="app-navigator" index={navIndex} setIndex={setNavIndex}/>
            <div className="app-container">
                <div className="bg-image" style={{backgroundImage: `url(${bgImage})`}}></div>
                <div className="bg-overlay"></div>
                <Introduction className={"app-introduction"}/>
                <SvgIcon 
                    name={DownArrow} 
                    size={Large}
                    className="app-down-arrow"
                />
            </div>
        </Fragment>
    )
}

export default App
