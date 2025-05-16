import './Tags.scss';
import use3DEffect from '@/hooks/use3DEffect';
import { BlogTag } from '@/services/adminService';

interface TagsProps {
    className?: string;
    tags: BlogTag[];
    onTagClick?: (tag: BlogTag) => void;
    activeTag?: string | null; // Selected tag ID as string
}

const Tags: React.FC<TagsProps> = ({
    className, 
    tags, 
    onTagClick,
    activeTag
}) => {
    const { cardRef, glowRef, borderGlowRef } = use3DEffect();

    const handleTagClick = (tag: BlogTag) => {
        if (onTagClick) {
            onTagClick(tag);
        }
    };

    return (
        <div className={`tags ${className || ''}`} ref={cardRef}>
            <div className="tags-glow" ref={glowRef}/>
            <div className="tags-border-glow" ref={borderGlowRef}/>
            <h3 className="tags-title">
                <span className="tags-icon">🏷️</span>
                标签
            </h3>
            <div className="tags-list">
                {tags.map((tag) => {
                    // 确保tag_id存在
                    const tagId = tag.tag_id || '';
                    const isActive = activeTag !== null && tagId !== '' && activeTag === tagId;
                    
                    return (
                        <span 
                            key={tagId || Math.random().toString()} 
                            className={`tag-item ${isActive ? 'active' : ''}`}
                            onClick={() => handleTagClick(tag)}
                        >
                            {tag.tag_name || '未命名标签'}
                        </span>
                    );
                })}
            </div>
        </div>
    );
};

export default Tags;