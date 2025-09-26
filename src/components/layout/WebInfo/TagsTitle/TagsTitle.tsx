import SectionTitle from '../SectionTitle/SectionTitle';

interface TagsTitleProps {
    className?: string;
}

const TagsTitle: React.FC<TagsTitleProps> = ({ className }) => {
    return (
        <SectionTitle 
            title="标签" 
            type="tags" 
            className={className}
        />
    );
};

export default TagsTitle;