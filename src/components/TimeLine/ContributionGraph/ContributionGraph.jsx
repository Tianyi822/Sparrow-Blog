import { useState, useMemo, useCallback } from 'react';
import './ContributionGraph.scss';
import SvgIcon, { DownArrow, Small } from "@/components/SvgIcon/SvgIcon.jsx";

const ContributionGraph = () => {
    // 定义颜色等级
    const colorScale = {
        'level-0': '#ebedf0',
        'level-1': '#9be9a8',
        'level-2': '#40c463',
        'level-3': '#30a14e',
        'level-4': '#216e39',
    };

    const months = useMemo(() => ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'], []);

    // 使用 useState 管理年份
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // 计算每个月的起始位置
    const getMonthStartColumn = (date) => {
        const weekDay = date.getDay();
        // 将周日的0转换为7，使其位于最后一列
        return weekDay === 0 ? 7 : weekDay;
    };

    // 生成一年的数据
    const generateYearData = useCallback((year) => {
        // 创建模拟数据
        const mockData = new Map();
        const startDate = new Date(year, 0, 1);
        const endDate = new Date(year, 11, 31);
        let currentDate = new Date(startDate);

        // 生成随机贡献数据
        while (currentDate <= endDate) {
            const dateString = currentDate.toISOString().split('T')[0];
            const count = Math.floor(Math.random() * 5000);
            mockData.set(dateString, count);
            currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
        }

        // 重置到年初
        const yearData = [];

        // 按月组织数据
        for (let month = 0; month < 12; month++) {
            const monthDays = [];
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const firstDay = new Date(year, month, 1);
            const startColumn = getMonthStartColumn(firstDay);

            // 添加月初的空白天数
            for (let i = 1; i < startColumn; i++) {
                monthDays.push({
                    empty: true,
                    weekDay: i
                });
            }

            // 填充实际日期
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const dateString = date.toISOString().split('T')[0];
                monthDays.push({
                    date,
                    weekDay: date.getDay(),
                    count: mockData.get(dateString) || 0
                });
            }

            yearData.push({
                month: months[month],
                days: monthDays
            });
        }

        return yearData;
    }, [months]);

    const yearData = useMemo(() => generateYearData(selectedYear), [selectedYear, generateYearData]);

    // 计算贡献等级
    const getContributionLevel = useCallback((count) => {
        if (count === 0) return 'level-0';
        if (count <= 800) return 'level-1';
        if (count <= 2000) return 'level-2';
        if (count <= 4000) return 'level-3';
        return 'level-4';
    }, []);

    return (
        <div className="contribution-graph">
            <div className="controls-column">
                <div className="year-controls">
                    <div className="arrow-btn">
                        <SvgIcon 
                            name={DownArrow}
                            size={Small}
                            className="rotate-90"
                            onClick={() => setSelectedYear(prev => prev - 1)}
                        />
                    </div>
                    <span className="year-text">{selectedYear}</span>
                    <div className="arrow-btn">
                        <SvgIcon 
                            name={DownArrow}
                            size={Small}
                            className="rotate-270"
                            onClick={() => setSelectedYear(prev => prev + 1)}
                        />
                    </div>
                </div>
            </div>

            <div className="graph-container">
                <div className="months-grid">
                    {yearData.map((monthData, monthIndex) => (
                        <div key={monthIndex} className="month-block">
                            <div className="month-label">{monthData.month}</div>
                            <div className="days-grid">
                                {monthData.days.map((day, dayIndex) => {
                                    if (day.empty) {
                                        return (
                                            <div
                                                key={`empty-${dayIndex}`}
                                                className="day empty"
                                                style={{
                                                    gridColumn: day.weekDay
                                                }}
                                            />
                                        );
                                    }
                                    const adjustedWeekDay = day.weekDay === 0 ? 7 : day.weekDay;
                                    return (
                                        <div
                                            key={dayIndex}
                                            className={`day ${getContributionLevel(day.count)}`}
                                            style={{
                                                gridColumn: adjustedWeekDay
                                            }}
                                            title={`${day.date.toLocaleDateString()}: ${day.count} words`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="color-scale">
                <span>少</span>
                <div className="contribution-cells">
                    {Object.keys(colorScale).map((level) => (
                        <div key={level} className={`contribution-cell ${level}`}/>
                    ))}
                </div>
                <span>多</span>
            </div>
        </div>
    );
};

export default ContributionGraph; 