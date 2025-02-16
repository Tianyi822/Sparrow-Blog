import './TimeLine.scss';
import ContributionGraph from './ContributionGraph/ContributionGraph';
import TimeLineSlider from './TimeLineSlider/TimeLineSlider';

const TimeLine = () => {
    return (
        <div className="timeline">
            <div className="timeline-container">
                <TimeLineSlider />
                <ContributionGraph className={"time-line-contribution-graph"} />
            </div>
        </div>
    );
};

export default TimeLine; 