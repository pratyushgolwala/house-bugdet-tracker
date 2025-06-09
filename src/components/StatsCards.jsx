const StatsCards = ({ expenses, categories }) => {
    // Calculate stats
    const totalExpenses = expenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
    );
    const thisMonthExpenses = expenses
        .filter((expense) => {
            const expenseDate = new Date(expense.date);
            const now = new Date();
            return (
                expenseDate.getMonth() === now.getMonth() &&
                expenseDate.getFullYear() === now.getFullYear()
            );
        })
        .reduce((sum, expense) => sum + expense.amount, 0);

    const avgExpense =
        expenses.length > 0 ? totalExpenses / expenses.length : 0;

    const topCategory = categories.reduce(
        (top, category) => {
            const categoryTotal = expenses
                .filter((expense) => expense.categoryId === category.id)
                .reduce((sum, expense) => sum + expense.amount, 0);

            return categoryTotal > top.amount
                ? { name: category.name, amount: categoryTotal }
                : top;
        },
        { name: 'None', amount: 0 }
    );

    const stats = [
        {
            title: 'Total Expenses',
            value: `$${totalExpenses.toFixed(2)}`,
            icon: '💰',
            color: 'bg-blue-500'
        },
        {
            title: 'This Month',
            value: `$${thisMonthExpenses.toFixed(2)}`,
            icon: '📅',
            color: 'bg-green-500'
        },
        {
            title: 'Average Expense',
            value: `$${avgExpense.toFixed(2)}`,
            icon: '📊',
            color: 'bg-purple-500'
        },
        {
            title: 'Top Category',
            value: topCategory.name,
            icon: '🏆',
            color: 'bg-orange-500'
        }
    ];

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {stats.map((stat, index) => (
                <div key={index} className='bg-white rounded-lg shadow-md p-6'>
                    <div className='flex items-center'>
                        <div className={`${stat.color} rounded-lg p-3 mr-4`}>
                            <span className='text-2xl'>{stat.icon}</span>
                        </div>
                        <div>
                            <p className='text-sm font-medium text-gray-600'>
                                {stat.title}
                            </p>
                            <p className='text-2xl font-bold text-gray-900'>
                                {stat.value}
                            </p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default StatsCards;
