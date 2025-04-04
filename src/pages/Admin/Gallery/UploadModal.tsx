import React, { useState, useEffect, useRef } from 'react';
import { FiLoader, FiCheckCircle, FiUploadCloud } from 'react-icons/fi';
import { createPortal } from 'react-dom';
import imageCompression from 'browser-image-compression';
import './Gallery.scss';

// 添加上传文件接口
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
}

// --- 文件上传模态框组件 ---
interface UploadModalProps {
    visible: boolean;
    onClose: () => void;
    onImagesUploaded?: (images: File[]) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({visible, onClose, onImagesUploaded}) => {
    const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [areAllFilesCompressed, setAreAllFilesCompressed] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // 清理预览URL
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

    // 处理拖拽事件
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const validateFile = (file: File) => {
        const validTypes = ['image/webp', 'image/jpeg', 'image/jpg', 'image/png'];
        return validTypes.includes(file.type);
    };

    // 压缩图片 - 接收索引而不是ID
    const compressImage = async (file: UploadFile, fileIndex: number) => {
        console.log(`开始压缩图片: ${file.name}, 索引: ${fileIndex}`);

        try {
            // 更新压缩状态
            setUploadFiles(prev => {
                // 再次检查索引是否有效
                if (fileIndex >= prev.length) {
                    console.error(`压缩时索引无效: ${fileIndex}, 当前文件数: ${prev.length}`);
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
            console.log(`执行压缩: ${file.name}`);
            const compressedFile = await imageCompression(file.file, options);
            console.log(`压缩完成: ${file.name}, 从 ${file.originalSize} 减小到 ${compressedFile.size}`);

            // 更新完成状态
            setUploadFiles(prev => {
                // 再次检查索引是否有效
                if (fileIndex >= prev.length) {
                    console.error(`完成压缩后索引无效: ${fileIndex}, 当前文件数: ${prev.length}`);
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
            console.error(`压缩失败 ${file.name}:`, error);

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
    };

    // 处理多个文件的上传 - 完全重写
    const processFiles = async (files: FileList) => {
        console.log(`处理 ${files.length} 个文件`);
        const fileArray = Array.from(files);
        const validFiles = fileArray.filter(validateFile);

        if (validFiles.length === 0) {
            console.warn('没有有效的图片文件');
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
                    console.error(`准备压缩时索引无效: ${currentIndex}, 当前文件数: ${prev.length}`);
                    return prev;
                }

                // 确保文件对象存在
                console.log(`准备压缩文件: ${prev[currentIndex].name}, 索引: ${currentIndex}`);

                // 启动压缩 - 使用setTimeout确保在状态更新后执行
                setTimeout(() => {
                    compressImage(prev[currentIndex], currentIndex);
                }, 50);

                return prev;
            });

            // 为下一个文件添加延迟，避免同时启动多个压缩任务
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFiles(e.dataTransfer.files);
        }
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFiles(e.target.files);
        }
    };

    // 移除文件 - 使用索引
    const handleRemoveFile = (index: number) => {
        setUploadFiles(prev => {
            // 释放URL对象
            URL.revokeObjectURL(prev[index].preview);

            // 过滤掉指定索引的文件
            return prev.filter((_, i) => i !== index);
        });
    };

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

    // 处理上传按钮点击
    const handleUpload = () => {
        console.log('已完成压缩，可以上传:', uploadFiles.map(f => ({
            name: f.name,
            originalSize: formatFileSize(f.originalSize),
            compressedSize: f.compressedSize ? formatFileSize(f.compressedSize) : 'N/A',
            compressionRate: f.compressedSize ? getCompressionRate(f.originalSize, f.compressedSize) : 'N/A'
        })));

        // 如果提供了回调函数，则调用它
        if (onImagesUploaded) {
            const compressedFiles = uploadFiles
                .filter(f => f.isCompressed && f.compressedFile)
                .map(f => f.compressedFile as File);
            onImagesUploaded(compressedFiles);
        } else {
            // 这里只是前端功能演示，不实际调用后端接口
            alert('压缩完成！在实际项目中，这里会调用上传API');
        }

        // 关闭模态框
        onClose();
    };

    if (!visible) return null;

    return createPortal(
        <div className="upload-modal-overlay">
            <div className="upload-modal">
                <div className="upload-modal-header">
                    <h2>添加图片</h2>
                    <button className="close-button" onClick={onClose}>&times;</button>
                </div>
                <div className="upload-modal-body">
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
                            style={{display: 'none'}}
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
                                            <img src={file.preview} alt={file.name}/>
                                            {file.isCompressing && (
                                                <div className="compression-overlay">
                                                    <FiLoader className="compression-spinner"/>
                                                    <span>压缩中 {file.compressionProgress}%</span>
                                                    <div className="progress-bar-container">
                                                        <div
                                                            className="progress-bar"
                                                            style={{width: `${file.compressionProgress}%`}}
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
                                                            <FiCheckCircle/>
                                                            <span>已完成</span>
                                                        </div>
                                                        <div className="size-info">
                                                            <span>{formatFileSize(file.originalSize)}</span>
                                                            <span className="arrow">→</span>
                                                            <span>{formatFileSize(file.compressedSize || 0)}</span>
                                                            <span className="compression-rate">
                                                                (-{getCompressionRate(file.originalSize, file.compressedSize || 0)})
                                                            </span>
                                                        </div>
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
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="upload-actions">
                                <button
                                    className={`upload-button ${areAllFilesCompressed ? 'enabled' : 'disabled'}`}
                                    disabled={!areAllFilesCompressed}
                                    onClick={handleUpload}
                                >
                                    <FiUploadCloud/>
                                    上传图片 ({uploadFiles.filter(f => f.isCompressed).length}/{uploadFiles.length})
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

export default UploadModal; 