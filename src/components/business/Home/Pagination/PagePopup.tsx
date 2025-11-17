import { useEffect, useState } from 'react';
import './PagePopup.scss';

/**
 * 分页弹出层属性接口
 */
interface PagePopupProps {
  pages: number[]; // 要显示的页码数组
  onSelect: (page: number) => void; // 选择页码时的回调
  onClose: () => void; // 关闭弹出层的回调
  position: number; // 弹出层位置
  isClosing?: boolean; // 是否正在关闭
  index: number; // 当前省略号在分页组件中的索引
  currentPage: number; // 当前选中的页码
}

/**
 * 分页弹出层组件
 * 显示被省略的页码，允许用户快速选择页码
 */
const PagePopup: React.FC<PagePopupProps> = ({ pages, onSelect, onClose, position, isClosing, index, currentPage }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});

  // 计算弹出层位置并显示
  useEffect(() => {
    // 获取所有省略号按钮
    const ellipsisButtons = document.querySelectorAll('.pagination .ellipsis');
    // 找到对应索引的省略号按钮
    const currentEllipsis = Array.from(ellipsisButtons).find((button) => {
      const buttonIndex = Array.from(button.parentNode!.children).indexOf(button);
      return buttonIndex === index;
    });

    // 如果找到了省略号按钮，根据它的位置设置弹出层位置
    if (currentEllipsis) {
      const rect = currentEllipsis.getBoundingClientRect();
      setPopupStyle({
        left: `${rect.left + rect.width / 2}px`, // 使用按钮的中心点
        top: `${rect.top - 8}px`,
        transform: 'translate(-50%, -100%)',
      });
    }

    // 使用requestAnimationFrame确保在下一帧显示，以便有过渡动画
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, [position, index]);

  // 监听关闭状态
  useEffect(() => {
    if (isClosing) {
      setIsVisible(false);
    }
  }, [isClosing]);

  // 阻止点击事件冒泡，避免点击弹出层内部时触发关闭
  const handlePopupClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className={`page-popup-container ${isVisible ? 'visible' : ''} ${isClosing ? 'closing' : ''}`}>
      {/* 透明遮罩层，点击时关闭弹出层 */}
      <div className='page-popup-overlay' onClick={onClose} />

      {/* 页码弹出层 */}
      <div
        className='page-popup'
        onClick={handlePopupClick}
        style={popupStyle}
      >
        {/* 页码列表 */}
        {pages.map((page) => (
          <span
            key={page}
            className={`popup-page-number ${page === currentPage ? 'active' : ''}`}
            onClick={() => {
              onSelect(page);
              onClose();
            }}
          >
            {page}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PagePopup;
