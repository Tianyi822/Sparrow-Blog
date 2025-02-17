import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './ContributionGraph.scss';
import SvgIcon, { DownArrow, Small } from "@/components/SvgIcon/SvgIcon.jsx";

const ContributionGraph = ({ className, onDayClick, data }) => {
    // 移除 mockApiData，使用传入的 data
    const contributionData = useMemo(() => data, [data]);

    // 定义颜色等级
    const colorScale = [
        'level-0',
        'level-1',
        'level-2',
        'level-3',
        'level-4'
    ]

    const months = useMemo(() => ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'], []);

    // 使用 useState 管理年份
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    // 计算每个月的起始位置
    const getMonthStartColumn = (date) => {
        const weekDay = date.getDay();
        return weekDay === 0 ? 7 : weekDay;
    };

    // 生成一年的数据
    const generateYearData = useCallback((year) => {
        const yearData = [];
        // 使用传入的 data 创建 Map
        const dataMap = new Map(contributionData.map(item => {
            const [y, m, d] = item.date.split('-');
            const localDate = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
            return [localDate, item.wordCount];
        }));

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

            // 填充实际日期，使用本地时间格式化日期
            for (let day = 1; day <= daysInMonth; day++) {
                const date = new Date(year, month, day);
                const localDate = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                monthDays.push({
                    date,
                    weekDay: date.getDay(),
                    count: dataMap.get(localDate) || 0
                });
            }

            yearData.push({
                month: months[month],
                days: monthDays
            });
        }

        return yearData;
    }, [months, contributionData]);

    const yearData = useMemo(() => generateYearData(selectedYear), [selectedYear, generateYearData]);

    // 修改贡献等级计算逻辑
    const getContributionLevel = useCallback((count) => {
        if (count === 0) return 'level-0';
        if (count <= 600) return 'level-1';
        if (count <= 1200) return 'level-2';
        if (count <= 1800) return 'level-3';
        return 'level-4';
    }, []);

    return (
        <div className={classNames('contribution-graph', className)}>
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
                                            onClick={() => day.count > 0 ? onDayClick(day.date) : null}
                                            role={day.count > 0 ? "button" : "presentation"}
                                            tabIndex={day.count > 0 ? 0 : -1}
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
                    {colorScale.map((level) => (
                        <div
                            key={level}
                            className={`contribution-cell ${level}`}
                            title={getContributionLevelTitle(level)}
                        />
                    ))}
                </div>
                <span>多</span>
            </div>
        </div>
    );
};

// 添加一个辅助函数来生成提示文本
const getContributionLevelTitle = (level) => {
    switch (level) {
        case 'level-0':
            return '无贡献';
        case 'level-1':
            return '1-600 字';
        case 'level-2':
            return '601-1200 字';
        case 'level-3':
            return '1201-1800 字';
        case 'level-4':
            return '1800+ 字';
        default:
            return '';
    }
};

ContributionGraph.propTypes = {
    className: PropTypes.string,
    onDayClick: PropTypes.func,
    data: PropTypes.arrayOf(PropTypes.shape({
        date: PropTypes.string.isRequired,
        wordCount: PropTypes.number.isRequired
    })).isRequired
};

ContributionGraph.defaultProps = {
    className: '',
    onDayClick: () => {}
};

export default ContributionGraph; 