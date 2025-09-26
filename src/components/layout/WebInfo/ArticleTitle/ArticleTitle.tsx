import SectionTitle from '../SectionTitle/SectionTitle';

interface ArticleTitleProps {
    className?: string;
}

const ArticleTitle: React.FC<ArticleTitleProps> = ({ className }) => {
    return (
        <SectionTitle 
            title="最新文章" 
            type="article" 
            className={className}
        />
    );
};

export default ArticleTitle;