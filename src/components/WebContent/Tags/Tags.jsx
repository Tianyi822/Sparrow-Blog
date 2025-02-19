import './Tags.scss';
import PropTypes from 'prop-types';
import use3DEffect from '@/hooks/use3DEffect';

const TAGS = [
    "Bilibili World", "C", "CPP", "ClickHouse",
    "ElasticSearch", "Flink", "HDFS", "Hexo", "JVM",
    "Java源码", "Linux", "Maven", "MySQL", "Python",
    "SQL", "Spark", "Twikoo", "VSCode", "Zookeeper",
    "年", "数据库", "数据结构", "智能指针", "算法",
    "骚年商城开发系列"
];

const Tags = ({className}) => {
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
                {TAGS.map((tag, index) => (
                    <span key={index} className="tag-item">
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
};

Tags.propTypes = {
    className: PropTypes.string
};

export default Tags; 