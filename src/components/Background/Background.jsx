import { useCallback, useEffect, useMemo, useState } from 'react';
import './Background.scss';
import PropTypes from 'prop-types';

const Background = ({backgroundImage}) => {
    const [blurAmount, setBlurAmount] = useState(0);

    // 计算模糊度
    const calculateBlur = useCallback(() => {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;

        const progress = Math.min(scrollPosition / windowHeight, 1);
        const eased = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        const blur = eased * 20;
        setBlurAmount(blur);
    }, []);

    // 监听滚动事件
    useEffect(() => {
        calculateBlur(); // 初始计算
        window.addEventListener('scroll', calculateBlur, {passive: true});
        return () => window.removeEventListener('scroll', calculateBlur);
    }, [calculateBlur]);

    // 计算遮罩层样式
    const overlayStyle = useMemo(() => ({
        backdropFilter: `blur(${blurAmount}px)`,
        WebkitBackdropFilter: `blur(${blurAmount}px)`,
        transition: 'backdrop-filter 0.1s linear'
    }), [blurAmount]);

    return (
        <div className="background-container">
            <div
                className="bg-image"
                style={{backgroundImage: `url(${backgroundImage})`}}
            />
            <div
                className="bg-overlay"
                style={overlayStyle}
            />
        </div>
    );
};

Background.propTypes = {
    backgroundImage: PropTypes.string.isRequired
};

export default Background; 