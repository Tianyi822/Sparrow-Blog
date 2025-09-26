import './CategoriesTitle.scss';

interface CategoriesTitleProps {
    className?: string;
}

const CategoriesTitle: React.FC<CategoriesTitleProps> = ({ className }) => {
    return (
        <div className={`categories-title-container ${className || ''}`}>
            <div className="categories-title-border-glow" />
            <h3 className="categories-title-text">
                分类
            </h3>
        </div>
    );
};

export default CategoriesTitle;