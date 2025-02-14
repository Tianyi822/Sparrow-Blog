import { useState, useEffect, Fragment } from "react";
import "./App.scss"
import Navigator from "@/components/Navigator/Navigator.jsx";
import Home from "@/components/Home/Home.jsx";

function App() {
    const [navIndex, setNavIndex] = useState(1);

    useEffect(() => {
        document.title = "Tianyi's Blog";
    }, []);

    return (
        <Fragment>
            <Navigator className="app-navigator" index={navIndex} setIndex={setNavIndex}/>
            <Home />
        </Fragment>
    )
}

export default App
