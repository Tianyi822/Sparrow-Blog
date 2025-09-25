import './CommentTitle.scss';

interface CommentTitleProps {
    className?: string;
}

const CommentTitle: React.FC<CommentTitleProps> = ({ className }) => {
    return (
        <div className={`comment-title-container ${className || ''}`}>
            <div className="comment-title-border-glow" />
            <h3 className="comment-title-text">
                最新评论
            </h3>
        </div>
    );
};

export default CommentTitle;