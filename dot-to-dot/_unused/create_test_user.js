import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sqlite3Verbose = sqlite3.verbose();

const dbPath = path.resolve(__dirname, 'server/rides.db');
const db = new sqlite3Verbose.Database(dbPath);

const email = 'testuser@scu.edu.tw';
const password = 'password123';
const name = 'TestUser';
const gender = 'male';

db.serialize(() => {
    db.run("INSERT INTO users (email, password, name, gender, is_admin) VALUES (?, ?, ?, ?, 0)",
        [email, password, name, gender],
        (err) => {
            if (err) {
                if (err.message.includes('UNIQUE constraint failed')) {
                    console.log('User already exists.');
                } else {
                    console.error("Error creating user:", err);
                }
            } else {
                console.log("Test user created successfully.");
            }
        }
    );
});

setTimeout(() => {
    db.close();
}, 1000);
