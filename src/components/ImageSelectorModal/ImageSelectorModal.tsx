import React, { useRef, useState, useEffect, useCallback } from 'react';
import { FiLoader, FiPlus, FiX, FiCheckCircle, FiUploadCloud, FiUser, FiImage, FiLayout } from 'react-icons/fi';
import { GalleryImage, getAllGalleryImages, addGalleryImages, AddImagesRequest, getImageUrl } from '@/services/adminService';
import { getPreSignUrl, uploadToOSS, FileType, ContentType } from '@/services/ossService';
import imageCompression from 'browser-image-compression';
import "./ImageSelectorModal.scss"

// 上传文件状态接口
interface UploadFileState {
    file: File;
    name: string;
    isCompressing: boolean;
    isCompressed: boolean;
    originalSize: number;
    compressedSize?: number;
    compressedFile?: File;
    compressionProgress: number;
    isUploading: boolean;
    isUploaded: boolean;
    uploadProgress: number;
    uploadError?: string;
}

// 图片使用类型
export type ImageUsageType = 'avatar' | 'logo' | 'background';

// 模态框模式
export type ModalMode = 'userSetting' | 'editor' | 'article';

interface ImageSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImageSelect?: (image: GalleryImage, usageType: ImageUsageType) => void;
    onImageInsert?: (image: GalleryImage) => void;
    usageType: ImageUsageType;
    mode: ModalMode;
}

