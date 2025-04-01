import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiTrash2, FiCode, FiFileText } from 'react-icons/fi'; // 添加所需图标
import './Gallery.scss';
import ImageModal from './ImageModal';
import use3DEffect from '@/hooks/use3DEffect';
import { getAllGalleryImages } from '@/services/adminService';

// --- 接口定义 ---
export interface ImageItem {
    id: string;
    url: string;
    name: string;
    type: string;
    date: string;
}

interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    targetItem: ImageItem | null;
}

// --- 图库项组件 ---
interface GalleryItemProps {
    item: ImageItem;
    index: number;
    onContextMenu: (event: React.MouseEvent<HTMLDivElement>, item: ImageItem) => void;
    onImageClick: (index: number) => void;
}

const GalleryItem: React.FC<GalleryItemProps> = ({ item, index, onContextMenu, onImageClick }) => {
    // 使用use3DEffect钩子获取引用
    const { cardRef, glowRef, borderGlowRef } = use3DEffect();

    return (
        <div
            className="gallery-item"
            ref={cardRef}
            onContextMenu={(e) => onContextMenu(e, item)}
            onClick={() => onImageClick(index)}
        >
            {/* 保留辉光元素的引用，但设置为不可见 */}
            <div ref={glowRef} style={{ display: 'none' }}></div>
            <div ref={borderGlowRef} style={{ display: 'none' }}></div>

            <div className="gallery-item-inner">
                <img src={item.url} alt={item.name} className="gallery-img" />
                <div className="gallery-caption">
                    <h3>{item.name}</h3>
                    <p>{item.date}</p>
                </div>
            </div>
        </div>
    );
};

