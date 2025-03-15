import React from 'react';
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

  return (
    <div className="config-server-container">
      <div className="config-forms-wrapper">
        <div className="form-item">
          <ServerBaseConfigForm
            onSubmit={handleServerSubmit}
            initialData={initialServerData}
          />
        </div>
        
        <div className="form-item">
          <LoggerConfigForm
            onSubmit={handleLoggerSubmit}
            initialData={initialLoggerData}
          />
        </div>

        <div className="form-item">
          <MySqlConfigForm
            onSubmit={handleMySQLSubmit}
            initialData={initialMySQLData}
          />
        </div>

        <div className="form-item">
          <OSSConfigForm 
            onSubmit={handleOSSSubmit}
            initialData={initialOSSData}
          />
        </div>
        
        <div className="form-item">
          <CacheConfigForm 
            onSubmit={handleCacheSubmit}
            initialData={initialCacheData}
          />
        </div>
        
        <div className="form-item">
          <UserEmailConfigForm 
            onSubmit={handleUserEmailSubmit}
            initialData={initialUserEmailData}
          />
        </div>
      </div>
    </div>
  );
};

export default ConfigServer;
