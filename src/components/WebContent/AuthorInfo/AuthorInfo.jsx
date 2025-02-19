import { useState, useRef, useEffect } from 'react';
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
    const [emailAddress] = useState('chentyit@163.com');

    // 添加 3D 效果所需的 refs
    const cardRef = useRef(null);
    const glowRef = useRef(null);
    const borderGlowRef = useRef(null);

    useEffect(() => {
        const card = cardRef.current;
        const glow = glowRef.current;
        const borderGlow = borderGlowRef.current;

        const handleMouseMove = (e) => {
            if (!card || !glow || !borderGlow) return;
            
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 计算倾斜角度
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / 20;
            const rotateY = -(centerX - x) / 20;

            // 应用3D变换
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;

            // 内部光晕
            glow.style.background = `radial-gradient(circle 500px at ${x}px ${y}px, 
                rgba(255, 255, 255, 0.25) 0%, 
                rgba(255, 255, 255, 0.12) 45%, 
                transparent 100%)`;

            // 边框光晕
            borderGlow.style.background = `
                radial-gradient(circle 1000px at ${x}px ${y}px, 
                    rgba(255, 255, 255, 1) 0%, 
                    rgba(255, 255, 255, 0.7) 20%, 
                    rgba(255, 255, 255, 0.3) 40%,
                    transparent 65%)`;
        };

        const handleMouseLeave = () => {
            if (card) {
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
            }
            if (glow) {
                glow.style.background = 'transparent';
            }
            if (borderGlow) {
                borderGlow.style.background = 'transparent';
            }
        };

        card?.addEventListener('mousemove', handleMouseMove);
        card?.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            card?.removeEventListener('mousemove', handleMouseMove);
            card?.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    const handleStatClick = (type) => {
        console.log(`Clicked ${type}`); // 暂时只打印点击信息
        // 后续可以添加导航或其他处理逻辑
    };

    return (
        <div className="author-info" ref={cardRef}>
            <div className="author-info-glow" ref={glowRef}/>
            <div className="author-info-border-glow" ref={borderGlowRef}/>
            <div className="author-avatar">
                <img src="https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/ayaka.jpg" alt="Tianyi"/>
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
            <a
                href={`mailto:${emailAddress}`}
                className="email-link"
                rel="noopener noreferrer"
            >
                <span className="email-icon">Email</span>
            </a>
        </div>
    );
};

export default AuthorInfo; 