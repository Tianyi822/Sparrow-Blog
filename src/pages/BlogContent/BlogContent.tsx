import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlogLayoutContext } from '@/layouts/BlogLayoutContext';
import { getBlogContent, fetchMarkdownContent } from '@/services/webService';
import { BlogContentData } from '@/services/webService';
import './BlogContent.scss';
import { FiCalendar, FiClock } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import rehypeRaw from 'rehype-raw';
import Background from "@/components/Background/Background";

const BlogContent: React.FC = () => {
  const { blogId } = useParams<{ blogId: string }>();
  const navigate = useNavigate();
  const { getImageUrl } = useBlogLayoutContext();
  
  const [blogData, setBlogData] = useState<BlogContentData | null>(null);
  const [markdownContent, setMarkdownContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [backgroundImage, setBackgroundImage] = useState<string>('');

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
        } catch (err) {
          console.error('Markdown获取失败:', err);
          setError('无法加载博客内容');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('博客数据获取失败:', err);
        setError('获取博客数据时发生错误');
        setLoading(false);
      }
    };

    fetchBlogData();
  }, [blogId, getImageUrl]);

  // 格式化日期
  const formatDate = (dateString: string) => {
    if (!dateString || dateString === '0001-01-01T00:00:00Z') {
      return '未知日期';
    }
    
    try {
      // 检查日期格式并添加调试信息
      console.log('格式化日期:', dateString);
      
      // 处理ISO 8601格式的日期字符串（带时区信息）
      const date = new Date(dateString);
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        console.error('无效的日期字符串:', dateString);
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
    } catch (err) {
      console.error('日期格式化错误:', err);
      return '日期格式错误';
    }
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
                  // 自定义组件可以在这里添加
                }}
                // @ts-ignore
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
              />
            )}
          </div>
        </article>
      </div>
    </>
  );
};

export default BlogContent; 