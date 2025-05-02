import './Tags.scss';
import use3DEffect from '@/hooks/use3DEffect';
import { BlogTag } from '@/services/webService';

interface TagsProps {
    className?: string;
    tags: BlogTag[];
}

const Tags: React.FC<TagsProps> = ({className, tags}) => {
    const { cardRef, glowRef, borderGlowRef } = use3DEffect();

    return (
        <div className={`tags ${className || ''}`} ref={cardRef}>
            <div className="tags-glow" ref={glowRef}/>
            <div className="tags-border-glow" ref={borderGlowRef}/>
            <h3 className="tags-title">
                <span className="tags-icon">🏷️</span>
                标签
            </h3>
            <div className="tags-list">
                {tags.map((tag) => (
                    <span key={tag.tag_id} className="tag-item">
                        {tag.tag_name}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default Tags;