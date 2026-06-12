import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'rides.db');
const sqlite3Verbose = sqlite3.verbose();
const db = new sqlite3Verbose.Database(dbPath);

const resetAdminPassword = async () => {
    const email = 'admin@scu.edu.tw';
    const newPassword = 'password123';
    const saltRounds = 10;

    console.log(`Resetting password for ${email}...`);

    bcrypt.hash(newPassword, saltRounds, (err, hash) => {
        if (err) {
            console.error("Error hashing password:", err);
            return;
        }

        db.run("UPDATE users SET password = ? WHERE email = ?", [hash, email], function (err) {
            if (err) {
                console.error("Error updating password:", err);
            } else {
                console.log(`Password updated for ${email}. Changes: ${this.changes}`);
                if (this.changes === 0) {
                    console.log("User not found!");
                }
            }
            db.close();
        });
    });
};

resetAdminPassword();
