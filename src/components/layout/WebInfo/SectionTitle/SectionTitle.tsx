import React from 'react';
import './SectionTitle.scss';

interface SectionTitleProps {
  title: string;
  type: 'article' | 'comment' | 'categories' | 'tags';
  className?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, type, className = '' }) => {
  return (
    <div className={`${type}-title-container ${className}`}>
      <div className={`${type}-title-border-glow`} />
      <h3 className={`${type}-title-text`}>{title}</h3>
    </div>
  );
};

export default SectionTitle;