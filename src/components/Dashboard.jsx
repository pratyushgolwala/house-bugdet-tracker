'use client';

import { useState, useEffect } from 'react';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import ExpenseCharts from './ExpenseCharts';
import StatsCards from './StatsCards';

const Dashboard = () => {
    const [expenses, setExpenses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);

                // Fetch expenses
                const expensesResponse = await fetch(
                    'http://localhost:3001/api/expenses'
                );
                if (!expensesResponse.ok)
                    throw new Error('Failed to fetch expenses');
                const expensesData = await expensesResponse.json();

                // Fetch categories
                const categoriesResponse = await fetch(
                    'http://localhost:3001/api/categories'
                );
                if (!categoriesResponse.ok)
                    throw new Error('Failed to fetch categories');
                const categoriesData = await categoriesResponse.json();

                setExpenses(expensesData);
                setCategories(categoriesData);
                setError(null);
            } catch (err) {
                setError(
                    'Error loading data. Please make sure the server is running.'
                );
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const addExpense = async (newExpense) => {
        try {
            const response = await fetch('http://localhost:3001/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newExpense)
            });

            if (!response.ok) throw new Error('Failed to add expense');

            const addedExpense = await response.json();
            setExpenses([...expenses, addedExpense]);
        } catch (err) {
            setError('Failed to add expense');
            console.error(err);
        }
    };

    const deleteExpense = async (id) => {
        try {
            const response = await fetch(
                `http://localhost:3001/api/expenses/${id}`,
                {
                    method: 'DELETE'
                }
            );

            if (!response.ok) throw new Error('Failed to delete expense');

            setExpenses(expenses.filter((expense) => expense.id !== id));
        } catch (err) {
            setError('Failed to delete expense');
            console.error(err);
        }
    };

    if (isLoading) {
        return (
            <div className='flex justify-center items-center min-h-screen'>
                <div className='text-xl text-gray-600'>
                    Loading expense data...
                </div>
            </div>
        );
    }

    return (
        <div className='max-w-7xl mx-auto p-6'>
            {/* Header */}
            <div className='mb-8'>
                <h1 className='text-4xl font-bold text-gray-900 mb-2'>
                    House Expense Tracker
                </h1>
                <p className='text-gray-600'>
                    Manage and track your household expenses
                </p>
            </div>

            {error && (
                <div
                    className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6'
                    role='alert'
                >
                    <span className='block sm:inline'>{error}</span>
                </div>
            )}

            {/* Navigation Tabs */}
            <div className='border-b border-gray-200 mb-6'>
                <nav className='-mb-px flex space-x-8'>
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'overview'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('add')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'add'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Add Expense
                    </button>
                    <button
                        onClick={() => setActiveTab('list')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'list'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        All Expenses
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === 'analytics'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Analytics
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
                <div className='space-y-6'>
                    <StatsCards expenses={expenses} categories={categories} />
                    <ExpenseCharts
                        expenses={expenses}
                        categories={categories}
                    />
                </div>
            )}

            {activeTab === 'add' && (
                <div className='max-w-2xl'>
                    <div className='bg-white p-6 rounded-lg shadow-md'>
                        <h2 className='text-xl font-semibold mb-4'>
                            Add New Expense
                        </h2>
                        <ExpenseForm
                            onSubmit={addExpense}
                            categories={categories}
                        />
                    </div>
                </div>
            )}

            {activeTab === 'list' && (
                <div className='bg-white rounded-lg shadow-md p-6'>
                    <ExpenseList
                        expenses={expenses}
                        categories={categories}
                        onDelete={deleteExpense}
                    />
                </div>
            )}

            {activeTab === 'analytics' && (
                <div className='space-y-6'>
                    <ExpenseCharts
                        expenses={expenses}
                        categories={categories}
                        showAll={true}
                    />
                </div>
            )}
        </div>
    );
};

export default Dashboard;
