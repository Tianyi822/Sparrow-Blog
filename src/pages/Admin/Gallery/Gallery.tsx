import React, { useState, useEffect, useRef, useMemo, useCallback, useContext } from 'react';
import { FiSearch, FiTrash2, FiCode, FiFileText } from 'react-icons/fi'; // 添加所需图标
import './Gallery.scss';
import { getAllGalleryImages } from '@/services/adminService';
import { LayoutContext } from '@/layouts/AdminLayout'; // 导入布局上下文

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

// 添加防抖工具函数
const debounce = <F extends (...args: Parameters<F>) => ReturnType<F>>(
    func: F,
    waitFor: number
): ((...args: Parameters<F>) => void) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return (...args: Parameters<F>): void => {
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => func(...args), waitFor);
    };
};

// --- 图库项组件 ---
interface GalleryItemProps {
    item: ImageItem;
    onContextMenu: (event: React.MouseEvent<HTMLDivElement>, item: ImageItem) => void;
}

const GalleryItem: React.FC<GalleryItemProps> = ({ item, onContextMenu }) => {
    // 添加图片加载状态跟踪
    const [imageLoaded, setImageLoaded] = useState(false);

    // 处理图片加载完成
    const handleImageLoad = useCallback(() => {
        setImageLoaded(true);
    }, []);

    return (
        <div
            className={`gallery-item ${imageLoaded ? 'loaded' : 'loading'}`}
            onContextMenu={(e) => onContextMenu(e, item)}
            onClick={(e) => { e.preventDefault(); }}
        >
            <div className="gallery-item-inner">
                {!imageLoaded && <div className="image-placeholder"></div>}
                <img
                    src={item.url}
                    alt={item.name}
                    className="gallery-img"
                    onLoad={handleImageLoad}
                />
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
    const [contextMenu, setContextMenu] = useState<ContextMenuState>({
        visible: false,
        x: 0,
        y: 0,
        targetItem: null
    });
    const [isMenuClosing, setIsMenuClosing] = useState(false);
    const menuCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const galleryContainerRef = useRef<HTMLDivElement>(null);
    // 添加是否正在调整窗口大小的状态
    const [isResizing, setIsResizing] = useState(false);

    // 使用布局上下文
    const { collapsed, isLayoutTransitioning } = useContext(LayoutContext);
    // 跟踪上一次的collapsed状态，以便检测变化
    const prevCollapsedRef = useRef(collapsed);

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

    // 处理窗口大小调整的防抖效果
    useEffect(() => {
        // 开始调整窗口大小时设置isResizing为true
        const handleResizeStart = () => {
            setIsResizing(true);
        };

        // 结束调整窗口大小时（防抖后）设置isResizing为false
        const handleResizeEnd = debounce(() => {
            setIsResizing(false);
        }, 300);

        // 合并开始和结束处理器
        const handleResize = () => {
            handleResizeStart();
            handleResizeEnd();
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // 监听菜单折叠状态的变化
    useEffect(() => {
        // 如果菜单状态发生改变或者正在过渡中
        if (prevCollapsedRef.current !== collapsed || isLayoutTransitioning) {
            // 标记为调整大小状态，激活性能优化
            setIsResizing(true);

            // 存储新的折叠状态
            prevCollapsedRef.current = collapsed;

            // 菜单折叠动画完成后解除调整状态
            const timerId = setTimeout(() => {
                setIsResizing(false);
            }, isLayoutTransitioning ? 300 : 0); // 如果正在过渡，等待300毫秒，否则立即解除

            return () => clearTimeout(timerId);
        }
    }, [collapsed, isLayoutTransitioning]);

    // 使用useMemo缓存过滤后的图片列表
    const filteredImages = useMemo(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return allImages.filter(img =>
            img.name.toLowerCase().includes(lowerCaseSearchTerm)
        );
    }, [searchTerm, allImages]);

    // 定义closeContextMenu在依赖它的useEffect之前
    const closeContextMenu = useCallback(() => {
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
    }, []);

    // 使用useCallback缓存事件处理函数
    const openContextMenu = useCallback((event: React.MouseEvent, item: ImageItem) => {
        event.preventDefault(); // 阻止默认的浏览器右键菜单

        // 获取鼠标在页面上的精确位置（考虑页面滚动）
        const x = event.pageX;
        const y = event.pageY;

        // 延迟设置菜单位置，确保DOM已更新
        setTimeout(() => {
            const menu = document.querySelector('.context-menu') as HTMLElement;
            if (!menu) return;

            // 获取菜单尺寸
            const menuWidth = menu.offsetWidth;
            const menuHeight = menu.offsetHeight;

            // 获取视口尺寸
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // 计算菜单的最终位置
            let finalX = x;
            let finalY = y;
            let adjustmentClass = '';

            // 检查右边界
            if (x + menuWidth > viewportWidth) {
                finalX = x - menuWidth;
                adjustmentClass += ' adjust-right';
            }

            // 检查下边界
            if (y + menuHeight > viewportHeight) {
                finalY = y - menuHeight;
                adjustmentClass += ' adjust-bottom';
            }

            // 设置菜单位置
            menu.style.left = `${finalX}px`;
            menu.style.top = `${finalY}px`;

            // 应用调整类
            menu.className = `context-menu${adjustmentClass}${isMenuClosing ? ' closing' : ''}`;
        }, 0);

        setContextMenu({
            visible: true,
            x,
            y,
            targetItem: item,
        });
    }, [isMenuClosing]);

    // 点击外部区域关闭右键菜单
    useEffect(() => {
        // 仅当菜单可见时添加监听器
        if (!contextMenu.visible) {
            return; // 如果菜单隐藏，则不需要监听器
        }

        const handleClickOutside = (event: MouseEvent) => {
            const menuElement = document.querySelector('.context-menu');

            // 检查点击目标是否在菜单元素之外
            if (menuElement && !menuElement.contains(event.target as Node)) {
                closeContextMenu();
            }
        };

        // 添加监听器
        document.addEventListener('mousedown', handleClickOutside);

        // 清理：在菜单隐藏或组件卸载时移除监听器
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [contextMenu.visible, closeContextMenu]); // 添加closeContextMenu作为依赖项

    const handleDelete = useCallback(() => {
        if (!contextMenu.targetItem) return;
        // 从 allImages 状态中过滤掉选定的图片
        setAllImages(prevImages => prevImages.filter(img => img.id !== contextMenu.targetItem!.id));
        closeContextMenu();
    }, [contextMenu.targetItem, closeContextMenu]);

    const handleCopyHTML = useCallback(() => {
        if (!contextMenu.targetItem) return;
        const htmlCode = `<img src="${contextMenu.targetItem.url}" alt="${contextMenu.targetItem.name}">`;
        navigator.clipboard.writeText(htmlCode)
            .then(() => console.log('HTML 已复制!')) // 可以添加用户反馈 (例如，toast 通知)
            .catch(err => console.error('复制 HTML 失败: ', err));
        closeContextMenu();
    }, [contextMenu.targetItem, closeContextMenu]);

    const handleCopyMarkdown = useCallback(() => {
        if (!contextMenu.targetItem) return;
        const markdownCode = `![${contextMenu.targetItem.name}](${contextMenu.targetItem.url})`;
        navigator.clipboard.writeText(markdownCode)
            .then(() => console.log('Markdown 已复制!')) // 可以添加用户反馈
            .catch(err => console.error('复制 Markdown 失败: ', err));
        closeContextMenu();
    }, [contextMenu.targetItem, closeContextMenu]);

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
                <div className={`gallery ${isResizing || isLayoutTransitioning ? 'resizing' : ''}`}>
                    {filteredImages.length > 0 ? (
                        filteredImages.map((img) => (
                            <GalleryItem
                                key={img.id}
                                item={img}
                                onContextMenu={openContextMenu}
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
                    className="context-menu"
                // 不再使用内联样式设置位置，而是在useEffect中根据菜单尺寸设置
                >
                    <ul>
                        <li onClick={handleDelete}><FiTrash2 className="menu-icon" /> 删除</li>
                        <li onClick={handleCopyHTML}><FiCode className="menu-icon" /> 复制 HTML 代码</li>
                        <li onClick={handleCopyMarkdown}><FiFileText className="menu-icon" /> 复制 Markdown 代码</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Gallery;