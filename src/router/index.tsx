import { createBrowserRouter, RouteObject } from "react-router-dom";
import InitiateConfig from "@/components/InitiateConfig/InitiateConfig.tsx";
import Home from "@/components/Home/Home";
import FriendLink from "@/components/FriendLink/FriendLink";
import BlogLayout from "@/layouts/BlogLayout";
import AdminLayout from "@/layouts/AdminLayout";
import Dashboard from "@/components/Admin/Dashboard/Dashboard";
import { checkSystemStatus } from "@/services/webService";
import Login from "@/components/Admin/Login/Login";

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

// 检查登录状态的loader函数
const checkAuthStatus = () => {
    const token = localStorage.getItem('auth_token');
    return { isAuthenticated: !!token };
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
        element: <Login />,
        loader: async () => {
            // 检查系统状态，如果未配置，重定向到配置页面
            const { isRuntime } = await checkApiConfig();
            if (!isRuntime) {
                throw new Response("", {
                    status: 302,
                    headers: {
                        Location: "/config",
                    },
                });
            }
            
            // 如果已登录，重定向到管理后台
            const { isAuthenticated } = checkAuthStatus();
            if (isAuthenticated) {
                throw new Response("", {
                    status: 302,
                    headers: {
                        Location: "/admin",
                    },
                });
            }
            
            return null;
        }
    },
    {
        path: "/admin",
        element: <AdminLayout />,
        children: [
            {
                index: true,
                element: <Dashboard />
            },
            // 这里可以添加更多的管理页面路由
            // {
            //     path: "posts",
            //     element: <PostsManagement />
            // },
            // {
            //     path: "categories",
            //     element: <CategoriesManagement />
            // },
            // 等等
        ]
    }
];

// 创建路由器
const router = createBrowserRouter(routes);

export default router;