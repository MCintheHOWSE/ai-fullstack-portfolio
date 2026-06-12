import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'rides.db');

const sqlite3Verbose = sqlite3.verbose();
const db = new sqlite3Verbose.Database(dbPath);

const userId = 5; // Change this to the ID you want to promote

db.run("UPDATE users SET role = 'admin' WHERE id = ?", [userId], function (err) {
    if (err) {
        console.error("Error promoting user:", err);
    } else {
        console.log(`User ID ${userId} promoted to admin. Changes: ${this.changes}`);
    }
    db.close();
});