// --- 主图库组件 ---
const Gallery: React.FC = () => {
    const [allImages, setAllImages] = useState<ImageItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredImages, setFilteredImages] = useState<ImageItem[]>([]);
    const [contextMenu, setContextMenu] = useState<ContextMenuState>({
        visible: false,
        x: 0,
        y: 0,
        targetItem: null
    });
    const [isMenuClosing, setIsMenuClosing] = useState(false);
    const menuCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const galleryContainerRef = useRef<HTMLDivElement>(null);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [animationDirection, setAnimationDirection] = useState<'next' | 'prev' | null>(null);

    // 加载真实数据
    useEffect(() => {
        const fetchGalleryImages = async () => {
            try {
                setIsLoading(true);
                const response = await getAllGalleryImages();
                if (response.code === 200 && response.data) {
                    // 获取环境变量中的业务服务URL
                    const businessServiceUrl = import.meta.env.VITE_BUSINESS_SERVICE_URL || '';

                    // 将API数据转换为组件所需的格式
                    const formattedImages: ImageItem[] = response.data.map(img => ({
                        id: img.img_id,
                        url: `${businessServiceUrl}/img/get/${img.img_id}`,
                        name: img.img_name,
                        type: img.img_type,
                        date: new Date().toLocaleDateString('zh-CN') // 由于API没有返回日期，使用当前日期
                    }));
                    setAllImages(formattedImages);
                    setFilteredImages(formattedImages);
                } else {
                    console.error('获取图片失败:', response.msg);
                }
            } catch (error) {
                console.error('获取图片出错:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchGalleryImages();
    }, []);

    // 根据搜索词过滤图片
    useEffect(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const filtered = allImages.filter(img =>
            img.name.toLowerCase().includes(lowerCaseSearchTerm)
        );
        setFilteredImages(filtered);
    }, [searchTerm, allImages]);

    // 点击外部区域关闭右键菜单
    useEffect(() => {
        // 仅当菜单可见时添加监听器
        if (!contextMenu.visible) {
            return; // 如果菜单隐藏，则不需要监听器
        }

        const handleClickOutside = (event: MouseEvent) => {
            // console.log('检测到 Mousedown', event.target);
            const menuElement = document.querySelector('.context-menu');

            // 检查点击目标是否在菜单元素之外
            if (menuElement && !menuElement.contains(event.target as Node)) {
                // console.log('点击菜单外部，正在关闭。');
                closeContextMenu();
            }
        };

        // 添加监听器
        document.addEventListener('mousedown', handleClickOutside);
        // console.log('已添加 mousedown 监听器');

        // 清理：在菜单隐藏或组件卸载时移除监听器
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            // console.log('已移除 mousedown 监听器');
        };
    }, [contextMenu.visible]); // 当可见性改变时重新运行效果

    const openContextMenu = (event: React.MouseEvent, item: ImageItem) => {
        event.preventDefault(); // 阻止默认的浏览器右键菜单

        // 获取窗口尺寸
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // 估计的菜单尺寸
        const menuWidth = 200; // 预估菜单宽度
        const menuHeight = 140; // 预估菜单高度

        // 初始位置
        let x = event.clientX;
        let y = event.clientY;

        // 调整X坐标，防止菜单超出右侧
        if (x + menuWidth > windowWidth) {
            x = windowWidth - menuWidth - 10; // 10px 边距
        }

        // 调整Y坐标，防止菜单超出底部
        if (y + menuHeight > windowHeight) {
            y = windowHeight - menuHeight - 10; // 10px 边距
        }

        setContextMenu({
            visible: true,
            x,
            y,
            targetItem: item,
        });
    };

    const closeContextMenu = () => {
        // 设置关闭动画标志
        setIsMenuClosing(true);

        // 清除任何已存在的超时
        if (menuCloseTimeoutRef.current) {
            clearTimeout(menuCloseTimeoutRef.current);
        }

        // 延迟隐藏元素，以便动画可以完成
        menuCloseTimeoutRef.current = setTimeout(() => {
            setContextMenu(prev => ({ ...prev, visible: false, targetItem: null }));
            setIsMenuClosing(false);
        }, 120); // 动画持续时间
    };

    const handleDelete = () => {
        if (!contextMenu.targetItem) return;
        // 从 allImages 状态中过滤掉选定的图片
        setAllImages(prevImages => prevImages.filter(img => img.id !== contextMenu.targetItem!.id));
        closeContextMenu();
    };

    const handleCopyHTML = () => {
        if (!contextMenu.targetItem) return;
        const htmlCode = `<img src="${contextMenu.targetItem.url}" alt="${contextMenu.targetItem.name}">`;
        navigator.clipboard.writeText(htmlCode)
            .then(() => console.log('HTML 已复制!')) // 可以添加用户反馈 (例如，toast 通知)
            .catch(err => console.error('复制 HTML 失败: ', err));
        closeContextMenu();
    };

    const handleCopyMarkdown = () => {
        if (!contextMenu.targetItem) return;
        const markdownCode = `![${contextMenu.targetItem.name}](${contextMenu.targetItem.url})`;
        navigator.clipboard.writeText(markdownCode)
            .then(() => console.log('Markdown 已复制!')) // 可以添加用户反馈
            .catch(err => console.error('复制 Markdown 失败: ', err));
        closeContextMenu();
    };

    // --- Modal Handlers ---
    const openModal = (index: number) => {
        const globalIndex = allImages.findIndex(img => img.id === filteredImages[index]?.id);
        if (globalIndex !== -1) {
            setSelectedImageIndex(globalIndex); // Use index from allImages for consistency
            setIsModalOpen(true);
            setAnimationDirection(null); // Reset animation direction when opening
        } else {
            // Fallback if filtered image id not found in allImages (shouldn't normally happen)
            console.error("Could not find clicked image in the main list.");
            // Find index within filtered list if needed, though navigation might be inconsistent
            // setSelectedImageIndex(index);
            // setIsModalOpen(true);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedImageIndex(null);
    };

    const showNextImage = () => {
        if (selectedImageIndex === null || selectedImageIndex >= allImages.length - 1) return;
        setAnimationDirection('next');
        setSelectedImageIndex(prevIndex => (prevIndex !== null ? prevIndex + 1 : 0));
    };

    const showPrevImage = () => {
        if (selectedImageIndex === null || selectedImageIndex <= 0) return;
        setAnimationDirection('prev');
        setSelectedImageIndex(prevIndex => (prevIndex !== null ? prevIndex - 1 : 0));
    };

    // 组件卸载时清理
    useEffect(() => {
        return () => {
            if (menuCloseTimeoutRef.current) {
                clearTimeout(menuCloseTimeoutRef.current);
            }
        };
    }, []);

    return (
        <div className="gallery-container" ref={galleryContainerRef}>
            <div className="search-box">
                <FiSearch className="search-icon" />
                <input
                    type="text"
                    className="search-input"
                    placeholder="搜索图片名称..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {isLoading ? (
                <div className="loading-indicator">加载中...</div>
            ) : (
                <div className="gallery">
                    {filteredImages.length > 0 ? (
                        filteredImages.map((img, index) => (
                            <GalleryItem
                                key={img.id}
                                item={img}
                                index={index}
                                onContextMenu={openContextMenu}
                                onImageClick={openModal}
                            />
                        ))
                    ) : (
                        <p className="no-results">没有找到匹配的图片。</p>
                    )}
                </div>
            )}

            {/* 右键菜单 */}
            {contextMenu.visible && (
                <div
                    className={`context-menu ${isMenuClosing ? 'closing' : ''}`}
                    style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
                >
                    <ul>
                        <li onClick={handleDelete}><FiTrash2 className="menu-icon" /> 删除</li>
                        <li onClick={handleCopyHTML}><FiCode className="menu-icon" /> 复制 HTML 代码</li>
                        <li onClick={handleCopyMarkdown}><FiFileText className="menu-icon" /> 复制 Markdown 代码</li>
                    </ul>
                </div>
            )}

            {/* Image Modal */}
            {isModalOpen && selectedImageIndex !== null && (
                <ImageModal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    image={allImages[selectedImageIndex]} // Pass image data from allImages
                    currentIndex={selectedImageIndex}
                    totalImages={allImages.length}
                    onNext={showNextImage}
                    onPrev={showPrevImage}
                    animationDirection={animationDirection}
                />
            )}
        </div>
    );
};

export default Gallery; 