import './LatestComments.scss';
import PropTypes from 'prop-types';
import use3DEffect from '@/hooks/use3DEffect';

const LATEST_COMMENTS = [
    {
        id: 1,
        content: "无法获取评论，请确认相关配置是否正确",
        date: "2023-09-10",
        article: "文章标题"
    }
];

const LatestComments = ({ className }) => {
    const { cardRef, glowRef, borderGlowRef } = use3DEffect();

    return (
        <div className={`latest-comments ${className || ''}`} ref={cardRef}>
            <div className="latest-comments-glow" ref={glowRef}/>
            <div className="latest-comments-border-glow" ref={borderGlowRef}/>
            <h3 className="latest-comments-title">
                <span className="latest-comments-icon">💬</span>
                最新评论
            </h3>
            <div className="latest-comments-list">
                {LATEST_COMMENTS.map(comment => (
                    <div key={comment.id} className="comment-item">
                        <p className="comment-content">{comment.content}</p>
                        <div className="comment-meta">
                            <span className="comment-article">{comment.article}</span>
                            <span className="comment-date">{comment.date}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

LatestComments.propTypes = {
    className: PropTypes.string
};

export default LatestComments; 