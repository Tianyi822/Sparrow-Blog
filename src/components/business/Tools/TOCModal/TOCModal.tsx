import React, { useCallback, useEffect, useRef } from 'react';
import { FiList, FiX } from 'react-icons/fi';
import './TOCModal.scss';

export interface TOCItem {
  id: string;
  level: number;
  text: string;
  anchorId: string;
}

interface TOCModalProps {
  isOpen: boolean;
  onClose: () => void;
  tocItems: TOCItem[];
  currentActiveId?: string;
}

const TOCModal: React.FC<TOCModalProps> = ({
  isOpen,
  onClose,
  tocItems,
  currentActiveId,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // 处理点击外部区域关闭模态框
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  }, [onClose]);

  // 处理键盘 ESC 键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // 处理目录项点击
  const handleTOCItemClick = useCallback((anchorId: string) => {
    const element = document.getElementById(anchorId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
      });
      onClose(); // 点击后关闭模态框
    }
  }, [onClose]);

  // 获取目录项的缩进类名
  const getTOCItemClassName = useCallback((item: TOCItem) => {
    const baseClass = 'toc-item';
    const levelClass = `toc-level-${item.level}`;
    const activeClass = currentActiveId === item.anchorId ? 'active' : '';

    return `${baseClass} ${levelClass} ${activeClass}`.trim();
  }, [currentActiveId]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className={`toc-modal-overlay ${isOpen ? 'visible' : ''}`}
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className={`toc-modal ${isOpen ? 'visible' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className='toc-modal-header'>
          <div className='toc-modal-title'>
            <FiList className='toc-title-icon' />
            <h3>文章目录</h3>
          </div>
          <button
            type='button'
            className='toc-modal-close'
            onClick={onClose}
            aria-label='关闭目录'
          >
            <FiX />
          </button>
        </div>

        <div className='toc-modal-content'>
          {tocItems.length > 0
            ? (
              <nav className='toc-nav'>
                {tocItems.map((item) => (
                  <div
                    key={item.id}
                    className={getTOCItemClassName(item)}
                    onClick={() => handleTOCItemClick(item.anchorId)}
                  >
                    <span className='toc-item-text'>{item.text}</span>
                  </div>
                ))}
              </nav>
            )
            : (
              <div className='toc-empty'>
                <p>未找到文章标题</p>
                <span className='toc-empty-hint'>
                  此文章可能没有使用标准的 Markdown 标题格式
                </span>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default TOCModal;
