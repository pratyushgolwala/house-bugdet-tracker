const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function initializeDatabase() {
    console.log('Initializing database...');

    // Open the database
    const db = await open({
        filename: path.join(__dirname, '../database.sqlite'),
        driver: sqlite3.Database
    });

    // Create tables
    await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      color TEXT
    );
    
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      categoryId INTEGER NOT NULL,
      FOREIGN KEY (categoryId) REFERENCES categories (id)
    );
  `);

    // Check if categories table is empty
    const categoryCount = await db.get(
        'SELECT COUNT(*) as count FROM categories'
    );

    // Insert default categories if none exist
    if (categoryCount.count === 0) {
        console.log('Adding default categories...');

        const defaultCategories = [
            { name: 'Groceries', color: '#4CAF50' },
            { name: 'Utilities', color: '#2196F3' },
            { name: 'Rent/Mortgage', color: '#9C27B0' },
            { name: 'Transportation', color: '#FF9800' },
            { name: 'Entertainment', color: '#E91E63' },
            { name: 'Dining Out', color: '#F44336' },
            { name: 'Healthcare', color: '#00BCD4' },
            { name: 'Other', color: '#607D8B' }
        ];

        for (const category of defaultCategories) {
            await db.run('INSERT INTO categories (name, color) VALUES (?, ?)', [
                category.name,
                category.color
            ]);
        }
    }

    // Check if expenses table is empty
    const expenseCount = await db.get('SELECT COUNT(*) as count FROM expenses');

    // Insert sample expenses if none exist
    if (expenseCount.count === 0) {
        console.log('Adding sample expenses...');

        const today = new Date();
        const lastMonth = new Date();
        lastMonth.setMonth(today.getMonth() - 1);

        const sampleExpenses = [
            {
                amount: 120.5,
                description: 'Weekly grocery shopping',
                date: formatDate(today),
                categoryId: 1
            },
            {
                amount: 85.75,
                description: 'Electricity bill',
                date: formatDate(new Date(today.setDate(today.getDate() - 5))),
                categoryId: 2
            },
            {
                amount: 1200.0,
                description: 'Monthly rent payment',
                date: formatDate(new Date(today.setDate(today.getDate() - 10))),
                categoryId: 3
            },
            {
                amount: 45.0,
                description: 'Gas for car',
                date: formatDate(new Date(today.setDate(today.getDate() - 3))),
                categoryId: 4
            },
            {
                amount: 65.25,
                description: 'Movie night with friends',
                date: formatDate(new Date(today.setDate(today.getDate() - 7))),
                categoryId: 5
            },
            {
                amount: 32.4,
                description: 'Lunch at restaurant',
                date: formatDate(new Date(today.setDate(today.getDate() - 2))),
                categoryId: 6
            },
            {
                amount: 25.0,
                description: 'Pharmacy - medicine',
                date: formatDate(lastMonth),
                categoryId: 7
            },
            {
                amount: 18.99,
                description: 'Office supplies',
                date: formatDate(
                    new Date(lastMonth.setDate(lastMonth.getDate() - 15))
                ),
                categoryId: 8
            }
        ];

        for (const expense of sampleExpenses) {
            await db.run(
                'INSERT INTO expenses (amount, description, date, categoryId) VALUES (?, ?, ?, ?)',
                [
                    expense.amount,
                    expense.description,
                    expense.date,
                    expense.categoryId
                ]
            );
        }
    }

    console.log('Database initialization complete!');
    await db.close();
}

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

// Run the initialization
initializeDatabase().catch((err) => {
    console.error('Database initialization failed:', err);
});
