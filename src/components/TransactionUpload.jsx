import { useState } from "react";
import Papa from "papaparse";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#2563eb", "#10b981"];

const TransactionUpload = ({ manualExpenses, categories }) => {
    const [comparison, setComparison] = useState(null);

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const parsed = results.data.map(row => ({
                    amount: parseFloat(row.amount),
                    description: row.description,
                    date: row.date,
                    categoryId: parseInt(row.categoryId)
                }));
                compareExpenses(parsed, manualExpenses);
            }
        });
    };

    const compareExpenses = (fileData, manualData) => {
        const fileTotal = fileData.reduce((sum, e) => sum + e.amount, 0);
        const manualTotal = manualData.reduce((sum, e) => sum + e.amount, 0);

        setComparison({
            fileCount: fileData.length,
            manualCount: manualData.length,
            fileTotal,
            manualTotal,
            difference: fileTotal - manualTotal,
            chartData: [
                { name: "Manual", value: manualTotal },
                { name: "File", value: fileTotal }
            ],
            countData: [
                { name: "Manual", value: manualData.length },
                { name: "File", value: fileData.length }
            ]
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-700 flex items-center gap-2">
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path fill="#2563eb" d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
                Upload & Compare Transactions
            </h2>
            <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
            />
            {comparison && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    <div className="bg-blue-50 rounded-lg p-6 shadow flex flex-col items-center">
                        <h3 className="text-lg font-semibold mb-4 text-blue-800">Total Amount Comparison</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={[
                                { name: "Manual", Amount: comparison.manualTotal },
                                { name: "File", Amount: comparison.fileTotal }
                            ]}>
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="Amount" fill="#2563eb" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="mt-4 text-center">
                            <span className="font-medium text-gray-700">Difference: </span>
                            <span className={comparison.difference === 0 ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                                ${comparison.difference.toFixed(2)}
                            </span>
                        </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-6 shadow flex flex-col items-center">
                        <h3 className="text-lg font-semibold mb-4 text-green-800">Expense Count Proportion</h3>
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie
                                    data={comparison.countData || []}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={70}
                                    label
                                >
                                    {(comparison.countData || []).map((entry, idx) => (
                                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Legend />
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <ul className="mt-4 space-y-1 text-gray-700">
                            <li>
                                <span className="font-medium text-blue-700">Manual Expenses:</span> {comparison.manualCount}
                            </li>
                            <li>
                                <span className="font-medium text-green-700">File Expenses:</span> {comparison.fileCount}
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionUpload;