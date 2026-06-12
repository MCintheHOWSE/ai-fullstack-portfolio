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
    console.log('Connected to database.');

    db.all("SELECT id, item, status FROM errands", [], (err, rows) => {
        if (err) console.error(err);
        else console.log('Errands:', rows);
    });

    db.all("SELECT id, vehicle, status FROM movers", [], (err, rows) => {
        if (err) console.error(err);
        else console.log('Movers:', rows);
    });
});
