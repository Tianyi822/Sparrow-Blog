import PropTypes from 'prop-types';
import { useState } from 'react';
import './FriendLink.scss';
import classNames from 'classnames';
import Apply from './Apply/Apply';

const FriendLink = ({className}) => {
    const [links] = useState([
        {
            id: 1,
            avatar: 'https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240225192355.webp',
            name: '示例博主1',
            description: '这是一个示例博主简介',
            url: 'https://example.com/blog1',
            category: '技术博客'
        },
        {
            id: 2,
            avatar: 'https://easy-blog-test.oss-cn-guangzhou.aliyuncs.com/images/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20240225192352.webp',
            name: '示例博主2',
            description: '这是另一个示例博主简介',
            url: 'https://example.com/blog2',
            category: '生活博客'
        }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('全部');

    // 获取所有分类
    const categories = ['全部', ...new Set(links.map(link => link.category))];

    // 过滤链接
    const filteredLinks = links.filter(link => {
        const matchesSearch = link.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            link.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === '全部' || link.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // 处理友链申请提交
    const handleApplySubmit = (formData) => {
        // 这里添加表单提交逻辑，例如发送到后端API
        console.log('提交的友链申请数据:', formData);
    };

    return (
        <div className={classNames('friend-link', className)}>
            <div className="friend-link-header">
                <input
                    type="text"
                    placeholder="搜索友链..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="friend-link-search"
                />
                <div className="friend-link-categories">
                    {categories.map(category => (
                        <button
                            key={category}
                            className={classNames('category-button', {
                                'active': category === selectedCategory
                            })}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>
            <div className="friend-link-grid">
                {filteredLinks.map(link => (
                    <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="friend-link-card"
                    >
                        <img src={link.avatar} alt={link.name} className="friend-avatar"/>
                        <div className="friend-info">
                            <h3 className="friend-name">{link.name}</h3>
                            <p className="friend-description">{link.description}</p>
                            <span className="friend-category">{link.category}</span>
                        </div>
                    </a>
                ))}
            </div>

            <Apply
                className="friend-link-apply"
                onSubmit={handleApplySubmit}
            />
        </div>
    );
};

FriendLink.propTypes = {
    className: PropTypes.string
};

export default FriendLink;