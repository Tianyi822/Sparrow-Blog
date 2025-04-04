import React, { useRef, useState, useEffect, useCallback } from 'react';
import { FiLoader, FiPlus, FiX, FiCopy, FiCheckCircle } from 'react-icons/fi';
import { GalleryImage, getAllGalleryImages } from '@/services/adminService';
import './ImageGalleryModal.scss';

interface ImageGalleryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImageInsert: (image: GalleryImage) => void;
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({ isOpen, onClose, onImageInsert }) => {
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [galleryLoading, setGalleryLoading] = useState<boolean>(false);
    const [copiedImageId, setCopiedImageId] = useState<string | null>(null);
    const galleryRef = useRef<HTMLDivElement>(null);

    // 加载图片库数据
    const loadImageGallery = useCallback(async () => {
        setGalleryLoading(true);
        try {
            const response = await getAllGalleryImages();
            if (response.code === 200 && response.data) {
                // 按照日期排序，最新的在前面
                const sortedImages = [...response.data].sort((a, b) => {
                    const dateA = new Date(a.create_time || 0).getTime();
                    const dateB = new Date(b.create_time || 0).getTime();
                    return dateB - dateA; // 降序排列，最新的在前
                });
                setGalleryImages(sortedImages);
            } else {
                console.error('获取图片库失败:', response.msg);
            }
        } catch (error) {
            console.error('获取图片库出错:', error);
        } finally {
            setGalleryLoading(false);
        }
    }, []);

    // 处理图片上传
    const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // TODO: 实现图片上传逻辑
        console.log('上传图片:', file.name);

        // 清空input值，允许再次选择同一文件
        e.target.value = '';

        // 示例上传过程
        alert('图片上传功能即将实现，请检查控制台日志');

        // 上传成功后应该重新加载图片库
        // loadImageGallery();
    }, []);

    // 点击图片时处理
    const handleImageClick = useCallback((image: GalleryImage) => {
        onImageInsert(image);
        
        // 显示复制成功提示
        setCopiedImageId(image.img_id);
        setTimeout(() => setCopiedImageId(null), 2000);
    }, [onImageInsert]);

    // 处理点击外部关闭图片库
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && galleryRef.current && !galleryRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // 当组件打开时加载图片
    useEffect(() => {
        if (isOpen && galleryImages.length === 0) {
            loadImageGallery();
        }
    }, [isOpen, galleryImages.length, loadImageGallery]);

    if (!isOpen) return null;

    return (
        <div className="image-gallery-modal-overlay">
            <div className="image-gallery-modal" ref={galleryRef}>
                <div className="gallery-header">
                    <div className="gallery-title">
                        <h3>图片库</h3>
                        <button
                            className="gallery-upload-btn"
                            title="上传图片"
                            onClick={() => document.getElementById('image-upload-input')?.click()}
                        >
                            <FiPlus />
                        </button>
                        <input
                            type="file"
                            id="image-upload-input"
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </div>
                    <button
                        className="close-gallery-btn"
                        onClick={onClose}
                    >
                        <FiX />
                    </button>
                </div>
                <div className="gallery-content">
                    {galleryLoading ? (
                        <div className="gallery-loading">
                            <FiLoader className="spin-icon" />
                            <span>加载中...</span>
                        </div>
                    ) : galleryImages.length === 0 ? (
                        <div className="gallery-empty">
                            <span>没有找到图片</span>
                        </div>
                    ) : (
                        <ul className="gallery-list">
                            {galleryImages.map(image => (
                                <li
                                    key={image.img_id}
                                    className="gallery-item"
                                >
                                    <div className="image-preview" onClick={() => handleImageClick(image)}>
                                        <img
                                            src={`${import.meta.env.VITE_BUSINESS_SERVICE_URL}/img/get/${image.img_id}`}
                                            alt={image.img_name}
                                        />
                                    </div>
                                    <div className="image-info">
                                        <span className="image-name">{image.img_name}</span>
                                        <div className="image-action" onClick={() => handleImageClick(image)}>
                                            {copiedImageId === image.img_id ? (
                                                <span className="copied-status">
                                                    <FiCheckCircle className="copied-icon" />
                                                    已复制
                                                </span>
                                            ) : (
                                                <span className="copy-hint">
                                                    <FiCopy className="copy-icon" />
                                                    点击复制
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageGalleryModal; 