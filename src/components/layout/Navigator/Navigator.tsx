import { useCallback, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { WEB_ROUTES } from '../../../constants';
import "./Navigator.scss"
import SvgIcon, {
    Normal,
    Search,
    Home,
    FriendLink,
    Category
} from "@/components/common/SvgIcon/SvgIcon";
import classNames from "classnames";
import SearchModal from '@/components/business/SearchModal/SearchModal';
import { useUIStore } from '@/stores';

/**
 * 导航项接口定义
 */
interface NavItem {
    name: string;
    path: string;
    label: string;
    icon: string;
    onClick?: () => void;
}

/**
 * 导航组件属性接口
 */
interface NavigatorProps {
    /** 当前活动的导航索引 */
    index: number;
    /** 设置当前活动的导航索引的函数 */
    setIndex?: (index: number) => void;
    /** 自定义类名 */
    className?: string;
    /** 用户名，用于显示博客名称 */
    userName?: string;
}

/**
 * 网站导航组件
 * 提供顶部导航栏功能，包括菜单切换、页面导航等
 */
const Navigator: React.FC<NavigatorProps> = (props) => {
    const { index, setIndex, className, userName } = props
    const navigate = useNavigate();
    const { searchModalOpen, setSearchModalOpen } = useUIStore();

    const [scrollDirection, setScrollDirection] = useState('none');
    const [isAtTop, setIsAtTop] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    // 监听滚动事件，控制导航栏显示和隐藏
    useEffect(() => {
        let ticking = false;
        
        const handleScroll = () => {
            // 如果搜索模态框打开，不处理滚动事件
            if (searchModalOpen) return;
            
            if (!ticking) {
                requestAnimationFrame(() => {
                    const currentScrollY = window.scrollY;
                    const scrollThreshold = 10; // 滚动阈值，避免微小滚动触发动画

                    // 检查是否在顶部
                    const atTop = currentScrollY <= 50;
                    setIsAtTop(atTop);

                    // 只有滚动距离超过阈值时才处理方向变化
                    if (Math.abs(currentScrollY - lastScrollY) > scrollThreshold) {
                        if (currentScrollY > lastScrollY && currentScrollY > 100) {
                            // 向下滚动且不在顶部附近时隐藏
                            setScrollDirection('down');
                            setIsVisible(false);
                        } else if (currentScrollY < lastScrollY) {
                            // 向上滚动时显示
                            setScrollDirection('up');
                            setIsVisible(true);
                        }
                        setLastScrollY(currentScrollY);
                    }
                    
                    // 在顶部附近时始终显示
                    if (atTop) {
                        setIsVisible(true);
                    }
                    
                    ticking = false;
                });
                ticking = true;
            }
        };

        // 只在搜索模态框关闭时监听滚动
        if (!searchModalOpen) {
            window.addEventListener('scroll', handleScroll, { passive: true });
        }

        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY, searchModalOpen]);



    /**
     * 处理搜索按钮点击
     */
    const handleSearch = useCallback(() => {
        // 打开搜索模态框
        setSearchModalOpen(true);

    }, [setSearchModalOpen]);

    /**
     * 关闭搜索模态框
     */
    const handleCloseSearch = useCallback(() => {
        setSearchModalOpen(false);
    }, [setSearchModalOpen]);

    /**
     * 处理后台管理按钮点击
     */
    const handleAdminClick = useCallback(() => {
        // 在新标签页中打开后台管理页面
        window.open('/admin/login', '_blank');

    }, []);

    /**
     * 导航项配置
     */
    const navItems = useMemo(() => [
        { name: '搜索', path: '', label: '搜索', icon: Search, onClick: handleSearch },
        { name: '首页', path: WEB_ROUTES.HOME, label: '首页', icon: Home },
        { name: '友链', path: WEB_ROUTES.FRIENDS, label: '友链', icon: FriendLink },
        { name: '后台管理', path: '', label: '后台管理', icon: Category, onClick: handleAdminClick },
    ], [handleSearch, handleAdminClick]);

    /**
     * 处理导航项点击
     */
    const handleClick = useCallback((idx: number, item: NavItem) => {
        if (setIndex && idx !== 0) {
            setIndex(idx);
        }
        if (item.onClick) {
            item.onClick();
            return;
        }
        // 导航到指定的路径
        if (item.path) {
            navigate(item.path);
        }

    }, [setIndex, navigate]);

    /**
     * 处理品牌点击，导航到首页
     */
    const handleBrandClick = useCallback(() => {
        // 导航到首页
        navigate(WEB_ROUTES.HOME);
        // 设置激活索引为首页(索引1)
        if (setIndex) {
            setIndex(1);
        }

    }, [navigate, setIndex]);



    /**
     * 计算导航栏类名
     */
    const navClasses = classNames(
        'navigator',
        className,
        {
            'nav-hidden': !isVisible && !isAtTop,
            'nav-solid': !isAtTop && isVisible,
            'nav-transparent': isAtTop
        }
    );

    // 图标颜色设置，始终使用浅色
    const iconColor = useMemo(() => {
        return '#ffffff'; // 始终使用白色
    }, []);

    return (
        <>
            <nav className={navClasses}>
                <div
                    className="nav-brand"
                    onClick={handleBrandClick}
                    style={{ cursor: 'pointer' }}
                >
                    {userName}&#39;s Blog
                </div>

                <ul className="nav-list">
                    {navItems.map((item, idx) => (
                        <li
                            key={item.name}
                            className={`nav-item ${!item.onClick && idx === index ? 'active' : ''}`}
                            onClick={() => handleClick(idx, item)}
                        >
                            <SvgIcon
                                name={item.icon}
                                size={Normal}
                                color={iconColor}
                            />
                            <span className="nav-text">{item.name}</span>
                        </li>
                    ))}
                </ul>


            </nav>
            
            {/* 搜索模态框 */}
            <SearchModal 
                isOpen={searchModalOpen} 
                onClose={handleCloseSearch} 
            />
        </>
    )
}

export default Navigator;