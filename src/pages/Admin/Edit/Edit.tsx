import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiPlus, FiArrowUp, FiEye } from 'react-icons/fi';
import { marked } from 'marked';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    getAllTagsAndCategories, 
    updateOrAddBlog, 
    BlogTag, 
    BlogCategory, 
    UpdateOrAddBlogRequest,
    deleteBlog,
    getBlogDataForEdit
} from '@/services/adminService';
import { uploadToOSS } from '@/services/ossService';
import './Edit.scss';

// 配置marked选项
const options = {
    breaks: true,  // 支持换行符变为<br>标签
    gfm: true      // 支持GitHub风格的Markdown
};

// 定义错误类型接口
interface ValidationErrors {
    [key: string]: string;
}

// 文章编辑页面组件
const Edit: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const blogId = new URLSearchParams(location.search).get('blog_id');
    const isEditMode = !!blogId;
    
    // 文章信息状态
    const [title, setTitle] = useState<string>('');
    const [intro, setIntro] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [parsedContent, setParsedContent] = useState<string>('');
    const [isTop, setIsTop] = useState<boolean>(false);
    const [isPublic, setIsPublic] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(false);

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

    // 标签输入框引用
    const tagInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);

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

    // 如果是编辑模式，获取博客数据
    useEffect(() => {
        const fetchBlogData = async () => {
            if (isEditMode && blogId) {
                try {
                    setLoading(true);
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
                                // 直接处理错误情况，而不是抛出异常
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
                } catch (error) {
                    console.error('获取博客数据错误:', error);
                    setErrors(prev => ({ ...prev, submit: '获取博客数据时发生错误' }));
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchBlogData();
    }, [isEditMode, blogId]);

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

    // Markdown内容变化时同步滚动预览
    const handleEditorScroll = () => {
        if (previewRef.current && textareaRef.current) {
            const textarea = textareaRef.current;
            const preview = previewRef.current;

            // 计算滚动比例
            const scrollPercentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);

            // 应用相同的滚动比例到预览区域
            preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);
        }
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

        // 准备请求数据
        const requestData: UpdateOrAddBlogRequest = {
            blog_id: isEditMode && blogId ? blogId : '', // 如果是编辑模式，使用现有ID
            blog_title: title,
            blog_brief: intro,
            blog_content: content,
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

        try {
            setSubmitLoading(true);
            console.log('正在保存文章:', requestData);
            const response = await updateOrAddBlog(requestData);
            
            if (response.code === 200) {
                try {
                    // 上传文章内容到OSS
                    const uploadSuccess = await uploadToOSS(response.data.presign_url, content);
                    if (uploadSuccess) {
                        // 上传成功，跳转回文章管理页面
                        navigate('/admin');
                    } else {
                        // 上传失败处理
                        await handleUploadFailure(response.data.blog_id, '上传到OSS失败');
                    }
                } catch (uploadError) {
                    // 上传失败，删除已创建的文章
                    await handleUploadFailure(
                        response.data.blog_id, 
                        uploadError instanceof Error ? uploadError.message : '上传文章内容失败，请稍后重试'
                    );
                }
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

    // 添加处理上传失败的函数
    const handleUploadFailure = async (blogId: string, errorMessage: string) => {
        // 尝试删除已创建的文章
        try {
            await deleteBlog(blogId);
        } catch (deleteError) {
            console.error('删除文章失败:', deleteError);
        }
        // 显示错误信息
        setErrors({ submit: `上传失败: ${errorMessage}` });
    };

    // 分类相关处理函数
    const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCategoryInput(e.target.value);
        clearError('category');
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
        }
    };

    const handleCategorySelect = (selectedCategory: BlogCategory) => {
        setCategory(selectedCategory);
        setCategoryInput('');
        clearError('category');
    };

    // 标签相关处理函数
    const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTagInput(e.target.value);
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
        }
    };

    const addTag = (tag: BlogTag) => {
        if (tag && !tags.some(t => t.tag_id === tag.tag_id)) {
            setTags([...tags, tag]);
        }
        setTagInput('');
        tagInputRef.current?.focus();
    };

    const removeTag = (tagToRemove: BlogTag) => {
        setTags(tags.filter(tag => tag.tag_id !== tagToRemove.tag_id));
    };

    const handleTagSelect = (selectedTag: BlogTag) => {
        if (!tags.some(t => t.tag_id === selectedTag.tag_id)) {
            setTags([...tags, selectedTag]);
        }
    };

    // 文章内容变化处理
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
        clearError('content');
    };

    // 标题变化处理
    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(e.target.value);
        clearError('title');
    };

    return (
        <div className="edit-page">
            <div className="edit-container">
                <div className="edit-header">
                    <h1>{isEditMode ? '编辑文章' : '新建文章'}</h1>
                    <button 
                        className="save-button" 
                        onClick={handleSave}
                        disabled={submitLoading || loading}
                    >
                        {submitLoading ? '保存中...' : '保存文章'}
                    </button>
                </div>

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
                                onChange={(e) => setIntro(e.target.value)}
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
                                                setErrors(prev => ({...prev, category: '请选择或输入文章分类'}));
                                            }}>
                                                <FiX/>
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
                                                    <FiX/>
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
                                            <FiPlus/>
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
                                    <FiArrowUp className="toggle-icon"/>
                                    <span>是否置顶</span>
                                </label>
                                <div className="toggle-switch-container">
                                    <input
                                        id="isTop"
                                        type="checkbox"
                                        className="toggle-switch"
                                        checked={isTop}
                                        onChange={() => setIsTop(!isTop)}
                                    />
                                    <label htmlFor="isTop" className="toggle-switch-label"></label>
                                </div>
                            </div>

                            <div className="toggle-setting">
                                <label htmlFor="isPublic" className="toggle-label">
                                    <FiEye className="toggle-icon"/>
                                    <span>是否公开</span>
                                </label>
                                <div className="toggle-switch-container">
                                    <input
                                        id="isPublic"
                                        type="checkbox"
                                        className="toggle-switch"
                                        checked={isPublic}
                                        onChange={() => setIsPublic(!isPublic)}
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
                                <div className="markdown-editor">
                                    <div className="markdown-edit-header">编辑</div>
                                    <textarea
                                        className={`markdown-input ${errors.content ? 'error' : ''}`}
                                        value={content}
                                        onChange={handleContentChange}
                                        onScroll={handleEditorScroll}
                                        ref={textareaRef}
                                        placeholder="在此输入Markdown格式的文章内容..."
                                    ></textarea>
                                </div>
                                <div className="markdown-preview">
                                    <div className="preview-header">预览</div>
                                    <div
                                        className="preview-content"
                                        ref={previewRef}
                                        dangerouslySetInnerHTML={{__html: parsedContent}}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Edit;