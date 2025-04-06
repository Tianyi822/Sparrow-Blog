import React, { useState } from 'react';
import { FiServer, FiGlobe, FiLock, FiAlertCircle } from 'react-icons/fi';
import './ServiceSetting.scss';

interface ServiceConfigProps {
  onSaveSuccess?: () => void;
}

const ServiceSetting: React.FC<ServiceConfigProps> = ({ onSaveSuccess }) => {
  // 表单状态
  const [formData, setFormData] = useState({
    servicePort: '8080',
    serviceUrl: 'http://localhost:8080',
    corsOrigins: '*',
    jwtSecret: '',
    serviceTimeout: '60',
    maxUploadSize: '10',
  });

  // 错误状态
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // 清除对应字段的错误
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: '',
      });
    }
  };

  // 表单验证
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // 验证服务端口
    if (!formData.servicePort) {
      newErrors.servicePort = '请输入服务端口';
    } else if (!/^\d+$/.test(formData.servicePort)) {
      newErrors.servicePort = '服务端口必须为数字';
    }

    // 验证服务URL
    if (!formData.serviceUrl) {
      newErrors.serviceUrl = '请输入服务URL';
    } else if (!/^(http|https):\/\//.test(formData.serviceUrl)) {
      newErrors.serviceUrl = '服务URL必须以http://或https://开头';
    }

    // 验证JWT密钥
    if (!formData.jwtSecret) {
      newErrors.jwtSecret = '请输入JWT密钥';
    } else if (formData.jwtSecret.length < 8) {
      newErrors.jwtSecret = 'JWT密钥长度不能小于8个字符';
    }

    // 验证服务超时
    if (!formData.serviceTimeout) {
      newErrors.serviceTimeout = '请输入服务超时时间';
    } else if (!/^\d+$/.test(formData.serviceTimeout)) {
      newErrors.serviceTimeout = '服务超时时间必须为数字';
    }

    // 验证最大上传大小
    if (!formData.maxUploadSize) {
      newErrors.maxUploadSize = '请输入最大上传大小';
    } else if (!/^\d+$/.test(formData.maxUploadSize)) {
      newErrors.maxUploadSize = '最大上传大小必须为数字';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 处理表单提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // 这里添加API调用逻辑
      console.log('提交服务配置:', formData);

      // 显示保存成功提示
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      // 触发父组件的保存成功回调
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    }
  };

  return (
    <div className="service-setting-card">
      <div className="service-img-section">
        <div className="service-info-overlay">
          <div className="service-title">
            <FiServer className="service-icon" />
            <h2>服务配置</h2>
          </div>
          <div className="service-description">
            <p>配置API服务的基本参数，包括端口、URL、跨域设置和安全选项。</p>
            <p>这些设置将影响系统的基本运行和安全性。</p>
          </div>
        </div>
      </div>
      
      <div className="service-setting-form-wrapper">
        {saveSuccess && (
          <div className="save-notification">
            <FiAlertCircle />
            设置已保存成功！
          </div>
        )}
        
        <form className="service-setting-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <FiServer className="input-icon" />
              服务端口
            </label>
            <input
              type="text"
              name="servicePort"
              value={formData.servicePort}
              onChange={handleInputChange}
              placeholder="输入服务端口，如8080"
              className={errors.servicePort ? 'has-error' : ''}
            />
            {errors.servicePort && <div className="error-message">{errors.servicePort}</div>}
          </div>
          
          <div className="form-group">
            <label>
              <FiGlobe className="input-icon" />
              服务URL
            </label>
            <input
              type="text"
              name="serviceUrl"
              value={formData.serviceUrl}
              onChange={handleInputChange}
              placeholder="输入服务URL，如http://localhost:8080"
              className={errors.serviceUrl ? 'has-error' : ''}
            />
            {errors.serviceUrl && <div className="error-message">{errors.serviceUrl}</div>}
          </div>
          
          <div className="form-group">
            <label>
              <FiGlobe className="input-icon" />
              跨域来源
            </label>
            <input
              type="text"
              name="corsOrigins"
              value={formData.corsOrigins}
              onChange={handleInputChange}
              placeholder="输入允许的跨域来源，用逗号分隔，或使用*表示允许所有"
              className={errors.corsOrigins ? 'has-error' : ''}
            />
            {errors.corsOrigins && <div className="error-message">{errors.corsOrigins}</div>}
          </div>
          
          <div className="form-group">
            <label>
              <FiLock className="input-icon" />
              JWT密钥
            </label>
            <input
              type="password"
              name="jwtSecret"
              value={formData.jwtSecret}
              onChange={handleInputChange}
              placeholder="输入JWT密钥，至少8个字符"
              className={errors.jwtSecret ? 'has-error' : ''}
            />
            {errors.jwtSecret && <div className="error-message">{errors.jwtSecret}</div>}
          </div>
          
          <div className="form-group">
            <label>
              <FiServer className="input-icon" />
              服务超时时间(秒)
            </label>
            <input
              type="text"
              name="serviceTimeout"
              value={formData.serviceTimeout}
              onChange={handleInputChange}
              placeholder="输入服务超时时间，单位为秒"
              className={errors.serviceTimeout ? 'has-error' : ''}
            />
            {errors.serviceTimeout && <div className="error-message">{errors.serviceTimeout}</div>}
          </div>
          
          <div className="form-group">
            <label>
              <FiServer className="input-icon" />
              最大上传大小(MB)
            </label>
            <input
              type="text"
              name="maxUploadSize"
              value={formData.maxUploadSize}
              onChange={handleInputChange}
              placeholder="输入最大上传大小，单位为MB"
              className={errors.maxUploadSize ? 'has-error' : ''}
            />
            {errors.maxUploadSize && <div className="error-message">{errors.maxUploadSize}</div>}
          </div>
          
          <button type="submit" className="submit-button">
            保存配置
          </button>
        </form>
      </div>
    </div>
  );
};

export default ServiceSetting; 