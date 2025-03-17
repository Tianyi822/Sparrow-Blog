import { createBrowserRouter, RouteObject } from "react-router-dom";
import ConfigServer from "@/components/ConfigServer/ConfigServer";
import Home from "@/components/Home/Home";
import FriendLink from "@/components/FriendLink/FriendLink";
import BlogLayout from "@/layouts/BlogLayout";
import { getWebStatus } from "@/services/webService";

// 检查API配置状态的loader函数
const checkApiConfig = async () => {
    try {
        const response = await getWebStatus();
        if (response.code === 200) {
            return {
                isRuntime: response.data.status === 'RUNTIME_ENV',
                status: response.data.status
            };
        }
        return { isRuntime: false, status: 'CONFIG_SERVER_ENV' };
    } catch (error) {
        console.error('API检查失败:', error);
        return { isRuntime: false, status: 'CONFIG_SERVER_ENV' };
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
        element: <ConfigServer />,
        loader: async () => {
            const { status } = await checkApiConfig();
            if (status === 'RUNTIME_ENV') {
                throw new Response("", {
                    status: 302,
                    headers: {
                        Location: "/",
                    },
                });
            }
            return null;
        }
    }
];

// 创建路由器
const router = createBrowserRouter(routes);

export default router;