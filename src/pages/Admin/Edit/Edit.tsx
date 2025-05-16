import ImageSelectorModal from '@/components/ImageSelectorModal';
import {
    BlogCategory,
    BlogTag,
    GalleryImage,
    UpdateOrAddBlogRequest,
    getAllTagsAndCategories,
    getBlogDataForEdit,
    getImageUrl,
    updateOrAddBlog
} from '@/services/adminService';
import { ContentType, FileType, getPreSignUrl, uploadToOSS } from '@/services/ossService';
import { marked } from 'marked';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiAlertCircle, FiArrowUp, FiEye, FiImage, FiLoader, FiPlus, FiSave, FiX } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import './Edit.scss';

/**
 * marked配置选项
 */
const options = {
    breaks: true,  // 支持换行符变为<br>标签
    gfm: true      // 支持GitHub风格的Markdown
};

/**
 * 表单验证错误类型接口
 */
interface ValidationErrors {
    [key: string]: string;
}

/**
 * 博客草稿数据结构接口
 */
interface BlogDraft {
    blog_id?: string | null; // 可选字段，用于区分编辑现有文章和新建文章
    title: string;
    intro: string;
    content: string;
    category: BlogCategory | null;
    tags: BlogTag[];
    isTop: boolean;
    isPublic: boolean;
    lastSaved: number; // 时间戳
    blogImage?: GalleryImage | null; // 文章封面图
}

// 常量定义
const CACHE_KEY = 'blog_draft'; // 缓存键
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 缓存过期时间 (24小时)
const DEBOUNCE_DELAY = 300; // 防抖延迟时间 (毫秒)

/**
 * 防抖函数钩子
 * 给定一个函数和延迟时间，返回一个防抖版本的函数
 * 
 * @param fn 需要防抖的函数
 * @param delay 延迟时间(毫秒)
 * @returns 防抖处理后的函数
 */
function useDebounce<T extends (...args: unknown[]) => unknown>(
    fn: T,
    delay: number
): (...args: Parameters<T>) => void {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const debouncedFn = useCallback(
        (...args: Parameters<T>) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                fn(...args);
            }, delay);
        },
        [fn, delay]
    );

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return debouncedFn;
}

/**
 * 文章编辑页面组件
 * 提供文章创建和编辑功能，支持Markdown编辑、预览、标签和分类管理等
 */
