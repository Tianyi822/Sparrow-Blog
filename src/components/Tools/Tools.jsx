import { useState, useEffect } from 'react';
import './Tools.scss';
import BackToTop from '@/components/Tools/BackToTop/BackToTop.jsx';
import WebsiteRecord from '@/components/Tools/WebsiteRecord/WebsiteRecord.jsx';
import classNames from 'classnames';
import PropTypes from 'prop-types';

const Tools = ({ className }) => {
    const [isBackToTopVisible, setIsBackToTopVisible] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

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

Tools.propTypes = {
    className: PropTypes.string,
};

export default Tools; 