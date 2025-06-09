"use client"

import { useState } from "react"
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
} from "recharts"

const ExpenseChart = ({ expenses, categories }) => {
  const [timeFrame, setTimeFrame] = useState("month")
  const [activeChart, setActiveChart] = useState("distribution")

  // Get current date info
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  // Filter expenses based on selected time frame
  const filteredExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)

    if (timeFrame === "month") {
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear
    } else if (timeFrame === "year") {
      return expenseDate.getFullYear() === currentYear
    }

    return true // "all" option
  })

  // Get category name helper
  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category ? category.name : `Category ${categoryId}`
  }

  // Group expenses by category for pie chart
  const expensesByCategory = {}

  filteredExpenses.forEach((expense) => {
    if (!expensesByCategory[expense.categoryId]) {
      expensesByCategory[expense.categoryId] = {
        name: getCategoryName(expense.categoryId),
        value: 0,
      }
    }
    expensesByCategory[expense.categoryId].value += expense.amount
  })

  const pieChartData = Object.values(expensesByCategory)

  // Group expenses by month/day for bar chart
  const getBarChartData = () => {
    const data = {}

    filteredExpenses.forEach((expense) => {
      const date = new Date(expense.date)
      let key

      if (timeFrame === "month") {
        // Group by day of month
        key = date.getDate().toString()
      } else {
        // Group by month
        key = date.toLocaleString("default", { month: "short" })
      }

      if (!data[key]) {
        data[key] = 0
      }
      data[key] += expense.amount
    })

    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        if (timeFrame === "month") {
          return Number.parseInt(a.name) - Number.parseInt(b.name)
        }
        return a.name.localeCompare(b.name)
      })
  }

  const barChartData = getBarChartData()

  // Colors for pie chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Expense Analysis</h2>
        <select
          value={timeFrame}
          onChange={(e) => setTimeFrame(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="month">This Month</option>
          <option value="year">This Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900">Summary</h3>
        <p className="text-sm text-gray-600 mb-2">
          {timeFrame === "month" ? "This month's" : timeFrame === "year" ? "This year's" : "All"} expenses
        </p>
        <div className="text-3xl font-bold text-blue-600">${totalAmount.toFixed(2)}</div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex">
          <button
            onClick={() => setActiveChart("distribution")}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeChart === "distribution"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Category Distribution
          </button>
          <button
            onClick={() => setActiveChart("timeline")}
            className={`py-2 px-4 border-b-2 font-medium text-sm ${
              activeChart === "timeline"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Expense Timeline
          </button>
        </nav>
      </div>

      {activeChart === "distribution" && (
        <div className="bg-white">
          <h3 className="text-lg font-medium mb-4">Expenses by Category</h3>
          {pieChartData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No data available for the selected time period</div>
          )}
        </div>
      )}

      {activeChart === "timeline" && (
        <div className="bg-white">
          <h3 className="text-lg font-medium mb-4">{timeFrame === "month" ? "Daily" : "Monthly"} Expense Trend</h3>
          {barChartData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `$${Number(value).toFixed(2)}`} />
                  <Bar dataKey="value" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No data available for the selected time period</div>
          )}
        </div>
      )}
    </div>
  )
}

export default ExpenseChart
