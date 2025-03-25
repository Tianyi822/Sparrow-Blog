import React, { useState } from 'react';
import { FiEdit, FiTrash2, FiArrowUp, FiEye, FiEyeOff } from 'react-icons/fi';
import './Dashboard.scss';

// Mock data for posts
interface Post {
  id: number;
  title: string;
  status: 'public' | 'hidden';
  description: string;
  category: string;
  tags: string[];
  wordCount: number;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
}

const mockPosts: Post[] = Array.from({ length: 15 }, (_, index) => ({
  id: index + 1,
  title: `文章标题 ${index + 1} ${index % 3 === 0 ? '这是一个较长的标题用来测试标题显示效果' : ''}`,
  status: index % 4 === 0 ? 'hidden' : 'public',
  description: `这是文章 ${index + 1} 的简介，简要描述了文章的主要内容和亮点。`,
  category: `分类${index % 5 + 1}`,
  tags: [`标签${index % 7 + 1}`, `标签${(index + 2) % 7 + 1}`, `标签${(index + 4) % 7 + 1}`],
  wordCount: Math.floor(Math.random() * 5000) + 500,
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString().split('T')[0],
  updatedAt: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toISOString().split('T')[0],
  pinned: index % 10 === 0
}));

const Dashboard: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  
  // 处理置顶文章
  const handleTogglePin = (id: number) => {
    setPosts(prevPosts => prevPosts.map(post => 
      post.id === id ? { ...post, pinned: !post.pinned } : post
    ));
  };
  
  // 处理切换文章状态
  const handleToggleStatus = (id: number) => {
    setPosts(prevPosts => prevPosts.map(post => 
      post.id === id ? { ...post, status: post.status === 'public' ? 'hidden' : 'public' } : post
    ));
  };
  
  // 处理编辑文章
  const handleEditPost = (id: number) => {
    console.log(`编辑文章: ${id}`);
    // 实际项目中这里会跳转到编辑页面
  };
  
  // 处理删除文章
  const handleDeletePost = (id: number) => {
    if (window.confirm('确定要删除这篇文章吗？此操作不可恢复。')) {
      setPosts(prevPosts => prevPosts.filter(post => post.id !== id));
    }
  };
  
  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>文章管理</h2>
        <div className="action-buttons">
          <button className="btn btn-primary">新建文章</button>
        </div>
      </div>
      
      <div className="posts-table-container">
        <table className="posts-table">
          <thead>
            <tr>
              <th className="fixed-column index-column">序号</th>
              <th className="fixed-column title-column">标题</th>
              <th>状态</th>
              <th>简介</th>
              <th>分类</th>
              <th>标签</th>
              <th>字数</th>
              <th>创建时间</th>
              <th>修改时间</th>
              <th className="action-column">操作</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id} className={post.pinned ? 'pinned-row' : ''}>
                <td className="fixed-column index-column">{post.id}</td>
                <td className="fixed-column title-column">
                  {post.title}
                  {post.pinned && <span className="pinned-indicator">已置顶</span>}
                </td>
                <td>
                  <span className={`status-badge ${post.status}`}>
                    {post.status === 'public' ? '公开' : '隐藏'}
                  </span>
                </td>
                <td className="description-column">{post.description}</td>
                <td>{post.category}</td>
                <td className="tags-column">
                  {post.tags.map(tag => (
                    <span key={tag} className="tag-badge">{tag}</span>
                  ))}
                </td>
                <td>{post.wordCount}</td>
                <td>{post.createdAt}</td>
                <td>{post.updatedAt}</td>
                <td className="action-column">
                  <div className="action-buttons">
                    <button 
                      className="action-btn toggle-status" 
                      title={post.status === 'public' ? '隐藏' : '公开'}
                      onClick={() => handleToggleStatus(post.id)}
                    >
                      {post.status === 'public' ? <FiEyeOff /> : <FiEye />}
                    </button>
                    <button 
                      className={`action-btn toggle-pin ${post.pinned ? 'active' : ''}`}
                      title={post.pinned ? '取消置顶' : '置顶'}
                      onClick={() => handleTogglePin(post.id)}
                    >
                      <FiArrowUp />
                    </button>
                    <button 
                      className="action-btn edit" 
                      title="编辑"
                      onClick={() => handleEditPost(post.id)}
                    >
                      <FiEdit />
                    </button>
                    <button 
                      className="action-btn delete" 
                      title="删除"
                      onClick={() => handleDeletePost(post.id)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard; 