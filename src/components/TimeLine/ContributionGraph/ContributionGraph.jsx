import { useMemo, useCallback, useRef, useEffect } from 'react';
import './ContributionGraph.scss';

const ContributionGraph = () => {
    const gridRef = useRef(null);

    useEffect(() => {
        // 在小屏幕下自动滚动到最新数据
        const handleResize = () => {
            if (window.innerWidth <= 920 && gridRef.current) {
                // 延迟执行以确保布局已完成
                setTimeout(() => {
                    gridRef.current.scrollLeft = gridRef.current.scrollWidth;
                }, 100);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // 使用 useMemo 缓存 mockApiData
    const mockApiData = useMemo(() => [
        // 2025年2月
        { date: '2025-02-25', wordCount: 2800 },  // level-3
        { date: '2025-02-22', wordCount: 1500 },  // level-2
        { date: '2025-02-18', wordCount: 4200 },  // level-4
        { date: '2025-02-15', wordCount: 750 },   // level-1
        { date: '2025-02-12', wordCount: 3200 },  // level-3
        { date: '2025-02-08', wordCount: 1800 },  // level-2
        { date: '2025-02-05', wordCount: 600 },   // level-1
        { date: '2025-02-01', wordCount: 4500 },  // level-4

        // 2025年1月
        { date: '2025-01-30', wordCount: 2100 },  // level-3
        { date: '2025-01-28', wordCount: 850 },   // level-2
        { date: '2025-01-25', wordCount: 4200 },  // level-4
        { date: '2025-01-22', wordCount: 1600 },  // level-2
        { date: '2025-01-18', wordCount: 3500 },  // level-3
        { date: '2025-01-15', wordCount: 5000 },  // level-4
        { date: '2025-01-10', wordCount: 700 },   // level-1
        { date: '2025-01-05', wordCount: 2400 },  // level-3
        { date: '2025-01-01', wordCount: 4800 },  // level-4

        // 2024年12月
        { date: '2024-12-31', wordCount: 3800 },  // level-3 跨年
        { date: '2024-12-28', wordCount: 1900 },  // level-2
        { date: '2024-12-25', wordCount: 4500 },  // level-4 圣诞
        { date: '2024-12-22', wordCount: 2200 },  // level-3
        { date: '2024-12-18', wordCount: 750 },   // level-1
        { date: '2024-12-15', wordCount: 3200 },  // level-3
        { date: '2024-12-10', wordCount: 1500 },  // level-2
        { date: '2024-12-05', wordCount: 2800 },  // level-3
        { date: '2024-12-01', wordCount: 4000 },  // level-3

        // 2024年11月
        { date: '2024-11-30', wordCount: 2500 },  // level-3
        { date: '2024-11-28', wordCount: 650 },   // level-1
        { date: '2024-11-25', wordCount: 3800 },  // level-3
        { date: '2024-11-22', wordCount: 1800 },  // level-2
        { date: '2024-11-18', wordCount: 4200 },  // level-4
        { date: '2024-11-15', wordCount: 2100 },  // level-3
        { date: '2024-11-10', wordCount: 900 },   // level-2
        { date: '2024-11-05', wordCount: 3500 },  // level-3
        { date: '2024-11-01', wordCount: 1500 },  // level-2

        // 2024年10月
        { date: '2024-10-31', wordCount: 4500 },  // level-4 万圣节
        { date: '2024-10-28', wordCount: 2200 },  // level-3
        { date: '2024-10-25', wordCount: 800 },   // level-1
        { date: '2024-10-20', wordCount: 3200 },  // level-3
        { date: '2024-10-15', wordCount: 1800 },  // level-2
        { date: '2024-10-10', wordCount: 4000 },  // level-3
        { date: '2024-10-05', wordCount: 700 },   // level-1
        { date: '2024-10-01', wordCount: 5000 },  // level-4 国庆

        // 2024年9月
        { date: '2024-09-30', wordCount: 2800 },  // level-3
        { date: '2024-09-25', wordCount: 1500 },  // level-2
        { date: '2024-09-20', wordCount: 3500 },  // level-3
        { date: '2024-09-15', wordCount: 750 },   // level-1
        { date: '2024-09-10', wordCount: 4200 },  // level-4
        { date: '2024-09-05', wordCount: 2100 },  // level-3
        { date: '2024-09-01', wordCount: 1800 },  // level-2

        // 2024年8月
        { date: '2024-08-28', wordCount: 3800 },  // level-3
        { date: '2024-08-25', wordCount: 650 },   // level-1
        { date: '2024-08-20', wordCount: 4500 },  // level-4
        { date: '2024-08-15', wordCount: 2200 },  // level-3
        { date: '2024-08-10', wordCount: 1500 },  // level-2
        { date: '2024-08-05', wordCount: 3200 },  // level-3
        { date: '2024-08-01', wordCount: 900 },   // level-2

        // 2024年7月
        { date: '2024-07-30', wordCount: 4200 },  // level-4
        { date: '2024-07-25', wordCount: 1800 },  // level-2
        { date: '2024-07-20', wordCount: 3500 },  // level-3
        { date: '2024-07-15', wordCount: 750 },   // level-1
        { date: '2024-07-10', wordCount: 2800 },  // level-3
        { date: '2024-07-05', wordCount: 1500 },  // level-2
        { date: '2024-07-01', wordCount: 4000 },  // level-3

        // 2024年6月
        { date: '2024-06-30', wordCount: 2100 },  // level-3
        { date: '2024-06-25', wordCount: 4500 },  // level-4
        { date: '2024-06-20', wordCount: 800 },   // level-1
        { date: '2024-06-15', wordCount: 3200 },  // level-3
        { date: '2024-06-10', wordCount: 1800 },  // level-2
        { date: '2024-06-05', wordCount: 2500 },  // level-3
        { date: '2024-06-01', wordCount: 4200 },  // level-4

        // 2024年5月
        { date: '2024-05-31', wordCount: 1500 },  // level-2
        { date: '2024-05-25', wordCount: 3800 },  // level-3
        { date: '2024-05-20', wordCount: 700 },   // level-1
        { date: '2024-05-15', wordCount: 4500 },  // level-4
        { date: '2024-05-10', wordCount: 2200 },  // level-3
        { date: '2024-05-05', wordCount: 1800 },  // level-2
        { date: '2024-05-01', wordCount: 5000 },  // level-4 劳动节

        // 2024年4月
        { date: '2024-04-30', wordCount: 2800 },  // level-3
        { date: '2024-04-25', wordCount: 1500 },  // level-2
        { date: '2024-04-20', wordCount: 3500 },  // level-3
        { date: '2024-04-15', wordCount: 750 },   // level-1
        { date: '2024-04-10', wordCount: 4200 },  // level-4
        { date: '2024-04-05', wordCount: 4800 },  // level-4 清明
        { date: '2024-04-01', wordCount: 1800 },  // level-2

        // 2024年3月
        { date: '2024-03-31', wordCount: 3200 },  // level-3
        { date: '2024-03-25', wordCount: 1500 },  // level-2
        { date: '2024-03-20', wordCount: 4500 },  // level-4
        { date: '2024-03-15', wordCount: 800 },   // level-1
        { date: '2024-03-10', wordCount: 2800 },  // level-3
        { date: '2024-03-05', wordCount: 1800 },  // level-2
        { date: '2024-03-01', wordCount: 3500 },  // level-3

        // 2024年2月
        { date: '2024-02-28', wordCount: 2100 },  // level-3
        { date: '2024-02-25', wordCount: 4200 },  // level-4
        { date: '2024-02-20', wordCount: 750 },   // level-1
        { date: '2024-02-15', wordCount: 3800 },  // level-3
        { date: '2024-02-10', wordCount: 5000 },  // level-4 春节
        { date: '2024-02-05', wordCount: 2800 },  // level-3
        { date: '2024-02-01', wordCount: 1500 },  // level-2

        // 2024年1月
        { date: '2024-01-31', wordCount: 3500 },  // level-3
        { date: '2024-01-25', wordCount: 1800 },  // level-2
        { date: '2024-01-20', wordCount: 4500 },  // level-4
        { date: '2024-01-15', wordCount: 700 },   // level-1
        { date: '2024-01-10', wordCount: 2500 },  // level-3
        { date: '2024-01-05', wordCount: 1500 },  // level-2
        { date: '2024-01-01', wordCount: 4800 }   // level-4 元旦
    ], []); // 空依赖数组，因为数据是静态的

    // 修改数据生成逻辑
    const generateContributionData = useCallback(() => {
        const data = [];
        const today = new Date();
        
        // 计算需要多少天才能让今天在最后一列
        const currentDayOfWeek = today.getDay();
        const displayDayOfWeek = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
        const daysToGenerate = 371 + (6 - displayDayOfWeek);

        // 创建日期到字数的映射
        const contributionMap = new Map(
            mockApiData.map(item => [
                item.date,
                item.wordCount  // 直接使用字数，不再转换
            ])
        );

        // 从今天开始，向前生成数据
        for (let i = 0; i < daysToGenerate; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            
            const dateString = date.toISOString().split('T')[0];
            const count = contributionMap.get(dateString) || 0;

            data.unshift({
                date,
                count
            });
        }

        // 填充开头的空数据
        const firstDay = data[0].date.getDay();
        const displayFirstDay = firstDay === 0 ? 6 : firstDay - 1;
        
        for (let i = 0; i < displayFirstDay; i++) {
            const firstDate = data[0].date;
            data.unshift({
                date: new Date(firstDate.getTime() - ((displayFirstDay - i) * 24 * 60 * 60 * 1000)),
                count: 0
            });
        }

        return data;
    }, [mockApiData]);

    // 使用 useMemo 缓存生成的数据
    const data = useMemo(() => generateContributionData(), [generateContributionData]);

    // 使用 useCallback 缓存月份标签生成函数
    const getMonthLabels = useCallback(() => {
        const months = [];

        // 英文月份缩写
        const monthAbbr = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // 获取当前日期
        const today = new Date();
        const currentMonth = today.getMonth();

        // 计算13个月前的日期
        const thirteenMonthsAgo = new Date(today);
        thirteenMonthsAgo.setMonth(currentMonth - 12);

        // 从数据中找到每个月的第一天的位置
        let firstDayIndexes = new Map();

        data.forEach((item, index) => {
            const date = item.date;
            const month = date.getMonth();
            const year = date.getFullYear();
            const key = `${year}-${month}`;

            // 如果是月初且还没记录过这个月
            if (date.getDate() === 1 && !firstDayIndexes.has(key)) {
                firstDayIndexes.set(key, index);
            }
        });

        // 遍历13个月的范围，生成月份标签
        let targetDate = new Date(thirteenMonthsAgo);
        while (targetDate <= today) {
            const month = targetDate.getMonth();
            const year = targetDate.getFullYear();
            const key = `${year}-${month}`;

            // 如果找到了这个月的第一天的位置
            if (firstDayIndexes.has(key)) {
                const index = firstDayIndexes.get(key);
                const columnStart = Math.floor(index / 7) + 2;  // 将基础列位置加1，使标签向右移动

                months.push({
                    label: monthAbbr[month],
                    columnIndex: columnStart,
                    month: month,
                    year: year,
                    key: key
                });
            }

            // 移到下一个月
            targetDate.setMonth(targetDate.getMonth() + 1);
        }

        return months;
    }, [data]); // 依赖于 data

    // 使用 useMemo 缓存月份标签
    const monthLabels = useMemo(() => getMonthLabels(), [getMonthLabels]);

    // 使用 useMemo 缓存周数据
    const weeks = useMemo(() => {
        const result = [];
        for (let i = 0; i < data.length; i += 7) {
            result.push(data.slice(i, i + 7));
        }
        return result;
    }, [data]);

    // 使用 useCallback 优化贡献等级计算
    const getContributionLevel = useCallback((count) => {
        if (count === 0) return 'level-0';          // 没有写作
        if (count <= 800) return 'level-1';         // 1-800字，短篇博客
        if (count <= 2000) return 'level-2';        // 801-2000字，中等篇幅
        if (count <= 4000) return 'level-3';        // 2001-4000字，较长文章
        return 'level-4';                           // 4000字以上，长篇文章
    }, []);

    // 添加鼠标事件处理函数
    const handleMouseEnter = (weekIndex, month, year) => {
        // 高亮对应的星期标签
        const weekday = document.querySelector(`.weekday[data-week-index="${weekIndex}"]`);
        if (weekday) {
            weekday.classList.add('highlight');
        }

        // 高亮对应的月份标签
        const monthLabel = document.querySelector(`.month[data-month="${month}"][data-year="${year}"]`);
        if (monthLabel) {
            monthLabel.classList.add('highlight');
        }
    };

    const handleMouseLeave = (weekIndex, month, year) => {
        // 移除星期标签高亮
        const weekday = document.querySelector(`.weekday[data-week-index="${weekIndex}"]`);
        if (weekday) {
            weekday.classList.remove('highlight');
        }

        // 移除月份标签高亮
        const monthLabel = document.querySelector(`.month[data-month="${month}"][data-year="${year}"]`);
        if (monthLabel) {
            monthLabel.classList.remove('highlight');
        }
    };

    // 修改事件处理函数
    const handleMonthMouseEnter = (month, year) => {
        // 高亮当前月份标签
        const monthLabel = document.querySelector(`.month[data-month="${month}"][data-year="${year}"]`);
        if (monthLabel) {
            monthLabel.classList.add('highlight');
        }

        // 高亮该月份的所有贡献格
        const cells = document.querySelectorAll(`.contribution-cell[data-month="${month}"][data-year="${year}"]`);
        cells.forEach(cell => {
            cell.classList.add('month-highlight');
        });
    };

    const handleMonthMouseLeave = (month, year) => {
        // 移除月份标签高亮
        const monthLabel = document.querySelector(`.month[data-month="${month}"][data-year="${year}"]`);
        if (monthLabel) {
            monthLabel.classList.remove('highlight');
        }

        // 移除贡献格高亮
        const cells = document.querySelectorAll(`.contribution-cell[data-month="${month}"][data-year="${year}"]`);
        cells.forEach(cell => {
            cell.classList.remove('month-highlight');
        });
    };

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
        <div className="contribution-graph">
            <div className="graph-grid" ref={gridRef}>
                <div className="grid-row months">
                    <div className="grid-cell"></div>
                    {monthLabels.map((month) => (
                        <div
                            key={month.key}
                            className="grid-cell month"
                            style={{
                                gridColumnStart: month.columnIndex,  // 直接使用 gridColumnStart
                                gridColumnEnd: `span 2`
                            }}
                            data-month={month.month}
                            data-year={month.year}
                            onMouseEnter={() => handleMonthMouseEnter(month.month, month.year)}
                            onMouseLeave={() => handleMonthMouseLeave(month.month, month.year)}
                        >
                            {month.label}
                        </div>
                    ))}
                </div>

                {weekDays.map((day, dayIndex) => (
                    <div key={day} className="grid-row">
                        <div className="grid-cell weekday" data-week-index={dayIndex}>{day}</div>
                        <div className="contribution-cells">
                            {weeks.map((week, weekIndex) => {
                                const cellDate = week[dayIndex]?.date;
                                // 只在日期存在时渲染格子
                                return cellDate ? (
                                    <div
                                        key={`${dayIndex}-${weekIndex}`}
                                        className={`grid-cell contribution-cell ${getContributionLevel(week[dayIndex]?.count || 0)}`}
                                        title={`${cellDate.toLocaleDateString()}: ${week[dayIndex]?.count || 0} words`}
                                        data-week-index={dayIndex}
                                        data-month={cellDate.getMonth()}
                                        data-year={cellDate.getFullYear()}
                                        onMouseEnter={() => handleMouseEnter(dayIndex, cellDate.getMonth(), cellDate.getFullYear())}
                                        onMouseLeave={() => handleMouseLeave(dayIndex, cellDate.getMonth(), cellDate.getFullYear())}
                                    />
                                ) : (
                                    // 日期不存在时返回空的占位 div
                                    <div
                                        key={`${dayIndex}-${weekIndex}`}
                                        className="grid-cell empty-cell"
                                    />
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="graph-legend">
                <span>Less</span>
                <div className="legend-cells">
                    <div className="contribution-cell level-0"></div>
                    <div className="contribution-cell level-1"></div>
                    <div className="contribution-cell level-2"></div>
                    <div className="contribution-cell level-3"></div>
                    <div className="contribution-cell level-4"></div>
                </div>
                <span>More</span>
            </div>
        </div>
    );
};

export default ContributionGraph; 