
const BASE_URL = 'http://localhost:3000/api';

async function joinRide() {
    const sqlite3 = (await import('sqlite3')).default.verbose();
    const db = new sqlite3.Database('./rides.db');

    // Get Test User ID
    db.get("SELECT id FROM users WHERE email = 'test_login@scu.edu.tw'", async (err, row) => {
        if (err || !row) {
            console.error('Test User not found');
            return;
        }
        const userId = row.id;
        console.log('Test User ID:', userId);

        // Get Ride ID (Screenshot Origin)
        db.get("SELECT id, status, passenger_id FROM rides WHERE origin = 'Screenshot Origin'", async (err, ride) => {
            if (err || !ride) {
                console.error('Ride not found');
                return;
            }
            console.log('Ride before join:', ride);

            // Join Ride
            try {
                const res = await fetch(`${BASE_URL}/rides/${ride.id}/join`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ passenger_id: userId })
                });
                const data = await res.json();
                console.log('Join Response:', data);

                // Check DB again
                db.get("SELECT id, status, passenger_id FROM rides WHERE id = ?", [ride.id], (err, updatedRide) => {
                    console.log('Ride after join:', updatedRide);
                    db.close();
                });

            } catch (e) {
                console.error(e);
                db.close();
            }
        });
    });
}

joinRide();
