import SectionTitle from '../SectionTitle/SectionTitle';

interface CategoriesTitleProps {
    className?: string;
}

const CategoriesTitle: React.FC<CategoriesTitleProps> = ({ className }) => {
    return (
        <SectionTitle 
            title="分类" 
            type="categories" 
            className={className}
        />
    );
};

export default CategoriesTitle;