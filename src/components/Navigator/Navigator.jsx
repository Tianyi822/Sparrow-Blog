import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import "./Navigator.scss"
import SvgIcon, {
    Normal,
    Search,
    Home,
    TimeLine,
    Tag,
    Category,
    FriendLink,
    About
} from "@/components/SvgIcon/SvgIcon.jsx";
import classNames from "classnames";

const Navigator = (props) => {
    const {index, setIndex, className} = props
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleSearch = useCallback(() => {
        // 处理搜索点击事件
        console.log('搜索被点击');
        setIsMenuOpen(false);
    }, []);

    const navItems = [
        {name: '搜索', path: '', label: '搜索', icon: Search, onClick: handleSearch},
        {name: '首页', path: '/', label: '首页', icon: Home},
        {name: '时间轴', path: '/timeline', label: '时间轴', icon: TimeLine},
        {name: '标签', path: '/tags', label: '标签', icon: Tag},
        {name: '分类', path: '/categories', label: '分类', icon: Category},
        {name: '友链', path: '/friends', label: '友链', icon: FriendLink},
        {name: '关于', path: '/about', label: '关于', icon: About},
    ];

    const handleClick = useCallback((idx, item) => {
        if (item.onClick) {
            item.onClick();
            return;
        }
        if (setIndex) {
            setIndex(idx)
        }
        setIsMenuOpen(false);
    }, [setIndex]);

    const toggleMenu = useCallback(() => {
        setIsMenuOpen(prev => !prev);
    }, []);

    const clsName = classNames('navigator', className)

    return (
        <nav className={clsName}>
            <div className="nav-brand">Tianyi&#39;s Blog</div>

            <div className="nav-menu-button" onClick={toggleMenu}>
                <span></span>
                <span></span>
                <span></span>
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
                            color="#cccccc"
                        />
                        <span className="nav-text">{item.name}</span>
                    </li>
                ))}
            </ul>
        </nav>
    )
}

Navigator.propTypes = {
    index: PropTypes.number.isRequired,
    setIndex: PropTypes.func,
    className: PropTypes.string
}

export default Navigator;