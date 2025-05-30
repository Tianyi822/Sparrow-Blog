import Background from "@/components/Background/Background";
import { CodeBlock } from '@/components/ui/code-block';
import { useBlogLayoutContext } from '@/layouts/BlogLayoutContext';
import { BlogContentData, fetchMarkdownContent, getBlogContent } from '@/services/webService';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { FiCalendar, FiClock, FiX } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { useNavigate, useParams } from 'react-router-dom';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import './BlogContent.scss';

const BlogContent: React.FC = memo(() => {
    const { blogId } = useParams<{ blogId: string }>();
    const navigate = useNavigate();
    const { getImageUrl } = useBlogLayoutContext();

    // 状态管理
    const [blogData, setBlogData] = useState<BlogContentData | null>(null);
    const [markdownContent, setMarkdownContent] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [backgroundImage, setBackgroundImage] = useState<string>('');
    const [zoomedImage, setZoomedImage] = useState<string | null>(null);
    const [isZooming, setIsZooming] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [imagePosition, setImagePosition] = useState<{
        top: number;
        left: number;
        width: number;
        height: number;
    } | null>(null);

    const zoomOverlayRef = useRef<HTMLDivElement>(null);
    const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 清除关闭定时器
    useEffect(() => {
        return () => {
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
            }
        };
    }, []);

    // 获取博客数据
    useEffect(() => {
        const fetchBlogData = async () => {
            if (!blogId) {
                setError('博客ID无效');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const data = await getBlogContent(blogId);

                if (!data) {
                    setError('获取博客数据失败');
                    setLoading(false);
                    return;
                }

                setBlogData(data);

                // 设置博客图片作为背景
                if (data.blog_data.blog_image_id) {
                    const imageUrl = getImageUrl(data.blog_data.blog_image_id);
                    setBackgroundImage(imageUrl);

                    // 设置文档标题
                    document.title = `${data.blog_data.blog_title} | Blog`;
                }

                // 获取Markdown内容
                try {
                    const markdown = await fetchMarkdownContent(data.pre_sign_url);
                    setMarkdownContent(markdown);
                } catch {
                    setError('无法加载博客内容');
                }

                setLoading(false);
            } catch {
                setError('获取博客数据时发生错误');
                setLoading(false);
            }
        };

        fetchBlogData();
    }, [blogId, getImageUrl]);

    // 设置图片放大可见性
    useEffect(() => {
        if (zoomedImage && !isClosing) {
            // 使用 requestAnimationFrame 确保在下一个绘制帧设置可见性
            requestAnimationFrame(() => {
                setIsVisible(true);
            });
        }
    }, [zoomedImage, isClosing]);

    // 格式化日期显示
    const formatDate = useCallback((dateString: string) => {
        if (!dateString || dateString === '0001-01-01T00:00:00Z') {
            return '未知日期';
        }

        try {
            // 处理ISO 8601格式的日期字符串（带时区信息）
            const date = new Date(dateString);

            // 检查日期是否有效
            if (isNaN(date.getTime())) {
                return '日期格式错误';
            }

            // 使用更完整的格式化方法，包含日期和时间
            const year = date.getFullYear();
            const month = date.getMonth() + 1;
            const day = date.getDate();
            const hour = date.getHours();
            const minute = date.getMinutes();

            // 补零函数
            const pad = (num: number) => num.toString().padStart(2, '0');

            return `${year}年${pad(month)}月${pad(day)}日 ${pad(hour)}:${pad(minute)}`;
        } catch {
            return '日期格式错误';
        }
    }, []);

    // 处理图片点击放大事件
    const handleImageClick = useCallback((event: React.MouseEvent<HTMLImageElement>, src: string) => {
        const imgElement = event.currentTarget;
        const rect = imgElement.getBoundingClientRect();

        // 保存原始图片的位置和尺寸
        setImagePosition({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height
        });

        setZoomedImage(src);
        setIsZooming(true);
        setIsClosing(false);

        // 防止页面滚动
        document.body.style.overflow = 'hidden';
    }, []);

    // 关闭放大的图片
    const closeZoomedImage = useCallback(() => {
        if (isClosing) return; // 防止重复关闭

        setIsClosing(true);
        setIsVisible(false);

        // 清除之前的定时器
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
        }

        // 添加关闭动画的时间 (确保比CSS动画时间稍长一点)
        closeTimeoutRef.current = setTimeout(() => {
            setZoomedImage(null);
            setIsZooming(false);
            setIsClosing(false);
            setImagePosition(null);

            // 恢复页面滚动
            document.body.style.overflow = '';
        }, 350); // 稍微比CSS动画时间(300ms)长一点，确保动画完成
    }, [isClosing]);

    // 图片渲染器 - 处理Markdown中的图片
    const renderImage = useCallback((props: React.ComponentPropsWithoutRef<'img'>) => {
        const { src, alt } = props;
        if (!src) return null;

        return (
            <img
                src={src}
                alt={alt || ''}
                onClick={(e) => handleImageClick(e, src)}
                style={{ cursor: 'zoom-in' }}
                className="blog-content-image"
            />
        );
    }, [handleImageClick]);

    // 代码块渲染器 - 处理Markdown中的代码块
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderCodeBlock = useCallback((props: any) => {
        const { inline, className, children } = props;
        const match = /language-(\w+)/.exec(className || '');
        const language = match && match[1] ? match[1] : '';

        if (!inline && language) {
            const codeContent = String(children).replace(/\n$/, '');

            // 使用CodeBlock组件渲染代码
            return (
                <CodeBlock
                    language={language}
                    code={codeContent}
                />
            );
        }

        return <code className={className}>{children}</code>;
    }, []);

    // 计算图片缩放动画的样式
    const getZoomAnimationStyle = useCallback(() => {
        if (!imagePosition) return {};
        return {};
    }, [imagePosition]);

    // 获取放大图片的样式
    const getZoomedImageStyle = useCallback(() => {
        if (!imagePosition) return {};
        return {};
    }, [imagePosition]);

    // 加载中状态
    if (loading) {
        return (
            <div className="blog-content-page">
                <div className="blog-content-page-loading">
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    // 错误状态
    if (error || !blogData) {
        return (
            <div className="blog-content-page">
                <div className="blog-content-page-error">
                    <h3>出错了</h3>
                    <p>{error || '无法加载博客内容'}</p>
                    <button onClick={() => navigate('/')}>返回主页</button>
                </div>
            </div>
        );
    }

    const {
        blog_data: {
            blog_title,
            blog_brief,
            category,
            tags,
            blog_words_num,
            blog_is_top,
            create_time,
            update_time
        }
    } = blogData;

    return (
        <>
            {backgroundImage && <Background backgroundImage={backgroundImage} />}
            <div className="blog-content-page">
                {/* 博客头部信息 */}
                <header className="blog-content-page-header">
                    <div className="blog-content-page-header-glow" />
                    <div className="blog-content-page-header-border-glow" />

                    <h1 className="blog-content-page-header-title">
                        {blog_title}
                        {blog_is_top && (
                            <span className="blog-top-badge">
                                <i className="top-icon">↑</i>置顶
                            </span>
                        )}
                    </h1>

                    <div className="blog-content-page-header-meta">
                        <div className="blog-content-page-header-meta-item">
                            <FiCalendar className="icon" />
                            <span>创建于 {formatDate(create_time)}</span>
                        </div>

                        {update_time && update_time !== '0001-01-01T00:00:00Z' && (
                            <div className="blog-content-page-header-meta-item">
                                <FiCalendar className="icon" />
                                <span>更新于 {formatDate(update_time)}</span>
                            </div>
                        )}

                        <div className="blog-content-page-header-meta-item">
                            <FiClock className="icon" />
                            <span>{blog_words_num} 字</span>
                        </div>
                    </div>

                    <div className="blog-content-page-header-tags">
                        {category && (
                            <span className="blog-category">
                                {category.category_name}
                            </span>
                        )}

                        {tags && tags.map((tag) => (
                            <span key={tag.tag_id} className="blog-tag">
                                {tag.tag_name}
                            </span>
                        ))}
                    </div>

                    {blog_brief && (
                        <div className="blog-content-page-header-brief">
                            {blog_brief}
                        </div>
                    )}
                </header>

                {/* 博客正文内容 */}
                <article className="blog-content-page-article">
                    <div className="blog-content-page-article-glow" />
                    <div className="blog-content-page-article-border-glow" />

                    <div className="markdown-content">
                        {markdownContent && (
                            <ReactMarkdown
                                children={markdownContent}
                                components={{
                                    code: renderCodeBlock,
                                    img: renderImage
                                }}
                                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                            />
                        )}
                    </div>
                </article>
            </div>

            {/* 图片放大查看层 */}
            {zoomedImage && (
                <div
                    ref={zoomOverlayRef}
                    className={`image-zoom-overlay ${isVisible ? 'visible' : ''} ${isClosing ? 'closing' : ''} ${isZooming ? 'zooming' : ''}`}
                    onClick={closeZoomedImage}
                    style={getZoomAnimationStyle()}
                >
                    <div
                        className={`image-zoom-container ${isVisible ? 'visible' : ''} ${isClosing ? 'closing' : ''} ${isZooming ? 'zooming' : ''}`}
                        style={getZoomedImageStyle()}
                    >
                        <button className="image-zoom-close" onClick={(e) => {
                            e.stopPropagation();
                            closeZoomedImage();
                        }}>
                            <FiX />
                        </button>
                        <img
                            src={zoomedImage}
                            alt="放大的图片"
                            className={`image-zoom-content ${isVisible ? 'visible' : ''} ${isClosing ? 'closing' : ''} ${isZooming ? 'zooming' : ''}`}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </>
    );
});

export default BlogContent; 