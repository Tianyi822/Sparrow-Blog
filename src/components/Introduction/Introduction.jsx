import './Introduction.scss';
import classNames from "classnames";
import PropTypes from "prop-types";
import { useState } from "react";
import TypeWriter from '@/components/TypeWriter/TypeWriter';

const Introduction = (props) => {
    const {className} = props;

    const introductionClassName = classNames("introduction", className);

    const [name] = useState("TianYi");

    const [typewriterTexts] = useState([
        "昨日种种，皆成今我，切勿思量，更莫哀，从今往后，怎么收获怎么载",
        "但行好事，莫问前程",
        "喜欢探索新技术",
        "终身学习者",
        "二次元爱好者"
    ]);

    return (
        <div className={introductionClassName}>
            <div className="greeting">
                <span className="hello">你好，我是</span>
                <span className="name">{name}</span>
            </div>
            <div className="identity">一名二次元+程序员。</div>
            <div className="tech-stack">
                喜欢
                <span className="tech">React</span>、
                <span className="tech">JavaScript</span>、
                <span className="tech">Golang</span>、
                <span className="tech">数据库</span> (＾Ｕ＾)ノ~
            </div>
            <TypeWriter
                texts={typewriterTexts}
                className="introduction-type-writer"
                typeSpeed={120}
                eraseSpeed={50}
                delayBetween={1500}
            />
        </div>
    );
};


Introduction.propTypes = {
    className: PropTypes.string
};

export default Introduction;