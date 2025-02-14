import { useState, useEffect } from "react";
import "./App.scss"
import Navigator from "@/components/Navigator/Navigator.jsx";
import Home from "@/components/Home/Home.jsx";
import WebsiteRecord from "@/components/WebsiteRecord/WebsiteRecord.jsx";

function App() {
    const [navIndex, setNavIndex] = useState(1);

    useEffect(() => {
        document.title = "Tianyi's Blog";
    }, []);

    return (
        <div className="app">
            <Navigator className="app-navigator" index={navIndex} setIndex={setNavIndex}/>
            <Home/>
            <WebsiteRecord />
        </div>
    );
}

export default App
