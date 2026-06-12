
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./rides.db');

db.get("SELECT * FROM users WHERE email = 'test_login@scu.edu.tw'", (err, row) => {
    if (err) {
        console.error(err);
    } else {
        console.log('User:', row);
    }
    db.close();
});
