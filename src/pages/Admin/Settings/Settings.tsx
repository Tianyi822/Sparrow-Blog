import React, { useState } from 'react';
import { FiAlertCircle, FiSettings, FiUser, FiServer, FiDatabase, FiHardDrive, FiCpu, FiSave } from 'react-icons/fi';
import UserSetting from './UserSetting';
import './Settings.scss';

type SettingTab = 'user' | 'service' | 'log' | 'database' | 'oss' | 'cache';

const Settings: React.FC = () => {
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [activeTab, setActiveTab] = useState<SettingTab>('user');

    const handleSaveSuccess = () => {
        // 显示全局保存成功提示
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const handleSaveClick = () => {
        // 目前不做网络请求，直接显示保存成功
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'user':
                return <UserSetting onSaveSuccess={handleSaveSuccess} />;
            case 'service':
            case 'log':
            case 'database':
            case 'oss':
            case 'cache':
                return (
                    <div className="placeholder-content">
                        <div className="placeholder-icon">
                            <FiSettings />
                        </div>
                        <p>该功能正在开发中...</p>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="settings-page">
            <div className="edit-container">
                <div className="edit-header">
                    <div className="settings-tabs">
                        <button 
                            className={`tab-item ${activeTab === 'user' ? 'active' : ''}`} 
                            onClick={() => setActiveTab('user')}
                        >
                            <FiUser /> 用户设置
                        </button>
                        <button 
                            className={`tab-item ${activeTab === 'service' ? 'active' : ''}`} 
                            onClick={() => setActiveTab('service')}
                        >
                            <FiServer /> 服务设置
                        </button>
                        <button 
                            className={`tab-item ${activeTab === 'log' ? 'active' : ''}`} 
                            onClick={() => setActiveTab('log')}
                        >
                            <FiCpu /> 日志设置
                        </button>
                        <button 
                            className={`tab-item ${activeTab === 'database' ? 'active' : ''}`} 
                            onClick={() => setActiveTab('database')}
                        >
                            <FiDatabase /> 数据库设置
                        </button>
                        <button 
                            className={`tab-item ${activeTab === 'oss' ? 'active' : ''}`} 
                            onClick={() => setActiveTab('oss')}
                        >
                            <FiHardDrive /> OSS设置
                        </button>
                        <button 
                            className={`tab-item ${activeTab === 'cache' ? 'active' : ''}`} 
                            onClick={() => setActiveTab('cache')}
                        >
                            <FiCpu /> 缓存设置
                        </button>
                    </div>
                    <div className="header-actions">
                        <button className="save-button" onClick={handleSaveClick}>
                            <FiSave /> 保存设置
                        </button>
                    </div>
                </div>

                {saveSuccess && (
                    <div className="auto-save-notification">
                        <FiAlertCircle /> 设置已保存成功！
                    </div>
                )}

                <div className="user-setting-wrapper">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default Settings; 