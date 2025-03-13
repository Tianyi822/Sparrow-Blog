import { useState, useEffect } from 'react';
import './Tools.scss';
import BackToTop from '@/components/Tools/BackToTop/BackToTop';
import WebsiteRecord from '@/components/Tools/WebsiteRecord/WebsiteRecord';
import classNames from 'classnames';

interface ToolsProps {
    className?: string;
}

const Tools: React.FC<ToolsProps> = ({ className }) => {
    const [isBackToTopVisible, setIsBackToTopVisible] = useState<boolean>(false);
    const [isAnimating, setIsAnimating] = useState<boolean>(false);

    useEffect(() => {
        const handleScroll = () => {
            if (!isAnimating) {
                setIsBackToTopVisible(window.scrollY > 100);
            }
        };

        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [isAnimating]);

    const handleBackToTop = () => {
        setIsAnimating(true);
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
        
        const checkIfScrollComplete = setInterval(() => {
            if (window.scrollY === 0) {
                clearInterval(checkIfScrollComplete);
                setTimeout(() => {
                    setIsAnimating(false);
                    setIsBackToTopVisible(false);
                }, 300);
            }
        }, 100);

        setTimeout(() => {
            clearInterval(checkIfScrollComplete);
        }, 5000);
    };

    const backToTopClass = classNames('tools-back-to-top', {
        'visible': isBackToTopVisible && !isAnimating,
        'animating': isAnimating
    });

    return (
        <div className={classNames('tools', className)}>
            <BackToTop 
                className={backToTopClass}
                onClick={handleBackToTop}
            />
            <WebsiteRecord className="tools-website-record"/>
        </div>
    );
};

export default Tools;