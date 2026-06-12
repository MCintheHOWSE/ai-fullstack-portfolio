import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'rides.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
        process.exit(1);
    }

    db.serialize(() => {
        console.log("--- USERS ---");
        db.all("SELECT id, name, email FROM users", (err, rows) => {
            console.table(rows);
        });

        console.log("--- MESSAGES ---");
        db.all("SELECT m.id, m.content, m.sender_id, u.name as sender_name FROM messages m JOIN users u ON m.sender_id = u.id", (err, rows) => {
            console.table(rows);
        });
    });
});
