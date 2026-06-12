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

    db.all("SELECT * FROM movers", [], (err, rows) => {
        console.log('All Movers:', rows);
    });
    db.all("SELECT id, email FROM users", [], (err, rows) => {
        console.log('All Users:', rows);
    });
});
