import React, { useState } from 'react';
import './AuthorInfo.scss';

const AuthorInfo = () => {
    const [stats] = useState({
        articles: {
            value: 41,
            label: '文章'
        },
        tags: {
            value: 25,
            label: '标签'
        },
        categories: {
            value: 6,
            label: '分类'
        }
    });

    const [githubUrl] = useState('https://github.com/Tianyi822');

    const handleStatClick = (type) => {
        console.log(`Clicked ${type}`); // 暂时只打印点击信息
        // 后续可以添加导航或其他处理逻辑
    };

    return (
        <div className="author-info">
            <div className="author-avatar">
                <img src="https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/ayaka.jpg" alt="Tianyi" />
            </div>
            <h2 className="author-name">Tianyi</h2>
            <p className="author-description">一个怀揣各种梦想的二次元</p>
            <div className="author-stats">
                <div 
                    className="stat-item" 
                    onClick={() => handleStatClick('articles')}
                    role="button"
                    tabIndex={0}
                >
                    <span className="stat-value">{stats.articles.value}</span>
                    <span className="stat-label">{stats.articles.label}</span>
                </div>
                <div 
                    className="stat-item"
                    onClick={() => handleStatClick('tags')}
                    role="button"
                    tabIndex={0}
                >
                    <span className="stat-value">{stats.tags.value}</span>
                    <span className="stat-label">{stats.tags.label}</span>
                </div>
                <div 
                    className="stat-item"
                    onClick={() => handleStatClick('categories')}
                    role="button"
                    tabIndex={0}
                >
                    <span className="stat-value">{stats.categories.value}</span>
                    <span className="stat-label">{stats.categories.label}</span>
                </div>
            </div>
            <a 
                href={githubUrl} 
                className="github-link" 
                target="_blank" 
                rel="noopener noreferrer"
            >
                <span className="github-icon">GitHub</span>
            </a>
        </div>
    );
};

export default AuthorInfo; 