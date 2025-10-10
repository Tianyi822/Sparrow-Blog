import React, { memo, useCallback, useState } from 'react';
import {
    FiChevronDown,
    FiCpu,
    FiHardDrive,
    FiServer,
    FiUser
} from 'react-icons/fi';
import { localStorage } from '@/utils';
import CacheAndIndexSetting from './CacheAndIndexSetting';
import LogSetting from './LogSetting';
import OssSetting from './OssSetting';
import ServiceSetting from './ServiceSetting';
import './Settings.scss';
import UserSetting from './UserSetting';

// 设置标签页类型定义
type SettingTab = 'user' | 'service' | 'log' | 'oss' | 'cache';

const Settings: React.FC = memo(() => {
    // 状态管理
    const [activeTab, setActiveTab] = useState<SettingTab>(() => {
        // 从localStorage读取上次选择的标签页，如果没有则默认为'user'
        const savedTab = localStorage.getItem('settings_active_tab');
        return (savedTab as SettingTab) || 'user';
    });
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // 标签页配置选项
    const tabOptions = [
        { id: 'user', label: '用户设置', icon: <FiUser /> },
        { id: 'log', label: '日志设置', icon: <FiCpu /> },
        { id: 'oss', label: 'OSS设置', icon: <FiHardDrive /> },
        { id: 'cache', label: '缓存与索引设置', icon: <FiCpu /> },
        { id: 'service', label: '服务设置', icon: <FiServer /> },
    ];

    // 保存成功回调处理
    const handleSaveSuccess = useCallback(() => {
        // 各组件内部处理保存成功提示
    }, []);

    // 标签页切换处理
    const handleTabChange = useCallback((tab: SettingTab) => {
        setActiveTab(tab);
        // 将当前选中的标签页保存到localStorage
        localStorage.setItem('settings_active_tab', tab);
        setIsDropdownOpen(false);
    }, []);

    // 切换下拉菜单开关状态
    const toggleDropdown = useCallback(() => {
        setIsDropdownOpen(prevState => !prevState);
    }, []);

    // 渲染当前激活的标签页内容
    const renderTabContent = useCallback(() => {
        switch (activeTab) {
            case 'user':
                return <UserSetting onSaveSuccess={handleSaveSuccess} />;
            case 'service':
                return <ServiceSetting onSaveSuccess={handleSaveSuccess} />;
            case 'log':
                return <LogSetting onSaveSuccess={handleSaveSuccess} />;
            case 'oss':
                return <OssSetting onSaveSuccess={handleSaveSuccess} />;
            case 'cache':
                return <CacheAndIndexSetting onSaveSuccess={handleSaveSuccess} />;
            default:
                return null;
        }
    }, [activeTab, handleSaveSuccess]);

    // 获取当前激活标签页的标签和图标
    const getActiveTabLabel = useCallback(() => {
        const activeOption = tabOptions.find(option => option.id === activeTab);
        return activeOption ? (
            <>
                {activeOption.icon} {activeOption.label}
            </>
        ) : null;
    }, [activeTab, tabOptions]);

    return (
        <div className="settings-page">
            <div className="edit-container">
                <div className="edit-header">
                    {/* 桌面版标签栏 */}
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

                    {/* 移动端下拉菜单 */}
                    <div className="settings-dropdown">
                        <button className="dropdown-toggle" onClick={toggleDropdown}>
                            {getActiveTabLabel()} <FiChevronDown className={isDropdownOpen ? 'rotate' : ''} />
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

                {/* 设置内容区域 */}
                <div className="user-setting-wrapper">
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
});

export default Settings;