"use client"

import { useState, useEffect } from "react"
import ExpenseForm from "./ExpenseForm"
import ExpenseList from "./ExpenseList"
import ExpenseChart from "./ExpenseChart"

const ExpenseTracker = () => {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("list")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch expenses
        const expensesResponse = await fetch("http://localhost:3001/api/expenses")
        if (!expensesResponse.ok) throw new Error("Failed to fetch expenses")
        const expensesData = await expensesResponse.json()

        // Fetch categories
        const categoriesResponse = await fetch("http://localhost:3001/api/categories")
        if (!categoriesResponse.ok) throw new Error("Failed to fetch categories")
        const categoriesData = await categoriesResponse.json()

        setExpenses(expensesData)
        setCategories(categoriesData)
        setError(null)
      } catch (err) {
        setError("Error loading data. Please make sure the server is running.")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const addExpense = async (newExpense) => {
    try {
      const response = await fetch("http://localhost:3001/api/expenses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newExpense),
      })

      if (!response.ok) throw new Error("Failed to add expense")

      const addedExpense = await response.json()
      setExpenses([...expenses, addedExpense])
    } catch (err) {
      setError("Failed to add expense")
      console.error(err)
    }
  }

  const deleteExpense = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/expenses/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete expense")

      setExpenses(expenses.filter((expense) => expense.id !== id))
    } catch (err) {
      setError("Failed to delete expense")
      console.error(err)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading expense data...</div>
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Add New Expense</h2>
        <ExpenseForm onSubmit={addExpense} categories={categories} />
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab("list")}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === "list"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Expense List
            </button>
            <button
              onClick={() => setActiveTab("chart")}
              className={`py-2 px-4 border-b-2 font-medium text-sm ${
                activeTab === "chart"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Charts
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "list" && <ExpenseList expenses={expenses} categories={categories} onDelete={deleteExpense} />}
          {activeTab === "chart" && <ExpenseChart expenses={expenses} categories={categories} />}
        </div>
      </div>
    </div>
  )
}

export default ExpenseTracker
