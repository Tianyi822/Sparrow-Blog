import React from 'react';
import { FiMessageSquare } from 'react-icons/fi';
import './CommentsButton.scss';

interface CommentsButtonProps {
  className?: string;
  onClick: () => void;
  commentsCount?: number;
}

const CommentsButton: React.FC<CommentsButtonProps> = ({
  className,
  onClick,
  commentsCount,
}) => {
  return (
    <div className={`comments-button ${className || ''}`} onClick={onClick}>
      <div className='comments-button-content'>
        <FiMessageSquare className='comments-icon' />
        {commentsCount !== undefined && commentsCount > 0 && <span className='comments-count'>{commentsCount}</span>}
      </div>
    </div>
  );
};

export default CommentsButton;
