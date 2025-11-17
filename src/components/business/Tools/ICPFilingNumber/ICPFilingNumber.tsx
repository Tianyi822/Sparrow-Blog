import { useEffect, useRef, useState } from 'react';
import './ICPFilingNumber.scss';
import SvgIcon, { Small, WebsiteRecord as WebsiteRecordIcon } from '@/components/common/SvgIcon/SvgIcon';
import classNames from 'classnames';

interface ICPFilingNumberProps {
  className?: string;
  icpFilingNumber?: string;
}

const ICPFilingNumber: React.FC<ICPFilingNumberProps> = ({ className, icpFilingNumber }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 根据展开状态调整图标位置
  useEffect(() => {
    if (iconRef.current) {
      // 使用 CSS 类名控制图标位置，避免直接操作样式
      if (isExpanded) {
        iconRef.current.classList.remove('centered');
        iconRef.current.classList.add('left-aligned');
      } else {
        iconRef.current.classList.remove('left-aligned');
        iconRef.current.classList.add('centered');
      }
    }
  }, [isExpanded]);

  // 不再需要初始化时设置居中类，因为已经在JSX中直接添加了

  // 如果没有 ICP 备案号或为空字符串，不显示组件
  if (!icpFilingNumber || icpFilingNumber.trim() === '') {
    return null;
  }

  const websiteRecordStyle = classNames('website-record', className, {
    expanded: isExpanded,
  });

  return (
    <div
      ref={containerRef}
      className={websiteRecordStyle}
      onClick={() => window.open('http://beian.miit.gov.cn')}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div ref={iconRef} className='icon-container centered'>
        <SvgIcon
          name={WebsiteRecordIcon}
          size={Small}
          color='#126bae'
        />
      </div>
      <span className='record-text'>{icpFilingNumber}</span>
    </div>
  );
};

export default ICPFilingNumber;
