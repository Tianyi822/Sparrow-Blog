import PropTypes from 'prop-types';
import { useCallback, useState, useEffect, useMemo } from 'react';
import "./Navigator.scss"
import SvgIcon, {
    Normal,
    Search,
    Home,
    FriendLink,
    About
} from "@/components/SvgIcon/SvgIcon.jsx";
import classNames from "classnames";

const Navigator = (props) => {
    const {index, setIndex, className} = props
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrollDirection, setScrollDirection] = useState('none');
    const [isAtTop, setIsAtTop] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

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
        const handleClickOutside = (event) => {
            // 如果菜单是打开的，且点击的不是菜单按钮和菜单内容
            if (isMenuOpen && 
                !event.target.closest('.nav-menu-button') && 
                !event.target.closest('.nav-list')) {
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

    const handleClick = useCallback((idx, item) => {
        if (setIndex && idx !== 0) {
            setIndex(idx);
        }
        if (item.onClick) {
            item.onClick();
            return;
        }
        setIsMenuOpen(false);  // 选中选项后关闭菜单
    }, [setIndex]);

    const toggleMenu = useCallback(() => {
        setIsMenuOpen(prev => !prev);
    }, []);

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
            <div className="nav-brand">Tianyi&#39;s Blog</div>

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

Navigator.propTypes = {
    index: PropTypes.number.isRequired,
    setIndex: PropTypes.func,
    className: PropTypes.string
}

export default Navigator;