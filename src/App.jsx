import { useState, useEffect, Fragment } from "react";
import "./App.scss"
import Navigator from "@/components/Navigator/Navigator.jsx";

function App() {
    const [navIndex, setNavIndex] = useState(1);
    // 模拟从后端获取的背景图片地址
    const [bgImage] = useState("https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/%E8%90%A4%E7%81%AB%E5%80%BE%E5%9F%8E-%E6%B8%85%E6%99%A8-%E6%B8%85%E5%87%89%E7%89%8810K_805e7.webp");

    useEffect(() => {
        document.title = "Tianyi's Blog";
    }, []);

    return (
        <Fragment>
            <Navigator className="app-navigator" index={navIndex} setIndex={setNavIndex}/>
            <div className="app-container">
                <div className="bg-image" style={{backgroundImage: `url(${bgImage})`}}></div>
                <div className="bg-overlay"></div>
            </div>
        </Fragment>
    )
}

export default App
