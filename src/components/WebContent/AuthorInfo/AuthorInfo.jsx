import { useState, useRef, useEffect } from 'react';
import './AuthorInfo.scss';
import use3DEffect from '@/hooks/use3DEffect';

// 添加作者配置
const AUTHOR_CONFIG = {
    avatar: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/ayaka.jpg",
    name: "Tianyi",
    description: "一个怀揣各种梦想的二次元",
    github: "https://github.com/Tianyi822",
    email: "chentyit@163.com"
};

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

    const { cardRef, glowRef, borderGlowRef } = use3DEffect();

    const handleStatClick = (type) => {
        console.log(`Clicked ${type}`); // 暂时只打印点击信息
        // 后续可以添加导航或其他处理逻辑
    };

    return (
        <div className="author-info" ref={cardRef}>
            <div className="author-info-glow" ref={glowRef}/>
            <div className="author-info-border-glow" ref={borderGlowRef}/>
            <div className="author-info-content">
                <div className="author-avatar">
                    <img src={AUTHOR_CONFIG.avatar} alt="author avatar" />
                </div>
                <h2 className="author-name">{AUTHOR_CONFIG.name}</h2>
                <p className="author-description">{AUTHOR_CONFIG.description}</p>
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
                    href={AUTHOR_CONFIG.github}
                    className="github-link"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <span className="github-icon">GitHub</span>
                </a>
                <a
                    href={`mailto:${AUTHOR_CONFIG.email}`}
                    className="email-link"
                    rel="noopener noreferrer"
                >
                    <span className="email-icon">Email</span>
                </a>
            </div>
        </div>
    );
};

export default AuthorInfo; 