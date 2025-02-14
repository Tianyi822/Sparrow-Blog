import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './TypeWriter.scss';

const TypeWriter = (props) => {
    const {
        texts = [],
        typeSpeed = 150,
        eraseSpeed = 100,
        delayBetween = 2000,
        className = ''
    } = props;

    const [displayText, setDisplayText] = useState('');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        if (!texts.length) return;

        let timeout;
        
        if (isTyping) {
            if (displayText.length < texts[currentIndex].length) {
                timeout = setTimeout(() => {
                    setDisplayText(texts[currentIndex].slice(0, displayText.length + 1));
                }, typeSpeed);
            } else {
                timeout = setTimeout(() => {
                    setIsTyping(false);
                }, delayBetween);
            }
        } else {
            if (displayText.length > 0) {
                timeout = setTimeout(() => {
                    setDisplayText(displayText.slice(0, -1));
                }, eraseSpeed);
            } else {
                setCurrentIndex((prev) => (prev + 1) % texts.length);
                setIsTyping(true);
            }
        }

        return () => clearTimeout(timeout);
    }, [texts, currentIndex, displayText, isTyping, typeSpeed, eraseSpeed, delayBetween]);

    const typeWriterClassName = classNames('type-writer', className, {
        'typing': isTyping && displayText.length < texts[currentIndex]?.length,
        'erasing': !isTyping
    });

    return (
        <div className={typeWriterClassName}>
            <span className="text">
                {displayText}
                <span className="cursor">__</span>
            </span>
        </div>
    );
};

TypeWriter.propTypes = {
    texts: PropTypes.arrayOf(PropTypes.string),
    typeSpeed: PropTypes.number,
    eraseSpeed: PropTypes.number,
    delayBetween: PropTypes.number,
    className: PropTypes.string
};

export default TypeWriter; 