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

// Delete all users
db.run(`DELETE FROM users`, (err) => {
    if (err) {
        console.error('Error deleting users:', err.message);
    } else {
        console.log('Successfully deleted all users from the database.');

        // Check remaining count
        db.get(`SELECT COUNT(*) as count FROM users`, (err, row) => {
            if (err) {
                console.error('Error counting users:', err.message);
            } else {
                console.log(`Remaining users: ${row.count}`);
            }
            db.close();
        });
    }
});
