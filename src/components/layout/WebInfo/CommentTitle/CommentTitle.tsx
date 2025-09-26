import SectionTitle from '../SectionTitle/SectionTitle';

interface CommentTitleProps {
    className?: string;
}

const CommentTitle: React.FC<CommentTitleProps> = ({ className }) => {
    return (
        <SectionTitle 
            title="最新评论" 
            type="comment" 
            className={className}
        />
    );
};

export default CommentTitle;