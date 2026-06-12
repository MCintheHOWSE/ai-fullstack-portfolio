const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const targetEmail = '11173138@scu.edu.tw';
const dbName = 'rides.db';
const dbPath = path.resolve(__dirname, 'server', dbName);

if (!fs.existsSync(dbPath)) {
    console.error(`${dbName} not found!`);
    process.exit(1);
}

console.log(`Processing ${dbName}...`);
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // 1. Ensure user_id column exists
    db.run("ALTER TABLE rides ADD COLUMN user_id INTEGER", (err) => {
        if (err && err.message.includes('duplicate column name')) {
            console.log('Column user_id already exists in rides.');
        } else if (err) {
            console.error('Error adding column:', err.message);
        } else {
            console.log('Added user_id column to rides.');
        }
    });

    // 2. Find the user ID
    db.get("SELECT id, name FROM users WHERE email = ?", [targetEmail], (err, user) => {
        if (err) {
            console.error(`Error finding user:`, err.message);
            db.close();
            return;
        }

        if (!user) {
            console.log(`User ${targetEmail} not found in ${dbName}`);
            db.close();
            return;
        }

        console.log(`Found user: ${user.name} (ID: ${user.id})`);

        // 3. Update all rides to belong to this user
        db.run("UPDATE rides SET user_id = ?", [user.id], function (err) {
            if (err) {
                console.error(`Error updating rides:`, err.message);
            } else {
                console.log(`Updated ${this.changes} rides to belong to user ${user.id}`);
            }

            // 4. Update movers
            db.run("UPDATE movers SET user_id = ?", [user.id], function (err) {
                if (err) {
                    // Ignore if table doesn't exist
                } else {
                    console.log(`Updated ${this.changes} movers to belong to user ${user.id}`);
                }
                db.close(); // Close only after everything is done
            });
        });
    });
});
