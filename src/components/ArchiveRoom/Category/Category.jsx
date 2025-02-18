import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './Category.scss';

const Category = ({ categories = [] }) => {
  const [columns, setColumns] = useState(6);

  // 计算块的大小和类型
  const calculateSize = (count) => {
    const maxCount = Math.max(...categories.map(cat => cat.count));
    const threshold1 = maxCount * 0.7; // 70% of max count for large
    const threshold2 = maxCount * 0.4; // 40% of max count for medium

    if (count >= threshold1) return 'large';
    if (count >= threshold2) return 'medium';
    return 'small';
  };

  const calculateType = (index) => {
    return `type-${(index % 20) + 1}`;
  };

  // 监听窗口大小变化，调整列数
  useEffect(() => {
    const handleResize = () => {
      const maxWidth = 1474; // 父组件定义的最大宽度
      const containerWidth = Math.min(
        document.querySelector('.category-grid')?.clientWidth || 0,
        maxWidth
      );
      const blockMinWidth = 90; // 每个分类块的最小宽度
      const newColumns = Math.max(2, Math.floor(containerWidth / blockMinWidth));
      setColumns(newColumns);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 计算需要填充的空白格子数量
  const calculateEmptyBlocks = () => {
    const totalBlocks = categories.reduce((acc, category) => {
      const size = calculateSize(category.count);
      return acc + (size === 'large' ? 9 : size === 'medium' ? 4 : 1);
    }, 0);
    const rowSize = columns * 3; // 考虑到大块占3x3，中块占2x2
    const remainder = rowSize - (totalBlocks % rowSize);
    return remainder === rowSize ? 0 : remainder;
  };

  // 渲染分类块和空白格子
  const renderCategories = () => {
    const categoryBlocks = categories.map((category, index) => (
      <div
        key={category.name}
        className={`category-block ${calculateSize(category.count)} ${calculateType(index)}`}
      >
        <span className="category-name">{category.name}</span>
        <span className="category-count">{category.count} 篇</span>
      </div>
    ));

    // 添加空白格子
    const emptyBlocks = Array.from({ length: calculateEmptyBlocks() }, (_, index) => (
      <div
        key={`empty-${index}`}
        className="category-block empty small"
      />
    ));

    return [...categoryBlocks, ...emptyBlocks];
  };

  return (
    <div className="archive-category">
      <h2 className="category-title">分类</h2>
      <div className="category-grid" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {renderCategories()}
      </div>
    </div>
  );
};

Category.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired
    })
  )
};

export default Category;