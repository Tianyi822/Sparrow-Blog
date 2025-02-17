import PropTypes from 'prop-types';
import { BlogType } from '../types';
import './BlogCollections.scss';

const BlogCollections = ({ blogs, onClose }) => {
    const handleContainerClick = (e) => {
        // 阻止事件冒泡，防止触发遮罩层的点击事件
        e.stopPropagation();
        
        // 检查点击的元素是否是卡片内的元素
        const isCardElement = e.target.closest('.item');
        if (!isCardElement) {
            onClose(e);
        }
    };

    return (
        <div className="shell" onClick={handleContainerClick}>
            <div className="shell-body">
                <div className="shell-slider">
                    {blogs.map((blog) => (
                        <div key={blog.id} className="item">
                            <div className="frame">
                                <div 
                                    className="box front"
                                    style={{ backgroundImage: `url(${blog.imageUrl})` }}
                                >
                                    <div className="content-wrapper">
                                        <h1>{blog.title}</h1>
                                        <div className="date">{blog.date}</div>
                                        <span>{blog.description}</span>
                                    </div>
                                </div>
                                <div 
                                    className="box left"
                                    style={{ backgroundImage: `url(${blog.imageUrl})` }}
                                />
                                <div 
                                    className="box right"
                                    style={{ backgroundImage: `url(${blog.imageUrl})` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

BlogCollections.propTypes = {
    blogs: PropTypes.arrayOf(BlogType).isRequired,
    onClose: PropTypes.func.isRequired
};

export default BlogCollections; 