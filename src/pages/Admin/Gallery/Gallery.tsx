import React, { useState, useEffect, useRef, useMemo, useCallback, useContext } from 'react';
import { FiSearch, FiTrash2, FiCode, FiFileText, FiEdit, FiPlus } from 'react-icons/fi';
import './Gallery.scss';
import {
    getAllGalleryImages,
    renameGalleryImage,
    deleteGalleryImage,
    RenameImageRequest,
    checkImageNameExistence,
    getImageUrl
} from '@/services/adminService';
// 导入布局上下文
import { createPortal } from 'react-dom';
import { LayoutContext } from "@/layouts/LayoutContext.tsx";
// 导入上传模态框组件
import UploadModal from './UploadModal';

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
    onContextMenu: (event: React.MouseEvent<HTMLDivElement>, item: ImageItem) => void;
    isRenaming: boolean;
    onRenameComplete: (newName: string) => void;
}

const GalleryItem: React.FC<GalleryItemProps> = ({item, onContextMenu, isRenaming, onRenameComplete}) => {
    // 添加图片加载状态跟踪
    const [imageLoaded, setImageLoaded] = useState(false);
    const [newName, setNewName] = useState(item.name);
    const [nameError, setNameError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // 处理图片加载完成
    const handleImageLoad = useCallback(() => {
        setImageLoaded(true);
    }, []);

    // 当进入重命名模式时，设置名称并聚焦输入框
    useEffect(() => {
        if (isRenaming) {
            setNewName(item.name);
            setNameError(null);
            // 延迟聚焦以确保输入框已经渲染
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                    inputRef.current.select();
                }
            }, 50);
        }
    }, [isRenaming, item.name]);

    // 处理重命名完成
    const handleRenameComplete = () => {
        const trimmedName = newName.trim();
        if (trimmedName === '') {
            setNameError('名称不能为空');
            return;
        }

        if (trimmedName === item.name) {
            onRenameComplete(item.name);
            return;
        }

        setNameError(null);
        onRenameComplete(trimmedName);
    };

    // 处理按键事件 - 回车提交，ESC取消
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleRenameComplete();
        } else if (e.key === 'Escape') {
            setNewName(item.name); // 重置为原始名称
            setNameError(null);
            onRenameComplete(item.name); // 取消重命名
        }
    };

    return (
        <div
            className={`gallery-item ${imageLoaded ? 'loaded' : 'loading'}`}
            onContextMenu={(e) => onContextMenu(e, item)}
            onClick={(e) => {
                e.preventDefault();
            }}
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
                    {isRenaming ? (
                        <div className="rename-input-container">
                            <input
                                ref={inputRef}
                                type="text"
                                className={`rename-input ${nameError ? 'input-error' : ''}`}
                                value={newName}
                                onChange={(e) => {
                                    setNewName(e.target.value);
                                    if (nameError) setNameError(null);
                                }}
                                onBlur={handleRenameComplete}
                                onKeyDown={handleKeyDown}
                            />
                            {nameError && <div className="name-error-message">{nameError}</div>}
                        </div>
                    ) : (
                        <>
                            <h3>{item.name}</h3>
                            <p>{item.date}</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- 右键菜单组件 ---
interface ContextMenuProps {
    visible: boolean;
    x: number;
    y: number;
    targetItem: ImageItem | null;
    isMenuClosing: boolean;
    onRename: () => void;
    onDelete: () => void;
    onCopyHTML: () => void;
    onCopyMarkdown: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
                                                     visible,
                                                     x,
                                                     y,
                                                     isMenuClosing,
                                                     onRename,
                                                     onDelete,
                                                     onCopyHTML,
                                                     onCopyMarkdown,
                                                 }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    // 每当菜单显示状态改变时调整位置
    useEffect(() => {
        if (visible && menuRef.current) {
            // 先将菜单定位到鼠标位置，但不设置尺寸限制，让它自然展开
            menuRef.current.style.left = `${x}px`;
            menuRef.current.style.top = `${y}px`;

            // 确保菜单完全渲染后再进行边界检查
            requestAnimationFrame(() => {
                if (menuRef.current) {
                    // 获取菜单尺寸
                    const menuWidth = menuRef.current.offsetWidth;
                    const menuHeight = menuRef.current.offsetHeight;

                    // 获取视口尺寸
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;

                    // 计算菜单的最终位置
                    let finalX = x;
                    let finalY = y;
                    let adjustmentClass = 'context-menu';

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
                    menuRef.current.style.left = `${finalX}px`;
                    menuRef.current.style.top = `${finalY}px`;

                    // 应用调整类
                    menuRef.current.className = `${adjustmentClass}${isMenuClosing ? ' closing' : ''}`;
                }
            });
        }
    }, [visible, x, y, isMenuClosing]);

    // 如果不可见，不渲染任何内容
    if (!visible) return null;

    // 使用Portal将菜单渲染到body上
    return createPortal(
        <div
            ref={menuRef}
            className="context-menu"
        >
            <ul>
                <li onClick={onRename}><FiEdit className="menu-icon"/> 重命名</li>
                <li onClick={onDelete}><FiTrash2 className="menu-icon"/> 删除</li>
                <li onClick={onCopyHTML}><FiCode className="menu-icon"/> 复制 HTML 代码</li>
                <li onClick={onCopyMarkdown}><FiFileText className="menu-icon"/> 复制 Markdown 代码</li>
            </ul>
        </div>,
        document.body
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
    const [renamingImageId, setRenamingImageId] = useState<string | null>(null);
    const menuCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const galleryContainerRef = useRef<HTMLDivElement>(null);
    // 添加是否正在调整窗口大小的状态
    const [isResizing, setIsResizing] = useState(false);
    const [isUploadModalVisible, setIsUploadModalVisible] = useState(false);
    // 添加错误消息状态
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // 使用布局上下文
    const {collapsed, isLayoutTransitioning} = useContext(LayoutContext);
    // 跟踪上一次的collapsed状态，以便检测变化
    const prevCollapsedRef = useRef(collapsed);

    // 刷新图库
    const refreshGallery = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await getAllGalleryImages();
            
            if (response.code === 200) {
                // 获取环境变量中的业务服务URL
                const businessServiceUrl = import.meta.env.VITE_BUSINESS_SERVICE_URL || '';
                
                // 将API数据转换为组件所需的格式
                const formattedImages: ImageItem[] = response.data.map(img => ({
                    id: img.img_id,
                    url: getImageUrl(img.img_id),
                    name: img.img_name,
                    type: img.img_type,
                    date: new Date().toLocaleDateString('zh-CN') // 由于API没有返回日期，使用当前日期
                }));
                setAllImages(formattedImages);
                setErrorMessage(null);
            } else {
                console.error('API返回错误码:', response.code, response.msg);
                setErrorMessage(`获取图片失败: ${response.msg}`);
            }
        } catch (error) {
            console.error('加载图片失败:', error);
            setErrorMessage(error instanceof Error ? error.message : '加载图片失败');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 初始加载图片
    useEffect(() => {
        refreshGallery();
    }, [refreshGallery]);

    // 处理窗口大小调整的防抖效果
    useEffect(() => {
        // 直接监听resize事件，不使用防抖
        const handleResize = () => {
            // 只在调整大小期间临时应用样式变化，然后立即移除
            setIsResizing(true);

            // 立即恢复正常状态，不再使用延迟
            // 使用requestAnimationFrame来保证在下一帧渲染前执行
            requestAnimationFrame(() => {
                setIsResizing(false);
            });
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

            // 使用requestAnimationFrame代替setTimeout，更加平滑
            requestAnimationFrame(() => {
                // 如果仍在过渡中，允许过渡效果完成
                if (!isLayoutTransitioning) {
                    setIsResizing(false);
                } else {
                    // 如果在过渡中，等待下一帧再次检查
                    requestAnimationFrame(() => {
                        setIsResizing(false);
                    });
                }
            });
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
            setContextMenu(prev => ({...prev, visible: false, targetItem: null}));
            setIsMenuClosing(false);
        }, 120); // 动画持续时间
    }, []);

    // 使用useCallback缓存事件处理函数
    const openContextMenu = useCallback((event: React.MouseEvent, item: ImageItem) => {
        event.preventDefault(); // 阻止默认的浏览器右键菜单

        // 获取鼠标在页面上的精确位置（考虑页面滚动）
        const x = event.pageX;
        const y = event.pageY;

        setContextMenu({
            visible: true,
            x,
            y,
            targetItem: item,
        });
    }, []);

    // 点击外部区域关闭右键菜单
    useEffect(() => {
        // 仅当菜单可见时添加监听器
        if (!contextMenu.visible) {
            return; // 如果菜单隐藏，则不需要监听器
        }

        const handleClickOutside = (event: MouseEvent) => {
            // 因为菜单是在body中渲染的，所以我们需要检查事件目标是否是菜单或其子元素
            if (event.target instanceof Node) {
                // 查找点击元素是否在菜单内
                const menuElement = document.querySelector('.context-menu');

                // 如果点击的不是菜单或其子元素，则关闭菜单
                if (!menuElement || !menuElement.contains(event.target)) {
                    closeContextMenu();
                }
            }
        };

        // ESC键关闭菜单
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeContextMenu();
            }
        };

        // 使用捕获阶段添加事件监听器，确保在事件冒泡之前捕获点击
        document.addEventListener('mousedown', handleClickOutside, true);
        document.addEventListener('keydown', handleKeyDown);

        // 清理：在菜单隐藏或组件卸载时移除监听器
        return () => {
            document.removeEventListener('mousedown', handleClickOutside, true);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [contextMenu.visible, closeContextMenu]);

    const handleDelete = useCallback(async () => {
        if (!contextMenu.targetItem) return;

        try {
            // 发送删除请求
            const response = await deleteGalleryImage(contextMenu.targetItem.id);

            if (response.code === 200) {
                // 从 allImages 状态中过滤掉选定的图片
                setAllImages(prevImages => prevImages.filter(img => img.id !== contextMenu.targetItem!.id));
            } else {
                console.error('删除失败:', response.msg);
                // 可以添加错误提示
            }
        } catch (error) {
            console.error('删除请求出错:', error);
            // 可以添加错误提示
        } finally {
            closeContextMenu();
        }
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

    // 处理重命名操作
    const handleRename = useCallback(() => {
        if (!contextMenu.targetItem) return;
        setRenamingImageId(contextMenu.targetItem.id);
        closeContextMenu();
    }, [contextMenu.targetItem, closeContextMenu]);

    // 处理重命名完成
    const handleRenameComplete = useCallback(async (imageId: string, newName: string) => {
        // 找到当前正在重命名的图片
        const imageToRename = allImages.find(img => img.id === imageId);

        // 如果找不到图片或名称没有变化，则取消重命名
        if (!imageToRename || imageToRename.name === newName) {
            setRenamingImageId(null);
            return;
        }

        try {
            // 首先检查名称是否已存在
            const checkResult = await checkImageNameExistence(newName);
            
            // 如果checkResult.data为true，则表示名称已存在
            if (checkResult.code === 200 && checkResult.data) {
                console.error('重命名失败: 图片名称已存在');
                setErrorMessage('图片名称已存在，请使用其他名称');
                return;
            }
            
            // 名称不存在，继续执行重命名操作
            // 准备请求数据
            const requestData: RenameImageRequest = {
                img_id: imageId,
                img_name: newName
            };

            // 发送重命名请求
            const response = await renameGalleryImage(imageId, requestData);

            if (response.code === 200) {
                // 更新本地状态
                setAllImages(prevImages =>
                    prevImages.map(img =>
                        img.id === imageId ? {...img, name: newName} : img
                    )
                );
            } else {
                console.error('重命名失败:', response.msg);
                setErrorMessage(`重命名失败: ${response.msg}`);
            }
        } catch (error) {
            console.error('重命名请求出错:', error);
            setErrorMessage('重命名请求出错，请稍后重试');
        } finally {
            // 无论成功还是失败，退出重命名模式
            setRenamingImageId(null);
        }
    }, [allImages]);

    // 组件卸载时清理
    useEffect(() => {
        return () => {
            if (menuCloseTimeoutRef.current) {
                clearTimeout(menuCloseTimeoutRef.current);
            }
        };
    }, []);

    // 处理打开上传模态框
    const openUploadModal = useCallback(() => {
        setIsUploadModalVisible(true);
    }, []);

    // 处理关闭上传模态框
    const closeUploadModal = useCallback(() => {
        setIsUploadModalVisible(false);
    }, []);

    // 处理完成图片上传后的回调
    const handleImagesUploaded = useCallback(async () => {
        try {
            // 已在UploadModal组件中处理上传逻辑
            // 这里只需要刷新图库
            await refreshGallery();
        } catch (error) {
            console.error('处理上传图片失败:', error);
            setErrorMessage(error instanceof Error ? error.message : '处理上传图片失败');
        }
    }, [refreshGallery]);

    return (
        <div className="gallery-container" ref={galleryContainerRef}>
            <div className="search-box">
                <FiSearch className="search-icon"/>
                <input
                    type="text"
                    className="search-input"
                    placeholder="搜索图片名称..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="add-image-btn" onClick={openUploadModal}>
                    <FiPlus className="add-icon"/>
                    添加图片
                </button>
            </div>

            {errorMessage && (
                <div className="error-message">
                    {errorMessage}
                    <button 
                        className="close-error-btn" 
                        onClick={() => setErrorMessage(null)}
                    >
                        &times;
                    </button>
                </div>
            )}

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
                                isRenaming={renamingImageId === img.id}
                                onRenameComplete={(newName) => handleRenameComplete(img.id, newName)}
                            />
                        ))
                    ) : (
                        <p className="no-results">没有找到匹配的图片。</p>
                    )}
                </div>
            )}

            {/* 使用Portal渲染右键菜单 */}
            <ContextMenu
                visible={contextMenu.visible}
                x={contextMenu.x}
                y={contextMenu.y}
                targetItem={contextMenu.targetItem}
                isMenuClosing={isMenuClosing}
                onRename={handleRename}
                onDelete={handleDelete}
                onCopyHTML={handleCopyHTML}
                onCopyMarkdown={handleCopyMarkdown}
            />

            {/* 使用新的上传模态框组件 */}
            <UploadModal
                visible={isUploadModalVisible}
                onClose={closeUploadModal}
                onImagesUploaded={handleImagesUploaded}
            />
        </div>
    );
};

export default Gallery;