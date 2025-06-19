import './Categories.scss';
import use3DEffect from '@/hooks/use3DEffect';
import { BlogCategory } from '@/services/adminService';
import { BlogInfo } from '@/services/webService';
import { useMemo } from 'react';

interface CategoriesProps {
    className?: string;
    categories: BlogCategory[];
    blogCounts: BlogInfo[];
    onCategoryClick?: (category: BlogCategory) => void;
    activeCategory?: string | null; // Selected category ID as string
}

interface CategoryWithCount extends BlogCategory {
    count: number;
}

const Categories: React.FC<CategoriesProps> = ({
    className, 
    categories, 
    blogCounts, 
    onCategoryClick,
    activeCategory
}) => {
    const { cardRef } = use3DEffect();

    // 计算每个分类的文章数量
    const categoriesWithCount = useMemo(() => {
        console.log('Total blogs passed to Categories:', blogCounts.length);
        console.log('Categories to count:', categories);
        
        // 帮助调试：打印每篇博客的分类信息
        blogCounts.forEach(blog => {
            console.log(`Blog "${blog.blog_title}" has category:`, blog.category);
        });
        
        return categories.map(category => {
            // 确保 category_id 存在
            const categoryId = category.category_id || '';
            
            // 计算该分类下的文章数量 - 确保使用字符串比较
            const count = blogCounts.filter(blog => {
                // 确保两边都是字符串进行比较
                // 注意：正确的路径是 blog.category.category_id 而不是 blog.category_id
                const blogCategoryId = blog.category && blog.category.category_id 
                    ? String(blog.category.category_id) 
                    : '';
                const match = blogCategoryId === String(categoryId);
                
                console.log(`Comparing blog "${blog.blog_title}": category_id=${blogCategoryId} with category "${category.category_name}" (ID=${categoryId}), match=${match}`);
                
                return match;
            }).length;
            
            console.log(`Category "${category.category_name}" (ID: ${categoryId}) has ${count} blogs`);
            
            return {
                ...category,
                count
            };
        });
    }, [categories, blogCounts]);

    const handleCategoryClick = (category: CategoryWithCount) => {
        console.log('Category clicked:', category);
        console.log('Category ID:', category.category_id, 'Type:', typeof category.category_id);
        
        if (onCategoryClick) {
            onCategoryClick(category);
        }
    };

    return (
        <div className={`categories ${className || ''}`} ref={cardRef}>
            <h3 className="categories-title">
                <span className="categories-icon">📂</span>
                分类
            </h3>
            <div className="categories-list">
                {categoriesWithCount.map(category => {
                    // 确保category_id存在
                    const categoryId = category.category_id || '';
                    const isActive = activeCategory !== null && categoryId !== '' && activeCategory === categoryId;
                    
                    return (
                        <div 
                            key={categoryId || Math.random().toString()} 
                            className={`category-item ${isActive ? 'active' : ''}`}
                            onClick={() => handleCategoryClick(category)}
                        >
                            <span className="category-name">{category.category_name || '未命名分类'}</span>
                            <span className="category-count">{category.count || 0}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Categories;