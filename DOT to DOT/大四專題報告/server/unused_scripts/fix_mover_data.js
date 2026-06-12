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

    // Assign Mover 1 to Admin (id=5) and set Test User (id=17) as customer, status accepted
    const sql = `UPDATE movers SET user_id = 5, customer_id = 17, status = 'accepted' WHERE id = 1`;

    db.run(sql, [], function (err) {
        if (err) console.error(err);
        else console.log(`Updated Mover 1: Changes ${this.changes}`);

        // Verify
        db.get("SELECT * FROM movers WHERE id = 1", [], (err, row) => {
            console.log('Updated Mover 1:', row);
        });
    });
});
