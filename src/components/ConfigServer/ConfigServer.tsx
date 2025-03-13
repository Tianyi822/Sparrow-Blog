import React from 'react';
import ServerBaseForm, { ServerBaseFormData } from './ServerBaseForm/ServerBaseForm';
import './ConfigServer.scss';

interface ConfigServerProps {
  initialData?: ServerBaseFormData;
}

const ConfigServer: React.FC<ConfigServerProps> = ({ initialData }) => {

  return (
    <div className="config-server-container">
      <div className="config-form-wrapper">
        <ServerBaseForm 
          onSubmit={() => {}}
          initialData={initialData}
        />
      </div>
    </div>
  );
};

export default ConfigServer;
