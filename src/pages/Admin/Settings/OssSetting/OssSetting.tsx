import React, { useState } from 'react';
import {
  FiBox,
  FiCloud,
  FiFile,
  FiGlobe,
  FiImage,
  FiKey,
  FiLock,
  FiAlertCircle
} from 'react-icons/fi';
import './OssSetting.scss';

interface OssFormData {
  endpoint: string;
  region: string;
  accessKeyId: string;
  accessKeySecret: string;
  bucketName: string;
  imagePath: string;
  blogPath: string;
}

interface ValidationErrors {
  [key: string]: string;
}

interface OssConfigProps {
  onSaveSuccess?: () => void;
}

const OssSetting: React.FC<OssConfigProps> = ({ onSaveSuccess }) => {
  const [formData, setFormData] = useState<OssFormData>({
    endpoint: '',
    region: '',
    accessKeyId: '',
    accessKeySecret: '',
    bucketName: '',
    imagePath: 'images/',
    blogPath: 'blogs/'
  });
  
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const validateField = (name: string, value: string): string => {
    switch(name) {
      case 'endpoint':
        return value.trim() ? '' : 'Endpoint 不能为空';
      case 'region':
        return value.trim() ? '' : '区域不能为空';
      case 'accessKeyId':
        return value.trim() ? '' : 'AccessKey ID不能为空';
      case 'accessKeySecret':
        return value.trim() ? '' : 'AccessKey Secret不能为空';
      case 'bucketName':
        return value.trim() ? '' : 'Bucket名称不能为空';
      case 'imagePath':
        if (!value.trim()) return '图片路径不能为空';
        if (!value.endsWith('/')) return '路径必须以 / 结尾';
        return '';
      case 'blogPath':
        if (!value.trim()) return '博客路径不能为空';
        if (!value.endsWith('/')) return '路径必须以 / 结尾';
        return '';
      default:
        return '';
    }
  };
  
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;
    
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // 清除错误
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // 如果有成功消息，清除它
    if (saveSuccess) {
      setSaveSuccess(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 这里应该调用API保存OSS配置
      // 处理路径以斜杠结尾
      const dataToSubmit = {
        ...formData,
        imagePath: formData.imagePath.endsWith('/') ? formData.imagePath : formData.imagePath + '/',
        blogPath: formData.blogPath.endsWith('/') ? formData.blogPath : formData.blogPath + '/'
      };
      
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      // 实际生产环境会使用下面的代码调用API
      // 例如：await saveOssConfig(dataToSubmit);
      console.log('将提交的数据:', dataToSubmit);
      
      // 显示成功消息
      setSaveSuccess(true);
      
      // 如果有回调函数，调用它
      if (onSaveSuccess) {
        onSaveSuccess();
      }
    } catch (error) {
      console.error('保存OSS配置失败:', error);
      // 如果需要，可以处理错误信息
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getIconByFieldName = (name: string) => {
    switch(name) {
      case 'endpoint': return <FiCloud className="input-icon" />;
      case 'region': return <FiGlobe className="input-icon" />;
      case 'accessKeyId': return <FiKey className="input-icon" />;
      case 'accessKeySecret': return <FiLock className="input-icon" />;
      case 'bucketName': return <FiBox className="input-icon" />;
      case 'imagePath': return <FiImage className="input-icon" />;
      case 'blogPath': return <FiFile className="input-icon" />;
      default: return null;
    }
  };
  
  const getFieldLabel = (name: string) => {
    switch(name) {
      case 'endpoint': return 'OSS Endpoint';
      case 'region': return '区域';
      case 'accessKeyId': return 'AccessKey ID';
      case 'accessKeySecret': return 'AccessKey Secret';
      case 'bucketName': return 'Bucket名称';
      case 'imagePath': return '图片OSS路径';
      case 'blogPath': return '博客OSS路径';
      default: return name;
    }
  };
  
  const getFieldPlaceholder = (name: string) => {
    switch(name) {
      case 'endpoint': return 'oss-cn-guangzhou.aliyuncs.com';
      case 'region': return 'cn-guangzhou';
      case 'accessKeyId': return '请输入AccessKey ID';
      case 'accessKeySecret': return '请输入AccessKey Secret';
      case 'bucketName': return '请输入Bucket名称';
      case 'imagePath': return 'images/';
      case 'blogPath': return 'blogs/';
      default: return '';
    }
  };
  
  const getFieldType = (name: string) => {
    switch(name) {
      case 'accessKeyId':
      case 'accessKeySecret':
        return 'password';
      default:
        return 'text';
    }
  };
  
  const formFields = [
    'endpoint',
    'region',
    'accessKeyId',
    'accessKeySecret',
    'bucketName',
    'imagePath',
    'blogPath'
  ];
  
  return (
    <div className="oss-setting-card">
      <div className="oss-img-section">
        <div className="oss-info-overlay">
          <div className="oss-title">
            <FiCloud className="oss-icon" />
            <h2>OSS存储配置</h2>
          </div>
          <div className="oss-description">
            <p>
              在这里配置您的对象存储服务(OSS)信息，包括访问密钥、存储区域和路径设置。这些配置将用于存储和访问您的博客图片和其他资源。
            </p>
            <p>
              请确保提供正确的OSS连接信息，以确保资源能够正常上传和访问。所有字段均为必填项。
            </p>
          </div>
        </div>
      </div>
      
      <div className="oss-setting-form-wrapper">
        {saveSuccess && (
          <div className="save-notification">
            <FiAlertCircle />
            设置已保存成功！
          </div>
        )}
        
        <form className="oss-setting-form" onSubmit={handleSubmit}>
          {formFields.map((field) => (
            <div className="form-group" key={field}>
              <label>
                {getIconByFieldName(field)}
                {getFieldLabel(field)}
              </label>
              <input
                type={getFieldType(field)}
                name={field}
                value={formData[field as keyof OssFormData]}
                onChange={handleInputChange}
                placeholder={getFieldPlaceholder(field)}
                className={errors[field] ? 'has-error' : ''}
              />
              {errors[field] && <div className="error-message">{errors[field]}</div>}
            </div>
          ))}
          
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? '保存中...' : '保存配置'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default OssSetting; 