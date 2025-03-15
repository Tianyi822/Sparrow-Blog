import React, { useState } from 'react';
import ServerBaseConfigForm, { ServerBaseFormData } from '@/components/ConfigServer/ServerBaseConfigForm/ServerBaseConfigForm.tsx';
import LoggerConfigForm, { LoggerFormData } from '@/components/ConfigServer/LoggerConfigForm/LoggerConfigForm.tsx';
import MySqlConfigForm, { MySQLFormData } from '@/components/ConfigServer/MySqlConfigForm/MySqlConfigForm.tsx';
import OSSConfigForm, { OSSConfigFormData } from './OSSConfigForm/OSSConfigForm';
import CacheConfigForm, { CacheConfigFormData } from './CacheConfigForm/CacheConfigForm';
import UserEmailConfigForm, { UserEmailConfigFormData } from './UserEmailConfigForm/UserEmailConfigForm';
import './ConfigServer.scss';

interface ConfigServerProps {
  initialServerData?: ServerBaseFormData;
  initialLoggerData?: LoggerFormData;
  initialMySQLData?: MySQLFormData;
  initialOSSData?: OSSConfigFormData;
  initialCacheData?: CacheConfigFormData;
  initialUserEmailData?: UserEmailConfigFormData;
}

const ConfigServer: React.FC<ConfigServerProps> = ({ 
  initialServerData, 
  initialLoggerData,
  initialMySQLData,
  initialOSSData,
  initialCacheData,
  initialUserEmailData
}) => {
  // State to track the current form index
  const [currentFormIndex, setCurrentFormIndex] = useState(0);

  // Form titles for reference
  const formTitles = [
    "服务基础配置",
    "日志配置",
    "数据库配置",
    "OSS 存储配置",
    "缓存配置",
    "用户与邮箱配置"
  ];

  const handleServerSubmit = (data: ServerBaseFormData) => {
    console.log('Server config submitted:', data);
    // Here you would typically save the data to your backend
  };

  const handleLoggerSubmit = (data: LoggerFormData) => {
    console.log('Logger config submitted:', data);
    // Here you would typically save the data to your backend
  };

  const handleMySQLSubmit = (data: MySQLFormData) => {
    console.log('MySQL config submitted:', data);
    // Here you would typically save the data to your backend
  };

  const handleOSSSubmit = (data: OSSConfigFormData) => {
    console.log('OSS config submitted:', data);
    // Here you would typically save the data to your backend
  };
  
  const handleCacheSubmit = (data: CacheConfigFormData) => {
    console.log('Cache config submitted:', data);
    // Here you would typically save the data to your backend
  };
  
  const handleUserEmailSubmit = (data: UserEmailConfigFormData) => {
    console.log('User & Email config submitted:', data);
    // Here you would typically save the data to your backend
  };

  const goToForm = (index: number) => {
    if (index >= 0 && index <= 5) {
      setCurrentFormIndex(index);
    }
  };

  // Render the current form based on index
  const renderCurrentForm = () => {
    switch (currentFormIndex) {
      case 0:
        return (
          <ServerBaseConfigForm
            onSubmit={handleServerSubmit}
            initialData={initialServerData}
          />
        );
      case 1:
        return (
          <LoggerConfigForm
            onSubmit={handleLoggerSubmit}
            initialData={initialLoggerData}
          />
        );
      case 2:
        return (
          <MySqlConfigForm
            onSubmit={handleMySQLSubmit}
            initialData={initialMySQLData}
          />
        );
      case 3:
        return (
          <OSSConfigForm 
            onSubmit={handleOSSSubmit}
            initialData={initialOSSData}
          />
        );
      case 4:
        return (
          <CacheConfigForm 
            onSubmit={handleCacheSubmit}
            initialData={initialCacheData}
          />
        );
      case 5:
        return (
          <UserEmailConfigForm 
            onSubmit={handleUserEmailSubmit}
            initialData={initialUserEmailData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="config-server-container">
      {/* Navigation dots moved to left side */}
      <div className="form-navigation-dots">
        {formTitles.map((title, index) => (
          <button
            key={index}
            className={`nav-dot ${currentFormIndex === index ? 'active' : ''}`}
            onClick={() => goToForm(index)}
            aria-label={title}
            title={title}
          />
        ))}
      </div>

      {/* The current form centered in the page */}
      <div className="config-form-content">
        <div className="current-form-container">
          {renderCurrentForm()}
        </div>
      </div>
    </div>
  );
};

export default ConfigServer;