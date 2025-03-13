import React, { useState, useEffect } from 'react';
import './ServerBaseForm.scss';

interface ValidationErrors {
  port?: string;
  tokenSecret?: string;
  tokenExpiration?: string;
  corsOrigin?: string;
  corsHeaders?: string;
  corsMethods?: string;
}

const generateRandomToken = (length: number = 20): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  return Array.from(crypto.getRandomValues(new Uint8Array(length)))
    .map(x => chars.charAt(x % chars.length))
    .join('');
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

interface ServerBaseFormProps {
  onSubmit?: (formData: ServerBaseFormData) => void;
  initialData?: ServerBaseFormData;
  serverError?: string; // 添加后端错误信息属性
}

export interface ServerBaseFormData {
  port: string;
  tokenSecret: string;
  tokenExpiration: string;
  corsOrigin: string;
  corsHeaders: string;
  corsMethods: string;
}

const ServerBaseForm: React.FC<ServerBaseFormProps> = ({ onSubmit, initialData, serverError }) => {
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formData, setFormData] = useState<ServerBaseFormData>({
    port: initialData?.port || '3000',
    tokenSecret: initialData?.tokenSecret || '',
    tokenExpiration: initialData?.tokenExpiration || '7',
    corsOrigin: initialData?.corsOrigin || '*',
    corsHeaders: initialData?.corsHeaders || 'Content-Type, Authorization',
    corsMethods: initialData?.corsMethods || 'GET, POST, PUT, DELETE'
  });

  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'port':
        const portNum = parseInt(value);
        if (isNaN(portNum) || !Number.isInteger(portNum)) {
          return '端口号必须为整数';
        }
        if (portNum < 0 || portNum > 65535) {
          return '端口号必须在0~65535之间';
        }
        return '';

      case 'tokenSecret':
        if (value.length < 20) {
          return 'Token密钥长度必须大于20个字符';
        }
        return '';

      case 'tokenExpiration':
        const days = parseInt(value);
        if (isNaN(days) || !Number.isInteger(days)) {
          return 'Token过期时间必须为整数';
        }
        if (days < 0 || days > 30) {
          return 'Token过期时间必须在0~30天之间';
        }
        return '';

      case 'corsOrigin':
        if (!value.trim()) {
          return '跨域源不能为空';
        }
        if (value.includes('，')) {
          return '请使用英文逗号(,)分隔多个跨域源';
        }
        const origins = value.split(',').map(o => o.trim());
        const invalidOrigins = origins.filter(o => o !== '*' && !isValidUrl(o));
        if (invalidOrigins.length > 0) {
          return '存在无效的跨域源URL格式';
        }
        return '';

      case 'corsHeaders':
        if (!value.trim()) {
          return '请求头不能为空';
        }
        if (value.includes('，')) {
          return '请使用英文逗号(,)分隔多个请求头';
        }
        return '';

      case 'corsMethods':
        if (!value.trim()) {
          return '请求方法不能为空';
        }
        if (value.includes('，')) {
          return '请使用英文逗号(,)分隔多个请求方法';
        }
        return '';

      default:
        return '';
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 验证所有字段
    const newErrors: ValidationErrors = {};
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) {
        newErrors[key as keyof ValidationErrors] = error;
      }
    });

    setErrors(newErrors);

    // 如果没有错误，则提交表单
    if (Object.keys(newErrors).length === 0) {
      onSubmit && onSubmit(formData);
    }
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
          {errors.port && <div className="error-message">{errors.port}</div>}
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
          {errors.tokenSecret && <div className="error-message">{errors.tokenSecret}</div>}
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
            required
          />
          {errors.tokenExpiration && <div className="error-message">{errors.tokenExpiration}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="corsOrigin">
            <span className="icon">🌍</span>
            跨域源 ( 请使用英文逗号分隔 )
          </label>
          <input
            type="text"
            id="corsOrigin"
            name="corsOrigin"
            value={formData.corsOrigin}
            onChange={handleChange}
            required
          />
          {errors.corsOrigin && <div className="error-message">{errors.corsOrigin}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="corsHeaders">
            <span className="icon">📋</span>
            跨域请求头 ( 请使用英文逗号分隔 )
          </label>
          <input
            type="text"
            id="corsHeaders"
            name="corsHeaders"
            value={formData.corsHeaders}
            onChange={handleChange}
            required
          />
          {errors.corsHeaders && <div className="error-message">{errors.corsHeaders}</div>}
        </div>

        <div className="form-group">
          <label htmlFor="corsMethods">
            <span className="icon">📡</span>
            跨域请求方法 ( 请使用英文逗号分隔 )
          </label>
          <input
            type="text"
            id="corsMethods"
            name="corsMethods"
            value={formData.corsMethods}
            onChange={handleChange}
            required
          />
          {errors.corsMethods && <div className="error-message">{errors.corsMethods}</div>}
        </div>

        <button type="submit" className="submit-button">保存配置</button>
        {serverError && <div className="server-error-message">{serverError}</div>}
      </form>
    </div>
  );
};

export default ServerBaseForm;