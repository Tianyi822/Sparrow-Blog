import { useCallback, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import "./Navigator.scss"
import SvgIcon, {
    Normal,
    Search,
    Home,
    FriendLink,
    About
} from "@/components/SvgIcon/SvgIcon";
import classNames from "classnames";

interface NavigatorProps {
    index: number;
    setIndex?: (index: number) => void;
    className?: string;
    userName?: string;
}

const Navigator: React.FC<NavigatorProps> = (props) => {
    const {index, setIndex, className, userName} = props
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrollDirection, setScrollDirection] = useState('none');
    const [isAtTop, setIsAtTop] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    // Log when component renders with new class
    useEffect(() => {
        console.log('Navigator rendered with class:', className);
    }, [className]);

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

    // Log menu state changes
    useEffect(() => {
        console.log('Menu state changed:', isMenuOpen);
    }, [isMenuOpen]);

    // 添加点击外部关闭菜单的处理函数
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // 如果菜单是打开的，且点击的不是菜单按钮和菜单内容
            if (isMenuOpen && 
                event.target && 
                !(event.target as Element).closest('.nav-menu-button') && 
                !(event.target as Element).closest('.nav-list')) {
                console.log('Clicked outside, closing menu');
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

    const handleSearch = useCallback(() => {
        // 处理搜索点击事件
        console.log('搜索被点击');
        setIsMenuOpen(false);
    }, []);

    const navItems = [
        {name: '搜索', path: '', label: '搜索', icon: Search, onClick: handleSearch},
        {name: '首页', path: '/', label: '首页', icon: Home},
        {name: '友链', path: '/friends', label: '友链', icon: FriendLink},
        {name: '关于', path: '/about', label: '关于', icon: About},
    ];

    interface NavItem {
    name: string;
    path: string;
    label: string;
    icon: string;
    onClick?: () => void;
}

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

    const toggleMenu = useCallback(() => {
        console.log('Menu button clicked, toggling menu. Current state:', isMenuOpen);
        setIsMenuOpen(prev => !prev);
    }, [isMenuOpen]);

    const navClasses = classNames(
        'navigator',
        className,
        {
            'nav-hidden': scrollDirection === 'down' && !isAtTop,
            'nav-solid': !isAtTop && scrollDirection === 'up',
            'nav-transparent': isAtTop
        }
    );

    // 修改图标颜色逻辑，始终使用浅色
    const iconColor = useMemo(() => {
        return '#ffffff'; // 始终使用白色
    }, []);

    return (
        <nav className={navClasses}>
            <div className="nav-brand">{userName}&#39;s Blog</div>

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