import { createBrowserRouter, RouteObject } from "react-router-dom";
import ConfigServer from "@/components/ConfigServer/ConfigServer";
import Home from "@/components/Home/Home";
import FriendLink from "@/components/FriendLink/FriendLink";
import BlogLayout from "@/layouts/BlogLayout";

// 定义路由配置
const routes: RouteObject[] = [
    {
        path: "/",
        element: <BlogLayout />,
        children: [
            {
                index: true,
                element: <Home />
            },
            {
                path: "friends",
                element: <FriendLink />
            }
        ]
    },
    {
        path: "/config",
        element: <ConfigServer />
    }
];

// 创建路由器
const router = createBrowserRouter(routes);

export default router;