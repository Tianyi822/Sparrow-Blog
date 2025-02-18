import PropTypes from 'prop-types';
import './Tags.scss';
import classNames from 'classnames';

const Tags = ({ tags = [], className, onTagClick }) => {
    return (
        <div className={classNames('archive-tags', className)}>
            <h2 className="archive-tags-title">标签</h2>
            <div className="archive-tags-list">
                {tags.map((tag, index) => (
                    <span
                        key={tag}
                        className={`archive-tag-item type-${(index % 20) + 1}`}
                        onClick={() => onTagClick && onTagClick(tag)}
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
};

Tags.propTypes = {
    tags: PropTypes.arrayOf(PropTypes.string),
    className: PropTypes.string,
    onTagClick: PropTypes.func
};

export default Tags;