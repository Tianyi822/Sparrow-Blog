import './Tags.scss';
import { BlogTag } from '@/types';
import { memo, useCallback } from 'react';

/**
 * 标签云组件属性接口
 */
interface TagsProps {
    /** 自定义类名 */
    className?: string;
    /** 标签数据列表 */
    tags: BlogTag[];
    /** 标签点击处理函数 */
    onTagClick?: (tag: BlogTag) => void;
    /** 当前激活的标签ID */
    activeTag?: string | null;
}

/**
 * 标签云组件
 * 
 * 显示博客标签列表，支持点击筛选和高亮显示当前选中标签
 */
const Tags: React.FC<TagsProps> = memo(({
    className, 
    tags, 
    onTagClick,
    activeTag
}) => {

    /**
     * 处理标签点击事件
     */
    const handleTagClick = useCallback((tag: BlogTag) => {
        if (onTagClick) {
            onTagClick(tag);
        }
    }, [onTagClick]);

    return (
        <div className={`tags ${className || ''}`}>
            {/* 光晕效果元素 */}
            <div className="tags-border-glow" />
            

            
            {/* 标签列表 */}
            <div className="tags-list">
                {tags.map((tag) => {
                    // 确保tag_id存在
                    const tagId = tag.tag_id || '';
                    const isActive = activeTag !== null && tagId !== '' && activeTag === tagId;
                    
                    return (
                        <span 
                            key={tagId || `tag-${Math.random().toString(36).substr(2, 9)}`} 
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
});

Tags.displayName = 'Tags';

export default Tags;