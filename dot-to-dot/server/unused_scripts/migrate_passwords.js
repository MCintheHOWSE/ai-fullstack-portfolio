import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'rides.db');

const sqlite3Verbose = sqlite3.verbose();
const db = new sqlite3Verbose.Database(dbPath);

const migratePasswords = async () => {
    console.log('Starting password migration...');

    db.all("SELECT id, password, email FROM users", async (err, rows) => {
        if (err) {
            console.error('Error fetching users:', err);
            return;
        }

        console.log(`Found ${rows.length} users.`);
        const saltRounds = 10;

        for (const user of rows) {
            // Check if password is already hashed (bcrypt hashes start with $2b$)
            if (user.password && !user.password.startsWith('$2b$')) {
                console.log(`Migrating user: ${user.email}`);
                try {
                    const hash = await bcrypt.hash(user.password, saltRounds);

                    await new Promise((resolve, reject) => {
                        db.run("UPDATE users SET password = ? WHERE id = ?", [hash, user.id], (err) => {
                            if (err) reject(err);
                            else resolve();
                        });
                    });
                    console.log(`User ${user.email} migrated successfully.`);
                } catch (error) {
                    console.error(`Failed to migrate user ${user.email}:`, error);
                }
            } else {
                console.log(`User ${user.email} already hashed or invalid.`);
            }
        }

        console.log('Migration completed.');
        db.close();
    });
};

migratePasswords();
