import { useState, useEffect } from "react";
import "./App.scss"
import Navigator from "@/components/Navigator/Navigator.jsx";
// import Home from "@/components/Home/Home.jsx";
import Tools from "@/components/Tools/Tools.jsx";
import ScrollBar from "@/components/ScrollBar/ScrollBar.jsx";
import Background from "@/components/Background/Background.jsx";
import TimeLine from "@/components/TimeLine/TimeLine.jsx";

function App() {
    const [navIndex, setNavIndex] = useState(1);
    const [bgImage] = useState("https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/background_image.webp");

    useEffect(() => {
        document.title = "Tianyi's Blog";
    }, []);

    return (
        <div className="app">
            <Background backgroundImage={bgImage} />
            <Navigator className="app-navigator" index={navIndex} setIndex={setNavIndex}/>
            {/* <Home/> */}
            <TimeLine />
            <Tools className="app-tools"/>
            <ScrollBar className="app-scroll-bar"/>
        </div>
    );
}

export default App
