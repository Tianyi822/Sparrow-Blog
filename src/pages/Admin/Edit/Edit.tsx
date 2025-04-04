import {
    BlogCategory,
    BlogTag,
    UpdateOrAddBlogRequest,
    getAllTagsAndCategories,
    getBlogDataForEdit,
    updateOrAddBlog,
    GalleryImage
} from '@/services/adminService';
import { ContentType, FileType, getPreSignUrl, uploadToOSS } from '@/services/ossService';
import { marked } from 'marked';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FiArrowUp, FiEye, FiPlus, FiX, FiSave, FiAlertCircle, FiLoader, FiImage } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import './Edit.scss';
import { ImageGalleryModal } from './';

// 配置marked选项
const options = {
    breaks: true,  // 支持换行符变为<br>标签
    gfm: true      // 支持GitHub风格的Markdown
};

// 定义错误类型接口
interface ValidationErrors {
    [key: string]: string;
}

// 缓存数据结构接口
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
}

// 缓存键常量
const CACHE_KEY = 'blog_draft';
// 缓存过期时间 (24小时)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;
// 防抖延迟时间 (毫秒)
const DEBOUNCE_DELAY = 300;

// 防抖函数
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

// 文章编辑页面组件
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

    // 自动保存相关
    const [showAutoSaveNotification, setShowAutoSaveNotification] = useState<boolean>(false);
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const hasDataChangedRef = useRef<boolean>(false);

    // 标签输入框引用
    const tagInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);

    // 保存草稿到本地缓存
    const saveDraftToCache = useCallback(() => {
        const draftData: BlogDraft = {
            title,
            intro,
            content,
            category,
            tags,
            isTop,
            isPublic,
            lastSaved: Date.now()
        };

        // 如果是编辑模式，添加blog_id
        if (isEditMode && blogId) {
            draftData.blog_id = blogId;
        }

        try {
            console.log('保存草稿到缓存:', draftData.blog_id ? '编辑模式' : '新建模式');
            localStorage.setItem(CACHE_KEY, JSON.stringify(draftData));

            // 更新最后保存时间
            setLastSavedTime(new Date().toLocaleTimeString());

            // 显示自动保存通知
            setShowAutoSaveNotification(true);
            setTimeout(() => setShowAutoSaveNotification(false), 3000);

            // 重置数据变更标志
            hasDataChangedRef.current = false;
            console.log('草稿保存成功');
        } catch (error) {
            console.error('保存草稿到本地缓存失败:', error);
        }
    }, [blogId, category, content, intro, isEditMode, isPublic, isTop, tags, title]);

    // 防抖后的保存草稿函数
    const debouncedSaveDraft = useDebounce(saveDraftToCache, DEBOUNCE_DELAY);

    // 当内容变化时标记数据已更改并使用防抖函数保存
    const markContentChanged = useCallback(() => {
        hasDataChangedRef.current = true;
        debouncedSaveDraft();
    }, [debouncedSaveDraft]);

    // 从本地缓存中获取草稿
    const loadDraftFromCache = useCallback((): BlogDraft | null => {
        try {
            const cachedData = localStorage.getItem(CACHE_KEY);
            if (!cachedData) {
                console.log('未找到缓存数据');
                return null;
            }

            const draftData = JSON.parse(cachedData) as BlogDraft;

            // 检查缓存是否过期（24小时）
            const now = Date.now();
            if (now - draftData.lastSaved > CACHE_EXPIRATION) {
                // 缓存已过期，清除并返回null
                console.log('缓存已过期，清除缓存');
                localStorage.removeItem(CACHE_KEY);
                return null;
            }

            console.log('成功加载缓存数据:', draftData.blog_id ? `编辑模式(ID: ${draftData.blog_id})` : '新建模式');
            return draftData;
        } catch (error) {
            console.error('从本地缓存中加载草稿失败:', error);
            return null;
        }
    }, []);

    // 清除本地缓存
    const clearCache = useCallback(() => {
        try {
            console.log('清除缓存');
            localStorage.removeItem(CACHE_KEY);
            setShowCachePrompt(false);
            setLastSavedTime('');
            console.log('缓存已清除');
        } catch (error) {
            console.error('清除本地缓存失败:', error);
        }
    }, []);

    // 加载缓存数据到表单
    const loadCacheDataToForm = useCallback((draftData: BlogDraft) => {
        setTitle(draftData.title);
        setIntro(draftData.intro);
        setContent(draftData.content);
        setCategory(draftData.category);
        setTags(draftData.tags);
        setIsTop(draftData.isTop);
        setIsPublic(draftData.isPublic);

        // 更新最后保存时间
        const date = new Date(draftData.lastSaved);
        setLastSavedTime(date.toLocaleString());

        console.log('已加载缓存数据到表单');
    }, []);

    // 初始页面加载时检查缓存数据
    useEffect(() => {
        // 如果URL中已包含cache=true参数，表示已经是从缓存加载，不需要再处理
        if (fromCache) {
            console.log('URL中包含cache=true参数，跳过缓存检查');
            return;
        }

        const cachedDraft = loadDraftFromCache();
        if (!cachedDraft) {
            console.log('没有发现缓存数据');
            return;
        }

        console.log('发现缓存数据:', cachedDraft);

        // 无论缓存是否包含blog_id，都显示恢复提示，不自动重定向
        console.log('显示缓存恢复提示，等待用户确认');
        setShowCachePrompt(true);

        // 更新最后保存时间显示
        const date = new Date(cachedDraft.lastSaved);
        setLastSavedTime(date.toLocaleString());
    }, [loadDraftFromCache, fromCache]);

    // 从缓存中恢复数据
    const restoreFromCache = useCallback(() => {
        const cachedDraft = loadDraftFromCache();
        if (!cachedDraft) return;

        // 如果缓存中有blog_id，重定向到编辑页面
        if (cachedDraft.blog_id) {
            console.log('缓存有blog_id，重定向到编辑页面:', cachedDraft.blog_id);
            // 重定向到带有cache=true参数的URL，表示需要从缓存加载数据
            navigate(`/admin/edit?blog_id=${cachedDraft.blog_id}&cache=true`, { replace: true });
            return;
        }

        // 如果没有blog_id，直接加载缓存数据
        loadCacheDataToForm(cachedDraft);
        setShowCachePrompt(false);

        console.log('已从缓存恢复数据');
    }, [loadDraftFromCache, loadCacheDataToForm, navigate]);

    // 丢弃缓存
    const discardCache = useCallback(() => {
        clearCache();
        console.log('已丢弃缓存');
    }, [clearCache]);

    // 处理图片库点击事件
    const handleImageGalleryToggle = useCallback(() => {
        console.log('Image gallery toggle clicked, current state:', showImageGallery);
        setShowImageGallery(prev => !prev);
        console.log('Image gallery new state:', !showImageGallery);
    }, [showImageGallery]);

    // 将图片插入到编辑器
    const handleImageInsert = useCallback((image: GalleryImage) => {
        // 构建图片的Markdown语法
        const businessServiceUrl = import.meta.env.VITE_BUSINESS_SERVICE_URL || '';
        const imageUrl = `${businessServiceUrl}/img/get/${image.img_id}`;
        const markdownImage = `![${image.img_name}](${imageUrl})`;

        // 复制到剪贴板
        navigator.clipboard.writeText(markdownImage)
            .then(() => {
                // 插入到编辑器的光标位置
                if (textareaRef.current) {
                    const textarea = textareaRef.current;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;

                    // 在光标位置插入Markdown图片语法
                    const newContent = content.substring(0, start) + markdownImage + content.substring(end);
                    setContent(newContent);

                    // 更新光标位置到插入内容之后
                    setTimeout(() => {
                        textarea.focus();
                        const newPosition = start + markdownImage.length;
                        textarea.setSelectionRange(newPosition, newPosition);
                    }, 0);

                    // 标记内容已更改
                    markContentChanged();
                }
            })
            .catch(err => {
                console.error('复制图片Markdown语法失败:', err);
            });
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
                    console.log('从缓存加载数据');
                    const cachedDraft = loadDraftFromCache();

                    if (cachedDraft) {
                        // 加载缓存数据到表单
                        loadCacheDataToForm(cachedDraft);

                        // 如果是编辑模式并且cache=true，加载完成后清除缓存
                        if (isEditMode) {
                            clearCache();
                            console.log('已从URL参数加载缓存数据，清除缓存');
                        }
                    } else {
                        console.log('找不到缓存数据，尝试从服务器加载');
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

            console.log('从服务器加载数据:', blogId);
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

    // 清除指定字段的错误
    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    // 验证表单
    const validateForm = (): boolean => {
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
    };

    // 自动调整文本区域高度
    useEffect(() => {
        const adjustTextareaHeight = () => {
            const textarea = textareaRef.current;
            if (textarea) {
                // 重置高度以便能够正确计算
                textarea.style.height = 'auto';

                // 获取当前可视窗口高度
                const viewportHeight = window.innerHeight;
                // 计算最大高度（屏幕高度的90%，但不小于300px）
                const maxHeight = Math.max(300, viewportHeight * 0.85);

                // 计算新高度（内容高度 + 边距）
                const newHeight = Math.min(textarea.scrollHeight, maxHeight);
                textarea.style.height = `${Math.max(300, newHeight)}px`; // 最小高度为300px

                // 同步预览区域滚动高度
                if (previewRef.current) {
                    previewRef.current.style.height = `${textarea.clientHeight}px`;
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

    // 切换预览模式
    const togglePreviewMode = () => {
        setIsPreviewMode(!isPreviewMode);
    };

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

    // 保存文章的处理函数
    const handleSave = async () => {
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
                console.error('上传到OSS失败:', uploadError);
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

            console.log('正在保存文章:', requestData);
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
            console.error('保存文章时出错:', error);
            setErrors({ submit: '保存文章时发生错误，请稍后重试' });
        } finally {
            setSubmitLoading(false);
        }
    };

    // 手动保存草稿
    const handleSaveDraft = () => {
        saveDraftToCache();
    };

    // 分类相关处理函数
    const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCategoryInput(e.target.value);
        clearError('category');
        markContentChanged();
    };

    const handleCategoryInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    };

    const handleCategorySelect = (selectedCategory: BlogCategory) => {
        setCategory(selectedCategory);
        setCategoryInput('');
        clearError('category');
        markContentChanged();
    };

    // 标签相关处理函数
    const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTagInput(e.target.value);
        markContentChanged();
    };

    const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
            setTagInput('');
            markContentChanged();
        }
    };

    const addTag = (tag: BlogTag) => {
        if (tag && !tags.some(t => t.tag_id === tag.tag_id)) {
            setTags([...tags, tag]);
            markContentChanged();
        }
        setTagInput('');
        tagInputRef.current?.focus();
    };

    const removeTag = (tagToRemove: BlogTag) => {
        setTags(tags.filter(tag => tag.tag_id !== tagToRemove.tag_id));
        markContentChanged();
    };

    const handleTagSelect = (selectedTag: BlogTag) => {
        if (!tags.some(t => t.tag_id === selectedTag.tag_id)) {
            setTags([...tags, selectedTag]);
            markContentChanged();
        }
    };

    // 文章内容变化处理
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        clearError('content');
        markContentChanged();
    };

    // 标题变化处理
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        clearError('title');
        markContentChanged();
    };

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
                                rows={3}
                            ></textarea>
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
                                <div className="markdown-editor" style={{ width: '100%' }}>
                                    <div className="markdown-edit-header">
                                        {isPreviewMode ? '预览' : '编辑'}
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
                                                <span>{isPreviewMode ? '返回编辑' : '预览'}</span>
                                            </button>
                                        </div>
                                    </div>
                                    {isPreviewMode ? (
                                        <div
                                            className="preview-content"
                                            ref={previewRef}
                                            dangerouslySetInnerHTML={{ __html: parsedContent }}
                                            style={{ minHeight: '300px' }}
                                        ></div>
                                    ) : (
                                        <textarea
                                            className={`markdown-input ${errors.content ? 'error' : ''}`}
                                            value={content}
                                            onChange={handleContentChange}
                                            ref={textareaRef}
                                            placeholder="在此输入Markdown格式的文章内容..."
                                        ></textarea>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 使用新的ImageGalleryModal组件 */}
            <ImageGalleryModal 
                isOpen={showImageGallery}
                onClose={() => setShowImageGallery(false)}
                onImageInsert={handleImageInsert}
            />
        </div>
    );
};

export default Edit;