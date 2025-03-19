import CacheConfigForm, { CacheConfigFormData } from '@/components/InitiateConfig/CacheConfigForm/CacheConfigForm.tsx';
import LoggerConfigForm, { LoggerFormData } from '@/components/InitiateConfig/LoggerConfigForm/LoggerConfigForm.tsx';
import MySqlConfigForm, { MySQLFormData } from '@/components/InitiateConfig/MySqlConfigForm/MySqlConfigForm.tsx';
import OSSConfigForm, { OSSConfigFormData } from '@/components/InitiateConfig/OSSConfigForm/OSSConfigForm.tsx';
import ServerBaseConfigForm, { ServerBaseFormData } from '@/components/InitiateConfig/ServerBaseConfigForm/ServerBaseConfigForm.tsx';
import UserConfigForm, { UserEmailConfigFormData } from '@/components/InitiateConfig/UserConfigForm/UserConfigForm.tsx';
import React, { useEffect, useState } from 'react';
import './InitiateConfig.scss';

interface InitiateConfigProps {
    initialServerData?: ServerBaseFormData;
    initialLoggerData?: LoggerFormData;
    initialMySQLData?: MySQLFormData;
    initialOSSData?: OSSConfigFormData;
    initialCacheData?: CacheConfigFormData;
    initialUserEmailData?: UserEmailConfigFormData;
}

// 保存在localStorage的数据结构
interface SavedState {
    currentFormIndex: number;
    formData: {
        serverData?: ServerBaseFormData;
        loggerData?: LoggerFormData;
        mysqlData?: MySQLFormData;
        ossData?: OSSConfigFormData;
        cacheData?: CacheConfigFormData;
        userEmailData?: UserEmailConfigFormData;
    }
    // Add submitted forms tracking
    submittedForms: {
        serverSubmitted: boolean;
        loggerSubmitted: boolean;
        mysqlSubmitted: boolean;
        ossSubmitted: boolean;
        cacheSubmitted: boolean;
        userEmailSubmitted: boolean;
    }
}

const STORAGE_KEY = 'h2blog_initiate_config_state';

// 从localStorage获取保存的状态
const getSavedState = (): SavedState | null => {
    try {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
            return JSON.parse(savedState) as SavedState;
        }
    } catch (error) {
        console.error('Failed to retrieve state from localStorage:', error);
    }
    return null;
};

