
// Removed node-fetch import as Node.js v18+ has native fetch

const BASE_URL = 'http://localhost:3000/api';

async function test() {
    console.log('Starting Verification...');

    // 1. Setup Users
    const userA = { email: `userA_${Date.now()}@scu.edu.tw`, password: 'password', name: 'User A', gender: 'M' };
    const userB = { email: `userB_${Date.now()}@scu.edu.tw`, password: 'password', name: 'User B', gender: 'F' };

    const sqlite3 = (await import('sqlite3')).default.verbose();
    const db = new sqlite3.Database('./rides.db');

    const createUser = (user) => {
        return new Promise((resolve, reject) => {
            db.run('INSERT INTO users (email, password, name, gender) VALUES (?,?,?,?)',
                [user.email, user.password, user.name, user.gender],
                function (err) {
                    if (err) reject(err);
                    else resolve({ ...user, id: this.lastID });
                }
            );
        });
    };

    try {
        const uA = await createUser(userA);
        const uB = await createUser(userB);
        console.log(`Created Users: A(${uA.id}), B(${uB.id})`);

        // --- RIDE TEST ---
        console.log('\n--- Testing Rides ---');

        // 1. Post Ride (User A)
        let res = await fetch(`${BASE_URL}/rides`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: uA.id,
                driver: uA.name,
                origin: 'Test Origin',
                destination: 'Test Dest',
                departureTime: '2025-12-25T10:00',
                seats: 3,
                price: 100,
                type: 'car'
            })
        });
        let ride = (await res.json()).data;
        console.log('Ride Created:', ride.id);

        // 2. Edit Ride (User A)
        res = await fetch(`${BASE_URL}/rides/${ride.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                origin: 'Updated Origin',
                destination: 'Updated Dest',
                departureTime: '2025-12-25T10:00',
                seats: 3,
                price: 120, // Price changed
                notes: 'Edited'
            })
        });
        console.log('Ride Edited:', (await res.json()).message);

        // 3. Join Ride (User B)
        res = await fetch(`${BASE_URL}/rides/${ride.id}/join`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ passenger_id: uB.id })
        });
        console.log('Ride Joined:', (await res.json()).message);

        // 4. Chat (A sends to B)
        res = await fetch(`${BASE_URL}/chats/ride/${ride.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sender_id: uA.id, content: 'Hello Passenger' })
        });
        console.log('Message Sent:', (await res.json()).message);

        // 5. Get Messages
        res = await fetch(`${BASE_URL}/chats/ride/${ride.id}`);
        const messages = (await res.json()).data;
        console.log('Messages Fetched:', messages.length, messages[0].content);

        // 6. Confirm (A)
        res = await fetch(`${BASE_URL}/rides/${ride.id}/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: uA.id })
        });
        console.log('Driver Confirmed:', (await res.json()).status);

        // 7. Confirm (B)
        res = await fetch(`${BASE_URL}/rides/${ride.id}/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: uB.id })
        });
        const rideConfirmResult = await res.json();
        console.log('Passenger Confirmed:', rideConfirmResult.status);
        if (rideConfirmResult.status !== 'completed') throw new Error('Ride should be completed');


        // --- MOVER TEST ---
        console.log('\n--- Testing Movers ---');

        // 1. Register Mover (User A)
        res = await fetch(`${BASE_URL}/movers`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: uA.id,
                vehicle: 'Truck',
                capacity: 'Large',
                price: 500,
                tags: 'fast,safe'
            })
        });
        let mover = (await res.json()).data;
        console.log('Mover Created:', mover.id);

        // 2. Edit Mover (User A)
        res = await fetch(`${BASE_URL}/movers/${mover.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                vehicle: 'Big Truck',
                capacity: 'Huge',
                price: 600,
                tags: 'fast,safe,cheap'
            })
        });
        console.log('Mover Edited:', (await res.json()).message);

        // 3. Book Mover (User B)
        res = await fetch(`${BASE_URL}/movers/${mover.id}/book`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customer_id: uB.id })
        });
        console.log('Mover Booked:', (await res.json()).message);

        // 4. Chat (B sends to A)
        res = await fetch(`${BASE_URL}/chats/mover/${mover.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sender_id: uB.id, content: 'Help me move' })
        });
        console.log('Message Sent:', (await res.json()).message);

        // 5. Confirm (A)
        res = await fetch(`${BASE_URL}/movers/${mover.id}/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: uA.id })
        });
        console.log('Mover Confirmed:', (await res.json()).status);

        // 6. Confirm (B)
        res = await fetch(`${BASE_URL}/movers/${mover.id}/confirm`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: uB.id })
        });
        const moverConfirmResult = await res.json();
        console.log('Customer Confirmed:', moverConfirmResult.status);
        if (moverConfirmResult.status !== 'completed') throw new Error('Mover should be completed');

        console.log('\nALL TESTS PASSED!');

    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        db.close();
    }
}

test();
