import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sqlite3Verbose = sqlite3.verbose();

const dbPath = path.resolve(__dirname, 'server/rides.db');
const db = new sqlite3Verbose.Database(dbPath);

db.serialize(() => {
    // 1. Add is_admin column
    console.log("Adding is_admin column...");
    db.run("ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT 0", (err) => {
        if (err) {
            if (err.message.includes("duplicate column name")) {
                console.log("Column is_admin already exists.");
            } else {
                console.error("Error adding column:", err.message);
            }
        } else {
            console.log("Column is_admin added successfully.");
        }
    });

    // 2. Create or Update Admin User
    const adminEmail = 'admin@scu.edu.tw';
    const adminPassword = 'admin'; // In production, hash this!
    const adminName = 'Admin';
    const adminGender = 'male';

    console.log(`Setting up admin user: ${adminEmail}`);

    db.get("SELECT id FROM users WHERE email = ?", [adminEmail], (err, row) => {
        if (err) {
            console.error("Error checking admin user:", err);
            return;
        }

        if (row) {
            // Update existing user
            db.run("UPDATE users SET is_admin = 1, password = ? WHERE email = ?", [adminPassword, adminEmail], (err) => {
                if (err) console.error("Error updating admin:", err);
                else console.log("Existing user promoted to admin.");
            });
        } else {
            // Create new admin user
            db.run("INSERT INTO users (email, password, name, gender, is_admin) VALUES (?, ?, ?, ?, 1)",
                [adminEmail, adminPassword, adminName, adminGender],
                (err) => {
                    if (err) console.error("Error creating admin:", err);
                    else console.log("New admin user created.");
                }
            );
        }
    });
});

// Close database connection after a short delay to ensure queries finish
setTimeout(() => {
    db.close();
}, 1000);
