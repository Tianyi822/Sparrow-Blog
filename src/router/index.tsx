import { createBrowserRouter, RouteObject } from "react-router-dom";
import InitiateConfig from "@/pages/InitiateConfig";
import Home from "@/pages/Home";
import FriendLink from "@/pages/FriendLink";
import BlogContent from "@/pages/BlogContent";
import BlogLayout from "@/layouts/BlogLayout";
import AdminLayout from "@/layouts/AdminLayout";
import Posts from "@/pages/Admin/Posts";
import Login from "@/pages/Admin/Login";
import NotFound from "@/pages/NotFound/NotFound";
import Edit from "@/pages/Admin/Edit";
import Gallery from "@/pages/Admin/Gallery";
import Settings from "@/pages/Admin/Settings";
import { ApiResponse, businessApiRequest } from "@/services/api";

// 检查系统状态的loader函数
const checkApiConfig = async () => {
    try {
        // 直接调用API获取原始响应，以便能够访问code字段
        const response = await businessApiRequest<ApiResponse<null>>({
            method: 'GET',
            url: '/web/sys/status'
        });

        console.log('系统状态检查结果:', response);
        return {
            isRuntime: response.code === 200,
            code: response.code
        };
    } catch (error) {
        console.error('系统状态检查失败:', error);
        return {isRuntime: false, code: 0};
    }
};

// 检查登录状态的loader函数
const checkAuthStatus = () => {
    const token = localStorage.getItem('auth_token');
    return {isAuthenticated: !!token};
};

// 定义路由配置
const routes: RouteObject[] = [
    {
        path: "/",
        element: <BlogLayout/>,
        loader: async () => {
            const {isRuntime} = await checkApiConfig();
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
                element: <Home/>
            },
            {
                path: "blog/:blogId",
                element: <BlogContent/>
            },
            {
                path: "friends",
                element: <FriendLink/>
            }
        ]
    },
    {
        path: "/config",
        element: <InitiateConfig/>,
        loader: async () => {
            const {isRuntime, code} = await checkApiConfig();
            // 如果系统已配置(isRuntime=true)或者响应code为200，跳转到首页
            if (isRuntime || code === 200) {
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
        element: <AdminLayout/>,
        loader: async () => {
            // 检查系统状态，如果未配置，重定向到配置页面
            const {isRuntime} = await checkApiConfig();
            if (!isRuntime) {
                throw new Response("", {
                    status: 302,
                    headers: {
                        Location: "/config",
                    },
                });
            }

            // 只有登录页不需要检查认证状态
            if (window.location.pathname !== '/admin/login') {
                const {isAuthenticated} = checkAuthStatus();
                if (!isAuthenticated) {
                    throw new Response("", {
                        status: 302,
                        headers: {
                            Location: "/admin/login",
                        },
                    });
                }
            }

            return null;
        },
        children: [
            {
                index: true,
                element: <Posts/>
            },
            {
                path: "login",
                element: <Login/>,
                loader: async () => {
                    // 如果已登录，重定向到管理后台
                    const {isAuthenticated} = checkAuthStatus();
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
                element: <Posts/>
            },
            {
                path: "edit",
                element: <Edit/>
            },
            {
                path: "gallery",
                element: <Gallery/>
            },
            {
                path: "settings",
                element: <Settings/>
            }
        ]
    },
    // 添加 404 路由，匹配所有未匹配的路径
    {
        path: "*",
        element: <NotFound/>
    }
];

// 创建路由器
const router = createBrowserRouter(routes);

export default router;