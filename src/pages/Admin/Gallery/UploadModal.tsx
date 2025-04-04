import React, { useState, useEffect, useRef } from 'react';
import { FiLoader, FiCheckCircle, FiUploadCloud } from 'react-icons/fi';
import { createPortal } from 'react-dom';
import imageCompression from 'browser-image-compression';
import './Gallery.scss';
import { getPreSignUrl, uploadToOSS, FileType, ContentType } from '@/services/ossService';
import { addGalleryImages, AddImagesRequest } from '@/services/adminService';

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
    isUploading?: boolean; // 是否正在上传
    isUploaded?: boolean; // 是否已上传完成
    uploadProgress?: number; // 上传进度 0-100
    uploadError?: string; // 上传错误信息
}

// --- 文件上传模态框组件 ---
interface UploadModalProps {
    visible: boolean;
    onClose: () => void;
    onImagesUploaded?: (images: File[]) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ visible, onClose, onImagesUploaded }) => {
    const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [areAllFilesCompressed, setAreAllFilesCompressed] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
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

    // 上传图片到OSS
    const uploadImageToOSS = async (file: UploadFile, index: number): Promise<{ success: boolean, fileName: string } | false> => {
        try {
            if (!file.compressedFile) {
                console.error(`文件 ${file.name} 没有压缩后的文件对象`);
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
            let fileName = file.name;

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
                throw new Error(`获取预签名URL失败: ${preSignUrlResponse.msg}`);
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
            console.log(`上传文件到OSS: ${uploadFileName}`);
            const uploadSuccess = await uploadToOSS(
                preSignUrl,
                fileContent,
                ContentType.WEBP
            );

            if (!uploadSuccess) {
                throw new Error(`上传到OSS失败`);
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

            console.log(`文件 ${uploadFileName} 上传成功`);
            return { 
                success: true, 
                fileName: uploadFileName 
            };

        } catch (error) {
            console.error(`上传文件 ${file.name} 失败:`, error);

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
    const handleUpload = async () => {
        const compressedFiles = uploadFiles.filter(f => f.isCompressed && f.compressedFile);

        if (compressedFiles.length === 0) {
            console.warn('没有压缩完成的文件可上传');
            return;
        }

        console.log(`开始上传 ${compressedFiles.length} 张图片到OSS`);
        setIsUploading(true);

        const uploadedFiles: File[] = [];
        const uploadedImageInfo: { img_name: string; img_type: string }[] = [];

        // 依次上传每张图片
        for (let i = 0; i < compressedFiles.length; i++) {
            const file = compressedFiles[i];
            const fileIndex = uploadFiles.findIndex(f => f === file);

            if (fileIndex === -1) {
                console.error(`找不到文件索引: ${file.name}`);
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
                console.error(`上传文件 ${file.name} 失败:`, error);
            }
        }

        if (uploadedImageInfo.length > 0) {
            try {
                // 将上传的图片信息提交到API
                console.log('添加图片到图库，数据:', uploadedImageInfo);
                
                const addRequest: AddImagesRequest = {
                    imgs: uploadedImageInfo
                };
                
                const response = await addGalleryImages(addRequest);
                
                if (response.code === 200) {
                    console.log('添加图片到图库成功');
                } else {
                    console.error('添加图片到图库失败:', response.msg);
                    alert(`添加图片到图库失败: ${response.msg}`);
                }
            } catch (error) {
                console.error('API调用失败:', error);
                alert('添加图片到图库失败: ' + (error instanceof Error ? error.message : String(error)));
            }
        }

        setIsUploading(false);

        console.log(`上传完成，成功上传 ${uploadedFiles.length}/${compressedFiles.length} 张图片`);

        // 如果提供了回调函数，则调用它
        if (onImagesUploaded && uploadedFiles.length > 0) {
            onImagesUploaded(uploadedFiles);
        }
        
        // 清空上传列表
        setUploadFiles([]);

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
};

export default UploadModal; 