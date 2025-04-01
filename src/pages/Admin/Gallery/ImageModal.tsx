import React, { useEffect, useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { ImageItem } from './Gallery'; // Assuming ImageItem is exported from Gallery.tsx or a types file
import './ImageModal.scss';

interface ImageModalProps {
    isOpen: boolean;
    onClose: () => void;
    image: ImageItem;
    currentIndex: number;
    totalImages: number;
    onNext: () => void;
    onPrev: () => void;
    animationDirection: 'next' | 'prev' | null;
}

const ImageModal: React.FC<ImageModalProps> = ({
    isOpen,
    onClose,
    image,
    currentIndex,
    totalImages,
    onNext,
    onPrev,
    animationDirection,
}) => {
    const [animateClass, setAnimateClass] = useState('');
    const [previousImage, setPreviousImage] = useState<ImageItem | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);

    // 处理键盘事件
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (isAnimating) return; // 动画过程中不响应键盘
            
            switch (event.key) {
                case 'Escape':
                    onClose();
                    break;
                case 'ArrowRight':
                    onNext();
                    break;
                case 'ArrowLeft':
                    onPrev();
                    break;
                default:
                    break;
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose, onNext, onPrev, isAnimating]);

    // 处理图片切换和动画
    useEffect(() => {
        // 如果有动画方向，则记录前一张图片并设置动画中状态
        if (animationDirection) {
            setPreviousImage(previousImage => previousImage || image);
            setAnimateClass(animationDirection);
            setIsAnimating(true);
            
            // 动画结束后清理
            const timer = setTimeout(() => {
                setIsAnimating(false);
                setPreviousImage(null);
                setAnimateClass('');
            }, 400); // 与CSS动画时长匹配
            
            return () => clearTimeout(timer);
        }
    }, [image.id, animationDirection]);
    
    // 带防抖的导航函数
    const handleNavigation = (direction: 'next' | 'prev') => {
        if (isAnimating) return; // 如果正在动画中，忽略导航请求
        
        if (direction === 'next') {
            onNext();
        } else {
            onPrev();
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="image-modal-backdrop" onClick={onClose}>
            <div className="image-modal-content">
                <div className={`image-wrapper ${animateClass}`}>
                    <div className="image-container">
                        {/* 前一张图片（如果有） */}
                        {previousImage && (
                            <img 
                                key={`prev-${previousImage.id}`}
                                src={previousImage.url} 
                                alt={previousImage.name}
                                className="previous-image"
                                onClick={(e) => e.stopPropagation()} // 阻止事件冒泡，防止点击图片时关闭弹窗
                            />
                        )}
                        
                        {/* 当前图片 */}
                        <img 
                            key={`current-${image.id}`}
                            src={image.url} 
                            alt={image.name}
                            className="current-image"
                            title={image.name}
                            onClick={(e) => e.stopPropagation()} // 阻止事件冒泡，防止点击图片时关闭弹窗
                        />
                    </div>
                </div>

                {/* 导航按钮 */}
                {currentIndex > 0 && (
                    <button 
                        className="modal-nav-btn prev" 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleNavigation('prev');
                        }}
                        disabled={isAnimating}
                        title="上一张图片"
                    >
                        <FiChevronLeft />
                    </button>
                )}
                {currentIndex < totalImages - 1 && (
                    <button 
                        className="modal-nav-btn next" 
                        onClick={(e) => {
                            e.stopPropagation();
                            handleNavigation('next');
                        }}
                        disabled={isAnimating}
                        title="下一张图片"
                    >
                        <FiChevronRight />
                    </button>
                )}

                {/* 图片信息 */}
                <div className="image-info" onClick={(e) => e.stopPropagation()}>
                    <h3>{image.name}</h3>
                    <div className="image-metadata">
                        <span className="image-date">{image.date}</span>
                    </div>
                    <span className="image-counter">{currentIndex + 1} / {totalImages}</span>
                </div>
            </div>
        </div>
    );
};

export default ImageModal; 