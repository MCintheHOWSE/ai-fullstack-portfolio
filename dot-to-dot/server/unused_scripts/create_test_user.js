
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('./rides.db');

const email = 'test_login@scu.edu.tw';
const password = 'password';
const name = 'Test User';
const gender = 'M';

db.run('INSERT INTO users (email, password, name, gender) VALUES (?,?,?,?)',
    [email, password, name, gender],
    function (err) {
        if (err) {
            console.error('Error creating user:', err.message);
        } else {
            console.log(`User created with ID: ${this.lastID}`);
        }
        db.close();
    }
);
