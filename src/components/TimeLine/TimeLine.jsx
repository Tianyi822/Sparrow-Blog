import { useState, useEffect } from 'react';
import './TimeLine.scss';
import ContributionGraph from './ContributionGraph/ContributionGraph';
import Slider from './Slider/Slider.jsx';

const TimeLine = () => {
    const [isWideScreen, setIsWideScreen] = useState(window.innerWidth > 1480);

    useEffect(() => {
        const handleResize = () => {
            setIsWideScreen(window.innerWidth > 1480);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="timeline">
            {isWideScreen ? (
                <div className="timeline-container">
                    <Slider className={"time-line-slider"} />
                    <ContributionGraph className="time-line-contribution-graph" />
                </div>
            ) : (
                <Slider className="time-line-slider" />
            )}
        </div>
    );
};

export default TimeLine; 