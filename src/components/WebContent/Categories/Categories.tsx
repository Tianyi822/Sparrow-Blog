import './Categories.scss';
import use3DEffect from '@/hooks/use3DEffect';
import { BlogCategory, BlogInfo } from '@/services/webService';
import { useMemo } from 'react';

interface CategoriesProps {
    className?: string;
    categories: BlogCategory[];
    blogCounts: BlogInfo[];
}

interface CategoryWithCount extends BlogCategory {
    count: number;
}

const Categories: React.FC<CategoriesProps> = ({className, categories, blogCounts}) => {
    const { cardRef, glowRef, borderGlowRef } = use3DEffect();

    // 计算每个分类的文章数量
    const categoriesWithCount = useMemo(() => {
        return categories.map(category => {
            // 计算该分类下的文章数量
            const count = blogCounts.filter(blog => blog.category_id === category.category_id).length;
            return {
                ...category,
                count
            };
        });
    }, [categories, blogCounts]);

    return (
        <div className={`categories ${className || ''}`} ref={cardRef}>
            <div className="categories-glow" ref={glowRef}/>
            <div className="categories-border-glow" ref={borderGlowRef}/>
            <h3 className="categories-title">
                <span className="categories-icon">📂</span>
                分类
            </h3>
            <div className="categories-list">
                {categoriesWithCount.map(category => (
                    <div key={category.category_id} className="category-item">
                        <span className="category-name">{category.category_name}</span>
                        <span className="category-count">{category.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Categories;