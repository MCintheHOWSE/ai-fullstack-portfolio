import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'rides.db');

const sqlite3Verbose = sqlite3.verbose();
const db = new sqlite3Verbose.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
        return;
    }

    // Reset password for test_login
    const sql = `UPDATE users SET password = 'password123' WHERE email = 'test_login@scu.edu.tw'`;

    db.run(sql, [], function (err) {
        if (err) console.error(err);
        else console.log(`Updated User Password: Changes ${this.changes}`);

        // Verify
        db.get("SELECT * FROM users WHERE email = 'test_login@scu.edu.tw'", [], (err, row) => {
            console.log('User:', row);
        });
    });
});
