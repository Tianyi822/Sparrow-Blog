import React, { useState, useRef, useEffect } from 'react';
import { FiX, FiPlus, FiArrowUp, FiEye } from 'react-icons/fi';
import './Edit.scss';

// 文章编辑页面组件
const Edit: React.FC = () => {
    // 文章信息状态
    const [title, setTitle] = useState<string>('');
    const [intro, setIntro] = useState<string>('');
    const [content, setContent] = useState<string>('');
    const [isTop, setIsTop] = useState<boolean>(false);
    const [isPublic, setIsPublic] = useState<boolean>(true);

    // 分类相关状态
    const [category, setCategory] = useState<string>('');
    const [categoryInput, setCategoryInput] = useState<string>('');
    const [availableCategories, setAvailableCategories] = useState<string[]>([
        '技术博客', '学习笔记', '生活随笔', '心得体会', '项目分享'
    ]);

    // 标签相关状态
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState<string>('');
    const [availableTags, setAvailableTags] = useState<string[]>([
        'JavaScript', 'TypeScript', 'React', 'Vue', 'Node.js',
        'CSS', 'HTML', 'Webpack', 'Git', 'Docker', 'Python',
        'Java', 'Go', 'C++', 'MongoDB', 'MySQL', 'Redis'
    ]);

    // 标签输入框引用
    const tagInputRef = useRef<HTMLInputElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const previewRef = useRef<HTMLDivElement>(null);

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
    const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
        if (previewRef.current && textareaRef.current) {
            const textarea = textareaRef.current;
            const preview = previewRef.current;

            // 计算滚动比例
            const scrollPercentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);

            // 应用相同的滚动比例到预览区域
            preview.scrollTop = scrollPercentage * (preview.scrollHeight - preview.clientHeight);
        }
    };

    // 保存文章的处理函数
    const handleSave = () => {
        const articleData = {
            title,
            intro,
            category,
            tags,
            isTop,
            isPublic,
            content
        };

        console.log('保存文章数据:', articleData);
        // 这里后续可以添加实际的API调用来保存文章
    };

    // 分类相关处理函数
    const handleCategoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCategoryInput(e.target.value);
    };

    const handleCategoryInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && categoryInput.trim()) {
            e.preventDefault();
            setCategory(categoryInput.trim());
            setCategoryInput('');
        }
    };

    const handleCategorySelect = (selectedCategory: string) => {
        setCategory(selectedCategory);
        setCategoryInput('');
    };

    // 标签相关处理函数
    const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTagInput(e.target.value);
    };

    const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && tagInput.trim()) {
            e.preventDefault();
            addTag(tagInput.trim());
        }
    };

    const addTag = (tag: string) => {
        if (tag && !tags.includes(tag)) {
            setTags([...tags, tag]);
        }
        setTagInput('');
        tagInputRef.current?.focus();
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleTagSelect = (selectedTag: string) => {
        if (!tags.includes(selectedTag)) {
            setTags([...tags, selectedTag]);
        }
    };

    // 文章内容变化处理
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent(e.target.value);
    };

    return (
        <div className="edit-page">
            <div className="edit-container">
                <div className="edit-header">
                    <h1>文章编辑</h1>
                    <button className="save-button" onClick={handleSave}>保存文章</button>
                </div>

                <div className="edit-main">
                    {/* 文章标题编辑 */}
                    <div className="edit-section">
                        <label htmlFor="title" className="section-label">文章标题</label>
                        <input
                            id="title"
                            type="text"
                            className="title-input"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="请输入文章标题"
                        />
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
                                    className="category-input"
                                    value={categoryInput}
                                    onChange={handleCategoryInputChange}
                                    onKeyDown={handleCategoryInputKeyDown}
                                    placeholder={category ? `当前分类: ${category}` : "输入分类名称并回车，或从下方选择"}
                                />
                                {category && (
                                    <div className="selected-category">
                                        <span>{category}</span>
                                        <button className="remove-btn" onClick={() => setCategory('')}>
                                            <FiX />
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="category-options">
                                {availableCategories.map((cat) => (
                                    <button
                                        key={cat}
                                        className={`category-option ${cat === category ? 'selected' : ''}`}
                                        onClick={() => handleCategorySelect(cat)}
                                    >
                                        {cat}
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
                                        <div key={tag} className="tag-item">
                                            <span>{tag}</span>
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
                                        onClick={() => addTag(tagInput)}
                                    >
                                        <FiPlus />
                                    </button>
                                )}
                            </div>

                            <div className="tags-options">
                                {availableTags
                                    .filter(tag => !tags.includes(tag))
                                    .map((tag) => (
                                        <button
                                            key={tag}
                                            className="tag-option"
                                            onClick={() => handleTagSelect(tag)}
                                        >
                                            {tag}
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
                                    onChange={() => setIsTop(!isTop)}
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
                                    onChange={() => setIsPublic(!isPublic)}
                                />
                                <label htmlFor="isPublic" className="toggle-switch-label"></label>
                            </div>
                        </div>
                    </div>

                    {/* Markdown编辑器 */}
                    <div className="edit-section markdown-section">
                        <label className="section-label">文章内容</label>
                        <div className="markdown-editor-container">
                            <div className="markdown-editor">
                                <div className="edit-header">编辑</div>
                                <textarea
                                    className="markdown-input"
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
                                    dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 简单的Markdown渲染函数，实际项目中可以使用第三方库如marked.js
function renderMarkdown(markdown: string): string {
    // 这里应该使用实际的Markdown解析库，这里只是一个非常简单的示例
    // 在实际项目中，建议使用成熟的库如marked.js或markdown-it
    let html = markdown
        // 转义HTML标签
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        // 标题
        .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
        .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
        .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
        // 粗体与斜体
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // 链接
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
        // 图片
        .replace(/!\[([^\]]+)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
        // 代码块
        .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
        // 行内代码
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // 列表
        .replace(/^- (.*?)$/gm, '<li>$1</li>')
        // 段落
        .replace(/^(?!<[a-z]).+$/gm, (match) => {
            return match.trim() ? `<p>${match}</p>` : '';
        });

    return html;
}

export default Edit; 