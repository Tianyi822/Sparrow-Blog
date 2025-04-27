import './Introduction.scss';
import classNames from "classnames";
import TypeWriter from '../TypeWriter/TypeWriter';

interface IntroductionProps {
    className?: string;
    userName?: string;
    typeWriterContent?: string[];
    userHobbies?: string[];
}

const Introduction: React.FC<IntroductionProps> = ({ 
    className, 
    userName = "H2Blog",
    typeWriterContent,
    userHobbies
}) => {
    const introductionClassName = classNames("introduction", className);

    return (
        <div className={introductionClassName}>
            <div className="greeting">
                <span className="hello">(＾Ｕ＾)ノ~ 你好，我是</span>
                <span className="name">{userName}</span>
            </div>
            <div className="identity">一名二次元 + 程序员</div>
            
            {userHobbies && userHobbies.length > 0 && (
                <div className="tech-stack">
                    喜欢
                    {userHobbies.map((hobby, index) => (
                        <span key={index}>
                            <span className="tech">{hobby}</span>
                            {index < userHobbies.length - 1 && '、'}
                        </span>
                    ))}
                </div>
            )}
            
            {typeWriterContent && typeWriterContent.length > 0 && (
                <TypeWriter
                    texts={typeWriterContent}
                    className="introduction-type-writer"
                    typeSpeed={120}
                    eraseSpeed={50}
                    delayBetween={1500}
                />
            )}
        </div>
    );
};

export default Introduction;