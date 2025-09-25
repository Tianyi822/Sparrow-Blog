import './ArticleTitle.scss';

interface ArticleTitleProps {
    className?: string;
}

const ArticleTitle: React.FC<ArticleTitleProps> = ({ className }) => {
    return (
        <div className={`article-title-container ${className || ''}`}>
            <div className="article-title-border-glow" />
            <h3 className="article-title-text">
                最新文章
            </h3>
        </div>
    );
};

export default ArticleTitle;