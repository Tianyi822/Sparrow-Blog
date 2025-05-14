import Background from "@/components/Background/Background";
import { useBlogLayoutContext } from '@/layouts/BlogLayoutContext';
import { BlogContentData, fetchMarkdownContent, getBlogContent } from '@/services/webService';
import hljs from 'highlight.js';
import 'highlight.js/styles/rainbow.css';
// 引入常用编程语言支持
import bash from 'highlight.js/lib/languages/bash';
import cpp from 'highlight.js/lib/languages/cpp';
import csharp from 'highlight.js/lib/languages/csharp';
import golang from 'highlight.js/lib/languages/go';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import rust from 'highlight.js/lib/languages/rust';
import sql from 'highlight.js/lib/languages/sql';
import typescript from 'highlight.js/lib/languages/typescript';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { FiCalendar, FiCheck, FiClock, FiCopy, FiX } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import { useNavigate, useParams } from 'react-router-dom';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import './BlogContent.scss';

// 注册语言
hljs.registerLanguage('go', golang);
hljs.registerLanguage('python', python);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('java', java);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sql', sql);

const BlogContent: React.FC = () => {
  const { blogId } = useParams<{ blogId: string }>();
  const navigate = useNavigate();
  const { getImageUrl } = useBlogLayoutContext();

  const [blogData, setBlogData] = useState<BlogContentData | null>(null);
  const [markdownContent, setMarkdownContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [copyStates, setCopyStates] = useState<Record<string, boolean>>({});
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

  // 设置可见性
  useEffect(() => {
    if (zoomedImage && !isClosing) {
      // 使用 requestAnimationFrame 确保在下一个绘制帧设置可见性
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    }
  }, [zoomedImage, isClosing]);

  // 格式化日期
  const formatDate = (dateString: string) => {
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
  };

  // 处理图片点击事件
  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>, src: string) => {
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
  };

  // 关闭放大的图片
  const closeZoomedImage = () => {
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
  };

  // 图片渲染器
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
  }, []);

  // 代码块渲染器
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderCodeBlock = useCallback((props: any) => {
    const { inline, className, children } = props;
    const match = /language-(\w+)/.exec(className || '');
    const language = match && match[1] ? match[1] : '';

    if (!inline && language) {
      const codeContent = String(children).replace(/\n$/, '');
      const lines = codeContent.split('\n');
      let highlightedCode = codeContent;
      const codeId = `code-${Math.random().toString(36).substring(2, 9)}`;

      try {
        if (hljs.getLanguage(language)) {
          highlightedCode = hljs.highlight(codeContent, { language }).value;
        } else {
          // 尝试小写语言名称
          const lowerLang = language.toLowerCase();
          if (hljs.getLanguage(lowerLang)) {
            highlightedCode = hljs.highlight(codeContent, { language: lowerLang }).value;
          }

          // 尝试别名映射
          const langAliases: Record<string, string> = {
            'golang': 'go',
            'py': 'python',
            'js': 'javascript',
            'ts': 'typescript',
            'shell': 'bash',
            'sh': 'bash',
            'c++': 'cpp',
            'c#': 'csharp'
          };

          if (langAliases[language]) {
            highlightedCode = hljs.highlight(codeContent, { language: langAliases[language] }).value;
          }
        }
      } catch {
        // 高亮失败时使用原始代码
      }

      const codeLines = highlightedCode.split('\n');

      const handleCopy = () => {
        navigator.clipboard.writeText(codeContent).then(() => {
          setCopyStates(prev => ({ ...prev, [codeId]: true }));
          setTimeout(() => {
            setCopyStates(prev => ({ ...prev, [codeId]: false }));
          }, 2000);
        });
      };

      return (
        <div className="code-block-wrapper">
          <div className="code-block-header">
            <span className="code-language">{language}</span>
            <button
              className="code-copy-btn"
              onClick={handleCopy}
              title="复制代码"
            >
              {copyStates[codeId] ? <FiCheck /> : <FiCopy />}
            </button>
          </div>
          <div className="code-block-content">
            <div className="line-numbers" aria-hidden="true">
              {lines.map((_, i) => (
                <span key={i} className="line-number">{i + 1}</span>
              ))}
            </div>
            <div className="code-block-code">
              {codeLines.map((line, i) => (
                <div key={i} className="code-line">
                  <code
                    // 这是安全的因为已经通过rehypeSanitize处理
                    dangerouslySetInnerHTML={{ __html: line || ' ' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    return <code className={className}>{children}</code>;
  }, [copyStates]);

  // 计算图片缩放动画的样式
  const getZoomAnimationStyle = () => {
    if (!imagePosition) return {};
    
    return {};
  };
  
  const getZoomedImageStyle = () => {
    if (!imagePosition) return {};
    
    return {};
  };

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

      {/* 图片缩放层 */}
      {zoomedImage && (
        <div 
          ref={zoomOverlayRef}
          className={`image-zoom-overlay ${isVisible ? 'visible' : ''} ${isClosing ? 'closing' : ''}`}
          onClick={closeZoomedImage}
          style={getZoomAnimationStyle()}
        >
          <div 
            className={`image-zoom-container ${isVisible ? 'visible' : ''} ${isClosing ? 'closing' : ''}`}
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
              alt="Zoomed image" 
              className={`image-zoom-content ${isVisible ? 'visible' : ''} ${isClosing ? 'closing' : ''}`}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default BlogContent; 