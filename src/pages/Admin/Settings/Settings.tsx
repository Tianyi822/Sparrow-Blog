import React, { useState } from 'react';
import { FiAlertCircle } from 'react-icons/fi';
import UserConfig from './UserConfig';
import './Settings.scss';

const Settings: React.FC = () => {
    const [saveSuccess, setSaveSuccess] = useState(false);

    const handleSaveSuccess = () => {
        // 显示全局保存成功提示
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    return (
        <div className="edit-page settings-page">
            <div className="edit-container">
                <div className="edit-header">
                    <h1>系统配置</h1>
                    <div className="header-actions">
                        {/* 顶部不需要保存按钮 */}
                    </div>
                </div>

                {saveSuccess && (
                    <div className="auto-save-notification">
                        <FiAlertCircle /> 设置已保存成功！
                    </div>
                )}

                <div className="edit-main">
                    <div className="edit-section">
                        <UserConfig onSaveSuccess={handleSaveSuccess} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings; 