import './SvgIcon.scss'
import PropTypes from 'prop-types';
import classNames from "classnames";
import SearchSvg from '@/assets/svgs/search.svg?react'
import HomeSvg from '@/assets/svgs/home.svg?react'
import TimeLineSvg from '@/assets/svgs/timeLine.svg?react'
import FriendLinkSvg from '@/assets/svgs/friendLink.svg?react'
import AboutSvg from '@/assets/svgs/about.svg?react'
import TagSvg from '@/assets/svgs/tag.svg?react'
import CategorySvg from '@/assets/svgs/category.svg?react'
import DownArrowSvg from '@/assets/svgs/downwardArrow.svg?react'
import PreviewSvg from '@/assets/svgs/preview.svg?react'

// 图标尺寸
export const Normal = "normal"
export const Small = "small"
export const Large = "large"

// 图标名称
export const Search = "search"
export const Home = "home"
export const TimeLine = "timeLine"
export const FriendLink = "friendLink"
export const About = "about"
export const Tag = "tag"
export const Category = "category"
export const DownArrow = "downArrow"
export const Preview = "preview"

const SvgIcon = ({name, size, className, onClick, color = 'currentColor'}) => {
    const clsName = classNames('svg-icon', className, {
        [`svg-icon-${size}`]: size
    })

    let icon = <div/>
    switch (name) {
        case Search:
            icon = <SearchSvg className={clsName} fill={color}/>
            break;
        case Home:
            icon = <HomeSvg className={clsName} fill={color}/>
            break;
        case TimeLine:
            icon = <TimeLineSvg className={clsName} fill={color}/>
            break;
        case FriendLink:
            icon = <FriendLinkSvg className={clsName} fill={color}/>
            break;
        case About:
            icon = <AboutSvg className={clsName} fill={color}/>
            break;
        case Tag:
            icon = <TagSvg className={clsName} fill={color}/>
            break;
        case Category:
            icon = <CategorySvg className={clsName} fill={color}/>
            break;
        case DownArrow:
            icon = <DownArrowSvg className={clsName} fill={color}/>
            break;
        case Preview:
            icon = <PreviewSvg className={clsName} fill={color}/>
            break;
        default:
            console.error("WARNING: 图标名称错误")
            break;
    }

    return (
        <div
            className={clsName}
            onClick={onClick}
            style={{cursor: 'pointer'}}
        >
            {icon}
        </div>
    )
}

SvgIcon.propTypes = {
    name: PropTypes.string.isRequired,
    size: PropTypes.string,
    className: PropTypes.string,
    onClick: PropTypes.func,
    color: PropTypes.string
};

export default SvgIcon;