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

db.serialize(() => {
    console.log('\n--- Users ---');
    db.all("SELECT id, name, email FROM users", (err, rows) => {
        if (err) console.error(err);
        else console.table(rows);
    });

    console.log('\n--- Rides (Last 5) ---');
    db.all("SELECT id, user_id, driver, origin, destination, createdAt FROM rides ORDER BY id DESC LIMIT 5", (err, rows) => {
        if (err) console.error(err);
        else console.table(rows);
    });
});

db.close();
