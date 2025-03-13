import Background from "@/components/Background/Background";
// import Home from "@/components/Home/Home";
import Navigator from "@/components/Navigator/Navigator";
import ScrollBar from "@/components/ScrollBar/ScrollBar";
import { useEffect, useState } from "react";
import ConfigServer from "./components/ConfigServer/ConfigServer";
import Tools from "./components/Tools/Tools";
// import FriendLink from "./components/FriendLink/FriendLink";

function App() {
    const [navIndex, setNavIndex] = useState<number>(1);
    const [bgImage] = useState<string>("https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/background_image.webp");

    useEffect(() => {
        document.title = "Tianyi's Blog";
    }, []);

    return (
        <div className="app">
            <Background backgroundImage={bgImage} />
            <Navigator className="app-navigator" index={navIndex} setIndex={setNavIndex} />
            {/* <Home/> */}
            {/*<FriendLink />*/}
            <ConfigServer />
            <Tools className="app-tools" />
            <ScrollBar className="app-scroll-bar" />
        </div>
    )
}

export default App
