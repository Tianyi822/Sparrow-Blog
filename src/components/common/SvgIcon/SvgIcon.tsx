import './SvgIcon.scss';
import classNames from 'classnames';
import SearchSvg from '@/assets/svgs/search.svg?react';
import HomeSvg from '@/assets/svgs/home.svg?react';
import TimeLineSvg from '@/assets/svgs/timeLine.svg?react';
import FriendLinkSvg from '@/assets/svgs/friendLink.svg?react';
import AboutSvg from '@/assets/svgs/about.svg?react';
import TagSvg from '@/assets/svgs/tag.svg?react';
import CategorySvg from '@/assets/svgs/category.svg?react';
import DownArrowSvg from '@/assets/svgs/downwardArrow.svg?react';
import PreviewSvg from '@/assets/svgs/preview.svg?react';
import WebsiteRecordSvg from '@/assets/svgs/websiteRecord.svg?react';
import { memo } from 'react';

/**
 * 图标尺寸常量
 */
export const Normal = 'normal' as const;
export const Small = 'small' as const;
export const Large = 'large' as const;

export type IconSize = typeof Normal | typeof Small | typeof Large;

/**
 * 图标名称常量
 */
export const Search = 'search' as const;
export const Home = 'home' as const;
export const TimeLine = 'timeLine' as const;
export const FriendLink = 'friendLink' as const;
export const About = 'about' as const;
export const Tag = 'tag' as const;
export const Category = 'category' as const;
export const DownArrow = 'downArrow' as const;
export const Preview = 'preview' as const;
export const WebsiteRecord = 'websiteRecord' as const;

export type IconName =
  | typeof Search
  | typeof Home
  | typeof TimeLine
  | typeof FriendLink
  | typeof About
  | typeof Tag
  | typeof Category
  | typeof DownArrow
  | typeof Preview
  | typeof WebsiteRecord;

/**
 * 图标组件和SVG映射
 */
const iconMap = {
  [Search]: SearchSvg,
  [Home]: HomeSvg,
  [TimeLine]: TimeLineSvg,
  [FriendLink]: FriendLinkSvg,
  [About]: AboutSvg,
  [Tag]: TagSvg,
  [Category]: CategorySvg,
  [DownArrow]: DownArrowSvg,
  [Preview]: PreviewSvg,
  [WebsiteRecord]: WebsiteRecordSvg,
} as const;

/**
 * SVG图标组件属性接口
 */
interface SvgIconProps {
  /** 图标名称 */
  name: IconName;
  /** 图标尺寸 */
  size?: IconSize;
  /** 自定义类名 */
  className?: string;
  /** 点击事件处理函数 */
  onClick?: () => void;
  /** 图标颜色 */
  color?: string;
}

/**
 * SVG图标组件
 *
 * 提供统一的SVG图标渲染，支持不同尺寸和颜色定制
 */
const SvgIcon: React.FC<SvgIconProps> = memo(({
  name,
  size,
  className,
  onClick,
  color = 'currentColor',
}) => {
  const clsName = classNames('svg-icon', className, {
    [`svg-icon-${size}`]: size,
  });

  // 获取对应的SVG组件
  const IconComponent = iconMap[name];

  // 如果找不到对应的图标，返回空元素
  if (!IconComponent) {
    return (
      <div
        className={clsName}
        style={{ color: 'red', fontSize: '12px' }}
      >
        无效图标
      </div>
    );
  }

  return (
    <div
      className={clsName}
      onClick={onClick}
      style={{ cursor: 'pointer', color: color }}
    >
      <IconComponent className={clsName} fill={color} />
    </div>
  );
});

SvgIcon.displayName = 'SvgIcon';

export default SvgIcon;
