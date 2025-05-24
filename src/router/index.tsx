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
    return { isAuthenticated: !!token };
};

// 统一的系统状态检查函数
const checkSystemStatusLoader = async (routeName: string = 'unknown') => {
    try {
        console.log(`路由器 [${routeName}]: 开始检查系统状态...`);
        const { isRuntime, errorMessage } = await checkSystemStatus();
        console.log(`路由器 [${routeName}]: 系统状态检查结果:`, { isRuntime, errorMessage });

        if (!isRuntime) {
            console.log(`路由器 [${routeName}]: 系统未就绪，重定向到等待页面`);
            throw new Response("", {
                status: 302,
                headers: {
                    Location: "/waiting",
                },
            });
        }

        console.log(`路由器 [${routeName}]: 系统已就绪，允许访问`);
        return null;
    } catch (error) {
        // 如果是重定向错误，直接抛出
        if (error instanceof Response) {
            throw error;
        }

        // 其他错误也重定向到等待页面
        console.error(`路由器 [${routeName}]: 系统状态检查失败:`, error);
        throw new Response("", {
            status: 302,
            headers: {
                Location: "/waiting",
            },
        });
    }
};

// 管理后台路由的loader（包含系统状态检查和认证检查）
const adminLoader = async () => {
    // 首先检查系统状态
    await checkSystemStatusLoader('admin');

    // 只有登录页不需要检查认证状态
    if (window.location.pathname !== '/admin/login') {
        const { isAuthenticated } = checkAuthStatus();
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
};

// 登录页面的loader（包含系统状态检查和已登录检查）
const loginLoader = async () => {
    // 首先检查系统状态
    await checkSystemStatusLoader('admin/login');

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
};

// 管理后台子路由的认证检查（不需要重复检查系统状态，因为父路由已检查）
const adminAuthLoader = async (routeName: string) => {
    console.log(`管理后台 [${routeName}]: 检查认证状态...`);
    const { isAuthenticated } = checkAuthStatus();
    if (!isAuthenticated) {
        console.log(`管理后台 [${routeName}]: 未认证，重定向到登录页`);
        throw new Response("", {
            status: 302,
            headers: {
                Location: "/admin/login",
            },
        });
    }
    console.log(`管理后台 [${routeName}]: 认证通过，允许访问`);
    return null;
};

// 定义路由配置
const routes: RouteObject[] = [
    {
        path: "/",
        element: <BlogLayout />,
        loader: () => checkSystemStatusLoader('blog-layout'),
        children: [
            {
                index: true,
                element: <Home />
            },
            {
                path: "blog/:blogId",
                element: <BlogContent />
            },
            {
                path: "friends",
                element: <FriendLink />
            }
        ]
    },
    {
        path: "/waiting",
        element: <Waiting />,
        loader: () => {
            console.log('等待页面: 直接加载，不检查系统状态');
            return null;
        }
    },
    {
        path: "/admin",
        element: <AdminLayout />,
        loader: adminLoader,
        children: [
            {
                index: true,
                element: <Posts />,
                loader: () => adminAuthLoader('posts')
            },
            {
                path: "login",
                element: <Login />,
                loader: loginLoader
            },
            {
                path: "posts",
                element: <Posts />,
                loader: () => adminAuthLoader('posts')
            },
            {
                path: "edit",
                element: <Edit />,
                loader: () => adminAuthLoader('edit')
            },
            {
                path: "gallery",
                element: <Gallery />,
                loader: () => adminAuthLoader('gallery')
            },
            {
                path: "settings",
                element: <Settings />,
                loader: () => adminAuthLoader('settings')
            }
        ]
    },
    // 404 路由也需要检查系统状态
    {
        path: "*",
        element: <NotFound />,
        loader: () => checkSystemStatusLoader('not-found')
    }
];

// 创建路由器
const router = createBrowserRouter(routes);

export default router;