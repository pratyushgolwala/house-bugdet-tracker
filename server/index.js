import express from 'express';
import cors from 'cors';
import sqlite3pkg from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

// For __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlite3 = sqlite3pkg.verbose();
// ...existing code...


// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
let db;

async function connectToDatabase() {
    db = await open({
        filename: path.join(__dirname, '../database.sqlite'),
        driver: sqlite3.Database
    });
    console.log('Connected to SQLite database');
}

// API Routes

// Get all expenses
app.get('/api/expenses', async (req, res) => {
    try {
        const expenses = await db.all(
            'SELECT * FROM expenses ORDER BY date DESC'
        );
        res.json(expenses);
    } catch (error) {
        console.error('Error fetching expenses:', error);
        res.status(500).json({ error: 'Failed to fetch expenses' });
    }
});

// Get a single expense
app.get('/api/expenses/:id', async (req, res) => {
    try {
        const expense = await db.get(
            'SELECT * FROM expenses WHERE id = ?',
            req.params.id
        );

        if (!expense) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        res.json(expense);
    } catch (error) {
        console.error('Error fetching expense:', error);
        res.status(500).json({ error: 'Failed to fetch expense' });
    }
});

// Create a new expense
app.post('/api/expenses', async (req, res) => {
    try {
        const { amount, description, date, categoryId } = req.body;

        if (!amount || !description || !date || !categoryId) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const result = await db.run(
            'INSERT INTO expenses (amount, description, date, categoryId) VALUES (?, ?, ?, ?)',
            [amount, description, date, categoryId]
        );

        const newExpense = await db.get(
            'SELECT * FROM expenses WHERE id = ?',
            result.lastID
        );
        res.status(201).json(newExpense);
    } catch (error) {
        console.error('Error creating expense:', error);
        res.status(500).json({ error: 'Failed to create expense' });
    }
});

// Update an expense
app.put('/api/expenses/:id', async (req, res) => {
    try {
        const { amount, description, date, categoryId } = req.body;

        if (!amount || !description || !date || !categoryId) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const result = await db.run(
            'UPDATE expenses SET amount = ?, description = ?, date = ?, categoryId = ? WHERE id = ?',
            [amount, description, date, categoryId, req.params.id]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        const updatedExpense = await db.get(
            'SELECT * FROM expenses WHERE id = ?',
            req.params.id
        );
        res.json(updatedExpense);
    } catch (error) {
        console.error('Error updating expense:', error);
        res.status(500).json({ error: 'Failed to update expense' });
    }
});

// Delete an expense
app.delete('/api/expenses/:id', async (req, res) => {
    try {
        const result = await db.run(
            'DELETE FROM expenses WHERE id = ?',
            req.params.id
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Expense not found' });
        }

        res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
        console.error('Error deleting expense:', error);
        res.status(500).json({ error: 'Failed to delete expense' });
    }
});

// Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const categories = await db.all('SELECT * FROM categories');
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// Start the server
async function startServer() {
    try {
        await connectToDatabase();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
    }
}

startServer();