const ImageSelectorModal: React.FC<ImageSelectorModalProps> = ({
    isOpen,
    onClose,
    onImageSelect,
    onImageInsert,
    usageType,
    mode
}) => {
    const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
    const [galleryLoading, setGalleryLoading] = useState<boolean>(false);
    const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
    const galleryRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 上传状态
    const [uploadFile, setUploadFile] = useState<UploadFileState | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);

    // 获取正在使用的用途类型标题
    const getUsageTypeTitle = (): string => {
        if (mode === 'editor') {
            return '图片库';
        } else if (mode === 'article') {
            return '文章封面图';
        } else {
            switch (usageType) {
                case 'avatar': return '用户头像';
                case 'logo': return '网站Logo';
                case 'background': return '背景图片';
                default: return '图片';
            }
        }
    };

    // 获取用途类型的图标
    const getUsageTypeIcon = () => {
        if (mode === 'editor') {
            return <FiImage />;
        } else if (mode === 'article') {
            return <FiImage />;
        } else {
            switch (usageType) {
                case 'avatar': return <FiUser />;
                case 'logo': return <FiImage />;
                case 'background': return <FiLayout />;
                default: return <FiImage />;
            }
        }
    };

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

    // 验证文件类型
    const validateFile = (file: File) => {
        const validTypes = ['image/webp', 'image/jpeg', 'image/jpg', 'image/png'];
        return validTypes.includes(file.type);
    };

    // 压缩图片
    const compressImage = useCallback(async (file: File): Promise<File | null> => {
        console.log(`开始压缩图片: ${file.name}`);

        try {
            // 更新压缩状态
            setUploadFile(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    isCompressing: true,
                    compressionProgress: 5
                };
            });

            // 压缩选项
            const options = {
                maxSizeMB: 1, // 最大1MB
                useWebWorker: true, // 使用Web Worker避免阻塞UI
                fileType: 'image/webp', // 输出WebP格式
                quality: 0.95, // 95%质量，优先保证图片质量
                initialQuality: 0.95, // 初始质量设置（部分浏览器需要）
                alwaysKeepResolution: true, // 保持原始分辨率
                preserveExif: true, // 保留图片元数据
                onProgress: (progress: number) => {
                    // 更新压缩进度
                    setUploadFile(prev => {
                        if (!prev) return null;
                        return {
                            ...prev,
                            compressionProgress: Math.round(progress)
                        };
                    });
                }
            };

            // 执行压缩
            console.log(`执行压缩: ${file.name}`);
            const compressedFile = await imageCompression(file, options);
            console.log(`压缩完成: ${file.name}, 从 ${file.size} 减小到 ${compressedFile.size}`);

            // 更新完成状态
            setUploadFile(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    isCompressing: false,
                    isCompressed: true,
                    compressedSize: compressedFile.size,
                    compressedFile: compressedFile,
                    compressionProgress: 100
                };
            });

            return compressedFile;
        } catch (error) {
            console.error(`压缩失败 ${file.name}:`, error);

            // 更新错误状态
            setUploadFile(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    isCompressing: false,
                    isCompressed: false,
                    compressionProgress: 0
                };
            });

            return null;
        }
    }, []);

    // 上传图片到OSS
    const uploadImageToOSS = useCallback(async (file: File): Promise<{ success: boolean, fileName: string } | null> => {
        try {
            // 更新状态为上传中
            setUploadFile(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    isUploading: true,
                    uploadProgress: 0,
                    uploadError: undefined
                };
            });

            // 1. 获取文件名，去除扩展名，只保留文件名本身并添加时间戳
            const timestamp = new Date().getTime();
            const fileName = file.name;

            // 移除原始文件扩展名，只保留文件名本身
            const nameParts = fileName.split('.');
            // 如果文件名包含扩展名，则去掉扩展名
            if (nameParts.length > 1) {
                // 去掉最后一部分(扩展名)
                nameParts.pop();
            }
            // 只保留文件名和时间戳，不添加任何扩展名
            const uploadFileName = `${nameParts.join('.')}_${timestamp}`;

            // 2. 获取预签名URL
            console.log(`获取预签名URL: ${uploadFileName}`);
            const preSignUrlResponse = await getPreSignUrl(uploadFileName, FileType.WEBP);

            if (preSignUrlResponse.code !== 200) {
                console.error(`获取预签名URL失败: ${preSignUrlResponse.msg}`);

                setUploadFile(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        isUploading: false,
                        uploadError: `获取预签名URL失败: ${preSignUrlResponse.msg}`
                    };
                });

                return null;
            }

            const preSignUrl = preSignUrlResponse.data.pre_sign_put_url;

            // 3. 读取文件内容
            const fileContent = await file.arrayBuffer();

            // 更新上传进度为50%
            setUploadFile(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    uploadProgress: 50
                };
            });

            // 4. 上传到OSS
            console.log(`上传文件到OSS: ${uploadFileName}`);
            const uploadSuccess = await uploadToOSS(
                preSignUrl,
                fileContent,
                ContentType.WEBP
            );

            if (!uploadSuccess) {
                console.error('上传到OSS失败');

                setUploadFile(prev => {
                    if (!prev) return null;
                    return {
                        ...prev,
                        isUploading: false,
                        uploadError: '上传到OSS失败'
                    };
                });

                return null;
            }

            // 5. 更新状态为上传完成
            setUploadFile(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    isUploading: false,
                    isUploaded: true,
                    uploadProgress: 100
                };
            });

            console.log(`文件 ${uploadFileName} 上传成功`);
            return {
                success: true,
                fileName: uploadFileName
            };

        } catch (error) {
            console.error(`上传文件失败:`, error);

            // 更新错误状态
            setUploadFile(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    isUploading: false,
                    isUploaded: false,
                    uploadError: error instanceof Error ? error.message : '上传失败'
                };
            });

            return null;
        }
    }, []);

    // 添加图片到图库
    const addImageToGallery = useCallback(async (fileName: string) => {
        try {
            // 将上传的图片信息提交到API
            console.log('添加图片到图库，数据:', fileName);

            const addRequest: AddImagesRequest = {
                imgs: [{
                    img_name: fileName,
                    img_type: "webp"
                }]
            };

            const response = await addGalleryImages(addRequest);

            if (response.code === 200) {
                console.log('添加图片到图库成功');
                // 重新加载图片库数据
                await loadImageGallery();
                // 清空上传状态
                setUploadFile(null);
            } else {
                console.error('添加图片到图库失败:', response.msg);
                alert(`添加图片到图库失败: ${response.msg}`);
            }
        } catch (error) {
            console.error('API调用失败:', error);
            alert('添加图片到图库失败: ' + (error instanceof Error ? error.message : String(error)));
        }
    }, [loadImageGallery]);

    // 处理图片上传
    const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 清空input值，允许再次选择同一文件
        e.target.value = '';

        // 验证文件类型
        if (!validateFile(file)) {
            alert('请选择有效的图片文件 (WEBP, JPG, JPEG, PNG)');
            return;
        }

        setIsUploading(true);

        // 初始化上传状态
        setUploadFile({
            file,
            name: file.name,
            isCompressing: false,
            isCompressed: false,
            originalSize: file.size,
            compressionProgress: 0,
            isUploading: false,
            isUploaded: false,
            uploadProgress: 0
        });

        // 压缩图片
        const compressedFile = await compressImage(file);

        if (compressedFile) {
            // 上传到OSS
            const result = await uploadImageToOSS(compressedFile);

            if (result && result.success) {
                // 添加图片到图库
                await addImageToGallery(result.fileName);
            }
        }

        setIsUploading(false);
    }, [compressImage, uploadImageToOSS, addImageToGallery]);

    // 处理图片选择
    const handleImageSelect = useCallback((image: GalleryImage) => {
        if (mode === 'editor' && onImageInsert) {
            // 编辑器模式，直接调用onImageInsert
            onImageInsert(image);
            onClose();
        } else if (mode === 'article' && onImageSelect) {
            // 文章封面图模式，选择图片并显示选中状态
            setSelectedImageId(image.img_id);

            // 1秒后执行应用
            setTimeout(() => {
                onImageSelect(image, usageType);
                onClose();
            }, 300);
        } else if (mode === 'userSetting' && onImageSelect) {
            // 用户设置模式，选择图片并显示选中状态
            setSelectedImageId(image.img_id);

            // 3秒后执行应用
            setTimeout(() => {
                onImageSelect(image, usageType);
                onClose();
            }, 300);
        }
    }, [mode, onImageInsert, onImageSelect, usageType, onClose]);

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
        if (isOpen) {
            loadImageGallery();
            setSelectedImageId(null);
        }
    }, [isOpen, loadImageGallery]);

    // 格式化文件大小显示
    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        else return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    // 计算压缩率
    const getCompressionRate = (original: number, compressed: number): string => {
        const rate = ((original - compressed) / original * 100).toFixed(0);
        return rate + '%';
    };

    if (!isOpen) return null;

    return (
        <div className="image-selector-modal-overlay">
            <div className="image-selector-modal" ref={galleryRef}>
                <div className="selector-header">
                    <div className="selector-title">
                        <div className="title-with-icon">
                            {getUsageTypeIcon()}
                            <h3>{getUsageTypeTitle()}</h3>
                        </div>
                        <button
                            className="selector-upload-btn"
                            title="上传图片"
                            onClick={() => !isUploading && document.getElementById('image-selector-input')?.click()}
                            disabled={isUploading}
                        >
                            {isUploading ? <FiLoader className="spin-icon" /> : <FiPlus />}
                        </button>
                        <input
                            type="file"
                            id="image-selector-input"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/webp,image/jpeg,image/jpg,image/png"
                            onChange={handleImageUpload}
                            disabled={isUploading}
                        />
                    </div>
                    <button
                        className="close-selector-btn"
                        onClick={onClose}
                    >
                        <FiX />
                    </button>
                </div>

                {uploadFile && (
                    <div className="upload-preview">
                        <div className="upload-file-info">
                            <p>{uploadFile.name}</p>
                            {uploadFile.isCompressed && uploadFile.compressedSize && (
                                <div className="upload-size-info">
                                    <span>{formatFileSize(uploadFile.originalSize)}</span>
                                    <span className="arrow">→</span>
                                    <span>{formatFileSize(uploadFile.compressedSize)}</span>
                                    <span className="compression-rate">
                                        (-{getCompressionRate(uploadFile.originalSize, uploadFile.compressedSize)})
                                    </span>
                                </div>
                            )}
                        </div>

                        {uploadFile.isCompressing && (
                            <div className="upload-progress-container">
                                <FiLoader className="spin-icon" />
                                <span>压缩中 {uploadFile.compressionProgress}%</span>
                                <div className="progress-bar">
                                    <div
                                        className="progress-bar-inner"
                                        style={{ width: `${uploadFile.compressionProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {uploadFile.isUploading && (
                            <div className="upload-progress-container">
                                <FiUploadCloud className="upload-icon" />
                                <span>上传中 {uploadFile.uploadProgress}%</span>
                                <div className="progress-bar">
                                    <div
                                        className="progress-bar-inner upload-bar"
                                        style={{ width: `${uploadFile.uploadProgress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {uploadFile.uploadError && (
                            <div className="upload-error">
                                <p>上传失败: {uploadFile.uploadError}</p>
                                <button
                                    className="retry-button"
                                    onClick={() => setUploadFile(null)}
                                >
                                    关闭
                                </button>
                            </div>
                        )}
                    </div>
                )}

                <div className="selector-content">
                    {galleryLoading ? (
                        <div className="selector-loading">
                            <FiLoader className="spin-icon" />
                            <span>加载中...</span>
                        </div>
                    ) : galleryImages.length === 0 ? (
                        <div className="selector-empty">
                            <span>没有找到图片</span>
                        </div>
                    ) : (
                        <ul className="selector-list">
                            {galleryImages.map(image => (
                                <li
                                    key={image.img_id}
                                    className={`selector-item ${selectedImageId === image.img_id ? 'selected' : ''}`}
                                    onClick={() => handleImageSelect(image)}
                                >
                                    <div className="image-preview">
                                        <img
                                            src={getImageUrl(image.img_id)}
                                            alt={image.img_name}
                                        />
                                        {selectedImageId === image.img_id && (
                                            <div className="selected-overlay">
                                                <FiCheckCircle className="selected-icon" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="image-info">
                                        <span className="image-name">{image.img_name}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="selector-footer">
                    <button
                        className="cancel-button"
                        onClick={onClose}
                    >
                        取消
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ImageSelectorModal; 