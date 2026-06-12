
const BASE_URL = 'http://localhost:3000/api';

async function createRide() {
    const sqlite3 = (await import('sqlite3')).default.verbose();
    const db = new sqlite3.Database('./rides.db');

    // Get Admin ID
    db.get("SELECT id FROM users WHERE email = 'admin@scu.edu.tw'", async (err, row) => {
        if (err || !row) {
            console.error('Admin not found');
            return;
        }
        const adminId = row.id;

        // Post Ride
        try {
            const res = await fetch(`${BASE_URL}/rides`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: adminId,
                    driver: 'Admin User',
                    origin: 'Screenshot Origin',
                    destination: 'Screenshot Dest',
                    departureTime: '2025-12-31T12:00',
                    seats: 3,
                    price: 100,
                    type: 'car'
                })
            });
            const data = await res.json();
            console.log('Ride Created:', data);
        } catch (e) {
            console.error(e);
        }
        db.close();
    });
}

createRide();
