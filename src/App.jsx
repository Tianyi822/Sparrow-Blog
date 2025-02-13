import { useState, useEffect } from "react";
import "./App.scss"
import Navigator from "@/components/Navigator/Navigator.jsx";

function App() {
    const [navIndex, setNavIndex] = useState(1);
    // 模拟从后端获取的背景图片地址
    const [bgImage] = useState("https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/%E3%80%90%E5%8D%95%E4%BA%BA%E7%89%88%E3%80%91%E8%90%A4%E7%81%AB%E4%B9%8B%E7%BA%A610K_ab781.webp");

    useEffect(() => {
        document.title = "Tianyi's Blog";
    }, []);

    return (
        <div className="app-container">
            <div className="bg-image" style={{ backgroundImage: `url(${bgImage})` }}></div>
            <div className="bg-overlay"></div>
            <Navigator className="app-navigator" index={navIndex} setIndex={setNavIndex}/>
        </div>
    )
}

export default App
