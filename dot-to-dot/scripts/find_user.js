import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'server/rides.db');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error(err.message);
        process.exit(1);
    }
});

const email = '11173112@scu.edu.tw';

db.get("SELECT id, name, email FROM users WHERE email = ?", [email], (err, row) => {
    if (err) {
        console.error(err.message);
    } else if (row) {
        console.log(JSON.stringify(row));
    } else {
        console.log("User not found");
    }
    db.close();
});
