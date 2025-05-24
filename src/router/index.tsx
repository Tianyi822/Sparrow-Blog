import { createBrowserRouter, RouteObject } from "react-router-dom";
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
import Waiting from "@/pages/Waiting";
import { checkSystemStatus } from "@/services/webService";

// 检查登录状态的loader函数
const checkAuthStatus = () => {
    const token = localStorage.getItem('auth_token');
    return {isAuthenticated: !!token};
};

// 检查系统状态的loader函数
const checkSystemStatusLoader = async () => {
    try {
        console.log('路由器: 开始检查系统状态...');
        const { isRuntime, errorMessage } = await checkSystemStatus();
        console.log('路由器: 系统状态检查结果:', { isRuntime, errorMessage });
        
        if (!isRuntime) {
            console.log('路由器: 系统未就绪，重定向到等待页面');
            throw new Response("", {
                status: 302,
                headers: {
                    Location: "/waiting",
                },
            });
        }
        
        console.log('路由器: 系统已就绪，允许访问');
        return null;
    } catch (error) {
        // 如果是重定向错误，直接抛出
        if (error instanceof Response) {
            throw error;
        }
        
        // 其他错误也重定向到等待页面
        console.error('路由器: 系统状态检查失败:', error);
        throw new Response("", {
            status: 302,
            headers: {
                Location: "/waiting",
            },
        });
    }
};

// 定义路由配置
const routes: RouteObject[] = [
    {
        path: "/",
        element: <BlogLayout/>,
        loader: checkSystemStatusLoader,
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
        path: "/waiting",
        element: <Waiting/>,
        loader: () => {
            console.log('等待页面: 直接加载，不检查系统状态');
            return null;
        }
    },
    {
        path: "/admin",
        element: <AdminLayout/>,
        loader: async () => {
            // 首先检查系统状态
            try {
                const { isRuntime } = await checkSystemStatus();
                if (!isRuntime) {
                    throw new Response("", {
                        status: 302,
                        headers: {
                            Location: "/waiting",
                        },
                    });
                }
            } catch (error) {
                if (error instanceof Response) {
                    throw error;
                }
                console.error('系统状态检查失败:', error);
                throw new Response("", {
                    status: 302,
                    headers: {
                        Location: "/waiting",
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