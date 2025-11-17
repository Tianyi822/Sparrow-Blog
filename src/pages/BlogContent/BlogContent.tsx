import Comments from '@/components/business/Comments/Comments';
import type { TOCItem } from '@/components/business/Tools/TOCModal/TOCModal';
import { CodeBlock } from '@/components/common/ui/code-block';
import Background from '@/components/layout/Background/Background';
import { useBlogLayoutContext } from '@/layouts/BlogLayoutContext';
import { fetchMarkdownContent, getBlogContent } from '@/services/webService';
import { useUIStore } from '@/stores';
import { BlogContentData } from '@/types';
import { formatDateTime } from '@/utils';
import 'katex/dist/katex.min.css';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { FiCalendar, FiClock, FiX } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { useNavigate, useParams } from 'react-router-dom';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import './BlogContent.scss';

const BlogContent: React.FC = memo(() => {
  const { blogId } = useParams<{ blogId: string }>();
  const navigate = useNavigate();
  const { getImageUrl, setTocItems } = useBlogLayoutContext();

  // 状态管理
  const [blogData, setBlogData] = useState<BlogContentData | null>(null);
  const [markdownContent, setMarkdownContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);

  // 使用 Zustand 状态管理图片缩放
  const {
    imageModalData,
    openImageModal,
    closeImageModal,
    setImageModalData,
  } = useUIStore();

  const zoomOverlayRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const articleContentRef = useRef<HTMLDivElement>(null);

  /**
   * 从Markdown内容中提取目录
   * 正确处理代码块，避免将代码中的内容误识别为标题
   * @param markdown - Markdown内容
   * @returns 目录项数组
   */
  const extractTOCFromMarkdown = useCallback((markdown: string): TOCItem[] => {
    const tocItems: TOCItem[] = [];

    // 首先移除代码块内容，避免代码块中的#被误识别为标题
    let processedMarkdown = markdown;

    // 移除围栏代码块 (```)
    processedMarkdown = processedMarkdown.replace(/```[\s\S]*?```/g, '');

    // 移除行内代码 (`code`)
    processedMarkdown = processedMarkdown.replace(/`[^`]*`/g, '');

    // 移除HTML注释
    processedMarkdown = processedMarkdown.replace(/<!--[\s\S]*?-->/g, '');

    // 分割成行，只处理真正的标题行
    const lines = processedMarkdown.split('\n');

    lines.forEach((line, index) => {
      // 匹配标题：行首是#，后面跟空格，然后是标题内容
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);

      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2].trim();

        // 清理标题文本，移除markdown语法
        const cleanText = text
          .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体
          .replace(/\*(.*?)\*/g, '$1') // 移除斜体
          .replace(/`(.*?)`/g, '$1') // 移除行内代码
          .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 移除链接，保留文本
          .trim();

        if (cleanText) {
          // 生成URL友好的锚点ID
          const anchorId = `heading-${
            cleanText
              .toLowerCase()
              .replace(/[^\w\s\u4e00-\u9fff]/g, '') // 保留字母、数字、空格和中文
              .replace(/\s+/g, '-')
              .replace(/-+/g, '-')
              .replace(/^-|-$/g, '')
          }`;

          tocItems.push({
            id: `toc-${index}-${tocItems.length}`,
            level,
            text: cleanText,
            anchorId,
          });
        }
      }
    });

    return tocItems;
  }, []);

  // 更新Markdown内容时同时提取目录
  useEffect(() => {
    if (markdownContent) {
      const toc = extractTOCFromMarkdown(markdownContent);
      setTocItems?.(toc);
    }
  }, [markdownContent, extractTOCFromMarkdown, setTocItems]);

  // 平滑滚动到指定锚点的函数
  const scrollToHeading = useCallback((anchorId: string) => {
    const element = document.getElementById(anchorId);
    if (element) {
      const yOffset = -80; // 顶部导航栏高度偏移
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;

      window.scrollTo({
        top: y,
        behavior: 'smooth',
      });
    }
  }, []);

  // 监听hash变化，支持URL直接跳转到标题
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        // 延迟执行，确保页面内容已经渲染
        setTimeout(() => {
          scrollToHeading(hash);
        }, 100);
      }
    };

    // 页面加载时检查hash
    handleHashChange();

    // 监听hash变化
    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [scrollToHeading]);

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

  // 监听 imageModalData 变化，控制动画
  useEffect(() => {
    if (imageModalData && !imageModalData.isClosing) {
      // 使用 requestAnimationFrame 确保在下一个绘制帧设置可见性
      requestAnimationFrame(() => {
        setImageModalData({
          ...imageModalData,
          isVisible: true,
        });
      });
    }
  }, [imageModalData, setImageModalData]);

  // 使用统一的日期格式化工具函数

  // 处理图片点击放大事件
  const handleImageClick = useCallback((event: React.MouseEvent<HTMLImageElement>, src: string) => {
    const imgElement = event.currentTarget;
    const rect = imgElement.getBoundingClientRect();

    // 打开图片模态框
    openImageModal(src, {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });

    // 防止页面滚动
    document.body.style.overflow = 'hidden';
  }, [openImageModal]);

  // 关闭放大的图片
  const closeZoomedImage = useCallback(() => {
    if (!imageModalData || imageModalData.isClosing) return; // 防止重复关闭

    closeImageModal();

    // 清除之前的定时器
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }

    // 添加关闭动画的时间 (确保比CSS动画时间稍长一点)
    closeTimeoutRef.current = setTimeout(() => {
      setImageModalData(null);

      // 恢复页面滚动
      document.body.style.overflow = '';
    }, 350); // 稍微比CSS动画时间(300ms)长一点，确保动画完成
  }, [closeImageModal, setImageModalData, imageModalData]);

  // 关闭评论面板
  const handleCommentsClose = useCallback(() => {
    setIsCommentsOpen(false);
  }, []);

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
        className='blog-content-image'
      />
    );
  }, [handleImageClick]);

  // 代码块渲染器 - 处理Markdown中的代码块
  const renderCodeBlock = useCallback((props: { inline?: boolean; className?: string; children?: React.ReactNode }) => {
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

  // 标题渲染器 - 为每个标题添加ID，支持目录跳转
  const renderHeading = useCallback((props: { level?: number; children?: React.ReactNode }) => {
    const { level, children } = props;
    const headingText = String(children);

    // 清理标题文本，保持与目录提取逻辑一致
    const cleanText = headingText
      .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体
      .replace(/\*(.*?)\*/g, '$1') // 移除斜体
      .replace(/`(.*?)`/g, '$1') // 移除行内代码
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 移除链接，保留文本
      .trim();

    // 生成与目录中一致的锚点ID
    const anchorId = `heading-${
      cleanText
        .toLowerCase()
        .replace(/[^\w\s\u4e00-\u9fff]/g, '') // 保留字母、数字、空格和中文
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
    }`;

    // 处理标题点击事件 - 复制链接到剪贴板
    const handleHeadingClick = (e: React.MouseEvent) => {
      // 只有点击前面的#号时才复制链接
      const target = e.target as HTMLElement;
      if (
        target.tagName.toLowerCase().startsWith('h') ||
        (e.clientX - target.getBoundingClientRect().left < 30)
      ) {
        const url = `${window.location.origin}${window.location.pathname}#${anchorId}`;

        // 尝试使用现代的 Clipboard API
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(url).then(() => {
            // 复制成功
          }).catch(() => {
            // 复制失败
          });
        } else {
          // 降级处理：直接更新 URL hash
          window.location.hash = anchorId;
        }
      }
    };

    // 使用React.createElement动态创建标题元素
    return React.createElement(
      `h${level}`,
      {
        id: anchorId,
        className: `markdown-heading markdown-heading-h${level}`,
        'data-heading-level': level,
        onClick: handleHeadingClick,
      },
      children,
    );
  }, []);

  // 计算图片缩放动画的样式
  const getZoomAnimationStyle = useCallback(() => {
    if (!imageModalData?.position) return {};
    return {};
  }, [imageModalData]);

  // 获取放大图片的样式
  const getZoomedImageStyle = useCallback(() => {
    if (!imageModalData?.position) return {};
    return {};
  }, [imageModalData]);

  // 加载中状态
  if (loading) {
    return (
      <div className='blog-content-page'>
        <div className='blog-content-page-loading'>
          <div className='spinner'></div>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error || !blogData) {
    return (
      <div className='blog-content-page'>
        <div className='blog-content-page-error'>
          <h3>出错了</h3>
          <p>{error || '无法加载博客内容'}</p>
          <button type='button' onClick={() => navigate('/')}>返回主页</button>
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
      update_time,
    },
  } = blogData;

  return (
    <>
      {backgroundImage && <Background backgroundImage={backgroundImage} />}
      <div className='blog-content-page'>
        {/* 博客头部信息 */}
        <header className='blog-content-page-header'>
          <div className='blog-content-page-header-glow' />
          <div className='blog-content-page-header-border-glow' />

          <h1 className='blog-content-page-header-title'>
            {blog_title}
            {blog_is_top && (
              <span className='blog-top-badge'>
                <i className='top-icon'>↑</i>置顶
              </span>
            )}
          </h1>

          <div className='blog-content-page-header-meta'>
            <div className='blog-content-page-header-meta-item'>
              <FiCalendar className='icon' />
              <span>创建于 {formatDateTime(create_time)}</span>
            </div>

            {update_time && update_time !== '0001-01-01T00:00:00Z' && (
              <div className='blog-content-page-header-meta-item'>
                <FiCalendar className='icon' />
                <span>更新于 {formatDateTime(update_time)}</span>
              </div>
            )}

            <div className='blog-content-page-header-meta-item'>
              <FiClock className='icon' />
              <span>{blog_words_num} 字</span>
            </div>
          </div>

          <div className='blog-content-page-header-tags'>
            {category && (
              <span className='blog-category'>
                {category.category_name}
              </span>
            )}

            {tags && tags.map((tag) => (
              <span key={tag.tag_id} className='blog-tag'>
                {tag.tag_name}
              </span>
            ))}
          </div>

          {blog_brief && (
            <div className='blog-content-page-header-brief'>
              {blog_brief}
            </div>
          )}
        </header>

        {/* 博客正文内容 */}
        <article className='blog-content-page-article'>
          <div className='blog-content-page-article-glow' />
          <div className='blog-content-page-article-border-glow' />

          <div className='markdown-content' ref={articleContentRef}>
            {markdownContent && (
              <ReactMarkdown
                children={markdownContent}
                components={{
                  code: renderCodeBlock,
                  img: renderImage,
                  h1: (props) => renderHeading({ ...props, level: 1 }),
                  h2: (props) => renderHeading({ ...props, level: 2 }),
                  h3: (props) => renderHeading({ ...props, level: 3 }),
                  h4: (props) => renderHeading({ ...props, level: 4 }),
                  h5: (props) => renderHeading({ ...props, level: 5 }),
                  h6: (props) => renderHeading({ ...props, level: 6 }),
                }}
                remarkPlugins={[remarkGfm, remarkMath]}
                rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeKatex]}
              />
            )}
          </div>
        </article>
      </div>

      {/* 评论系统 */}
      {blogId && (
        <Comments
          blogId={blogId}
          isOpen={isCommentsOpen}
          onClose={handleCommentsClose}
        />
      )}

      {/* 图片放大查看层 */}
      {imageModalData && (
        <div
          ref={zoomOverlayRef}
          className={`image-zoom-overlay ${imageModalData.isVisible ? 'visible' : ''} ${
            imageModalData.isClosing ? 'closing' : ''
          } ${imageModalData.isZooming ? 'zooming' : ''}`}
          onClick={closeZoomedImage}
          style={getZoomAnimationStyle()}
        >
          <div
            className={`image-zoom-container ${imageModalData.isVisible ? 'visible' : ''} ${
              imageModalData.isClosing ? 'closing' : ''
            } ${imageModalData.isZooming ? 'zooming' : ''}`}
            style={getZoomedImageStyle()}
          >
            <button
              type='button'
              className='image-zoom-close'
              onClick={(e) => {
                e.stopPropagation();
                closeZoomedImage();
              }}
            >
              <FiX />
            </button>
            <img
              src={imageModalData.src}
              alt='放大的图片'
              className={`image-zoom-content ${imageModalData.isVisible ? 'visible' : ''} ${
                imageModalData.isClosing ? 'closing' : ''
              } ${imageModalData.isZooming ? 'zooming' : ''}`}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
});

export default BlogContent;
