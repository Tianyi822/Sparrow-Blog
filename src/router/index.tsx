import { createBrowserRouter, RouteObject } from "react-router-dom";
import InitiateConfig from "@/pages/InitiateConfig";
import Home from "@/pages/Home";
import FriendLink from "@/pages/FriendLink";
import BlogLayout from "@/layouts/BlogLayout";
import AdminLayout from "@/layouts/AdminLayout";
import Posts from "@/pages/Admin/Posts";
import { checkSystemStatus } from "@/services/webService";
import Login from "@/pages/Admin/Login";
import NotFound from "@/pages/NotFound/NotFound";
import Edit from "@/pages/Admin/Edit";
import Gallery from "@/pages/Admin/Gallery";

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
        path: "/admin",
        element: <AdminLayout />,
        children: [
            {
                index: true,
                element: <Posts />
            },
            {
                path: "login",
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
            // 这里可以添加更多的管理页面路由
            {
                path: "posts",
                element: <Posts />
            },
            {
                path: "edit",
                element: <Edit />
            },
            {
                path: "gallery",
                element: <Gallery />
            }
        ]
    },
    // 添加 404 路由，匹配所有未匹配的路径
    {
        path: "*",
        element: <NotFound />
    }
];

// 创建路由器
const router = createBrowserRouter(routes);

export default router;