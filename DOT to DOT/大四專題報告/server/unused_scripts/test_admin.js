
const testAdmin = async () => {
    const baseUrl = 'http://localhost:3000/api';
    const adminEmail = 'admin@scu.edu.tw'; // ID 5
    const password = 'password123'; // Assuming this is the password for ID 5 based on previous context, or I might need to reset it if unknown. 
    // Wait, ID 5 password hash was visible in debug output. I don't know the plain text.
    // I should use the seeded user "Rater" (ID 18) or "Rated" (ID 19) and promote them instead, as I know their password is 'password123'.

    // Let's promote ID 18 (Rater) to admin for testing purposes since I know the password.
    // But wait, I already promoted ID 5. 
    // I will reset ID 5's password to 'password123' first to be sure.
};

// Actually, let's just use the seeded user ID 18 (Rater) which I know the password for.
// I'll promote ID 18 to admin first.

import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'rides.db');
const sqlite3Verbose = sqlite3.verbose();
const db = new sqlite3Verbose.Database(dbPath);

const promoteAndTest = () => {
    const userId = 18; // Rater
    console.log(`Promoting User ${userId} to admin...`);

    db.run("UPDATE users SET role = 'admin' WHERE id = ?", [userId], async function (err) {
        if (err) {
            console.error(err);
            return;
        }
        console.log('Promoted.');
        db.close();

        // Now test API
        try {
            console.log('Logging in as Admin...');
            const loginRes = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: 'rater_1764796056500@test.com', password: 'password123' }) // Need to check if this email exists from previous run or if I need to re-seed.
                // The previous run output showed: rater_1764796056500@test.com
            });
            const loginData = await loginRes.json();

            if (loginData.error) {
                console.error('Login failed:', loginData);
                return;
            }

            console.log('Login success. Role:', loginData.data.role);

            if (loginData.data.role !== 'admin') {
                console.error('Role mismatch!');
                return;
            }

            console.log('Fetching Admin Stats...');
            const statsRes = await fetch('http://localhost:3000/api/admin/stats', {
                headers: { 'x-user-id': loginData.data.id }
            });
            const statsData = await statsRes.json();
            console.log('Stats:', statsData);

        } catch (e) {
            console.error(e);
        }
    });
};

promoteAndTest();
