import { useEffect, useRef, useState } from 'react';
import './Clock.scss';

interface ClockProps {
    className?: string;
    profileImage?: string;
    backgroundImage?: string;
}

interface TimeObject {
    h: number;
    m: number;
    s: number;
}

const Clock: React.FC<ClockProps> = ({className, profileImage, backgroundImage}) => {
    const clockRef = useRef<HTMLDivElement | null>(null);
    const [time, setTime] = useState<TimeObject>(getTimeObject());

    // 获取时间对象
    function getTimeObject(): TimeObject {
        const date = new Date();
        const h = date.getHours();
        const m = date.getMinutes();
        const s = date.getSeconds();
        return {h, m, s};
    }

    // 获取格式化的时间数组
    function getTimeDigitsGrouped(): [number | string, string, string, string] {
        let {h, m, s} = time;
        const ap = h > 11 ? "P" : "A";
        if (h === 0) h += 12;
        else if (h > 12) h -= 12;
        const mStr = m < 10 ? `0${m}` : m.toString();
        const sStr = s < 10 ? `0${s}` : s.toString();
        return [h, mStr, sStr, ap];
    }

    // 更新时钟样式和时间
    useEffect(() => {
        const updateClock = () => {
            const newTime = getTimeObject();
            setTime(newTime);

            const secFraction = newTime.s / 60;
            const minFraction = (newTime.m + secFraction) / 60;
            const hrFraction = (newTime.h + minFraction) / 12;

            if (clockRef.current) {
                clockRef.current.style.setProperty("--secAngle", `${360 * secFraction}deg`);
                clockRef.current.style.setProperty("--minAngle", `${360 * minFraction}deg`);
                clockRef.current.style.setProperty("--hrAngle", `${360 * hrFraction}deg`);
            }
        };

        updateClock(); // 立即更新一次
        const interval = setInterval(updateClock, 1000);

        return () => clearInterval(interval);
    }, []);

    const [h, m, s, ap] = getTimeDigitsGrouped();

    return (
        <div className={`clock ${className || ''}`} ref={clockRef}>
            <div
                className="layer layer--img"
                style={{
                    background: backgroundImage ? `url(${backgroundImage}) 0 0 / 100% 100%` : 'none'
                }}
            />
            <div className="layer layer--shade"/>
            <div className="layer layer--face">
                <div className="digits">
                    <span className="digit-group" data-unit="h">{h}</span>
                    <span>:</span>
                    <span className="digit-group" data-unit="m">{m}</span>
                    <small className="digit-group digit-group--small" data-unit="s">{s}</small>
                    <small className="digit-group digit-group--small" data-unit="ap">{ap}</small>
                </div>
                <div className="hand hand--hr"/>
                <div className="hand hand--min"/>
                <div className="hand hand--sec"/>
                <div className="ring"/>
            </div>
            <div className="layer layer--profile">
                <img src={profileImage} alt="" className="profile"/>
            </div>
        </div>
    );
};

export default Clock;