import React, { useState } from 'react';
import {
    FiChevronDown,
    FiCpu,
    FiDatabase,
    FiHardDrive,
    FiServer,
    FiUser
} from 'react-icons/fi';
import LogSetting from './LogSetting';
import ServiceSetting from './ServiceSetting';
import './Settings.scss';
import UserSetting from './UserSetting';
import DatabaseSetting from './DatabaseSetting';
import OssSetting from './OssSetting';
import CacheSetting from './CacheSetting';

type SettingTab = 'user' | 'service' | 'log' | 'database' | 'oss' | 'cache';

const Settings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<SettingTab>('user');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const tabOptions = [
        {id: 'user', label: '用户设置', icon: <FiUser/>},
        {id: 'service', label: '服务设置', icon: <FiServer/>},
        {id: 'log', label: '日志设置', icon: <FiCpu/>},
        {id: 'database', label: '数据库设置', icon: <FiDatabase/>},
        {id: 'oss', label: 'OSS设置', icon: <FiHardDrive/>},
        {id: 'cache', label: '缓存设置', icon: <FiCpu/>},
    ];

    const handleSaveSuccess = () => {
        // 各组件内部处理保存成功提示
        console.log('组件保存成功');
    };

    const handleTabChange = (tab: SettingTab) => {
        setActiveTab(tab);
        setIsDropdownOpen(false);
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'user':
                return <UserSetting onSaveSuccess={handleSaveSuccess}/>;
            case 'service':
                return <ServiceSetting onSaveSuccess={handleSaveSuccess}/>;
            case 'log':
                return <LogSetting onSaveSuccess={handleSaveSuccess}/>;
            case 'database':
                return <DatabaseSetting onSaveSuccess={handleSaveSuccess}/>;
            case 'oss':
                return <OssSetting onSaveSuccess={handleSaveSuccess}/>;
            case 'cache':
                return <CacheSetting onSaveSuccess={handleSaveSuccess}/>;
            default:
                return null;
        }
    };

    const getActiveTabLabel = () => {
        const activeOption = tabOptions.find(option => option.id === activeTab);
        return activeOption ? (
            <>
                {activeOption.icon} {activeOption.label}
            </>
        ) : null;
    };

    return (
        <div className="settings-page">
            <div className="edit-container">
                <div className="edit-header">
                    <div className="settings-tabs">
                        {tabOptions.map(option => (
                            <button
                                key={option.id}
                                className={`tab-item ${activeTab === option.id ? 'active' : ''}`}
                                onClick={() => handleTabChange(option.id as SettingTab)}
                            >
                                {option.icon} {option.label}
                            </button>
                        ))}
                    </div>

                    <div className="settings-dropdown">
                        <button className="dropdown-toggle" onClick={toggleDropdown}>
                            {getActiveTabLabel()} <FiChevronDown className={isDropdownOpen ? 'rotate' : ''}/>
                        </button>
                        {isDropdownOpen && (
                            <div className="dropdown-menu">
                                {tabOptions.map(option => (
                                    <button
                                        key={option.id}
                                        className={`dropdown-item ${activeTab === option.id ? 'active' : ''}`}
                                        onClick={() => handleTabChange(option.id as SettingTab)}
                                    >
                                        {option.icon} {option.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="user-setting-wrapper">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};

export default Settings; 