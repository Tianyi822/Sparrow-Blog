import './LatestArticles.scss';
import use3DEffect from '@/hooks/use3DEffect';

interface LatestArticlesProps {
    className?: string;
}

interface ArticleItem {
    id: number;
    title: string;
    date: string;
    image: string;
}

const LATEST_ARTICLES: ArticleItem[] = [
    {
        id: 1,
        title: "Vite+React 没有 ReactComponent 解决方案",
        date: "2023-09-10",
        image: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/ayaka.jpg"
    },
    {
        id: 2,
        title: "MacBook M1平台使用 C++ 连接 MySQL",
        date: "2021-12-27",
        image: "https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/ayaka.jpg"
    },
    // ... 其他文章
];

const LatestArticles: React.FC<LatestArticlesProps> = ({className}) => {
    const { cardRef, glowRef, borderGlowRef } = use3DEffect();

    return (
        <div className={`latest-articles ${className || ''}`} ref={cardRef}>
            <div className="latest-articles-glow" ref={glowRef}/>
            <div className="latest-articles-border-glow" ref={borderGlowRef}/>
            <h3 className="latest-articles-title">
                <span className="latest-articles-icon">🕒</span>
                最新文章
            </h3>
            <div className="latest-articles-list">
                {LATEST_ARTICLES.map(article => (
                    <div key={article.id} className="article-item">
                        <img src={article.image} alt={article.title} className="article-image"/>
                        <div className="article-info">
                            <h4 className="article-title">{article.title}</h4>
                            <span className="article-date">{article.date}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LatestArticles;