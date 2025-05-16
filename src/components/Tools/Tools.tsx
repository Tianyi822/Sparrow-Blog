import { useState, useEffect, useCallback, useMemo } from 'react';
import './Tools.scss';
import BackToTop from '@/components/Tools/BackToTop/BackToTop';
import ICPFilingNumber from '@/components/Tools/ICPFilingNumber/ICPFilingNumber.tsx';
import classNames from 'classnames';
import { BasicData } from '@/services/webService';

/**
 * 工具组件属性接口
 */
interface ToolsProps {
    /** 自定义类名 */
    className?: string;
    /** 网站基础数据 */
    homeData?: BasicData | null;
}

/**
 * 工具组件
 * 包含返回顶部按钮和备案号显示等功能
 */
const Tools: React.FC<ToolsProps> = ({ className, homeData }) => {
    // 状态定义
    const [isBackToTopVisible, setIsBackToTopVisible] = useState<boolean>(false); // 控制返回顶部按钮可见性
    const [isAnimating, setIsAnimating] = useState<boolean>(false); // 控制当前是否处于滚动动画中

    /**
     * 处理滚动事件，控制返回顶部按钮的显示隐藏
     */
    const handleScroll = useCallback(() => {
        if (!isAnimating) {
            setIsBackToTopVisible(window.scrollY > 100);
        }
    }, [isAnimating]);

    // 监听滚动事件
    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        handleScroll(); // 初始化时检查滚动位置
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    /**
     * 处理返回顶部点击事件
     */
    const handleBackToTop = useCallback(() => {
        setIsAnimating(true);
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // 检查滚动是否完成的定时器
        const checkIfScrollComplete = setInterval(() => {
            if (window.scrollY === 0) {
                clearInterval(checkIfScrollComplete);
                setTimeout(() => {
                    setIsAnimating(false);
                    setIsBackToTopVisible(false);
                }, 300);
            }
        }, 100);

        // 添加安全时间限制，防止定时器永久运行
        setTimeout(() => {
            clearInterval(checkIfScrollComplete);
            setIsAnimating(false); // 确保动画状态最终会被重置
        }, 5000);
    }, []);

    /**
     * 计算返回顶部按钮的类名
     */
    const backToTopClass = useMemo(() => classNames('tools-back-to-top', {
        'visible': isBackToTopVisible && !isAnimating,
        'animating': isAnimating
    }), [isBackToTopVisible, isAnimating]);

    return (
        <div className={classNames('tools', className)}>
            <BackToTop 
                className={backToTopClass}
                onClick={handleBackToTop}
            />
            <ICPFilingNumber 
                className="tools-website-record"
                icpFilingNumber={homeData?.icp_filing_number}
            />
        </div>
    );
};

export default Tools;