import './TagsTitle.scss';

interface TagsTitleProps {
    className?: string;
}

const TagsTitle: React.FC<TagsTitleProps> = ({ className }) => {
    return (
        <div className={`tags-title-container ${className || ''}`}>
            <div className="tags-title-border-glow" />
            <h3 className="tags-title-text">
                标签
            </h3>
        </div>
    );
};

export default TagsTitle;