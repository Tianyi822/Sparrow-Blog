import React, { useState } from 'react';
import './ServerBaseForm.scss';

interface ServerBaseFormProps {
  onSubmit?: (formData: ServerBaseFormData) => void;
  initialData?: ServerBaseFormData;
}

export interface ServerBaseFormData {
  port: string;
  tokenSecret: string;
  tokenExpiration: string;
  corsOrigin: string;
  corsHeaders: string;
  corsMethods: string;
}

const ServerBaseForm: React.FC<ServerBaseFormProps> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState<ServerBaseFormData>({
    port: initialData?.port || '3000',
    tokenSecret: initialData?.tokenSecret || '',
    tokenExpiration: initialData?.tokenExpiration || '7',
    corsOrigin: initialData?.corsOrigin || '*',
    corsHeaders: initialData?.corsHeaders || 'Content-Type, Authorization',
    corsMethods: initialData?.corsMethods || 'GET, POST, PUT, DELETE'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit && onSubmit(formData);
  };

  return (
    <div className="server-base-form-container">
      <div className="card-glow"></div>
      <div className="card-border-glow"></div>
      
      <h2>服务基础配置</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="port">
            <span className="icon">🌐</span>
            服务端口号
          </label>
          <input
            type="text"
            id="port"
            name="port"
            value={formData.port}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="tokenSecret">
            <span className="icon">🔑</span>
            Token 密钥
          </label>
          <input
            type="password"
            id="tokenSecret"
            name="tokenSecret"
            value={formData.tokenSecret}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="tokenExpiration">
            <span className="icon">⏱️</span>
            Token 过期时间（天）
          </label>
          <input
            type="text"
            id="tokenExpiration"
            name="tokenExpiration"
            value={formData.tokenExpiration}
            onChange={handleChange}
            min="1"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="corsOrigin">
            <span className="icon">🌍</span>
            跨域源
          </label>
          <input
            type="text"
            id="corsOrigin"
            name="corsOrigin"
            value={formData.corsOrigin}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="corsHeaders">
            <span className="icon">📋</span>
            跨域请求头
          </label>
          <input
            type="text"
            id="corsHeaders"
            name="corsHeaders"
            value={formData.corsHeaders}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="corsMethods">
            <span className="icon">📡</span>
            跨域请求方法
          </label>
          <input
            type="text"
            id="corsMethods"
            name="corsMethods"
            value={formData.corsMethods}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit" className="submit-button">保存配置</button>
      </form>
    </div>
  );
};

export default ServerBaseForm;