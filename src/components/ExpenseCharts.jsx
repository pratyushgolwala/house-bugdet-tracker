'use client';

import { useState } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';

const ExpenseCharts = ({ expenses, categories, showAll = false }) => {
    const [timeFrame, setTimeFrame] = useState('month');

    // Get current date info
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    // Filter expenses based on selected time frame
    const filteredExpenses = expenses.filter((expense) => {
        const expenseDate = new Date(expense.date);

        if (timeFrame === 'month') {
            return (
                expenseDate.getMonth() === currentMonth &&
                expenseDate.getFullYear() === currentYear
            );
        } else if (timeFrame === 'year') {
            return expenseDate.getFullYear() === currentYear;
        }

        return true; // "all" option
    });

    // Get category name helper
    const getCategoryName = (categoryId) => {
        const category = categories.find((cat) => cat.id === categoryId);
        return category ? category.name : `Category ${categoryId}`;
    };

    // Prepare data for category pie chart
    const categoryData = categories
        .map((category) => {
            const total = filteredExpenses
                .filter((expense) => expense.categoryId === category.id)
                .reduce((sum, expense) => sum + expense.amount, 0);

            return {
                name: category.name,
                value: total,
                color: category.color || '#8884d8'
            };
        })
        .filter((item) => item.value > 0);

    // Prepare data for monthly trend
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleString('default', { month: 'short' });
        const monthYear = `${monthName} ${date.getFullYear()}`;

        const monthTotal = expenses
            .filter((expense) => {
                const expenseDate = new Date(expense.date);
                return (
                    expenseDate.getMonth() === date.getMonth() &&
                    expenseDate.getFullYear() === date.getFullYear()
                );
            })
            .reduce((sum, expense) => sum + expense.amount, 0);

        monthlyData.push({
            month: monthName,
            amount: monthTotal,
            fullDate: monthYear
        });
    }

    // Prepare data for daily expenses (last 30 days)
    const dailyData = [];
    for (let i = 29; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dayString = date.toISOString().split('T')[0];

        const dayTotal = expenses
            .filter((expense) => expense.date === dayString)
            .reduce((sum, expense) => sum + expense.amount, 0);

        dailyData.push({
            day: date.getDate(),
            amount: dayTotal,
            date: dayString
        });
    }

    // Colors for charts
    const COLORS = [
        '#0088FE',
        '#00C49F',
        '#FFBB28',
        '#FF8042',
        '#8884d8',
        '#82ca9d',
        '#ffc658',
        '#ff7300'
    ];

    const totalAmount = filteredExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
    );

    return (
        <div className='space-y-6'>
            {/* Time Frame Selector */}
            <div className='flex justify-between items-center'>
                <h2 className='text-2xl font-bold text-gray-900'>
                    Expense Analytics
                </h2>
                <select
                    value={timeFrame}
                    onChange={(e) => setTimeFrame(e.target.value)}
                    className='px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                >
                    <option value='month'>This Month</option>
                    <option value='year'>This Year</option>
                    <option value='all'>All Time</option>
                </select>
            </div>

            {/* Summary Card */}
            <div className='bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white'>
                <h3 className='text-lg font-medium mb-2'>
                    {timeFrame === 'month'
                        ? "This Month's"
                        : timeFrame === 'year'
                        ? "This Year's"
                        : 'Total'}{' '}
                    Expenses
                </h3>
                <div className='text-4xl font-bold'>
                    ${totalAmount.toFixed(2)}
                </div>
                <p className='text-blue-100 mt-2'>
                    {filteredExpenses.length} transactions
                </p>
            </div>

            {/* Charts Grid */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                {/* Category Distribution Pie Chart */}
                <div className='bg-white rounded-lg shadow-md p-6'>
                    <h3 className='text-lg font-semibold mb-4'>
                        Expenses by Category
                    </h3>
                    {categoryData.length > 0 ? (
                        <div className='h-80'>
                            <ResponsiveContainer width='100%' height='100%'>
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx='50%'
                                        cy='50%'
                                        labelLine={false}
                                        outerRadius={80}
                                        fill='#8884d8'
                                        dataKey='value'
                                        label={({ name, percent }) =>
                                            `${name} ${(percent * 100).toFixed(
                                                0
                                            )}%`
                                        }
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={
                                                    COLORS[
                                                        index % COLORS.length
                                                    ]
                                                }
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value) =>
                                            `$${Number(value).toFixed(2)}`
                                        }
                                    />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className='text-center py-8 text-gray-500'>
                            No data available for the selected time period
                        </div>
                    )}
                </div>

                {/* Category Bar Chart */}
                <div className='bg-white rounded-lg shadow-md p-6'>
                    <h3 className='text-lg font-semibold mb-4'>
                        Category Breakdown
                    </h3>
                    {categoryData.length > 0 ? (
                        <div className='h-80'>
                            <ResponsiveContainer width='100%' height='100%'>
                                <BarChart
                                    data={categoryData}
                                    layout='horizontal'
                                >
                                    <CartesianGrid strokeDasharray='3 3' />
                                    <XAxis type='number' />
                                    <YAxis
                                        dataKey='name'
                                        type='category'
                                        width={80}
                                    />
                                    <Tooltip
                                        formatter={(value) =>
                                            `$${Number(value).toFixed(2)}`
                                        }
                                    />
                                    <Bar dataKey='value' fill='#3B82F6' />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className='text-center py-8 text-gray-500'>
                            No data available
                        </div>
                    )}
                </div>
            </div>

            {showAll && (
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
                    {/* Monthly Trend Line Chart */}
                    <div className='bg-white rounded-lg shadow-md p-6'>
                        <h3 className='text-lg font-semibold mb-4'>
                            Monthly Spending Trend
                        </h3>
                        <div className='h-80'>
                            <ResponsiveContainer width='100%' height='100%'>
                                <LineChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray='3 3' />
                                    <XAxis dataKey='month' />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value) =>
                                            `$${Number(value).toFixed(2)}`
                                        }
                                        labelFormatter={(label) =>
                                            `Month: ${label}`
                                        }
                                    />
                                    <Line
                                        type='monotone'
                                        dataKey='amount'
                                        stroke='#8884d8'
                                        strokeWidth={3}
                                        dot={{
                                            fill: '#8884d8',
                                            strokeWidth: 2,
                                            r: 4
                                        }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Daily Expenses Area Chart */}
                    <div className='bg-white rounded-lg shadow-md p-6'>
                        <h3 className='text-lg font-semibold mb-4'>
                            Daily Expenses (Last 30 Days)
                        </h3>
                        <div className='h-80'>
                            <ResponsiveContainer width='100%' height='100%'>
                                <AreaChart data={dailyData}>
                                    <CartesianGrid strokeDasharray='3 3' />
                                    <XAxis dataKey='day' />
                                    <YAxis />
                                    <Tooltip
                                        formatter={(value) =>
                                            `$${Number(value).toFixed(2)}`
                                        }
                                        labelFormatter={(label) =>
                                            `Day: ${label}`
                                        }
                                    />
                                    <Area
                                        type='monotone'
                                        dataKey='amount'
                                        stroke='#82ca9d'
                                        fill='#82ca9d'
                                        fillOpacity={0.6}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseCharts;
