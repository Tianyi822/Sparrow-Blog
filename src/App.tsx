import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import router from "./router";

function App() {
    useEffect(() => {
        document.title = "Tianyi's Blog";
    }, []);

    return (
        <div className="app">
            <RouterProvider router={router} />
        </div>
    );
}

export default App;