const InitiateConfig: React.FC<InitiateConfigProps> = ({
    initialServerData,
    initialLoggerData,
    initialMySQLData,
    initialOSSData,
    initialCacheData,
    initialUserEmailData
}) => {
    // 获取保存的状态
    const savedState = getSavedState();

    // 保存各表单数据的状态
    const [serverData, setServerData] = useState<ServerBaseFormData | undefined>(
        savedState?.formData?.serverData || initialServerData
    );
    const [loggerData, setLoggerData] = useState<LoggerFormData | undefined>(
        savedState?.formData?.loggerData || initialLoggerData
    );
    const [mysqlData, setMySQLData] = useState<MySQLFormData | undefined>(
        savedState?.formData?.mysqlData || initialMySQLData
    );
    const [ossData, setOSSData] = useState<OSSConfigFormData | undefined>(
        savedState?.formData?.ossData || initialOSSData
    );
    const [cacheData, setCacheData] = useState<CacheConfigFormData | undefined>(
        savedState?.formData?.cacheData || initialCacheData
    );
    const [userEmailData, setUserEmailData] = useState<UserEmailConfigFormData | undefined>(
        savedState?.formData?.userEmailData || initialUserEmailData
    );

    // Track which forms have been submitted successfully
    const [submittedForms, setSubmittedForms] = useState({
        serverSubmitted: savedState?.submittedForms?.serverSubmitted || false,
        loggerSubmitted: savedState?.submittedForms?.loggerSubmitted || false,
        mysqlSubmitted: savedState?.submittedForms?.mysqlSubmitted || false,
        ossSubmitted: savedState?.submittedForms?.ossSubmitted || false,
        cacheSubmitted: savedState?.submittedForms?.cacheSubmitted || false,
        userEmailSubmitted: savedState?.submittedForms?.userEmailSubmitted || false,
    });

    // State to track the current form index
    const [currentFormIndex, setCurrentFormIndex] = useState(savedState?.currentFormIndex || 0);
    // State to track animation direction (1: down, -1: up)
    const [animationDirection, setAnimationDirection] = useState(0);
    // State to track if animation is in progress
    const [isAnimating, setIsAnimating] = useState(false);

    // 初始化时设置文档标题
    useEffect(() => {
        document.title = "H2Blog 初始化配置";
    }, []);

    // 当表单数据或当前表单索引变化时，保存到localStorage
    useEffect(() => {
        try {
            const stateToSave: SavedState = {
                currentFormIndex,
                formData: {
                    serverData,
                    loggerData,
                    mysqlData,
                    ossData,
                    cacheData,
                    userEmailData
                },
                submittedForms
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (error) {
            console.error('Failed to save state to localStorage:', error);
        }
    }, [currentFormIndex, serverData, loggerData, mysqlData, ossData, cacheData, userEmailData, submittedForms]);

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

    // 处理各表单提交后的回调
    const handleServerSubmit = (data: ServerBaseFormData) => {
        console.log('Server config submitted:', data);
        setServerData(data);
        setSubmittedForms(prev => ({ ...prev, serverSubmitted: true }));
        // Removed automatic navigation
    };

    const handleLoggerSubmit = (data: LoggerFormData) => {
        console.log('Logger config submitted:', data);
        setLoggerData(data);
        setSubmittedForms(prev => ({ ...prev, loggerSubmitted: true }));
        // Removed automatic navigation
    };

    const handleMySQLSubmit = (data: MySQLFormData) => {
        console.log('MySQL config submitted:', data);
        setMySQLData(data);
        setSubmittedForms(prev => ({ ...prev, mysqlSubmitted: true }));
        // Removed automatic navigation
    };

    const handleOSSSubmit = (data: OSSConfigFormData) => {
        console.log('OSS config submitted:', data);
        setOSSData(data);
        setSubmittedForms(prev => ({ ...prev, ossSubmitted: true }));
        // Removed automatic navigation
    };

    const handleCacheSubmit = (data: CacheConfigFormData) => {
        console.log('Cache config submitted:', data);
        setCacheData(data);
        setSubmittedForms(prev => ({ ...prev, cacheSubmitted: true }));
        // Removed automatic navigation
    };

    const handleUserEmailSubmit = (data: UserEmailConfigFormData) => {
        console.log('User & Email config submitted:', data);
        setUserEmailData(data);
        setSubmittedForms(prev => ({ ...prev, userEmailSubmitted: true }));
        // 最后一个表单可以不跳转
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
                        initialData={serverData}
                        isSubmitted={submittedForms.serverSubmitted}
                        onNext={goToNextForm}
                    />
                );
            case 1:
                return (
                    <LoggerConfigForm
                        onSubmit={handleLoggerSubmit}
                        initialData={loggerData}
                        isSubmitted={submittedForms.loggerSubmitted}
                        onNext={goToNextForm}
                    />
                );
            case 2:
                return (
                    <MySqlConfigForm
                        onSubmit={handleMySQLSubmit}
                        initialData={mysqlData}
                        isSubmitted={submittedForms.mysqlSubmitted}
                        onNext={goToNextForm}
                    />
                );
            case 3:
                return (
                    <OSSConfigForm
                        onSubmit={handleOSSSubmit}
                        initialData={ossData}
                        isSubmitted={submittedForms.ossSubmitted}
                        onNext={goToNextForm}
                    />
                );
            case 4:
                return (
                    <CacheConfigForm
                        onSubmit={handleCacheSubmit}
                        initialData={cacheData}
                        isSubmitted={submittedForms.cacheSubmitted}
                        onNext={goToNextForm}
                    />
                );
            case 5:
                return (
                    <UserConfigForm
                        onSubmit={handleUserEmailSubmit}
                        initialData={userEmailData}
                        isSubmitted={submittedForms.userEmailSubmitted}
                        onNext={goToNextForm}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="initiate-config-container">
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

export default InitiateConfig;
