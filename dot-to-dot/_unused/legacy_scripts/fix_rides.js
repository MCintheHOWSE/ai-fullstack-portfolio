const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'server/rides.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Update rides with null user_id where driver matches user name '杜翰威'
    // We assume user ID 1 is '杜翰威' based on previous debug output.
    db.run("UPDATE rides SET user_id = 1 WHERE user_id IS NULL AND driver = '杜翰威'", function (err) {
        if (err) {
            console.error(err);
        } else {
            console.log(`Updated ${this.changes} rides to user_id 1.`);
        }
    });
});

db.close();
