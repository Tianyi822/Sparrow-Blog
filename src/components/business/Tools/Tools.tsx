import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import './Tools.scss';
import BackToTop from '@/components/business/Tools/BackToTop/BackToTop';
import ICPFilingNumber from '@/components/business/Tools/ICPFilingNumber/ICPFilingNumber.tsx';
import CommentsButton from '@/components/business/Tools/CommentsButton/CommentsButton';
import TOCButton from '@/components/business/Tools/TOCButton';
import TOCModal, { type TOCItem } from '@/components/business/Tools/TOCModal';
import classNames from 'classnames';
import { BasicData } from '@/types';

/**
 * 工具组件属性接口
 */
interface ToolsProps {
    /** 自定义类名 */
    className?: string;
    /** 网站基础数据 */
    homeData?: BasicData | null;
    /** 是否显示评论按钮 */
    showCommentsButton?: boolean;
    /** 评论按钮点击事件 */
    onCommentsClick?: () => void;
    /** 评论数量 */
    commentsCount?: number;
    /** 是否显示目录按钮 */
    showTOCButton?: boolean;
    /** 目录数据 */
    tocItems?: TOCItem[];
}

/**
 * 工具组件
 * 包含返回顶部按钮、评论按钮、目录按钮和备案号显示等功能
 * 
 * @param className - 自定义类名
 * @param homeData - 网站基础数据，包含备案号等信息
 * @param showCommentsButton - 是否显示评论按钮
 * @param onCommentsClick - 评论按钮点击事件
 * @param commentsCount - 评论数量
 * @param showTOCButton - 是否显示目录按钮
 * @param tocItems - 目录数据
 */
const Tools: React.FC<ToolsProps> = ({ 
    className, 
    homeData, 
    showCommentsButton = false, 
    onCommentsClick, 
    commentsCount,
    showTOCButton = false,
    tocItems = []
}) => {
    // 状态定义
    const [isBackToTopVisible, setIsBackToTopVisible] = useState<boolean>(false); // 控制返回顶部按钮可见性
    const [isAnimating, setIsAnimating] = useState<boolean>(false); // 控制当前是否处于滚动动画中
    const [isTOCModalOpen, setIsTOCModalOpen] = useState<boolean>(false); // 控制目录模态框可见性
    
    // 引用定时器，便于清除
    const scrollCheckIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    /**
     * 处理滚动事件，控制返回顶部按钮的显示隐藏
     * 只在非动画滚动状态时更新按钮显示状态
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
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);

    /**
     * 处理返回顶部点击事件
     * 平滑滚动到页面顶部并处理动画状态变化
     */
    const handleBackToTop = useCallback(() => {
        // 清除可能存在的之前的定时器
        if (scrollCheckIntervalRef.current) {
            clearInterval(scrollCheckIntervalRef.current);
        }
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }
        
        setIsAnimating(true);
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        // 检查滚动是否完成的定时器
        scrollCheckIntervalRef.current = setInterval(() => {
            if (window.scrollY === 0) {
                if (scrollCheckIntervalRef.current) {
                    clearInterval(scrollCheckIntervalRef.current);
                    scrollCheckIntervalRef.current = null;
                }
                
                scrollTimeoutRef.current = setTimeout(() => {
                    setIsAnimating(false);
                    setIsBackToTopVisible(false);
                    scrollTimeoutRef.current = null;
                }, 300);
            }
        }, 100);

        // 添加安全时间限制，防止定时器永久运行
        scrollTimeoutRef.current = setTimeout(() => {
            if (scrollCheckIntervalRef.current) {
                clearInterval(scrollCheckIntervalRef.current);
                scrollCheckIntervalRef.current = null;
            }
            setIsAnimating(false); // 确保动画状态最终会被重置
        }, 5000);
    }, []);

    /**
     * 处理目录按钮点击事件
     * 打开或关闭目录模态框
     */
    const handleTOCClick = useCallback(() => {
        setIsTOCModalOpen(true);
    }, []);

    /**
     * 关闭目录模态框
     */
    const handleTOCClose = useCallback(() => {
        setIsTOCModalOpen(false);
    }, []);

    // 组件卸载时清除所有定时器
    useEffect(() => {
        return () => {
            if (scrollCheckIntervalRef.current) {
                clearInterval(scrollCheckIntervalRef.current);
            }
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

    /**
     * 计算返回顶部按钮的类名
     * 根据按钮可见性和动画状态生成对应的CSS类名
     */
    const backToTopClass = useMemo(() => classNames('tools-back-to-top', {
        'visible': isBackToTopVisible && !isAnimating,
        'animating': isAnimating
    }), [isBackToTopVisible, isAnimating]);

    /**
     * 计算工具栏容器的类名
     */
    const toolsContainerClass = useMemo(() => classNames('tools', className), [className]);

    return (
        <>
            <div className={toolsContainerClass}>
                <BackToTop 
                    className={backToTopClass}
                    onClick={handleBackToTop}
                />
                {showCommentsButton && onCommentsClick && (
                    <CommentsButton 
                        className="tools-comments-button"
                        onClick={onCommentsClick}
                        commentsCount={commentsCount}
                    />
                )}
                {showTOCButton && (
                    <TOCButton 
                        className="tools-toc-button"
                        onClick={handleTOCClick}
                        disabled={tocItems.length === 0}
                    />
                )}
                <ICPFilingNumber 
                    className="tools-website-record"
                    icpFilingNumber={homeData?.icp_filing_number}
                />
            </div>
            
            {/* 目录模态框 */}
            {showTOCButton && (
                <TOCModal 
                    isOpen={isTOCModalOpen}
                    onClose={handleTOCClose}
                    tocItems={tocItems}
                />
            )}
        </>
    );
};

export default Tools;