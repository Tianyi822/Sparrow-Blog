import { useCallback, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Navigator.scss"
import SvgIcon, {
    Normal,
    Search,
    Home,
    FriendLink,
    Category
} from "@/components/SvgIcon/SvgIcon";
import classNames from "classnames";

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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrollDirection, setScrollDirection] = useState('none');
    const [isAtTop, setIsAtTop] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // 监听滚动事件，控制导航栏显示和隐藏
    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // 检查是否在顶部
            setIsAtTop(currentScrollY === 0);

            // 确定滚动方向并设置状态
            if (currentScrollY > lastScrollY) {
                // 向下滚动
                setScrollDirection('down');
            } else if (currentScrollY < lastScrollY) {
                // 向上滚动
                setScrollDirection('up');
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    // 添加点击外部关闭菜单的处理函数
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // 如果菜单是打开的，且点击的不是菜单按钮和菜单内容
            if (isMenuOpen &&
                event.target &&
                !(event.target as Element).closest('.nav-menu-button') &&
                !(event.target as Element).closest('.nav-list')) {
                setIsMenuOpen(false);
            }
        };

        // 只在菜单打开时添加事件监听
        if (isMenuOpen) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isMenuOpen]);

    /**
     * 处理搜索按钮点击
     */
    const handleSearch = useCallback(() => {
        // 处理搜索点击事件
        setIsMenuOpen(false);
    }, []);

    /**
     * 处理后台管理按钮点击
     */
    const handleAdminClick = useCallback(() => {
        // 在新标签页中打开后台管理页面
        window.open('/admin/login', '_blank');
        setIsMenuOpen(false);
    }, []);

    /**
     * 导航项配置
     */
    const navItems = useMemo(() => [
        { name: '搜索', path: '', label: '搜索', icon: Search, onClick: handleSearch },
        { name: '首页', path: '/', label: '首页', icon: Home },
        { name: '友链', path: '/friends', label: '友链', icon: FriendLink },
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
        setIsMenuOpen(false);  // 选中选项后关闭菜单
    }, [setIndex, navigate]);

    /**
     * 处理品牌点击，导航到首页
     */
    const handleBrandClick = useCallback(() => {
        // 导航到首页
        navigate('/');
        // 设置激活索引为首页(索引1)
        if (setIndex) {
            setIndex(1);
        }
        // 关闭菜单(如果打开)
        setIsMenuOpen(false);
    }, [navigate, setIndex]);

    /**
     * 切换菜单显示状态
     */
    const toggleMenu = useCallback(() => {
        setIsMenuOpen(prev => !prev);
    }, []);

    /**
     * 计算导航栏类名
     */
    const navClasses = classNames(
        'navigator',
        className,
        {
            'nav-hidden': scrollDirection === 'down' && !isAtTop,
            'nav-solid': !isAtTop && scrollDirection === 'up',
            'nav-transparent': isAtTop
        }
    );

    // 图标颜色设置，始终使用浅色
    const iconColor = useMemo(() => {
        return '#ffffff'; // 始终使用白色
    }, []);

    return (
        <nav className={navClasses}>
            <div
                className="nav-brand"
                onClick={handleBrandClick}
                style={{ cursor: 'pointer' }}
            >
                {userName}&#39;s Blog
            </div>

            <ul className={`nav-list ${isMenuOpen ? 'open' : ''}`}>
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

            <div className="nav-menu-button" onClick={toggleMenu}>
                <span></span>
                <span></span>
                <span></span>
            </div>
        </nav>
    )
}

export default Navigator;