import PropTypes from 'prop-types';
import { useCallback, useState } from 'react';
import "./index.scss"

const Navigator = (props) => {
    const {index, setIndex} = props
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const navItems = [
        {name: '首页', path: '/', label: '首页'},
        {name: '时间轴', path: '/timeline', label: '时间轴'},
        {name: '标签', path: '/tags', label: '标签'},
        {name: '分类', path: '/categories', label: '分类'},
        {name: '友链', path: '/friends', label: '友链'},
        {name: '关于', path: '/about', label: '关于'},
    ];

    const handleClick = useCallback((idx) => {
        if (setIndex) {
            setIndex(idx)
        }
        setIsMenuOpen(false);
    }, [setIndex]);

    const toggleMenu = useCallback(() => {
        setIsMenuOpen(prev => !prev);
    }, []);

    return (
        <nav className="navigator">
            <div className="nav-brand">Tianyi's Blog</div>

            <div className="nav-menu-button" onClick={toggleMenu}>
                <span></span>
                <span></span>
                <span></span>
            </div>

            <ul className={`nav-list ${isMenuOpen ? 'open' : ''}`}>
                <li className="nav-item search-button">
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </li>
                {navItems.map((item, idx) => (
                    <li
                        key={item.name}
                        className={`nav-item ${idx === index ? 'active' : ''}`}
                        onClick={() => handleClick(idx)}
                    >
                        {item.name}
                    </li>
                ))}
            </ul>
        </nav>
    )
}

Navigator.propTypes = {
    index: PropTypes.number.isRequired,
    setIndex: PropTypes.func
}

export default Navigator;