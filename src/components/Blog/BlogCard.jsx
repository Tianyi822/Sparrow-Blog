import React from 'react';
import PropTypes from 'prop-types';
import SvgIcon, { Preview, Small } from '@/components/SvgIcon/SvgIcon';
import './BlogCard.scss';

const BlogCard = ({ title, date, updateDate, category, tags, image, description, className, onPreview }) => {
    return (
        <div className={`blog-card ${className || ''}`}>
            <div
                className="blog-card-img"
                style={{backgroundImage: `url(${image})`}}
            />
            <div className="blog-card-content">
                <div className="blog-card-header">
                    <h3 className="blog-card-title">{title}</h3>
                    <div className="blog-card-meta">
                        <span className="blog-card-time">
                            <i className="fa fa-calendar"></i>
                            创建于 {date}
                        </span>
                        <span className="blog-card-time">
                            <i className="fa fa-clock-o"></i>
                            更新于 {updateDate}
                        </span>
                    </div>
                    <div className="blog-card-tags">
                        <span className="blog-card-category">
                            <i className="fa fa-folder"></i>
                            {category}
                        </span>
                        {tags && tags.map((tag, index) => (
                            <span key={index} className="blog-card-tag">
                                <i className="fa fa-tag"></i>
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="blog-card-brief">
                    {description}
                </div>
                <div className="blog-card-preview">
                    <SvgIcon 
                        name={Preview} 
                        size={Small}
                        color="#126bae"
                        onClick={onPreview}
                    />
                </div>
            </div>
        </div>
    );
};

BlogCard.propTypes = {
    title: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    updateDate: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    tags: PropTypes.arrayOf(PropTypes.string),
    image: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    className: PropTypes.string,
    onPreview: PropTypes.func
};

export default BlogCard;