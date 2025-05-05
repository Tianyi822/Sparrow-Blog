import { useState, useEffect } from 'react';
import './Tools.scss';
import BackToTop from '@/components/Tools/BackToTop/BackToTop';
import ICPFilingNumber from '@/components/Tools/ICPFilingNumber/ICPFilingNumber.tsx';
import classNames from 'classnames';
import { BasicData } from '@/services/webService';

interface ToolsProps {
    className?: string;
    homeData?: BasicData | null;
}

const Tools: React.FC<ToolsProps> = ({ className, homeData }) => {
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
            <ICPFilingNumber 
                className="tools-website-record"
                icpFilingNumber={homeData?.icp_filing_number}
            />
        </div>
    );
};

export default Tools;