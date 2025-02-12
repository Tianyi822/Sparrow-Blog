import { useState } from "react";
import "./App.scss"
import Navigator from "@/components/Navigator/Navigator.jsx";

function App() {
    const [navIndex, setNavIndex] = useState(0)

    return (
        <Navigator index={navIndex} setIndex={setNavIndex}/>
    )
}

export default App
