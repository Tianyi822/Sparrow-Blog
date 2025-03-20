import { createBrowserRouter, RouteObject } from "react-router-dom";
import InitiateConfig from "@/components/InitiateConfig/InitiateConfig.tsx";
import Home from "@/components/Home/Home";
import FriendLink from "@/components/FriendLink/FriendLink";
import BlogLayout from "@/layouts/BlogLayout";
import { checkSystemStatus } from "@/services/webService";
import Login from "@/components/Login/Login";

// 检查系统状态的loader函数
const checkApiConfig = async () => {
    try {
        const { isRuntime, errorMessage } = await checkSystemStatus();
        console.log('系统状态检查结果:', { isRuntime, errorMessage });
        return { isRuntime };
    } catch (error) {
        console.error('系统状态检查失败:', error);
        return { isRuntime: false };
    }
};

// 定义路由配置
const routes: RouteObject[] = [
    {
        path: "/",
        element: <BlogLayout />,
        loader: async () => {
            const { isRuntime } = await checkApiConfig();
            if (!isRuntime) {
                throw new Response("", {
                    status: 302,
                    headers: {
                        Location: "/config",
                    },
                });
            }
            return null;
        },
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
        element: <InitiateConfig />,
        loader: async () => {
            const { isRuntime } = await checkApiConfig();
            if (isRuntime) {
                throw new Response("", {
                    status: 302,
                    headers: {
                        Location: "/",
                    },
                });
            }
            return null;
        }
    },
    {
        path: "/login",
        element: <Login />
    }
];

// 创建路由器
const router = createBrowserRouter(routes);

export default router;