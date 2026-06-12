import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcrypt';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'rides.db');

const sqlite3Verbose = sqlite3.verbose();
const db = new sqlite3Verbose.Database(dbPath);

const seedUsers = async () => {
    const password = 'password123';
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);

    const raterEmail = `rater_${Date.now()}@test.com`;
    const ratedEmail = `rated_${Date.now()}@test.com`;

    const insertUser = (email, name, gender) => {
        return new Promise((resolve, reject) => {
            db.run("INSERT INTO users (email, password, name, gender) VALUES (?,?,?,?)",
                [email, hash, name, gender],
                function (err) {
                    if (err) reject(err);
                    else resolve({ id: this.lastID, email });
                }
            );
        });
    };

    try {
        const userA = await insertUser(raterEmail, 'Rater', 'M');
        const userB = await insertUser(ratedEmail, 'Rated', 'F');
        console.log(JSON.stringify({ userA, userB }));
    } catch (err) {
        console.error(err);
    } finally {
        db.close();
    }
};

seedUsers();
