import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'server/rides.db');

const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error(err.message);
        process.exit(1);
    }
});

const ADMIN_ID = 5;
const USER_ID = 9;
const BASE_URL = 'http://localhost:3000/api';

const acceptErrand = async (id) => {
    try {
        const res = await fetch(`${BASE_URL}/errands/${id}/accept`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ runner_id: USER_ID })
        });
        const data = await res.json();
        console.log(`Errand ${id}:`, data.message || data.error);
    } catch (e) {
        console.error(`Errand ${id} error:`, e.message);
    }
};

const joinRide = async (id) => {
    try {
        const res = await fetch(`${BASE_URL}/rides/${id}/join`, {
            method: 'POST', // Note: API uses POST for join, but some might be PUT, checking index.js... index.js says POST /api/rides/:id/join
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ passenger_id: USER_ID })
        });
        const data = await res.json();
        console.log(`Ride ${id}:`, data.message || data.error);
    } catch (e) {
        console.error(`Ride ${id} error:`, e.message);
    }
};

const acceptDelivery = async (id) => {
    try {
        const res = await fetch(`${BASE_URL}/deliveries/${id}/accept`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ driver_id: USER_ID })
        });
        const data = await res.json();
        console.log(`Delivery ${id}:`, data.message || data.error);
    } catch (e) {
        console.error(`Delivery ${id} error:`, e.message);
    }
};

db.serialize(() => {
    // Find Open Errands by Admin
    db.all("SELECT id FROM errands WHERE user_id = ? AND status = 'open'", [ADMIN_ID], async (err, rows) => {
        if (err) console.error(err);
        else {
            console.log(`Found ${rows.length} open errands.`);
            for (const row of rows) {
                await acceptErrand(row.id);
            }
        }
    });

    // Find Open Rides by Admin
    db.all("SELECT id FROM rides WHERE user_id = ? AND status = 'open'", [ADMIN_ID], async (err, rows) => {
        if (err) console.error(err);
        else {
            console.log(`Found ${rows.length} open rides.`);
            for (const row of rows) {
                await joinRide(row.id);
            }
        }
    });

    // Find Open Deliveries by Admin
    db.all("SELECT id FROM deliveries WHERE user_id = ? AND status = 'open'", [ADMIN_ID], async (err, rows) => {
        if (err) console.error(err);
        else {
            console.log(`Found ${rows.length} open deliveries.`);
            for (const row of rows) {
                await acceptDelivery(row.id);
            }
        }
    });
});
