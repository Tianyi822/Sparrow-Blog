import React from 'react';
import { FiList } from 'react-icons/fi';
import './TOCButton.scss';

interface TOCButtonProps {
  className?: string;
  onClick: () => void;
  disabled?: boolean;
}

const TOCButton: React.FC<TOCButtonProps> = ({
  className,
  onClick,
  disabled = false,
}) => {
  return (
    <div
      className={`toc-button ${className || ''} ${disabled ? 'disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
    >
      <div className='toc-button-content'>
        <FiList className='toc-icon' />
      </div>
    </div>
  );
};

export default TOCButton;
