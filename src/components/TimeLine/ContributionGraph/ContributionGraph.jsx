import './ContributionGraph.scss';

const ContributionGraph = () => {
    // 修改数据生成函数
    const generateMockData = () => {
        const data = [];
        const today = new Date();

        // 计算需要多少天才能让今天在最后一列
        const currentDayOfWeek = today.getDay();  // 0-6，0是周日
        // 转换为我们的显示方式（1-7，周一-周日）
        const displayDayOfWeek = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
        const daysToGenerate = 371 + (6 - displayDayOfWeek);  // 确保今天在最后一列

        // 从今天开始，向前生成数据
        for (let i = 0; i < daysToGenerate; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);

            // 生成1-4的随机数
            const count = Math.floor(Math.random() * 4) + 1;

            // 将新数据插入到数组开头，这样最新的日期会在最后
            data.unshift({
                date,
                count
            });
        }

        // 获取第一天的星期并转换为我们的显示方式
        const firstDay = data[0].date.getDay();
        const displayFirstDay = firstDay === 0 ? 6 : firstDay - 1;

        // 在开头填充空数据，使其从周一开始
        for (let i = 0; i < displayFirstDay; i++) {
            const firstDate = data[0].date;
            data.unshift({
                date: new Date(firstDate.getTime() - ((displayFirstDay - i) * 24 * 60 * 60 * 1000)),
                count: 0
            });
        }

        return data;
    };

    const data = generateMockData();

    // 修改月份标签生成函数
    const getMonthLabels = () => {
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
    };

    const monthLabels = getMonthLabels();
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // 将数据按周分组
    const weeks = [];
    for (let i = 0; i < data.length; i += 7) {
        weeks.push(data.slice(i, i + 7));
    }

    const getContributionLevel = (count) => {
        if (count === 0) return 'level-0';
        if (count === 1) return 'level-1';
        if (count === 2) return 'level-2';
        if (count === 3) return 'level-3';
        return 'level-4';
    };

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

    return (
        <div className="contribution-graph">
            <div className="graph-grid">
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
                                        title={`${cellDate.toLocaleDateString()}: ${week[dayIndex]?.count || 0} contributions`}
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