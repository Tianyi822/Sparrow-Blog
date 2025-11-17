import { useEffect, useState } from 'react';
import classNames from 'classnames';
import './TypeWriter.scss';

interface TypeWriterProps {
  texts?: string[];
  typeSpeed?: number;
  eraseSpeed?: number;
  delayBetween?: number;
  className?: string;
}

const TypeWriter: React.FC<TypeWriterProps> = ({
  texts = [],
  typeSpeed = 150,
  eraseSpeed = 100,
  delayBetween = 2000,
  className = '',
}) => {
  const [displayText, setDisplayText] = useState<string>('');
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isTyping, setIsTyping] = useState<boolean>(true);

  useEffect(() => {
    if (!texts.length) return;

    let timeout: NodeJS.Timeout;

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
    'erasing': !isTyping,
  });

  return (
    <div className={typeWriterClassName}>
      <span className='text'>
        {displayText}
        <span className='cursor'>__</span>
      </span>
    </div>
  );
};

export default TypeWriter;
