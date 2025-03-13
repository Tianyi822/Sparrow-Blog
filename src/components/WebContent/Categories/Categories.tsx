import './Categories.scss';
import use3DEffect from '@/hooks/use3DEffect';

interface CategoriesProps {
    className?: string;
}

interface CategoryItem {
    id: number;
    name: string;
    count: number;
}

const CATEGORIES: CategoryItem[] = [
    {id: 1, name: "博客版本记录", count: 1},
    {id: 2, name: "大数据", count: 10},
    {id: 3, name: "奇技淫巧", count: 3},
    {id: 4, name: "学习笔记", count: 23},
    {id: 5, name: "小工具开发", count: 1},
    {id: 6, name: "生活", count: 3}
];

const Categories: React.FC<CategoriesProps> = ({className}) => {
    const { cardRef, glowRef, borderGlowRef } = use3DEffect();

    return (
        <div className={`categories ${className || ''}`} ref={cardRef}>
            <div className="categories-glow" ref={glowRef}/>
            <div className="categories-border-glow" ref={borderGlowRef}/>
            <h3 className="categories-title">
                <span className="categories-icon">📂</span>
                分类
            </h3>
            <div className="categories-list">
                {CATEGORIES.map(category => (
                    <div key={category.id} className="category-item">
                        <span className="category-name">{category.name}</span>
                        <span className="category-count">{category.count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Categories;