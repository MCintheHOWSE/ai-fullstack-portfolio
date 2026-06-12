
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./rides.db');

db.get("SELECT email, password FROM users LIMIT 1", (err, row) => {
    if (err) {
        console.error(err);
    } else {
        console.log('User found:', row);
    }
    db.close();
});
