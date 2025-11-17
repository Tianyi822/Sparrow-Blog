import './BlogCard.scss';
import React from 'react';

/**
 * 博客卡片组件属性接口
 */
interface BlogCardProps {
  title: string; // 博客标题
  date: string; // 创建日期
  updateDate: string; // 更新日期
  category: string; // 分类名称
  tags?: string[]; // 标签列表
  image: string; // 封面图片URL
  description: string; // 博客描述/摘要
  className?: string; // 自定义CSS类名
  blogId?: string; // 博客ID，用于导航
}

/**
 * 博客卡片组件
 * 展示博客信息的卡片，点击跳转到博客详情
 */
const BlogCard: React.FC<BlogCardProps> = (
  { title, date, updateDate, category, tags, image, description, className, blogId },
) => {
  // 判断是否为置顶博客
  const isTop = className?.includes('top');

  // 处理点击事件，导航到博客详情页
  const handleCardClick = (e: React.MouseEvent) => {
    // 阻止默认事件
    e.preventDefault();

    if (blogId) {
      // 使用 window.open 在新标签页打开链接
      window.open(`/blog/${blogId}`, '_blank');
    }
  };

  return (
    <article
      className={`blog-card ${className || ''}`}
      onClick={handleCardClick}
      style={{ cursor: blogId ? 'pointer' : 'default' }}
    >
      {/* 光晕元素 */}
      <div className='blog-card-border-glow' />

      {/* 置顶标记 */}
      {isTop && (
        <div className='blog-card-top-badge'>
          <div className='blog-card-top-badge-triangle'></div>
        </div>
      )}

      {/* 博客封面图 */}
      <div
        className='blog-card-img'
        style={{
          backgroundImage: `url(${image})`,
        }}
      />

      {/* 博客内容区 */}
      <div className='blog-card-content'>
        <div className='blog-card-header'>
          {/* 博客标题 */}
          <h3 className='blog-card-title'>{title}</h3>

          {/* 时间信息 */}
          <div className='blog-card-meta'>
            <span className='blog-card-time'>
              创建于 {date}
            </span>
            <span className='blog-card-time'>
              更新于 {updateDate}
            </span>
          </div>

          {/* 分类和标签 */}
          <div className='blog-card-tags'>
            <span className='blog-card-category'>
              {category}
            </span>
            {tags && tags.map((tag, index) => (
              <span key={index} className='blog-card-tag'>
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* 博客摘要 */}
        <div className='blog-card-brief'>
          {description}
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
