import LoggerConfigForm, { LoggerFormData } from '@/components/ConfigServer/LoggerConfigForm/LoggerConfigForm.tsx';
import MySqlConfigForm, { MySQLFormData } from '@/components/ConfigServer/MySqlConfigForm/MySqlConfigForm.tsx';
import ServerBaseConfigForm, {
    ServerBaseFormData
} from '@/components/ConfigServer/ServerBaseConfigForm/ServerBaseConfigForm.tsx';
import React, { useEffect, useState } from 'react';
import CacheConfigForm, { CacheConfigFormData } from './CacheConfigForm/CacheConfigForm';
import './ConfigServer.scss';
import OSSConfigForm, { OSSConfigFormData } from './OSSConfigForm/OSSConfigForm';
import UserEmailConfigForm, { UserEmailConfigFormData } from './UserEmailConfigForm/UserEmailConfigForm';

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
    // State to track animation direction (1: down, -1: up)
    const [animationDirection, setAnimationDirection] = useState(0);
    // State to track if animation is in progress
    const [isAnimating, setIsAnimating] = useState(false);

    // Effect to handle animation reset
    useEffect(() => {
        if (!isAnimating) {
            // Reset animation direction after animation completes
            setAnimationDirection(0);
        }
    }, [isAnimating]);

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
        if (index >= 0 && index <= 5 && index !== currentFormIndex) {
            // Always set animation direction to -1 for exit (up direction)
            // This ensures all forms exit with the same animation (up direction)
            setAnimationDirection(-1);
            setIsAnimating(true);

            // Delay the actual form change to allow exit animation
            setTimeout(() => {
                setCurrentFormIndex(index);
                // Reset animation state after a short delay
                setTimeout(() => {
                    setIsAnimating(false);
                }, 50);
            }, 300); // Match this with animation duration
        }
    };

    // New functions for navigating to previous/next form
    const goToPrevForm = () => {
        const prevIndex = currentFormIndex > 0 ? currentFormIndex - 1 : 5;
        goToForm(prevIndex);
    };

    const goToNextForm = () => {
        const nextIndex = currentFormIndex < 5 ? currentFormIndex + 1 : 0;
        goToForm(nextIndex);
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
            {/* Navigation dots moved to left side with up/down arrows */}
            <div className="form-navigation-dots">
                {/* Up arrow for navigating to previous form */}
                <button
                    className="nav-arrow nav-arrow-up"
                    onClick={goToPrevForm}
                    aria-label="上一个配置表单"
                    title={formTitles[(currentFormIndex > 0 ? currentFormIndex - 1 : 5)]}
                >
                    <span>&#10094;</span>
                </button>

                {/* Navigation dots */}
                {formTitles.map((title, index) => (
                    <button
                        key={index}
                        className={`nav-dot ${currentFormIndex === index ? 'active' : ''}`}
                        onClick={() => goToForm(index)}
                        aria-label={title}
                        title={title}
                    />
                ))}

                {/* Down arrow for navigating to next form */}
                <button
                    className="nav-arrow nav-arrow-down"
                    onClick={goToNextForm}
                    aria-label="下一个配置表单"
                    title={formTitles[(currentFormIndex < 5 ? currentFormIndex + 1 : 0)]}
                >
                    <span>&#10094;</span>
                </button>
            </div>

            {/* The current form centered in the page */}
            <div className="config-form-content">
                <div
                    className={`current-form-container ${isAnimating ? 'animating' : ''} ${animationDirection > 0 ? 'slide-up-out' :
                        animationDirection < 0 ? 'slide-down-out' : ''
                    }`}
                >
                    {renderCurrentForm()}
                </div>
            </div>
        </div>
    );
};

export default ConfigServer;
