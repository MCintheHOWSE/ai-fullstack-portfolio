const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbName = 'rides.db';
const dbPath = path.resolve(__dirname, 'server', dbName);

if (!fs.existsSync(dbPath)) {
    console.error(`${dbName} not found!`);
    process.exit(1);
}

console.log(`Processing ${dbName}...`);
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Delete rides where driver is NOT '杜翰威'
    // Assuming '杜翰威' is the user we want to keep.
    // Or simpler: Delete rides where user_id is NOT 1 (assuming Du Hanwei is ID 1)

    // First, let's check who is ID 1
    db.get("SELECT name FROM users WHERE id = 1", (err, user) => {
        if (user) {
            console.log(`User ID 1 is ${user.name}`);

            // Delete rides that don't belong to ID 1
            // But wait, I previously transferred ALL rides to ID 1.
            // So currently ALL rides have user_id = 1.
            // The user's problem is that some rides have driver name "林同學" etc.

            // So I should delete rides where driver != user.name
            const sql = "DELETE FROM rides WHERE driver != ?";
            db.run(sql, [user.name], function (err) {
                if (err) {
                    console.error("Error deleting rides:", err);
                } else {
                    console.log(`Deleted ${this.changes} rides where driver is not ${user.name}`);
                }
            });

            // Also delete movers if name doesn't match (though movers table doesn't have name column, it joins with users)
            // Movers table has user_id. If user_id is 1, the name comes from User 1.
            // So movers are fine because they will show "杜翰威" as the name (since they are linked to user ID 1).
            // The issue with rides is that 'driver' is a hardcoded text column in the rides table.

        } else {
            console.log("User ID 1 not found");
        }
    });
});
