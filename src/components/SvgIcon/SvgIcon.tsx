import './SvgIcon.scss'
import classNames from "classnames";
import SearchSvg from '@/assets/svgs/search.svg?react'
import HomeSvg from '@/assets/svgs/home.svg?react'
import TimeLineSvg  from '@/assets/svgs/timeLine.svg?react'
import FriendLinkSvg from '@/assets/svgs/friendLink.svg?react'
import AboutSvg from '@/assets/svgs/about.svg?react'
import TagSvg from '@/assets/svgs/tag.svg?react'
import CategorySvg from '@/assets/svgs/category.svg?react'
import DownArrowSvg from '@/assets/svgs/downwardArrow.svg?react'
import PreviewSvg from '@/assets/svgs/preview.svg?react'
import WebsiteRecordSvg from '@/assets/svgs/websiteRecord.svg?react'

// 图标尺寸
export const Normal = "normal" as const;
export const Small = "small" as const;
export const Large = "large" as const;

export type IconSize = typeof Normal | typeof Small | typeof Large;

// 图标名称
export const Search = "search" as const;
export const Home = "home" as const;
export const TimeLine = "timeLine" as const;
export const FriendLink = "friendLink" as const;
export const About = "about" as const;
export const Tag = "tag" as const;
export const Category = "category" as const;
export const DownArrow = "downArrow" as const;
export const Preview = "preview" as const;
export const WebsiteRecord = "websiteRecord" as const;

export type IconName = typeof Search | typeof Home | typeof TimeLine | typeof FriendLink | 
                      typeof About | typeof Tag | typeof Category | typeof DownArrow | 
                      typeof Preview | typeof WebsiteRecord;

interface SvgIconProps {
    name: IconName;
    size?: IconSize;
    className?: string;
    onClick?: () => void;
    color?: string;
}

const SvgIcon: React.FC<SvgIconProps> = ({name, size, className, onClick, color = 'currentColor'}) => {
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
        case WebsiteRecord:
            icon = <WebsiteRecordSvg className={clsName} fill={color}/>
            break;
        default:
            console.error("WARNING: 图标名称错误")
            break;
    }

    return (
        <div
            className={clsName}
            onClick={onClick}
            style={{cursor: 'pointer', color: color}}
        >
            {icon}
        </div>
    )
}

export default SvgIcon;