import React, { Suspense } from "react";
import { createBrowserRouter, RouteObject } from "react-router-dom";
import { checkSystemStatus } from "@/services/webService";
import { WEB_ROUTES, ADMIN_ROUTES, NOT_FOUND_ROUTE } from "@/constants";
import { localStorage } from "@/utils";

// 懒加载组件
const Home = React.lazy(() => import("@/pages/Home"));
const BlogContent = React.lazy(() => import("@/pages/BlogContent"));
const BlogLayout = React.lazy(() => import("@/layouts/BlogLayout"));
const AdminLayout = React.lazy(() => import("@/layouts/AdminLayout"));
const Posts = React.lazy(() => import("@/pages/Admin/Posts"));
const Login = React.lazy(() => import("@/pages/Admin/Login"));
const NotFound = React.lazy(() => import("@/pages/NotFound/NotFound"));
const Edit = React.lazy(() => import("@/pages/Admin/Edit"));
const Gallery = React.lazy(() => import("@/pages/Admin/Gallery"));
const Comments = React.lazy(() => import("@/pages/Admin/Comments"));
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
        const { isRuntime } = await checkSystemStatus();

        if (!isRuntime) {
            throw new Response("", {
                status: 302,
                headers: {
                    Location: "/waiting",
                },
            });
        }

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
const adminAuthLoader = async (_routeName: string) => {
    const { isAuthenticated } = checkAuthStatus();
    if (!isAuthenticated) {
        throw new Response("", {
            status: 302,
            headers: {
                Location: "/admin/login",
            },
        });
    }
    return null;
};

// 定义路由配置
const routes: RouteObject[] = [
    {
        path: WEB_ROUTES.HOME,
        element: withSuspense(BlogLayout),
        loader: () => checkSystemStatusLoader('blog-layout'),
        children: [
            {
                index: true,
                element: withSuspense(Home)
            },
            {
                path: WEB_ROUTES.BLOG_DETAIL,
                element: withSuspense(BlogContent)
            }
        ]
    },
    {
        path: WEB_ROUTES.WAITING,
        element: withSuspense(Waiting),
        loader: () => {
            return null;
        }
    },
    {
        path: ADMIN_ROUTES.ROOT,
        element: withSuspense(AdminLayout),
        loader: adminLoader,
        children: [
            {
                index: true,
                element: withSuspense(Posts),
                loader: () => adminAuthLoader('posts')
            },
            {
                path: ADMIN_ROUTES.LOGIN,
                element: withSuspense(Login),
                loader: loginLoader
            },
            {
                path: ADMIN_ROUTES.POSTS,
                element: withSuspense(Posts),
                loader: () => adminAuthLoader('posts')
            },
            {
                path: ADMIN_ROUTES.EDIT,
                element: withSuspense(Edit),
                loader: () => adminAuthLoader('edit')
            },
            {
                path: ADMIN_ROUTES.GALLERY,
                element: withSuspense(Gallery),
                loader: () => adminAuthLoader('gallery')
            },
            {
                path: ADMIN_ROUTES.COMMENTS,
                element: withSuspense(Comments),
                loader: () => adminAuthLoader('comments')
            },
            {
                path: ADMIN_ROUTES.SETTINGS,
                element: withSuspense(Settings),
                loader: () => adminAuthLoader('settings')
            }
        ]
    },
    // 404 路由也需要检查系统状态
    {
        path: NOT_FOUND_ROUTE,
        element: withSuspense(NotFound),
        loader: () => checkSystemStatusLoader('not-found')
    }
];

// 创建路由器
const router = createBrowserRouter(routes);

export default router;