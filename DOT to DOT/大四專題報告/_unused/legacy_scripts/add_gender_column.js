const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'server/rides.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
        return;
    }
    console.log('Connected to database.');
});

// Add gender column to users table if it doesn't exist
db.run(`ALTER TABLE users ADD COLUMN gender TEXT`, (err) => {
    if (err) {
        if (err.message.includes('duplicate column name')) {
            console.log('Column "gender" already exists.');
        } else {
            console.error('Error adding column:', err.message);
        }
    } else {
        console.log('Successfully added "gender" column to users table.');
    }
    db.close();
});
