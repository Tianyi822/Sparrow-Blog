import { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import './ContributionGraph.scss';
import SvgIcon, { DownArrow, Small } from "@/components/SvgIcon/SvgIcon.jsx";

const ContributionGraph = ({ className, onDayClick }) => {
    // 模拟后端返回的数据
    const mockApiData = useMemo(() => [
        // 2025年2月
        {date: '2025-02-25', wordCount: 2800},  // level-3
        {date: '2025-02-22', wordCount: 1500},  // level-2
        {date: '2025-02-18', wordCount: 4200},  // level-4
        {date: '2025-02-15', wordCount: 750},   // level-1
        {date: '2025-02-12', wordCount: 3200},  // level-3
        {date: '2025-02-08', wordCount: 1800},  // level-2
        {date: '2025-02-05', wordCount: 600},   // level-1
        {date: '2025-02-01', wordCount: 4500},  // level-4

        // 2025年1月
        {date: '2025-01-30', wordCount: 2100},  // level-3
        {date: '2025-01-28', wordCount: 850},   // level-2
        {date: '2025-01-25', wordCount: 4200},  // level-4
        {date: '2025-01-22', wordCount: 1600},  // level-2
        {date: '2025-01-18', wordCount: 3500},  // level-3
        {date: '2025-01-15', wordCount: 5000},  // level-4
        {date: '2025-01-10', wordCount: 700},   // level-1
        {date: '2025-01-05', wordCount: 2400},  // level-3
        {date: '2025-01-01', wordCount: 4800},  // level-4

        // 2024年12月
        {date: '2024-12-31', wordCount: 3800},  // level-3 跨年
        {date: '2024-12-28', wordCount: 1900},  // level-2
        {date: '2024-12-25', wordCount: 4500},  // level-4 圣诞
        {date: '2024-12-22', wordCount: 2200},  // level-3
        {date: '2024-12-18', wordCount: 750},   // level-1
        {date: '2024-12-15', wordCount: 3200},  // level-3
        {date: '2024-12-10', wordCount: 1500},  // level-2
        {date: '2024-12-05', wordCount: 2800},  // level-3
        {date: '2024-12-01', wordCount: 4000},  // level-3

        // 2024年11月
        {date: '2024-11-30', wordCount: 2500},  // level-3
        {date: '2024-11-28', wordCount: 650},   // level-1
        {date: '2024-11-25', wordCount: 3800},  // level-3
        {date: '2024-11-22', wordCount: 1800},  // level-2
        {date: '2024-11-18', wordCount: 4200},  // level-4
        {date: '2024-11-15', wordCount: 2100},  // level-3
        {date: '2024-11-10', wordCount: 900},   // level-2
        {date: '2024-11-05', wordCount: 3500},  // level-3
        {date: '2024-11-01', wordCount: 1500},  // level-2

        // 2024年10月
        {date: '2024-10-31', wordCount: 4500},  // level-4 万圣节
        {date: '2024-10-28', wordCount: 2200},  // level-3
        {date: '2024-10-25', wordCount: 800},   // level-1
        {date: '2024-10-20', wordCount: 3200},  // level-3
        {date: '2024-10-15', wordCount: 1800},  // level-2
        {date: '2024-10-10', wordCount: 4000},  // level-3
        {date: '2024-10-05', wordCount: 700},   // level-1
        {date: '2024-10-01', wordCount: 5000},  // level-4 国庆

        // 2024年9月
        {date: '2024-09-30', wordCount: 2800},  // level-3
        {date: '2024-09-25', wordCount: 1500},  // level-2
        {date: '2024-09-20', wordCount: 3500},  // level-3
        {date: '2024-09-15', wordCount: 750},   // level-1
        {date: '2024-09-10', wordCount: 4200},  // level-4
        {date: '2024-09-05', wordCount: 2100},  // level-3
        {date: '2024-09-01', wordCount: 1800},  // level-2

        // 2024年8月
        {date: '2024-08-28', wordCount: 3800},  // level-3
        {date: '2024-08-25', wordCount: 650},   // level-1
        {date: '2024-08-20', wordCount: 4500},  // level-4
        {date: '2024-08-15', wordCount: 2200},  // level-3
        {date: '2024-08-10', wordCount: 1500},  // level-2
        {date: '2024-08-05', wordCount: 3200},  // level-3
        {date: '2024-08-01', wordCount: 900},   // level-2

        // 2024年7月
        {date: '2024-07-30', wordCount: 4200},  // level-4
        {date: '2024-07-25', wordCount: 1800},  // level-2
        {date: '2024-07-20', wordCount: 3500},  // level-3
        {date: '2024-07-15', wordCount: 750},   // level-1
        {date: '2024-07-10', wordCount: 2800},  // level-3
        {date: '2024-07-05', wordCount: 1500},  // level-2
        {date: '2024-07-01', wordCount: 4000},  // level-3

        // 2024年6月
        {date: '2024-06-30', wordCount: 2100},  // level-3
        {date: '2024-06-25', wordCount: 4500},  // level-4
        {date: '2024-06-20', wordCount: 800},   // level-1
        {date: '2024-06-15', wordCount: 3200},  // level-3
        {date: '2024-06-10', wordCount: 1800},  // level-2
        {date: '2024-06-05', wordCount: 2500},  // level-3
        {date: '2024-06-01', wordCount: 4200},  // level-4

        // 2024年5月
        {date: '2024-05-31', wordCount: 1500},  // level-2
        {date: '2024-05-25', wordCount: 3800},  // level-3
        {date: '2024-05-20', wordCount: 700},   // level-1
        {date: '2024-05-15', wordCount: 4500},  // level-4
        {date: '2024-05-10', wordCount: 2200},  // level-3
        {date: '2024-05-05', wordCount: 1800},  // level-2
        {date: '2024-05-01', wordCount: 5000},  // level-4 劳动节

        // 2024年4月
        {date: '2024-04-30', wordCount: 2800},  // level-3
        {date: '2024-04-25', wordCount: 1500},  // level-2
        {date: '2024-04-20', wordCount: 3500},  // level-3
        {date: '2024-04-15', wordCount: 750},   // level-1
        {date: '2024-04-10', wordCount: 4200},  // level-4
        {date: '2024-04-05', wordCount: 4800},  // level-4 清明
        {date: '2024-04-01', wordCount: 1800},  // level-2

        // 2024年3月
        {date: '2024-03-31', wordCount: 3200},  // level-3
        {date: '2024-03-25', wordCount: 1500},  // level-2
        {date: '2024-03-20', wordCount: 4500},  // level-4
        {date: '2024-03-15', wordCount: 800},   // level-1
        {date: '2024-03-10', wordCount: 2800},  // level-3
        {date: '2024-03-05', wordCount: 1800},  // level-2
        {date: '2024-03-01', wordCount: 3500},  // level-3

        // 2024年2月
        {date: '2024-02-28', wordCount: 2100},  // level-3
        {date: '2024-02-25', wordCount: 4200},  // level-4
        {date: '2024-02-20', wordCount: 750},   // level-1
        {date: '2024-02-15', wordCount: 3800},  // level-3
        {date: '2024-02-10', wordCount: 5000},  // level-4 春节
        {date: '2024-02-05', wordCount: 2800},  // level-3
        {date: '2024-02-01', wordCount: 1500},  // level-2

        // 2024年1月
        {date: '2024-01-31', wordCount: 3500},  // level-3
        {date: '2024-01-25', wordCount: 1800},  // level-2
        {date: '2024-01-20', wordCount: 4500},  // level-4
        {date: '2024-01-15', wordCount: 700},   // level-1
        {date: '2024-01-10', wordCount: 2500},  // level-3
        {date: '2024-01-05', wordCount: 1500},  // level-2
        {date: '2024-01-01', wordCount: 4800}   // level-4 元旦
    ], []);

    // 定义颜色等级
    const colorScale = [
        'level-0',
        'level-1',
        'level-2',
        'level-3',
        'level-4'
    ];

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
        // 修改 Map 的创建方式，使用本地时间格式化日期
        const mockDataMap = new Map(mockApiData.map(item => {
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
                    count: mockDataMap.get(localDate) || 0
                });
            }

            yearData.push({
                month: months[month],
                days: monthDays
            });
        }

        return yearData;
    }, [months, mockApiData]);

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
                                            onClick={() => onDayClick(day.date)}
                                            role="button"
                                            tabIndex={0}
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
    onDayClick: PropTypes.func
};

ContributionGraph.defaultProps = {
    className: '',
    onDayClick: () => {}
};

export default ContributionGraph; 