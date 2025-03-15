import React from 'react';
import ServerBaseForm, { ServerBaseFormData } from './ServerBaseForm/ServerBaseForm';
import LoggerForm, { LoggerFormData } from './LoggerForm/LoggerForm';
import MySQLForm, { MySQLFormData } from './MySQLForm/MySQLForm';
import OSSConfigForm, { OSSConfigFormData } from './OSSConfigForm/OSSConfigForm';
import './ConfigServer.scss';

interface ConfigServerProps {
  initialServerData?: ServerBaseFormData;
  initialLoggerData?: LoggerFormData;
  initialMySQLData?: MySQLFormData;
  initialOSSData?: OSSConfigFormData;
}

const ConfigServer: React.FC<ConfigServerProps> = ({ 
  initialServerData, 
  initialLoggerData,
  initialMySQLData,
  initialOSSData
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

  return (
    <div className="config-server-container">
      <div className="config-forms-wrapper">
        <div className="form-item">
          <ServerBaseForm 
            onSubmit={handleServerSubmit}
            initialData={initialServerData}
          />
        </div>
        
        <div className="form-item">
          <LoggerForm 
            onSubmit={handleLoggerSubmit}
            initialData={initialLoggerData}
          />
        </div>

        <div className="form-item">
          <MySQLForm 
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
      </div>
    </div>
  );
};

export default ConfigServer;
