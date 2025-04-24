import CacheConfigForm, { CacheConfigFormData } from '@/components/InitiateConfig/CacheConfigForm';
import LoggerConfigForm, { LoggerFormData } from '@/components/InitiateConfig/LoggerConfigForm';
import MySqlConfigForm, { MySQLFormData } from '@/components/InitiateConfig/MySqlConfigForm';
import OSSConfigForm, { OSSConfigFormData } from '@/components/InitiateConfig/OSSConfigForm';
import ServerBaseConfigForm, {
    ServerBaseConfigFormData
} from '@/components/InitiateConfig/ServerBaseConfigForm';
import UserConfigForm, { UserEmailConfigFormData } from '@/components/InitiateConfig/UserConfigForm';
import { completeInitiatedConfig } from '@/services/initiateConfigService.ts';
import { checkSystemStatus } from '@/services/webService';
import React, { useEffect, useState } from 'react';
import './InitiateConfig.scss';
import { useNavigate } from 'react-router-dom';

interface InitiateConfigProps {
    initialServerData?: ServerBaseConfigFormData;
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
        serverData?: ServerBaseConfigFormData;
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
    const [serverData, setServerData] = useState<ServerBaseConfigFormData | undefined>(
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
    // 等待状态
    const [isWaiting, setIsWaiting] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [pollingCount, setPollingCount] = useState(0);

    // 导航hook
    const navigate = useNavigate();

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

    // 轮询用户信息接口状态
    useEffect(() => {
        if (!isWaiting) return;

        let timerId: number;
        const checkSystemReady = async () => {
            try {
                const { isRuntime, errorMessage } = await checkSystemStatus();

                // 如果系统状态检查成功，表示服务已经启动完成
                if (isRuntime) {
                    setIsWaiting(false);
                    // 清空localStorage中的配置信息，防止泄露
                    localStorage.removeItem(STORAGE_KEY);
                    localStorage.removeItem('verifyCodeCountdown');
                    localStorage.removeItem('verifyCodeTimestamp');
                    // 跳转到登录页
                    navigate('/admin/login');
                } else {
                    // 系统状态检查失败，继续轮询
                    setPollingCount(prev => prev + 1);
                    setStatusMessage(`正在检查服务状态... (尝试 ${pollingCount + 1}次) ${errorMessage ? `- ${errorMessage}` : ''}`);
                    timerId = window.setTimeout(checkSystemReady, 3000);
                }
            } catch (error) {
                // 请求出错，继续轮询
                console.error('检查服务状态失败:', error);
                setPollingCount(prev => prev + 1);
                setStatusMessage(`等待服务启动中... (尝试 ${pollingCount + 1}次)`);
                timerId = window.setTimeout(checkSystemReady, 3000);
            }
        };

        // 开始轮询
        timerId = window.setTimeout(checkSystemReady, 1000);

        // 清理定时器
        return () => {
            if (timerId) window.clearTimeout(timerId);
        };
    }, [isWaiting, pollingCount, navigate]);

    // Form titles for reference
    const formTitles = [
        "服务基础配置",
        "用户与邮箱配置",
        "日志配置",
        "数据库配置",
        "OSS 存储配置",
        "缓存配置"
    ];

    // 处理各表单提交后的回调
    const handleServerSubmit = (data: ServerBaseConfigFormData) => {
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

    // 处理完成配置并进入登录页面
    const handleCompleteConfig = async () => {
        try {
            setIsWaiting(true);
            setStatusMessage('正在完成配置...');
            // 请求完成配置接口
            const response = await completeInitiatedConfig();

            // 检查响应状态
            if (response && response.code !== 200) {
                // 不使用throw，直接显示错误并返回
                console.error('Failed to complete configuration:', response.msg);
                alert(response.msg || '配置完成请求失败');
                setIsWaiting(false);
                return;
            }

            // 启动轮询检查
            setStatusMessage('配置已完成，正在等待服务启动...');
            setPollingCount(0);

        } catch (error) {
            console.error('Failed to complete configuration:', error);
            alert('完成配置请求失败，请检查网络连接或联系管理员');
            setIsWaiting(false);
        }
    };

    const goToForm = (index: number) => {
        // 验证是否可以跳转到目标表单
        // 只能跳转到已提交的表单或序号比当前可操作表单小或相等的表单
        const canNavigateTo = () => {
            // 获取最高可操作的表单索引（已提交的表单的最后一个索引+1）
            let highestAllowedIndex = 0;

            if (submittedForms.serverSubmitted) highestAllowedIndex = 1;
            if (submittedForms.userEmailSubmitted) highestAllowedIndex = 2;
            if (submittedForms.loggerSubmitted) highestAllowedIndex = 3;
            if (submittedForms.mysqlSubmitted) highestAllowedIndex = 4;
            if (submittedForms.ossSubmitted) highestAllowedIndex = 5;

            // 如果目标表单已提交或在最高可操作表单索引范围内，则允许跳转
            return index <= highestAllowedIndex;
        };

        // 如果无法跳转，显示提示信息
        if (index !== currentFormIndex && !canNavigateTo()) {
            // 查找最后一个未提交的表单索引，作为需要完成的表单
            let lastIncompleteIndex = -1;
            if (!submittedForms.serverSubmitted) lastIncompleteIndex = 0;
            else if (!submittedForms.userEmailSubmitted) lastIncompleteIndex = 1;
            else if (!submittedForms.loggerSubmitted) lastIncompleteIndex = 2;
            else if (!submittedForms.mysqlSubmitted) lastIncompleteIndex = 3;
            else if (!submittedForms.ossSubmitted) lastIncompleteIndex = 4;

            alert(`请先完成 ${formTitles[lastIncompleteIndex]} 再进行后续配置`);
            return;
        }

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
        if (currentFormIndex > 0) {
            // 上一个表单总是已经可访问的，直接跳转
            goToForm(currentFormIndex - 1);
        }
    };

    const goToNextForm = () => {
        // 只有当前表单已提交成功，才能前进到下一个表单
        if (currentFormIndex < 5) {
            const canProceed = (() => {
                switch (currentFormIndex) {
                    case 0:
                        return submittedForms.serverSubmitted;
                    case 1:
                        return submittedForms.userEmailSubmitted;
                    case 2:
                        return submittedForms.loggerSubmitted;
                    case 3:
                        return submittedForms.mysqlSubmitted;
                    case 4:
                        return submittedForms.ossSubmitted;
                    default:
                        return false;
                }
            })();

            if (canProceed) {
                goToForm(currentFormIndex + 1);
            } else {
                alert(`请先完成 ${formTitles[currentFormIndex]} 再进行下一步配置`);
            }
        }
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
                    <UserConfigForm
                        onSubmit={handleUserEmailSubmit}
                        initialData={userEmailData}
                        isSubmitted={submittedForms.userEmailSubmitted}
                        onNext={goToNextForm}
                    />
                );
            case 2:
                return (
                    <LoggerConfigForm
                        onSubmit={handleLoggerSubmit}
                        initialData={loggerData}
                        isSubmitted={submittedForms.loggerSubmitted}
                        onNext={goToNextForm}
                    />
                );
            case 3:
                return (
                    <MySqlConfigForm
                        onSubmit={handleMySQLSubmit}
                        initialData={mysqlData}
                        isSubmitted={submittedForms.mysqlSubmitted}
                        onNext={goToNextForm}
                    />
                );
            case 4:
                return (
                    <OSSConfigForm
                        onSubmit={handleOSSSubmit}
                        initialData={ossData}
                        isSubmitted={submittedForms.ossSubmitted}
                        onNext={goToNextForm}
                    />
                );
            case 5:
                return (
                    <CacheConfigForm
                        onSubmit={handleCacheSubmit}
                        initialData={cacheData}
                        isSubmitted={submittedForms.cacheSubmitted}
                        onNext={handleCompleteConfig}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className="initiate-config-container">
            {/* 等待界面 */}
            {isWaiting && (
                <div className="waiting-overlay">
                    <div className="waiting-content">
                        <div className="waiting-spinner"></div>
                        <h2>服务启动中</h2>
                        <p>{statusMessage}</p>
                    </div>
                </div>
            )}

            {/* Navigation dots moved to left side with up/down arrows */}
            <div className="form-navigation-dots">
                {/* Up arrow for navigating to previous form */}
                <button
                    className="nav-arrow nav-arrow-up"
                    onClick={goToPrevForm}
                    aria-label="上一个配置表单"
                    title={currentFormIndex > 0 ? formTitles[currentFormIndex - 1] : "已经是第一个表单"}
                    disabled={currentFormIndex === 0}
                >
                    <span>&#10094;</span>
                </button>

                {/* Navigation dots */}
                {formTitles.map((title, index) => {
                    // 检查此表单是否可访问
                    const canAccess = (() => {
                        // 当前表单总是可访问的
                        if (index === currentFormIndex) return true;

                        // 检查表单是否可访问（前一个表单已提交）
                        let highestAllowedIndex = 0;
                        if (submittedForms.serverSubmitted) highestAllowedIndex = 1;
                        if (submittedForms.userEmailSubmitted) highestAllowedIndex = 2;
                        if (submittedForms.loggerSubmitted) highestAllowedIndex = 3;
                        if (submittedForms.mysqlSubmitted) highestAllowedIndex = 4;
                        if (submittedForms.ossSubmitted) highestAllowedIndex = 5;

                        return index <= highestAllowedIndex;
                    })();

                    // 检查表单是否已提交
                    const isSubmitted = (() => {
                        switch (index) {
                            case 0:
                                return submittedForms.serverSubmitted;
                            case 1:
                                return submittedForms.userEmailSubmitted;
                            case 2:
                                return submittedForms.loggerSubmitted;
                            case 3:
                                return submittedForms.mysqlSubmitted;
                            case 4:
                                return submittedForms.ossSubmitted;
                            case 5:
                                return submittedForms.cacheSubmitted;
                            default:
                                return false;
                        }
                    })();

                    return (
                        <button
                            key={index}
                            className={`nav-dot ${currentFormIndex === index ? 'active' : ''} ${isSubmitted ? 'submitted' : ''} ${!canAccess ? 'disabled' : ''}`}
                            onClick={() => canAccess && goToForm(index)}
                            aria-label={title}
                            title={canAccess ? title : `请先完成${formTitles[index - 1]}配置`}
                            disabled={!canAccess}
                        />
                    );
                })}

                {/* Down arrow for navigating to next form */}
                <button
                    className="nav-arrow nav-arrow-down"
                    onClick={goToNextForm}
                    aria-label="下一个配置表单"
                    title={(() => {
                        // 如果是最后一个表单
                        if (currentFormIndex === 5) return "已经是最后一个表单";

                        // 检查是否可以前往下一个表单
                        const canProceed = (() => {
                            switch (currentFormIndex) {
                                case 0:
                                    return submittedForms.serverSubmitted;
                                case 1:
                                    return submittedForms.userEmailSubmitted;
                                case 2:
                                    return submittedForms.loggerSubmitted;
                                case 3:
                                    return submittedForms.mysqlSubmitted;
                                case 4:
                                    return submittedForms.ossSubmitted;
                                default:
                                    return false;
                            }
                        })();

                        return canProceed
                            ? formTitles[currentFormIndex + 1]
                            : `请先完成${formTitles[currentFormIndex]}配置`;
                    })()}
                    disabled={currentFormIndex === 5 || (() => {
                        switch (currentFormIndex) {
                            case 0:
                                return !submittedForms.serverSubmitted;
                            case 1:
                                return !submittedForms.userEmailSubmitted;
                            case 2:
                                return !submittedForms.loggerSubmitted;
                            case 3:
                                return !submittedForms.mysqlSubmitted;
                            case 4:
                                return !submittedForms.ossSubmitted;
                            default:
                                return true;
                        }
                    })()}
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
