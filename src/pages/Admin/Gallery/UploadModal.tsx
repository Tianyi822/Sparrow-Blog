import { addGalleryImages } from '@/services/adminService';
import { AddImagesRequest } from '@/types';
import { ContentType, FileType, getPreSignUrl, uploadToOSS } from '@/services/ossService';
import imageCompression from 'browser-image-compression';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FiCheckCircle, FiLoader, FiUploadCloud } from 'react-icons/fi';
import './Gallery.scss';

// 上传文件接口定义
interface UploadFile {
    file: File;
    preview: string;
    name: string;
    isCompressing: boolean;
    isCompressed: boolean;
    originalSize: number;
    compressedSize?: number;
    compressedFile?: File;
    compressionProgress: number; // 压缩进度 0-100
    isUploading?: boolean; // 是否正在上传
    isUploaded?: boolean; // 是否已上传完成
    uploadProgress?: number; // 上传进度 0-100
    uploadError?: string; // 上传错误信息
}

// --- 文件上传模态框组件接口 ---
interface UploadModalProps {
    visible: boolean;
    onClose: () => void;
    onImagesUploaded?: (images: File[]) => void;
}

const UploadModal: React.FC<UploadModalProps> = React.memo(({ visible, onClose, onImagesUploaded }) => {
    const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [areAllFilesCompressed, setAreAllFilesCompressed] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 清理预览URL，防止内存泄漏
    useEffect(() => {
        return () => {
            uploadFiles.forEach(file => URL.revokeObjectURL(file.preview));
        };
    }, [uploadFiles]);

    // 检查所有文件是否已压缩
    useEffect(() => {
        const allCompressed = uploadFiles.length > 0 &&
            uploadFiles.every(file => file.isCompressed);
        setAreAllFilesCompressed(allCompressed);
    }, [uploadFiles]);

    // 处理拖拽进入事件
    const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    // 处理拖拽离开事件
    const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    // 处理拖拽悬停事件
    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    // 验证文件类型是否合法
    const validateFile = useCallback((file: File) => {
        const validTypes = ['image/webp', 'image/jpeg', 'image/jpg', 'image/png'];
        return validTypes.includes(file.type);
    }, []);

    // 压缩图片 - 接收索引而不是ID
    const compressImage = useCallback(async (file: UploadFile, fileIndex: number) => {
        try {
            // 更新压缩状态
            setUploadFiles(prev => {
                // 再次检查索引是否有效
                if (fileIndex >= prev.length) {
                    return prev;
                }

                const updated = [...prev];
                updated[fileIndex] = {
                    ...updated[fileIndex],
                    isCompressing: true,
                    compressionProgress: 5 // 初始进度设为5%
                };
                return updated;
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
                    setUploadFiles(prev => {
                        // 再次检查索引是否有效
                        if (fileIndex >= prev.length) return prev;

                        const updated = [...prev];
                        updated[fileIndex] = {
                            ...updated[fileIndex],
                            compressionProgress: Math.round(progress)
                        };
                        return updated;
                    });
                }
            };

            // 执行压缩
            const compressedFile = await imageCompression(file.file, options);

            // 更新完成状态
            setUploadFiles(prev => {
                // 再次检查索引是否有效
                if (fileIndex >= prev.length) {
                    return prev;
                }

                const updated = [...prev];
                updated[fileIndex] = {
                    ...updated[fileIndex],
                    isCompressing: false,
                    isCompressed: true,
                    compressedSize: compressedFile.size,
                    compressedFile: compressedFile,
                    compressionProgress: 100
                };
                return updated;
            });

            // 短暂显示100%进度
            setTimeout(() => {
                setUploadFiles(prev => {
                    // 再次检查索引是否有效
                    if (fileIndex >= prev.length) return prev;

                    const updated = [...prev];
                    updated[fileIndex] = {
                        ...updated[fileIndex],
                        isCompressing: false // 确保不再显示压缩中
                    };
                    return updated;
                });
            }, 500);

            return true;
        } catch (error) {
            setErrorMessage(`压缩失败 ${file.name}: ${error instanceof Error ? error.message : String(error)}`);

            // 更新错误状态
            setUploadFiles(prev => {
                // 再次检查索引是否有效
                if (fileIndex >= prev.length) return prev;

                const updated = [...prev];
                updated[fileIndex] = {
                    ...updated[fileIndex],
                    isCompressing: false,
                    compressionProgress: 0
                };
                return updated;
            });

            return false;
        }
    }, []);

    // 上传图片到OSS
    const uploadImageToOSS = useCallback(async (file: UploadFile, index: number): Promise<{ success: boolean, fileName: string } | false> => {
        try {
            if (!file.compressedFile) {
                return false;
            }

            // 更新状态为上传中
            setUploadFiles(prev => {
                const updated = [...prev];
                if (index < updated.length) {
                    updated[index] = {
                        ...updated[index],
                        isUploading: true,
                        uploadProgress: 0,
                        uploadError: undefined
                    };
                }
                return updated;
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
            const preSignUrlResponse = await getPreSignUrl(uploadFileName, FileType.WEBP);

            if (preSignUrlResponse.code !== 200) {
                return false;
            }

            const preSignUrl = preSignUrlResponse.data.pre_sign_put_url;

            // 3. 读取文件内容
            const fileContent = await file.compressedFile.arrayBuffer();

            // 更新上传进度为50%
            setUploadFiles(prev => {
                const updated = [...prev];
                if (index < updated.length) {
                    updated[index] = {
                        ...updated[index],
                        uploadProgress: 50
                    };
                }
                return updated;
            });

            // 4. 上传到OSS
            const uploadSuccess = await uploadToOSS(
                preSignUrl,
                fileContent,
                ContentType.WEBP
            );

            if (!uploadSuccess) {
                return false;
            }

            // 5. 更新状态为上传完成
            setUploadFiles(prev => {
                const updated = [...prev];
                if (index < updated.length) {
                    updated[index] = {
                        ...updated[index],
                        isUploading: false,
                        isUploaded: true,
                        uploadProgress: 100
                    };
                }
                return updated;
            });

            return {
                success: true,
                fileName: uploadFileName
            };

        } catch (error) {
            setErrorMessage(`上传文件 ${file.name} 失败: ${error instanceof Error ? error.message : String(error)}`);

            // 更新错误状态
            setUploadFiles(prev => {
                const updated = [...prev];
                if (index < updated.length) {
                    updated[index] = {
                        ...updated[index],
                        isUploading: false,
                        isUploaded: false,
                        uploadError: error instanceof Error ? error.message : '上传失败'
                    };
                }
                return updated;
            });

            return false;
        }
    }, []);

    // 处理多个文件的上传 - 完全重写
    const processFiles = useCallback(async (files: FileList) => {
        const fileArray = Array.from(files);
        const validFiles = fileArray.filter(validateFile);

        if (validFiles.length === 0) {
            return;
        }

        // 1. 首先创建文件对象并添加到状态
        const newFiles = validFiles.map(file => ({
            file: file,
            preview: URL.createObjectURL(file),
            name: file.name,
            isCompressing: false,
            isCompressed: false,
            originalSize: file.size,
            compressionProgress: 0
        }));

        // 2. 添加文件到状态 - 获取当前索引位置
        const startIndex = uploadFiles.length;

        // 3. 更新状态，添加新文件
        setUploadFiles(prev => [...prev, ...newFiles]);

        // 4. 等待状态更新完成
        await new Promise(resolve => setTimeout(resolve, 100));

        // 5. 逐个处理文件压缩，确保索引有效
        for (let i = 0; i < newFiles.length; i++) {
            const currentIndex = startIndex + i;

            // 再次获取当前状态，确保索引有效
            setUploadFiles(prev => {
                if (currentIndex >= prev.length) {
                    return prev;
                }

                // 确保文件对象存在
                setTimeout(() => {
                    compressImage(prev[currentIndex], currentIndex);
                }, 50);

                return prev;
            });

            // 为下一个文件添加延迟，避免同时启动多个压缩任务
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }, [uploadFiles.length, validateFile, compressImage]);

    // 处理拖放事件
    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    }, [processFiles]);

    // 处理文件输入变化
    const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
        }
    }, [processFiles]);

    // 移除文件 - 使用索引
    const handleRemoveFile = useCallback((index: number) => {
        setUploadFiles(prev => {
            // 释放URL对象
            URL.revokeObjectURL(prev[index].preview);

            // 过滤掉指定索引的文件
            return prev.filter((_, i) => i !== index);
        });
    }, []);

    // 格式化文件大小显示
    const formatFileSize = useCallback((bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        else return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }, []);

    // 计算压缩率
    const getCompressionRate = useCallback((original: number, compressed: number): string => {
        const rate = ((original - compressed) / original * 100).toFixed(0);
        return rate + '%';
    }, []);

    // 处理上传按钮点击
    const handleUpload = useCallback(async () => {
        const compressedFiles = uploadFiles.filter(f => f.isCompressed && f.compressedFile);

        if (compressedFiles.length === 0) {
            return;
        }

        setIsUploading(true);

        const uploadedFiles: File[] = [];
        const uploadedImageInfo: { img_name: string; img_type: string }[] = [];

        // 依次上传每张图片
        for (let i = 0; i < compressedFiles.length; i++) {
            const file = compressedFiles[i];
            const fileIndex = uploadFiles.findIndex(f => f === file);

            if (fileIndex === -1) {
                continue;
            }

            try {
                const result = await uploadImageToOSS(file, fileIndex);
                if (result && result.success && file.compressedFile) {
                    uploadedFiles.push(file.compressedFile);

                    // 收集上传成功的图片信息
                    uploadedImageInfo.push({
                        img_name: result.fileName,
                        img_type: "webp"
                    });
                }
            } catch (error) {
                setErrorMessage(`上传文件 ${file.name} 失败: ${error instanceof Error ? error.message : String(error)}`);
            }
        }

        if (uploadedImageInfo.length > 0) {
            try {
                // 将上传的图片信息提交到API
                const addRequest: AddImagesRequest = {
                    imgs: uploadedImageInfo
                };

                const response = await addGalleryImages(addRequest);

                if (response.code === 200) {
                    // 添加图片到图库成功
                } else {
                    setErrorMessage(`添加图片到图库失败: ${response.msg}`);
                }
            } catch (error) {
                setErrorMessage('添加图片到图库失败: ' + (error instanceof Error ? error.message : String(error)));
            }
        }

        setIsUploading(false);

        // 如果提供了回调函数，则调用它
        if (onImagesUploaded && uploadedFiles.length > 0) {
            onImagesUploaded(uploadedFiles);
        }

        // 清空上传列表
        setUploadFiles([]);

        // 关闭模态框
        onClose();
    }, [uploadFiles, uploadImageToOSS, onImagesUploaded, onClose]);

    if (!visible) return null;

    return createPortal(
        <div className="upload-modal-overlay">
            <div className="upload-modal">
                <div className="upload-modal-header">
                    <h2>添加图片</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="upload-modal-body">
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
                    <div
                        className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <p>点击或拖拽图片到此处上传</p>
                        <p className="file-type-hint">支持的格式: WEBP, JPG, JPEG, PNG</p>
                        <p className="file-type-hint">将自动压缩为WebP格式 (保持原始分辨率, 高质量95%, ≤1MB)</p>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept=".jpg,.jpeg,.png,.webp"
                            multiple
                            onChange={handleFileInputChange}
                        />
                    </div>

                    {uploadFiles.length > 0 && (
                        <div className="upload-file-list">
                            <h3>图片预览</h3>
                            <div className="file-items">
                                {uploadFiles.map((file, index) => (
                                    <div key={index} className="file-item">
                                        <div className="file-preview">
                                            <img src={file.preview} alt={file.name} />
                                            {file.isCompressing && (
                                                <div className="compression-overlay">
                                                    <FiLoader className="compression-spinner" />
                                                    <span>压缩中 {file.compressionProgress}%</span>
                                                    <div className="progress-bar-container">
                                                        <div
                                                            className="progress-bar"
                                                            style={{ width: `${file.compressionProgress}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                            {file.isUploading && (
                                                <div className="compression-overlay upload-overlay">
                                                    <FiLoader className="compression-spinner" />
                                                    <span>上传中 {file.uploadProgress || 0}%</span>
                                                    <div className="progress-bar-container">
                                                        <div
                                                            className="progress-bar upload-progress"
                                                            style={{ width: `${file.uploadProgress || 0}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="file-info">
                                            <p className="file-name">{file.name}</p>
                                            <div className="file-meta">
                                                {file.isCompressed ? (
                                                    <div className="compression-info">
                                                        <div className="compression-status success">
                                                            <FiCheckCircle />
                                                            <span>
                                                                {file.isUploaded ? '已上传' :
                                                                    file.uploadError ? '上传失败' : '已压缩'}
                                                            </span>
                                                        </div>
                                                        <div className="size-info">
                                                            <span>{formatFileSize(file.originalSize)}</span>
                                                            <span className="arrow">→</span>
                                                            <span>{formatFileSize(file.compressedSize || 0)}</span>
                                                            <span className="compression-rate">
                                                                (-{getCompressionRate(file.originalSize, file.compressedSize || 0)})
                                                            </span>
                                                        </div>
                                                        {file.uploadError && (
                                                            <div className="upload-error">
                                                                {file.uploadError}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="compression-status">
                                                        {file.isCompressing ? (
                                                            <span>压缩中...</span>
                                                        ) : (
                                                            <span>等待压缩</span>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                className="remove-file"
                                                onClick={() => handleRemoveFile(index)}
                                                disabled={file.isUploading}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="upload-actions">
                                <button
                                    className={`upload-button ${areAllFilesCompressed && !isUploading ? 'enabled' : 'disabled'}`}
                                    disabled={!areAllFilesCompressed || isUploading}
                                    onClick={handleUpload}
                                >
                                    <FiUploadCloud />
                                    {isUploading ? '上传中...' : `上传图片 (${uploadFiles.filter(f => f.isCompressed).length}/${uploadFiles.length})`}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
});

export default UploadModal;