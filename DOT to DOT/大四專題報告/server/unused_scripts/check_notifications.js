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

    // Check notifications for User B (id=17)
    db.all("SELECT * FROM notifications", [], (err, rows) => {
        if (err) console.error(err);
        else console.log('All Notifications:', rows);
    });

    // Check Errands to confirm acceptance
    db.all("SELECT * FROM errands WHERE item LIKE 'Notification Test%'", [], (err, rows) => {
        if (err) console.error(err);
        else console.log('Test Errands:', rows);
    });
});