const Edit: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const blogId = new URLSearchParams(location.search).get('blog_id');
    const fromCache = new URLSearchParams(location.search).get('cache') === 'true';
    const isEditMode = !!blogId;

    // 缓存相关状态
    const [lastSavedTime, setLastSavedTime] = useState<string>('');
    const [showCachePrompt, setShowCachePrompt] = useState<boolean>(false);

    // 文章信息状态
    const [title, setTitle] = useState<string>('');
    const [intro, setIntro] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [parsedContent, setParsedContent] = useState<string>('');
    const [isTop, setIsTop] = useState<boolean>(false);
    const [isPublic, setIsPublic] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);

    // 分类相关状态
    const [category, setCategory] = useState<BlogCategory | null>(null);
    const [categoryInput, setCategoryInput] = useState<string>('');
    const [availableCategories, setAvailableCategories] = useState<BlogCategory[]>([]);

    // 标签相关状态
    const [tags, setTags] = useState<BlogTag[]>([]);
    const [tagInput, setTagInput] = useState<string>('');
    const [availableTags, setAvailableTags] = useState<BlogTag[]>([]);

    // 错误状态
    const [errors, setErrors] = useState<ValidationErrors>({});
    const [submitLoading, setSubmitLoading] = useState<boolean>(false);

    // 图片库相关状态
    const [showImageGallery, setShowImageGallery] = useState<boolean>(false);
    const [blogImage, setBlogImage] = useState<GalleryImage | null>(null);
    const [showArticleImageSelector, setShowArticleImageSelector] = useState<boolean>(false);

    // 自动保存相关状态和引用
    const [showAutoSaveNotification, setShowAutoSaveNotification] = useState<boolean>(false);
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const hasDataChangedRef = useRef<boolean>(false);

    // DOM元素引用
    const tagInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    /**
     * 保存草稿到本地缓存
     * 将当前编辑状态保存到localStorage，包含文章内容、标签、分类等信息
     */
    const saveDraftToCache = useCallback(() => {
        const draftData: BlogDraft = {
            title,
            intro,
            content,
            category,
            tags,
            isTop,
            isPublic,
            lastSaved: Date.now(),
            blogImage
        };

        // 如果是编辑模式，添加blog_id
        if (isEditMode && blogId) {
            draftData.blog_id = blogId;
        }

        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify(draftData));

            // 更新最后保存时间
            setLastSavedTime(new Date().toLocaleTimeString());

            // 显示自动保存通知
            setShowAutoSaveNotification(true);
            setTimeout(() => setShowAutoSaveNotification(false), 3000);

            // 重置数据变更标志
            hasDataChangedRef.current = false;
        } catch (error) {
            // 缓存保存失败，但不影响主要功能，仅记录错误
        }
    }, [blogId, category, content, intro, isEditMode, isPublic, isTop, tags, title, blogImage]);

    /**
     * 防抖后的保存草稿函数
     * 延迟执行保存，减少频繁保存操作
     */
    const debouncedSaveDraft = useDebounce(saveDraftToCache, DEBOUNCE_DELAY);

    /**
     * 标记内容已更改
     * 设置内容变更标志并触发防抖保存
     */
    const markContentChanged = useCallback(() => {
        hasDataChangedRef.current = true;
        debouncedSaveDraft();
    }, [debouncedSaveDraft]);

    /**
     * 从本地缓存中获取草稿
     * 检索并解析本地存储的草稿数据，处理过期检查
     * 
     * @returns 缓存的草稿数据或null
     */
    const loadDraftFromCache = useCallback((): BlogDraft | null => {
        try {
            const cachedData = localStorage.getItem(CACHE_KEY);
            if (!cachedData) {
                return null;
            }

            const draftData = JSON.parse(cachedData) as BlogDraft;

            // 检查缓存是否过期（24小时）
            const now = Date.now();
            if (now - draftData.lastSaved > CACHE_EXPIRATION) {
                // 缓存已过期，清除并返回null
                localStorage.removeItem(CACHE_KEY);
                return null;
            }

            return draftData;
        } catch (error) {
            // 加载缓存失败，返回null
            return null;
        }
    }, []);

    /**
     * 清除本地缓存
     * 删除localStorage中的草稿数据并重置相关状态
     */
    const clearCache = useCallback(() => {
        try {
            localStorage.removeItem(CACHE_KEY);
            setShowCachePrompt(false);
            setLastSavedTime('');
        } catch (error) {
            // 清除缓存失败，但不影响主要功能
        }
    }, []);

    /**
     * 加载缓存数据到表单
     * 将草稿数据填充到表单各字段中
     * 
     * @param draftData 要加载的草稿数据
     */
    const loadCacheDataToForm = useCallback((draftData: BlogDraft) => {
        setTitle(draftData.title);
        setIntro(draftData.intro);
        setContent(draftData.content);
        setCategory(draftData.category);
        setTags(draftData.tags);
        setIsTop(draftData.isTop);
        setIsPublic(draftData.isPublic);

        // 恢复文章封面图
        if (draftData.blogImage) {
            setBlogImage(draftData.blogImage);
        }

        // 更新最后保存时间
        const date = new Date(draftData.lastSaved);
        setLastSavedTime(date.toLocaleString());
    }, []);

    // 初始页面加载时检查缓存数据
    useEffect(() => {
        // 如果URL中已包含cache=true参数，表示已经是从缓存加载，不需要再处理
        if (fromCache) {
            return;
        }

        const cachedDraft = loadDraftFromCache();
        if (!cachedDraft) {
            return;
        }

        // 无论缓存是否包含blog_id，都显示恢复提示，不自动重定向
        setShowCachePrompt(true);

        // 更新最后保存时间显示
        const date = new Date(cachedDraft.lastSaved);
        setLastSavedTime(date.toLocaleString());
    }, [loadDraftFromCache, fromCache]);

    /**
     * 从缓存中恢复数据
     * 获取并填充草稿数据，如有必要重定向到正确的编辑页面
     */
    const restoreFromCache = useCallback(() => {
        const cachedDraft = loadDraftFromCache();
        if (!cachedDraft) return;

        // 如果缓存中有blog_id，重定向到编辑页面
        if (cachedDraft.blog_id) {
            // 重定向到带有cache=true参数的URL，表示需要从缓存加载数据
            navigate(`/admin/edit?blog_id=${cachedDraft.blog_id}&cache=true`, { replace: true });
            return;
        }

        // 如果没有blog_id，直接加载缓存数据
        loadCacheDataToForm(cachedDraft);
        setShowCachePrompt(false);
    }, [loadDraftFromCache, loadCacheDataToForm, navigate]);

    /**
     * 丢弃缓存
     * 清除本地存储的草稿数据
     */
    const discardCache = useCallback(() => {
        clearCache();
    }, [clearCache]);

    /**
     * 处理图片库显示切换
     * 控制图片选择器模态框的显示与隐藏
     */
    const handleImageGalleryToggle = useCallback(() => {
        setShowImageGallery(prev => !prev);
    }, []);

    /**
     * 将图片插入到编辑器
     * 在光标位置插入Markdown格式的图片链接
     * 
     * @param image 要插入的图片对象
     */
    const handleImageInsert = useCallback((image: GalleryImage) => {
        // 在光标位置或文本末尾插入图片Markdown语法
        const textarea = textareaRef.current;
        if (textarea) {
            const imageMarkdown = `![${image.img_name}](${getImageUrl(image.img_id)})\n`;

            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;

            // 更新内容，在光标位置插入图片
            const newContent = content.substring(0, start) + imageMarkdown + content.substring(end);
            setContent(newContent);

            // 更新光标位置到插入内容之后
            setTimeout(() => {
                textarea.focus();
                textarea.selectionStart = start + imageMarkdown.length;
                textarea.selectionEnd = start + imageMarkdown.length;
            }, 0);

            markContentChanged();
        }
    }, [content, markContentChanged]);

    // 设置自动保存定时器
    useEffect(() => {
        // 每30秒自动保存一次
        autoSaveTimerRef.current = setInterval(() => {
            if (hasDataChangedRef.current) {
                saveDraftToCache();
            }
        }, 30000);

        return () => {
            if (autoSaveTimerRef.current) {
                clearInterval(autoSaveTimerRef.current);
            }
        };
    }, [saveDraftToCache]);

    // 检查页面离开
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasDataChangedRef.current) {
                // 阻止默认行为
                e.preventDefault();
                // 现代浏览器需要通过 returnValue 设置提示信息
                const message = '您有未保存的更改，确定要离开吗？';
                e.returnValue = message; // 保留以兼容旧浏览器
                return message; // 返回值用于现代浏览器
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, []);

    // 获取标签和分类数据
    useEffect(() => {
        const fetchTagsAndCategories = async () => {
            try {
                const response = await getAllTagsAndCategories();
                if (response.code === 200) {
                    setAvailableCategories(response.data.categories);
                    setAvailableTags(response.data.tags);
                }
            } catch (error) {
                console.error('获取标签和分类数据失败:', error);
            }
        };

        fetchTagsAndCategories();
    }, []);

    // 处理数据加载逻辑
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);

            try {
                // 如果是从缓存加载的请求
                if (fromCache) {
                    const cachedDraft = loadDraftFromCache();

                    if (cachedDraft) {
                        // 加载缓存数据到表单
                        loadCacheDataToForm(cachedDraft);

                        // 如果是编辑模式并且cache=true，加载完成后清除缓存
                        if (isEditMode) {
                            clearCache();
                        }
                    } else {
                        await loadDataFromServer();
                    }
                }
                // 如果是编辑模式且不是从缓存加载，从服务器获取数据
                else if (isEditMode && blogId) {
                    await loadDataFromServer();
                }
            } catch (error) {
                console.error('加载数据失败:', error);
                setErrors(prev => ({ ...prev, submit: '加载数据失败，请稍后重试' }));
            } finally {
                setLoading(false);
            }
        };

        const loadDataFromServer = async () => {
            if (!blogId) return;

            const response = await getBlogDataForEdit(blogId);

            if (response.code === 200) {
                const { blog_data, content_url } = response.data;

                // 设置基本信息
                setTitle(blog_data.blog_title || '');
                setIntro(blog_data.blog_brief || '');
                setCategory(blog_data.category || null);
                setTags(blog_data.tags || []);

                // 设置文章状态
                setIsTop(!!blog_data.blog_is_top);
                setIsPublic(blog_data.blog_state !== false);
                if (blog_data.blog_is_top !== undefined) {
                    setIsTop(blog_data.blog_is_top);
                }
                if (blog_data.blog_state !== undefined) {
                    setIsPublic(blog_data.blog_state);
                }

                // 设置文章封面图（如果有）
                if (blog_data.blog_image) {
                    setBlogImage(blog_data.blog_image);
                }
                // 如果有 blog_image_id 但没有 blog_image 对象
                else if (blog_data.blog_image_id) {
                    // 创建一个临时的 GalleryImage 对象
                    const imageData: GalleryImage = {
                        img_id: blog_data.blog_image_id,
                        img_name: '文章封面图',
                        img_type: 'webp',
                        create_time: ''
                    };
                    setBlogImage(imageData);
                }

                // 获取文章内容
                try {
                    const contentResponse = await fetch(content_url);
                    if (contentResponse.ok) {
                        const markdownContent = await contentResponse.text();
                        setContent(markdownContent);
                    } else {
                        console.error('获取文章内容失败:', contentResponse.status, contentResponse.statusText);
                        setErrors(prev => ({ ...prev, content: '无法加载文章内容' }));
                    }
                } catch (contentError) {
                    console.error('获取文章内容错误:', contentError);
                    setErrors(prev => ({ ...prev, content: '无法加载文章内容' }));
                }
            } else {
                setErrors(prev => ({ ...prev, submit: `获取博客数据失败: ${response.msg}` }));
            }
        };

        loadData();
    }, [blogId, isEditMode, fromCache, loadDraftFromCache, loadCacheDataToForm, clearCache]);

    /**
     * 清除指定字段的错误
     * @param field 要清除错误的字段名
     */
    const clearError = useCallback((field: string) => {
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    }, [errors]);

    /**
     * 验证表单
     * 检查必填字段并设置错误信息
     * @returns 表单是否有效
     */
    const validateForm = useCallback((): boolean => {
        const newErrors: ValidationErrors = {};

        if (!title.trim()) {
            newErrors.title = '文章标题不能为空';
        }

        if (!category) {
            newErrors.category = '请选择或输入文章分类';
        }

        if (!content.trim()) {
            newErrors.content = '文章内容不能为空';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [title, category, content]);

    // 自动调整文本区域高度
    useEffect(() => {
        const adjustTextareaHeight = () => {
            const textarea = textareaRef.current;
            if (textarea) {
                // 重置高度以便能够正确计算
                textarea.style.height = 'auto';

                // 使用视口高度的85%
                const viewportHeight = window.innerHeight * 0.85;
                textarea.style.height = `${viewportHeight}px`;

                // 同步预览区域滚动高度
                if (previewRef.current) {
                    previewRef.current.style.height = `${viewportHeight}px`;
                }
            }
        };

        adjustTextareaHeight();

        // 监听窗口大小改变，重新调整高度
        window.addEventListener('resize', adjustTextareaHeight);

        return () => {
            window.removeEventListener('resize', adjustTextareaHeight);
        };
    }, [content]);

    /**
     * 切换预览模式 
     * 仅在移动视图下切换预览模式
     */
    const togglePreviewMode = useCallback(() => {
        // 只在移动视图下切换预览模式
        if (window.innerWidth <= 1800) {
            setIsPreviewMode(!isPreviewMode);
        }
    }, [isPreviewMode]);

    // 检测窗口大小变化，处理响应式行为
    useEffect(() => {
        const handleResize = () => {
            // 如果从小屏幕变为大屏幕，且在预览模式，切换回编辑模式
            if (window.innerWidth > 1800 && isPreviewMode) {
                setIsPreviewMode(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [isPreviewMode]);

    // 渲染Markdown内容
    useEffect(() => {
        const renderMarkdown = async () => {
            if (content) {
                try {
                    const html = await marked(content, options);
                    setParsedContent(html);
                } catch (error) {
                    console.error('Error parsing markdown:', error);
                    setParsedContent('<p>Error parsing markdown content</p>');
                }
            } else {
                setParsedContent('');
            }
        };

        // 使用 .catch 捕获异常
        renderMarkdown().catch((error) => {
            console.error('Unhandled error in renderMarkdown:', error);
        });
    }, [content]);

    /**
     * 保存文章的处理函数
     * 验证表单、上传内容到OSS并保存博客数据
     */
    const handleSave = useCallback(async () => {
        if (!validateForm()) {
            return;
        }

        // 计算文章的字数
        const wordsCount = content.length;

        try {
            setSubmitLoading(true);

            // 1. 获取预签名URL
            const preSignResponse = await getPreSignUrl(title, FileType.MARKDOWN);

            if (preSignResponse.code !== 200 || !preSignResponse.data.pre_sign_put_url) {
                setErrors({ submit: `获取上传URL失败: ${preSignResponse.msg}` });
                setSubmitLoading(false);
                return;
            }

            // 2. 使用预签名URL上传文章内容到OSS
            try {
                const uploadSuccess = await uploadToOSS(
                    preSignResponse.data.pre_sign_put_url,
                    content,
                    ContentType.MARKDOWN
                );
                if (!uploadSuccess) {
                    setErrors({ submit: '上传到OSS失败' });
                    setSubmitLoading(false);
                    return;
                }
            } catch (uploadError) {
                setErrors({
                    submit: uploadError instanceof Error
                        ? `上传失败: ${uploadError.message}`
                        : '上传文章内容失败，请稍后重试'
                });
                setSubmitLoading(false);
                return;
            }

            // 3. 上传成功后，提交博客数据
            // 准备请求数据
            const requestData: UpdateOrAddBlogRequest = {
                blog_id: isEditMode && blogId ? blogId : '', // 如果是编辑模式，使用现有ID
                blog_title: title,
                blog_brief: intro,
                blog_state: isPublic,
                blog_is_top: isTop,
                blog_words_num: wordsCount,
                // 处理分类信息
                category_id: category?.category_id && !category.category_id.startsWith('cat_')
                    ? category.category_id
                    : '', // 如果是新分类或临时ID，则category_id为空
                category: {
                    category_name: category?.category_name || ''
                },
                // 处理标签信息
                tags: tags.map(tag => {
                    // 如果是从选择区选择的标签（有效的tag_id且不是临时ID）
                    if (tag.tag_id && !tag.tag_id.startsWith('tag_')) {
                        return {
                            tag_id: tag.tag_id,
                            tag_name: tag.tag_name
                        };
                    }
                    // 如果是新增的标签，只传name
                    return {
                        tag_name: tag.tag_name
                    };
                })
            };

            // 添加封面图ID（如果有）
            if (blogImage && blogImage.img_id) {
                requestData.blog_image_id = blogImage.img_id;
            }

            const response = await updateOrAddBlog(requestData);

            if (response.code === 200) {
                // 保存成功后清除缓存
                clearCache();
                // 上传成功，跳转回文章管理页面
                navigate('/admin');
            } else {
                setErrors({ submit: `保存失败: ${response.msg}` });
            }
        } catch (error) {
            setErrors({ submit: '保存文章时发生错误，请稍后重试' });
        } finally {
            setSubmitLoading(false);
        }
    }, [validateForm, content, title, blogId, intro, isPublic, isTop, category, tags, blogImage, isEditMode, clearCache, navigate]);

    /**
     * 手动保存草稿
     */
    const handleSaveDraft = useCallback(() => {
        saveDraftToCache();
    }, [saveDraftToCache]);

    /**
     * 分类输入框变化处理
     * @param e 输入框变化事件
     */
    const handleCategoryInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCategoryInput(e.target.value);
        clearError('category');
        markContentChanged();
    }, [clearError, markContentChanged]);

    /**
     * 分类输入框按键处理
     * 处理回车键创建或选择分类
     * @param e 键盘事件
     */
    const handleCategoryInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && categoryInput.trim()) {
            e.preventDefault();
            // 先尝试在已有分类中查找
            const matchedCategory = availableCategories.find(
                cat => cat.category_name.toLowerCase() === categoryInput.trim().toLowerCase()
            );

            if (matchedCategory) {
                // 如果找到匹配的分类，使用已有的分类
                setCategory(matchedCategory);
            } else {
                // 如果没有找到匹配的分类，创建新的分类
                const newCategory: BlogCategory = {
                    category_id: `cat_${Date.now()}`, // 临时ID
                    category_name: categoryInput.trim()
                };
                setCategory(newCategory);
            }
            setCategoryInput('');
            clearError('category');
            markContentChanged();
        }
    }, [categoryInput, availableCategories, clearError, markContentChanged]);

    /**
     * 分类选择处理
     * @param selectedCategory 选择的分类
     */
    const handleCategorySelect = useCallback((selectedCategory: BlogCategory) => {
        setCategory(selectedCategory);
        setCategoryInput('');
        clearError('category');
        markContentChanged();
    }, [clearError, markContentChanged]);

    /**
     * 标签输入框变化处理
     * @param e 输入框变化事件
     */
    const handleTagInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTagInput(e.target.value);
        markContentChanged();
    }, [markContentChanged]);

    /**
     * 添加标签到选中列表
     * @param tag 要添加的标签
     */
    const addTag = useCallback((tag: BlogTag) => {
        if (tag && !tags.some(t => t.tag_id === tag.tag_id)) {
            setTags(prevTags => [...prevTags, tag]);
            markContentChanged();
        }
        setTagInput('');
        tagInputRef.current?.focus();
    }, [tags, markContentChanged]);

    /**
     * 标签输入框按键处理
     * 处理回车键创建或选择标签
     * @param e 键盘事件
     */
    const handleTagInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            // 先尝试在已有标签中查找
            const matchedTag = availableTags.find(
                tag => tag.tag_name.toLowerCase() === tagInput.trim().toLowerCase()
            );

            if (matchedTag) {
                // 如果找到匹配的标签，使用已有的标签
                addTag(matchedTag);
            } else {
                // 如果没有找到匹配的标签，创建新的标签
                const newTag: BlogTag = {
                    tag_id: `tag_${Date.now()}`, // 临时ID
                    tag_name: tagInput.trim()
                };
                addTag(newTag);
            }
            // 清空输入框
            setTagInput('');
            markContentChanged();
        }
    }, [tagInput, availableTags, addTag, markContentChanged]);

    /**
     * 移除已选标签
     * @param tagToRemove 要移除的标签
     */
    const removeTag = useCallback((tagToRemove: BlogTag) => {
        setTags(prevTags => prevTags.filter(tag => tag.tag_id !== tagToRemove.tag_id));
        markContentChanged();
    }, [markContentChanged]);

    /**
     * 从可用标签列表中选择标签
     * @param selectedTag 选择的标签
     */
    const handleTagSelect = useCallback((selectedTag: BlogTag) => {
        if (!tags.some(t => t.tag_id === selectedTag.tag_id)) {
            setTags(prevTags => [...prevTags, selectedTag]);
            markContentChanged();
        }
    }, [tags, markContentChanged]);

    /**
     * 文章内容变化处理
     * @param e 文本区域变化事件
     */
    const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        clearError('content');
        markContentChanged();
    }, [clearError, markContentChanged]);

    /**
     * 标题变化处理
     * @param e 输入框变化事件
     */
    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        clearError('title');
        markContentChanged();
    }, [clearError, markContentChanged]);

    /**
     * 处理文章封面图选择
     * @param image 选择的图片对象
     */
    const handleArticleImageSelect = useCallback((image: GalleryImage) => {
        setBlogImage(image);
        markContentChanged();
    }, [markContentChanged]);

    /**
     * 打开文章封面图选择器
     */
    const openArticleImageSelector = useCallback(() => {
        setShowArticleImageSelector(true);
    }, []);

    return (
        <div className="edit-page">
            <div className="edit-container">
                <div className="edit-header">
                    <h1>{isEditMode ? (title ? `编辑 "${title}" 文章` : '编辑文章') : '新建文章'}</h1>
                    <div className="header-actions">
                        {lastSavedTime && (
                            <div className="last-saved-info">
                                上次保存: {lastSavedTime}
                            </div>
                        )}
                        <button
                            className="draft-button"
                            onClick={handleSaveDraft}
                        >
                            <FiSave /> 保存草稿
                        </button>
                        <button
                            className="save-button"
                            onClick={handleSave}
                            disabled={submitLoading || loading}
                        >
                            {submitLoading ? '保存中...' : '保存文章'}
                        </button>
                    </div>
                </div>

                {showCachePrompt && (
                    <div className="cache-prompt">
                        <FiAlertCircle className="alert-icon" />
                        <span>发现未保存的草稿（{lastSavedTime}），是否恢复？</span>
                        <div className="cache-actions">
                            <button onClick={restoreFromCache} className="restore-button">恢复草稿</button>
                            <button onClick={discardCache} className="discard-button">丢弃草稿</button>
                        </div>
                    </div>
                )}

                {showAutoSaveNotification && (
                    <div className="auto-save-spinner">
                        <FiLoader className="spinner-icon" />
                    </div>
                )}

                {errors.submit && (
                    <div className="error-message submit-error">
                        {errors.submit}
                    </div>
                )}

                {loading ? (
                    <div className="loading-container">正在加载文章数据...</div>
                ) : (
                    <div className="edit-main">
                        {/* 文章标题编辑 */}
                        <div className="edit-section">
                            <label htmlFor="title" className="section-label">文章标题</label>
                            <input
                                id="title"
                                type="text"
                                className={`title-input ${errors.title ? 'error' : ''}`}
                                value={title}
                                onChange={handleTitleChange}
                                placeholder="请输入文章标题"
                            />
                            {errors.title && (
                                <div className="error-message">
                                    {errors.title}
                                </div>
                            )}
                        </div>

                        {/* 文章简介编辑 */}
                        <div className="edit-section">
                            <div className="intro-with-image">
                                <div className="intro-input-container">
                                    <label htmlFor="intro" className="section-label">文章简介</label>
                                    <textarea
                                        id="intro"
                                        className="intro-input"
                                        value={intro}
                                        onChange={(e) => {
                                            setIntro(e.target.value);
                                            markContentChanged();
                                        }}
                                        placeholder="请输入文章简介"
                                    ></textarea>
                                </div>
                                <div className="article-image-container">
                                    <label className="section-label">文章封面图</label>
                                    <div
                                        className="article-image-preview"
                                        onClick={openArticleImageSelector}
                                    >
                                        {blogImage ? (
                                            <img
                                                src={getImageUrl(blogImage.img_id)}
                                                alt="文章封面图"
                                            />
                                        ) : (
                                            <div className="image-placeholder">
                                                <FiImage />
                                                <span>点击添加封面图</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 分类编辑 */}
                        <div className="edit-section">
                            <label htmlFor="category" className="section-label">文章分类</label>
                            <div className="category-container">
                                <div className="category-input-container">
                                    <input
                                        id="category"
                                        type="text"
                                        className={`category-input ${errors.category ? 'error' : ''}`}
                                        value={categoryInput}
                                        onChange={handleCategoryInputChange}
                                        onKeyDown={handleCategoryInputKeyDown}
                                        placeholder={category ? `当前分类: ${category.category_name}` : "输入分类名称并回车，或从下方选择"}
                                    />
                                    {category && (
                                        <div className="selected-category">
                                            <span>{category.category_name}</span>
                                            <button className="remove-btn" onClick={() => {
                                                setCategory(null);
                                                setErrors(prev => ({ ...prev, category: '请选择或输入文章分类' }));
                                                markContentChanged();
                                            }}>
                                                <FiX />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {errors.category && (
                                    <div className="error-message">
                                        {errors.category}
                                    </div>
                                )}

                                <div className="category-options">
                                    {availableCategories.map((cat) => (
                                        <button
                                            key={cat.category_id}
                                            className={`category-option ${cat.category_id === category?.category_id ? 'selected' : ''}`}
                                            onClick={() => handleCategorySelect(cat)}
                                        >
                                            {cat.category_name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* 标签编辑 */}
                        <div className="edit-section">
                            <label htmlFor="tags" className="section-label">文章标签</label>
                            <div className="tags-container">
                                <div className="tags-input-container">
                                    <div className="tags-input-wrapper">
                                        {tags.map((tag) => (
                                            <div key={tag.tag_id} className="tag-item">
                                                <span>{tag.tag_name}</span>
                                                <button className="remove-btn" onClick={() => removeTag(tag)}>
                                                    <FiX />
                                                </button>
                                            </div>
                                        ))}
                                        <input
                                            id="tags"
                                            ref={tagInputRef}
                                            type="text"
                                            className="tags-input"
                                            value={tagInput}
                                            onChange={handleTagInputChange}
                                            onKeyDown={handleTagInputKeyDown}
                                            placeholder={tags.length ? "" : "输入标签名称并回车添加，或从下方选择"}
                                        />
                                    </div>
                                    {tagInput && (
                                        <button
                                            className="add-tag-btn"
                                            onClick={() => {
                                                // 先尝试在已有标签中查找
                                                const matchedTag = availableTags.find(
                                                    tag => tag.tag_name.toLowerCase() === tagInput.trim().toLowerCase()
                                                );

                                                if (matchedTag) {
                                                    // 如果找到匹配的标签，使用已有的标签
                                                    addTag(matchedTag);
                                                } else {
                                                    // 如果没有找到匹配的标签，创建新的标签
                                                    const newTag: BlogTag = {
                                                        tag_id: `tag_${Date.now()}`, // 临时ID
                                                        tag_name: tagInput.trim()
                                                    };
                                                    addTag(newTag);
                                                }
                                            }}
                                        >
                                            <FiPlus />
                                        </button>
                                    )}
                                </div>

                                <div className="tags-options">
                                    {availableTags
                                        .filter(tag => !tags.some(t => t.tag_id === tag.tag_id))
                                        .map((tag) => (
                                            <button
                                                key={tag.tag_id}
                                                className="tag-option"
                                                onClick={() => handleTagSelect(tag)}
                                            >
                                                {tag.tag_name}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        </div>

                        {/* 文章设置 */}
                        <div className="edit-section settings-section">
                            <div className="toggle-setting">
                                <label htmlFor="isTop" className="toggle-label">
                                    <FiArrowUp className="toggle-icon" />
                                    <span>是否置顶</span>
                                </label>
                                <div className="toggle-switch-container">
                                    <input
                                        id="isTop"
                                        type="checkbox"
                                        className="toggle-switch"
                                        checked={isTop}
                                        onChange={() => {
                                            setIsTop(!isTop);
                                            markContentChanged();
                                        }}
                                    />
                                    <label htmlFor="isTop" className="toggle-switch-label"></label>
                                </div>
                            </div>

                            <div className="toggle-setting">
                                <label htmlFor="isPublic" className="toggle-label">
                                    <FiEye className="toggle-icon" />
                                    <span>是否公开</span>
                                </label>
                                <div className="toggle-switch-container">
                                    <input
                                        id="isPublic"
                                        type="checkbox"
                                        className="toggle-switch"
                                        checked={isPublic}
                                        onChange={() => {
                                            setIsPublic(!isPublic);
                                            markContentChanged();
                                        }}
                                    />
                                    <label htmlFor="isPublic" className="toggle-switch-label"></label>
                                </div>
                            </div>
                        </div>

                        {/* Markdown编辑器 */}
                        <div className="edit-section markdown-section">
                            <div className="content-header">
                                <label className="section-label">文章内容</label>
                                {errors.content && (
                                    <div className="content-error-message">
                                        {errors.content}
                                    </div>
                                )}
                            </div>
                            <div className="markdown-editor-container">
                                <div className={`markdown-editor ${isPreviewMode ? 'hidden' : ''}`} style={{ width: '100%' }}>
                                    <div className="markdown-edit-header">
                                        编辑
                                        <div className="editor-actions">
                                            <button
                                                className="editor-img-btn"
                                                onClick={handleImageGalleryToggle}
                                                title="插入图片"
                                            >
                                                <FiImage className="action-icon" />
                                            </button>
                                            <button
                                                className="preview-toggle-btn"
                                                onClick={togglePreviewMode}
                                            >
                                                <FiEye className="toggle-icon" />
                                                <span>预览</span>
                                            </button>
                                        </div>
                                    </div>
                                    <textarea
                                        className={`markdown-input ${errors.content ? 'error' : ''}`}
                                        value={content}
                                        onChange={handleContentChange}
                                        ref={textareaRef}
                                        placeholder="在此输入Markdown格式的文章内容..."
                                    ></textarea>
                                </div>

                                <div className={`markdown-preview ${isPreviewMode ? 'visible' : ''}`}>
                                    <div className="markdown-edit-header">
                                        预览
                                        <div className="editor-actions">
                                            <button
                                                className="preview-toggle-btn"
                                                onClick={togglePreviewMode}
                                            >
                                                <span>返回编辑</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div
                                        className="preview-content"
                                        ref={previewRef}
                                        dangerouslySetInnerHTML={{ __html: parsedContent }}
                                        style={{ minHeight: '85vh' }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 使用ImageSelectorModal组件 */}
            <ImageSelectorModal
                isOpen={showImageGallery}
                onClose={() => setShowImageGallery(false)}
                onImageInsert={handleImageInsert}
                mode="editor"
                usageType="avatar" // 此字段在editor模式下不重要，但需要提供一个值
            />

            {/* 文章封面图选择器 */}
            <ImageSelectorModal
                isOpen={showArticleImageSelector}
                onClose={() => setShowArticleImageSelector(false)}
                onImageSelect={handleArticleImageSelect}
                mode="article"
                usageType="avatar" // 此字段在article模式下不重要，但需要提供一个值
            />
        </div>
    );
};

export default Edit;