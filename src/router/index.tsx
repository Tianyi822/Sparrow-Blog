import React, { Suspense } from "react";
import { createBrowserRouter, RouteObject } from "react-router-dom";
import { checkSystemStatus } from "@/services/webService";

// 懒加载组件
const Home = React.lazy(() => import("@/pages/Home"));
const FriendLink = React.lazy(() => import("@/pages/FriendLink"));
const BlogContent = React.lazy(() => import("@/pages/BlogContent"));
const BlogLayout = React.lazy(() => import("@/layouts/BlogLayout"));
const AdminLayout = React.lazy(() => import("@/layouts/AdminLayout"));
const Posts = React.lazy(() => import("@/pages/Admin/Posts"));
const Login = React.lazy(() => import("@/pages/Admin/Login"));
const NotFound = React.lazy(() => import("@/pages/NotFound/NotFound"));
const Edit = React.lazy(() => import("@/pages/Admin/Edit"));
const Gallery = React.lazy(() => import("@/pages/Admin/Gallery"));
const FriendLinks = React.lazy(() => import("@/pages/Admin/FriendLinks"));
const Settings = React.lazy(() => import("@/pages/Admin/Settings"));
const Waiting = React.lazy(() => import("@/pages/Waiting"));

// 加载指示器组件
const LoadingFallback = () => (
    <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
    }}>
        加载中...
    </div>
);

// Suspense包装器
const withSuspense = (Component: React.ComponentType) => (
    <Suspense fallback={<LoadingFallback />}>
        <Component />
    </Suspense>
);

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
        element: withSuspense(BlogLayout),
        loader: () => checkSystemStatusLoader('blog-layout'),
        children: [
            {
                index: true,
                element: withSuspense(Home)
            },
            {
                path: "blog/:blogId",
                element: withSuspense(BlogContent)
            },
            {
                path: "friends",
                element: withSuspense(FriendLink)
            }
        ]
    },
    {
        path: "/waiting",
        element: withSuspense(Waiting),
        loader: () => {
            console.log('等待页面: 直接加载，不检查系统状态');
            return null;
        }
    },
    {
        path: "/admin",
        element: withSuspense(AdminLayout),
        loader: adminLoader,
        children: [
            {
                index: true,
                element: withSuspense(Posts),
                loader: () => adminAuthLoader('posts')
            },
            {
                path: "login",
                element: withSuspense(Login),
                loader: loginLoader
            },
            {
                path: "posts",
                element: withSuspense(Posts),
                loader: () => adminAuthLoader('posts')
            },
            {
                path: "edit",
                element: withSuspense(Edit),
                loader: () => adminAuthLoader('edit')
            },
            {
                path: "gallery",
                element: withSuspense(Gallery),
                loader: () => adminAuthLoader('gallery')
            },
            {
                path: "friend-links",
                element: withSuspense(FriendLinks),
                loader: () => adminAuthLoader('friend-links')
            },
            {
                path: "settings",
                element: withSuspense(Settings),
                loader: () => adminAuthLoader('settings')
            }
        ]
    },
    // 404 路由也需要检查系统状态
    {
        path: "*",
        element: withSuspense(NotFound),
        loader: () => checkSystemStatusLoader('not-found')
    }
];

// 创建路由器
const router = createBrowserRouter(routes);

export default router;