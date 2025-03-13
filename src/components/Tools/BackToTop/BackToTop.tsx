import './BackToTop.scss';
import SvgIcon, { DownArrow, Normal } from '@/components/SvgIcon/SvgIcon';
import classNames from "classnames";

interface BackToTopProps {
    className?: string;
    onClick?: () => void;
}

const BackToTop: React.FC<BackToTopProps> = ({ className, onClick }) => {
    return (
        <div
            className={classNames('back-to-top', className)}
            onClick={onClick}
        >
            <SvgIcon
                name={DownArrow}
                size={Normal}
                className="svg-icon"
                color="#fff"
            />
        </div>
    );
};

export default BackToTop;