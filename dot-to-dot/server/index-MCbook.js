import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendVerificationEmail } from './email_service.js';
import { Server } from 'socket.io';
import { createServer } from 'http';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sqlite3Verbose = sqlite3.verbose();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"]
    },
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 45000
});

const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database Setup
const dbPath = path.resolve(__dirname, 'rides.db');
const db = new sqlite3Verbose.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');

        // Create ride_requests table if not exists
        db.run(`CREATE TABLE IF NOT EXISTS ride_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            origin TEXT,
            destination TEXT,
            passenger_count INTEGER,
            preferred_vehicle TEXT,
            budget INTEGER,
            driver_gender_preference TEXT DEFAULT 'none',
            status TEXT DEFAULT 'open',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (!err) {
                // Add column if not exists
                const columns = [
                    "ALTER TABLE ride_requests ADD COLUMN driver_gender_preference TEXT DEFAULT 'none'"
                ];
                columns.forEach(sql => db.run(sql, () => { }));
            }
        });

        // Create rides table if not exists
        db.run(`CREATE TABLE IF NOT EXISTS rides (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            driver TEXT,
            origin TEXT,
            destination TEXT,
            departureTime TEXT,
            seats INTEGER,
            price INTEGER,
            notes TEXT,
            type TEXT,
            gender_restriction TEXT,
            status TEXT DEFAULT 'open',
            passenger_id INTEGER,
            driver_confirmed BOOLEAN DEFAULT 0,
            passenger_confirmed BOOLEAN DEFAULT 0,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (!err) {
                // Add columns if they don't exist
                const columns = [
                    "ALTER TABLE rides ADD COLUMN status TEXT DEFAULT 'open'",
                    "ALTER TABLE rides ADD COLUMN passenger_id INTEGER",
                    "ALTER TABLE rides ADD COLUMN driver_confirmed BOOLEAN DEFAULT 0",
                    "ALTER TABLE rides ADD COLUMN passenger_confirmed BOOLEAN DEFAULT 0",
                    "ALTER TABLE rides ADD COLUMN gender_restriction TEXT",
                    "ALTER TABLE rides ADD COLUMN payment_status TEXT DEFAULT 'pending'"
                ];
                columns.forEach(sql => db.run(sql, () => { }));
            }
        });

        // Create email_verifications table
        db.run(`CREATE TABLE IF NOT EXISTS email_verifications (
            email TEXT PRIMARY KEY,
            code TEXT NOT NULL,
            expiresAt DATETIME NOT NULL
        )`);

        // Create users table if not exists
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            password TEXT,
            name TEXT,
            gender TEXT,
            is_partner BOOLEAN DEFAULT 0,
            is_admin BOOLEAN DEFAULT 0,
            rating REAL DEFAULT 0,
            rating_count INTEGER DEFAULT 0,
            role TEXT DEFAULT 'user',
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (!err) {
                // Check if role column exists (for existing DBs)
                db.all("PRAGMA table_info(users)", (err, rows) => {
                    const hasRole = rows.some(row => row.name === 'role');
                    if (!hasRole) {
                        db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
                    }
                    const hasRating = rows.some(row => row.name === 'rating');
                    if (!hasRating) {
                        db.run("ALTER TABLE users ADD COLUMN rating REAL DEFAULT 0");
                        db.run("ALTER TABLE users ADD COLUMN rating_count INTEGER DEFAULT 0");
                    }
                });
            }
        });

        // Create deliveries table - NEW Logistics System Schema (2025-12-08)
        // Note: This replaces the old schema. Run "DROP TABLE deliveries_old;" if backup exists
        db.run(`CREATE TABLE IF NOT EXISTS deliveries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            requester_id INTEGER NOT NULL,
            provider_id INTEGER,
            
            -- Location & Floor Info (Simplified POI)
            origin_poi TEXT NOT NULL,
            dest_poi TEXT NOT NULL,
            floor_origin INTEGER DEFAULT 0,
            floor_dest INTEGER DEFAULT 0,
            has_elevator_origin BOOLEAN DEFAULT 0,
            has_elevator_dest BOOLEAN DEFAULT 0,
            
            -- ⭐ Standardized Items (JSON format)
            items_json TEXT NOT NULL,
            
            -- Service Requirements
            req_vehicle BOOLEAN DEFAULT 1,
            req_labor BOOLEAN DEFAULT 0,
            vehicle_type TEXT,
            
            -- Pricing
            estimated_price INTEGER,
            quoted_price INTEGER,
            final_price INTEGER,
            
            -- Status Flow
            status TEXT DEFAULT 'open',
            
            -- ⭐ On-site Verification & Renegotiation
            items_verified BOOLEAN DEFAULT 0,
            verification_note TEXT,
            renegotiation_price INTEGER,
            renegotiation_reason TEXT,
            
            -- Timestamps
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            accepted_at DATETIME,
            started_at DATETIME,
            completed_at DATETIME,
            
            notes TEXT,
            
            FOREIGN KEY (requester_id) REFERENCES users(id),
            FOREIGN KEY (provider_id) REFERENCES users(id)
        )`, (err) => {
            if (err) {
                console.error("Error creating deliveries table", err);
            } else {
                console.log("✓ Deliveries table (Logistics System) ready");
            }
        });

        // Create provider_profiles table for logistics capabilities
        db.run(`CREATE TABLE IF NOT EXISTS provider_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            has_vehicle BOOLEAN DEFAULT 0,
            vehicle_type TEXT,
            vehicle_capacity_boxes INTEGER,
            willing_to_carry BOOLEAN DEFAULT 0,
            max_floor_no_elevator INTEGER DEFAULT 3,
            provider_type TEXT,
            avg_rating REAL DEFAULT 0,
            total_deliveries INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`, (err) => {
            if (err) {
                console.error("Error creating provider_profiles table", err);
            }
        });

        // Create errands table if not exists
        db.run(`CREATE TABLE IF NOT EXISTS errands (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            item TEXT NOT NULL,
            shop_location TEXT NOT NULL,
            meet_location TEXT NOT NULL,
            price INTEGER NOT NULL,
            status TEXT DEFAULT 'open',
            runner_id INTEGER,
            contact_info TEXT,
            requester_confirmed BOOLEAN DEFAULT 0,
            runner_confirmed BOOLEAN DEFAULT 0,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id),
            FOREIGN KEY (runner_id) REFERENCES users(id)
        )`, (err) => {
            if (err) {
                console.error("Error creating errands table", err);
            } else {
                // Attempt to add new columns if they don't exist (for existing DB)

                // Create messages table (Legacy for errands, keeping for compatibility)
                db.run(`CREATE TABLE IF NOT EXISTS messages(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            errand_id INTEGER NOT NULL,
            sender_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(errand_id) REFERENCES errands(id),
            FOREIGN KEY(sender_id) REFERENCES users(id)
        )`);

                // Create generic chats table (supports 'errand', 'ride', 'mover', 'food')
                db.run(`CREATE TABLE IF NOT EXISTS chats(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            related_id INTEGER NOT NULL,
            sender_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(sender_id) REFERENCES users(id)
        )`);

                // Create notifications table
                db.run(`CREATE TABLE IF NOT EXISTS notifications(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            content TEXT NOT NULL,
            related_id INTEGER,
            is_read BOOLEAN DEFAULT 0,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`, (err) => {
                    if (!err) {
                        // Add related_id column if it doesn't exist
                        db.all("PRAGMA table_info(notifications)", (err, rows) => {
                            const hasRelatedId = rows.some(row => row.name === 'related_id');
                            if (!hasRelatedId) {
                                db.run("ALTER TABLE notifications ADD COLUMN related_id INTEGER");
                            }
                        });
                    }
                });

                // Create group_buys table for food delivery service
                db.run(`CREATE TABLE IF NOT EXISTS group_buys (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            runner_id INTEGER,
            type TEXT NOT NULL DEFAULT 'group',
            store_name TEXT NOT NULL,
            store_location TEXT NOT NULL,
            menu_photo_url TEXT,
            delivery_fee INTEGER NOT NULL,
            max_orders INTEGER DEFAULT 5,
            deadline DATETIME NOT NULL,
            status TEXT DEFAULT 'open',
            actual_total_cost INTEGER,
            meet_location TEXT,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            stopped_at DATETIME,
            completed_at DATETIME,
            FOREIGN KEY (runner_id) REFERENCES users(id)
        )`, (err) => {
                    if (err) {
                        console.error("Error creating group_buys table", err);
                    } else {
                        console.log("group_buys table created successfully");
                    }
                });

                // Create food_orders table
                db.run(`CREATE TABLE IF NOT EXISTS food_orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id INTEGER NOT NULL,
            eater_id INTEGER NOT NULL,
            item_desc TEXT NOT NULL,
            estimated_cost INTEGER,
            actual_cost INTEGER,
            delivery_fee INTEGER NOT NULL,
            final_price INTEGER,
            is_paid BOOLEAN DEFAULT 0,
            payment_confirmed BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (group_id) REFERENCES group_buys(id),
            FOREIGN KEY (eater_id) REFERENCES users(id)
        )`, (err) => {
                    if (err) {
                        console.error("Error creating food_orders table", err);
                    } else {
                        console.log("food_orders table created successfully");
                    }
                });

                // Create ratings table
                db.run(`CREATE TABLE IF NOT EXISTS ratings(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            from_user_id INTEGER NOT NULL,
            to_user_id INTEGER NOT NULL,
            service_type TEXT NOT NULL, -- 'errand', 'ride', 'mover'
            service_id INTEGER NOT NULL,
            score REAL NOT NULL,
            comment TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(from_user_id) REFERENCES users(id),
            FOREIGN KEY(to_user_id) REFERENCES users(id)
        )`, (err) => {
                    if (!err) {
                        // Add rating columns to users if not exist
                        const columns = [
                            "ALTER TABLE users ADD COLUMN rating REAL DEFAULT 0",
                            "ALTER TABLE users ADD COLUMN rating_count INTEGER DEFAULT 0"
                        ];
                        columns.forEach(sql => db.run(sql, () => { }));
                    }
                });

                // Seed data if empty
                db.get("SELECT count(*) as count FROM rides", (err, row) => {
                    if (row && row.count === 0) {
                        console.log("Seeding database...");
                        const stmt = db.prepare("INSERT INTO rides (driver, origin, destination, departureTime, seats, price, notes) VALUES (?, ?, ?, ?, ?, ?, ?)");
                        stmt.run("陳同學", "外雙溪校區", "捷運士林站", "2023-11-25T17:30", 2, 20, "準時出發");
                        stmt.run("林教授", "外雙溪校區", "城中校區", "2023-11-25T18:00", 3, 30, "歡迎同學搭乘");
                        stmt.finalize();
                    }
                });
            }
        });

        // Socket.io Connection Logic - see comprehensive handler at end of file (line ~1264)

        // Middleware to check if user is admin
        const isAdmin = (req, res, next) => {
            const userId = req.headers['x-user-id']; // Simple header check for now
            if (!userId) return res.status(401).json({ error: "Unauthorized" });

            db.get("SELECT role FROM users WHERE id = ?", [userId], (err, user) => {
                if (err || !user || user.role !== 'admin') {
                    return res.status(403).json({ error: "Forbidden: Admins only" });
                }
                next();
            });
        };

        // API Endpoints

        // Send Verification Code
        app.post('/api/send-code', (req, res) => {
            const { email } = req.body;
            if (!email || !email.endsWith('@scu.edu.tw')) {
                return res.status(400).json({ error: "請使用東吳大學信箱 (@scu.edu.tw)" });
            }

            const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
            const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

            const sql = `INSERT OR REPLACE INTO email_verifications(email, code, expiresAt) VALUES(?, ?, ?)`;

            db.run(sql, [email, code, expiresAt.toISOString()], async (err) => {
                if (err) {
                    return res.status(500).json({ error: "Database error" });
                }

                try {
                    await sendVerificationEmail(email, code);
                    res.json({ message: "Verification code sent" });
                } catch (emailErr) {
                    res.status(500).json({ error: "Failed to send email" });
                }
            });
        });

        // Register
        app.post('/api/register', (req, res) => {
            const { email, password, name, gender, code, role } = req.body; // Added role (optional)

            // Verify code
            db.get("SELECT * FROM email_verifications WHERE email = ?", [email], (err, row) => {
                if (err) return res.status(500).json({ error: "Database error" });

                if (!row) {
                    return res.status(400).json({ error: "請先獲取驗證碼" });
                }

                if (row.code !== code) {
                    return res.status(400).json({ error: "驗證碼錯誤" });
                }

                if (new Date(row.expiresAt) < new Date()) {
                    return res.status(400).json({ error: "驗證碼已過期，請重新發送" });
                }

                // Proceed with registration
                const saltRounds = 10;
                bcrypt.hash(password, saltRounds, (err, hash) => {
                    if (err) {
                        return res.status(500).json({ error: "Error hashing password" });
                    }

                    const sql = 'INSERT INTO users (email, password, name, gender, role) VALUES (?,?,?,?,?)';
                    const params = [email, hash, name, gender, role || 'user'];

                    db.run(sql, params, function (err) {
                        if (err) {
                            res.status(400).json({ "error": err.message });
                            return;
                        }

                        // Clean up verification code
                        db.run("DELETE FROM email_verifications WHERE email = ?", [email]);

                        res.json({
                            "message": "success",
                            "data": { id: this.lastID, email, name, gender, is_partner: 0, role: role || 'user' }
                        });
                    });
                });
            });
        });

        // Login
        app.post('/api/login', (req, res) => {
            const { email, password } = req.body;
            db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
                if (err) return res.status(400).json({ "error": err.message });
                if (!user) return res.status(401).json({ "error": "User not found" });

                const match = await bcrypt.compare(password, user.password);
                if (match) {
                    res.json({
                        "message": "success",
                        "data": {
                            id: user.id,
                            name: user.name,
                            email: user.email,
                            gender: user.gender,
                            rating: user.rating,
                            rating_count: user.rating_count,
                            role: user.role // Return role
                        }
                    });
                } else {
                    res.status(401).json({ "error": "Invalid password" });
                }
            });
        });

        // --- Admin APIs ---

        // Get System Stats
        app.get('/api/admin/stats', isAdmin, (req, res) => {
            const stats = {};
            db.serialize(() => {
                db.get("SELECT COUNT(*) as count FROM users", (err, row) => stats.users = row.count);
                db.get("SELECT COUNT(*) as count FROM errands", (err, row) => stats.errands = row.count);
                db.get("SELECT COUNT(*) as count FROM rides", (err, row) => stats.rides = row.count);
                db.get("SELECT COUNT(*) as count FROM deliveries", (err, row) => {
                    stats.deliveries = row.count;
                    res.json({ message: "success", data: stats });
                });
            });
        });

        // Get All Users
        app.get('/api/admin/users', isAdmin, (req, res) => {
            db.all("SELECT id, email, name, gender, role, rating, rating_count, createdAt FROM users ORDER BY createdAt DESC", (err, rows) => {
                if (err) return res.status(400).json({ error: err.message });
                res.json({ message: "success", data: rows });
            });
        });

        // Delete User
        app.delete('/api/admin/users/:id', isAdmin, (req, res) => {
            db.run("DELETE FROM users WHERE id = ?", [req.params.id], function (err) {
                if (err) return res.status(400).json({ error: err.message });
                res.json({ message: "success", changes: this.changes });
            });
        });

        // Update User (Admin)
        app.put('/api/admin/users/:id', isAdmin, (req, res) => {
            const { name, role } = req.body;
            db.run("UPDATE users SET name = ?, role = ? WHERE id = ?", [name, role, req.params.id], function (err) {
                if (err) return res.status(400).json({ error: err.message });
                res.json({ message: "success", changes: this.changes });
            });
        });

        // Get Tasks (Generic)
        app.get('/api/admin/tasks/:type', isAdmin, (req, res) => {
            const { type } = req.params;
            const table = type === 'errand' ? 'errands' : type === 'ride' ? 'rides' : 'deliveries';

            // Join with users to get creator name
            const sql = `SELECT t.*, u.name as creator_name FROM ${table} t LEFT JOIN users u ON t.user_id = u.id ORDER BY t.createdAt DESC`;

            db.all(sql, (err, rows) => {
                if (err) return res.status(400).json({ error: err.message });
                res.json({ message: "success", data: rows });
            });
        });

        // Delete Task
        app.delete('/api/admin/tasks/:type/:id', isAdmin, (req, res) => {
            const { type, id } = req.params;
            const table = type === 'errand' ? 'errands' : type === 'ride' ? 'rides' : 'deliveries';

            db.run(`DELETE FROM ${table} WHERE id = ? `, [id], function (err) {
                if (err) return res.status(400).json({ error: err.message });
                res.json({ message: "success", changes: this.changes });
            });
        });

        // ==========================================
        // Ride Requests APIs (Ride Service Restructuring)
        // ==========================================

        // Create a new ride request
        app.post('/api/ride-requests', (req, res) => {
            const { user_id, origin, destination, passenger_count, preferred_vehicle, budget, driver_gender_preference } = req.body;
            const sql = 'INSERT INTO ride_requests (user_id, origin, destination, passenger_count, preferred_vehicle, budget, driver_gender_preference) VALUES (?,?,?,?,?,?,?)';
            const params = [user_id, origin, destination, passenger_count, preferred_vehicle || 'none', budget, driver_gender_preference || 'none'];

            db.run(sql, params, function (err) {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }
                res.json({
                    "message": "success",
                    "data": { id: this.lastID, ...req.body },
                    "id": this.lastID
                });
            });
        });

        // Get all open ride requests
        app.get('/api/ride-requests', (req, res) => {
            const sql = "SELECT ride_requests.*, users.name as user_name, users.rating as user_rating FROM ride_requests JOIN users ON ride_requests.user_id = users.id WHERE status = 'open' ORDER BY created_at DESC";
            db.all(sql, [], (err, rows) => {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }
                res.json({
                    "message": "success",
                    "data": rows
                });
            });
        });

        // Delete a ride request
        app.delete('/api/ride-requests/:id', (req, res) => {
            db.run(
                'DELETE FROM ride_requests WHERE id = ?',
                req.params.id,
                function (err) {
                    if (err) {
                        res.status(400).json({ "error": res.message });
                        return;
                    }
                    res.json({ "message": "deleted", changes: this.changes });
                }
            );
        });

        // Invite a passenger (driver sends invite to ride request creator)
        app.post('/api/ride-requests/:id/invite', (req, res) => {
            const { id } = req.params;
            const { driver_id, driver_name } = req.body;

            if (!driver_id || !driver_name) {
                return res.status(400).json({ "error": "Driver ID and name are required" });
            }

            // Get the ride request details
            db.get("SELECT user_id, origin, destination FROM ride_requests WHERE id = ? AND status = 'open'", [id], (err, request) => {
                if (err) return res.status(400).json({ "error": err.message });
                if (!request) return res.status(404).json({ "error": "Ride request not found or already accepted" });

                // Create notification for the passenger
                const notification = {
                    user_id: request.user_id,
                    type: 'ride_invite',
                    content: `${driver_name} 邀請您共乘: ${request.origin} → ${request.destination}`,
                    related_id: id,
                    createdAt: new Date().toISOString()
                };

                // Save notification to DB
                db.run("INSERT INTO notifications (user_id, type, content, related_id) VALUES (?,?,?,?)",
                    [notification.user_id, notification.type, notification.content, id], function (err) {
                        if (err) {
                            console.error('Error creating notification:', err);
                            return res.status(500).json({ "error": "Failed to create notification" });
                        }

                        // Emit Socket event for real-time notification
                        io.emit(`notification_${request.user_id}`, notification);

                        res.json({
                            "message": "success",
                            "data": { invited: true, notification_id: this.lastID }
                        });
                    });
            });
        });

        // --- Existing APIs ---

        // Admin - Update user (Legacy/Generic)
        app.put('/api/users/:id', (req, res) => {
            const { id } = req.params;
            const { name, email, gender, is_partner } = req.body;

            const sql = 'UPDATE users SET name = ?, email = ?, gender = ?, is_partner = ? WHERE id = ?';
            const params = [name, email, gender, is_partner, id];

            db.run(sql, params, function (err) {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }
                res.json({
                    "message": "success",
                    "data": req.body,
                    "changes": this.changes
                });
            });
        });

        // Admin - Delete user (Legacy/Generic)
        app.delete('/api/users/:id', (req, res) => {
            const { id } = req.params;
            const sql = 'DELETE FROM users WHERE id = ?';

            db.run(sql, id, function (err) {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }
                res.json({ "message": "deleted", "changes": this.changes });
            });
        });

        // Get all rides
        app.get('/api/rides', (req, res) => {
            const { from, to } = req.query;
            let query = "SELECT * FROM rides WHERE 1=1";
            const params = [];

            if (from) {
                query += " AND origin = ?";
                params.push(from);
            }
            if (to) {
                query += " AND destination = ?";
                params.push(to);
            }

            query += " ORDER BY departureTime ASC";

            db.all(query, params, (err, rows) => {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }
                res.json({
                    "message": "success",
                    "data": rows
                });
            });
        });

        // Create a new ride
        app.post('/api/rides', (req, res) => {
            const { user_id, driver, origin, destination, departureTime, seats, price, notes, type } = req.body;
            const sql = 'INSERT INTO rides (user_id, driver, origin, destination, departureTime, seats, price, notes, type) VALUES (?,?,?,?,?,?,?,?,?)';
            const params = [user_id, driver || '匿名', origin, destination, departureTime, seats, price, notes, type || 'car'];

            db.run(sql, params, function (err) {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }
                res.json({
                    "message": "success",
                    "data": { id: this.lastID, ...req.body },
                    "id": this.lastID
                });
            });
        });

        // Update a ride
        app.put('/api/rides/:id', (req, res) => {
            const { id } = req.params;
            const { origin, destination, departureTime, seats, price, notes } = req.body;
            const sql = 'UPDATE rides SET origin = ?, destination = ?, departureTime = ?, seats = ?, price = ?, notes = ? WHERE id = ?';
            const params = [origin, destination, departureTime, seats, price, notes, id];

            db.run(sql, params, function (err) {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }
                res.json({
                    "message": "success",
                    "data": req.body,
                    "changes": this.changes
                });
            });
        });

        // Delete a ride
        app.delete('/api/rides/:id', (req, res) => {
            const { id } = req.params;
            const sql = 'DELETE FROM rides WHERE id = ?';

            db.run(sql, id, function (err) {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }
                res.json({ "message": "deleted", "changes": this.changes });
            });
        });

        // Update a delivery request
        app.put('/api/deliveries/:id', (req, res) => {
            const { id } = req.params;
            const { origin, destination, item_description, required_vehicle, price, pickup_time, notes } = req.body;
            const sql = 'UPDATE deliveries SET origin = ?, destination = ?, item_description = ?, required_vehicle = ?, price = ?, pickup_time = ?, notes = ? WHERE id = ? AND status = "open"';
            const params = [origin, destination, item_description, required_vehicle, price, pickup_time, notes, id];

            db.run(sql, params, function (err) {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }
                if (this.changes === 0) {
                    return res.status(400).json({ "error": "Delivery not found or cannot be edited" });
                }
                res.json({
                    "message": "success",
                    "data": req.body,
                    "changes": this.changes
                });
            });
        });

        // Delete a delivery request
        app.delete('/api/deliveries/:id', (req, res) => {
            const { id } = req.params;
            const sql = 'DELETE FROM deliveries WHERE id = ?';

            db.run(sql, id, function (err) {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }
                res.json({ "message": "deleted", "changes": this.changes });
            });
        });

        // ==========================================
        // P0 LOGISTICS CORE APIs (New)
        // ==========================================

        // Get delivery by ID
        app.get('/api/deliveries/:id', (req, res) => {
            const { id } = req.params;

            db.get(`
                SELECT d.*, 
                       u1.name as requester_name, u1.email as requester_email, u1.rating as requester_rating,
                       u2.name as provider_name, u2.email as provider_email, u2.rating as provider_rating
                FROM deliveries d
                JOIN users u1 ON d.requester_id = u1.id
                LEFT JOIN users u2 ON d.provider_id = u2.id
                WHERE d.id = ?
            `, [id], (err, delivery) => {
                if (err) return res.status(400).json({ error: err.message });
                if (!delivery) return res.status(404).json({ error: "Delivery not found" });

                res.json({ message: "success", data: delivery });
            });
        });

        // Accept delivery (provider claims the order)
        app.put('/api/deliveries/:id/accept', (req, res) => {
            const { id } = req.params;
            const { provider_id, quoted_price } = req.body;

            if (!provider_id) {
                return res.status(400).json({ error: "provider_id is required" });
            }

            db.get('SELECT * FROM deliveries WHERE id = ?', [id], (err, delivery) => {
                if (err) return res.status(400).json({ error: err.message });
                if (!delivery) return res.status(404).json({ error: "Delivery not found" });

                if (delivery.status !== 'open') {
                    return res.status(400).json({ error: "Delivery is no longer available" });
                }

                if (delivery.requester_id === provider_id) {
                    return res.status(400).json({ error: "Cannot accept your own delivery request" });
                }

                // Update delivery with provider and status
                const finalQuotedPrice = quoted_price || delivery.estimated_price;
                db.run(
                    'UPDATE deliveries SET provider_id = ?, quoted_price = ?, status = ?, accepted_at = CURRENT_TIMESTAMP WHERE id = ?',
                    [provider_id, finalQuotedPrice, 'booked', id],
                    function (err) {
                        if (err) return res.status(400).json({ error: err.message });

                        // Fetch updated delivery
                        db.get(`
                            SELECT d.*, 
                                   u1.name as requester_name, u1.email as requester_email,
                                   u2.name as provider_name, u2.email as provider_email
                            FROM deliveries d
                            JOIN users u1 ON d.requester_id = u1.id
                            LEFT JOIN users u2 ON d.provider_id = u2.id
                            WHERE d.id = ?
                        `, [id], (err, row) => {
                            if (err) return res.status(400).json({ error: err.message });

                            console.log(`✓ Delivery #${id} accepted by provider #${provider_id} (NT$${finalQuotedPrice})`);

                            // P2: Notify requester about acceptance
                            io.to(`user_${row.requester_id}`).emit('delivery_accepted', {
                                deliveryId: id,
                                providerName: row.provider_name,
                                quotedPrice: finalQuotedPrice,
                                message: `${row.provider_name} 接受了您的訂單 (NT$ ${finalQuotedPrice})`
                            });

                            res.json({ message: "success", data: row });
                        });
                    }
                );
            });
        });

        // Cancel delivery
        app.put('/api/deliveries/:id/cancel', (req, res) => {
            const { id } = req.params;
            const { user_id, reason } = req.body;

            if (!user_id) {
                return res.status(400).json({ error: "user_id is required" });
            }

            db.get('SELECT * FROM deliveries WHERE id = ?', [id], (err, delivery) => {
                if (err) return res.status(400).json({ error: err.message });
                if (!delivery) return res.status(404).json({ error: "Delivery not found" });

                // Check authorization: only requester or provider can cancel
                if (delivery.requester_id !== user_id && delivery.provider_id !== user_id) {
                    return res.status(403).json({ error: "Not authorized to cancel this delivery" });
                }

                // Cannot cancel if already completed
                if (delivery.status === 'completed') {
                    return res.status(400).json({ error: "Cannot cancel a completed delivery" });
                }

                db.run(
                    'UPDATE deliveries SET status = ?, notes = ? WHERE id = ?',
                    ['cancelled', reason || delivery.notes, id],
                    function (err) {
                        if (err) return res.status(400).json({ error: err.message });

                        console.log(`✓ Delivery #${id} cancelled by user #${user_id}`);
                        res.json({ message: "success", data: { id, status: 'cancelled' } });
                    }
                );
            });
        });

        // ==========================================
        // P1 LOGISTICS ADVANCED APIs
        // ==========================================

        // On-site verification (Provider verifies items upon arrival)
        app.put('/api/deliveries/:id/verify', (req, res) => {
            const { id } = req.params;
            const { provider_id, items_match, verification_note, renegotiation_price, renegotiation_reason } = req.body;

            if (!provider_id) {
                return res.status(400).json({ error: "provider_id is required" });
            }

            db.get('SELECT * FROM deliveries WHERE id = ?', [id], (err, delivery) => {
                if (err) return res.status(400).json({ error: err.message });
                if (!delivery) return res.status(404).json({ error: "Delivery not found" });

                // Only provider can verify
                if (delivery.provider_id !== provider_id) {
                    return res.status(403).json({ error: "Only the assigned provider can verify items" });
                }

                // Can only verify booked orders
                if (delivery.status !== 'booked') {
                    return res.status(400).json({ error: "Order must be in 'booked' status to verify" });
                }

                let updateSql, updateParams;

                if (items_match) {
                    // Items match - proceed normally
                    updateSql = `UPDATE deliveries SET 
                        items_verified = 1, 
                        verification_note = ?, 
                        status = 'moving'
                        WHERE id = ?`;
                    updateParams = [verification_note || 'Items verified - all correct', id];
                } else {
                    // Items don't match - initiate renegotiation
                    if (!renegotiation_price || !renegotiation_reason) {
                        return res.status(400).json({
                            error: "renegotiation_price and renegotiation_reason required when items don't match"
                        });
                    }

                    updateSql = `UPDATE deliveries SET 
                        items_verified = 0,
                        verification_note = ?,
                        renegotiation_price = ?,
                        renegotiation_reason = ?,
                        status = 'negotiating'
                        WHERE id = ?`;
                    updateParams = [verification_note, renegotiation_price, renegotiation_reason, id];
                }

                db.run(updateSql, updateParams, function (err) {
                    if (err) return res.status(400).json({ error: err.message });

                    // Fetch updated delivery
                    db.get(`
                        SELECT d.*, 
                               u1.name as requester_name, u1.email as requester_email,
                               u2.name as provider_name, u2.email as provider_email
                        FROM deliveries d
                        JOIN users u1 ON d.requester_id = u1.id
                        LEFT JOIN users u2 ON d.provider_id = u2.id
                        WHERE d.id = ?
                    `, [id], (err, row) => {
                        if (err) return res.status(400).json({ error: err.message });

                        const action = items_match ? 'verified and moving' : 'price renegotiation proposed';
                        console.log(`✓ Delivery #${id} ${action}`);

                        // TODO P2: Emit Socket.io event to notify requester
                        res.json({ message: "success", data: row });
                    });
                });
            });
        });

        // Renegotiation response (Requester accepts/rejects new price)
        app.put('/api/deliveries/:id/renegotiation-response', (req, res) => {
            const { id } = req.params;
            const { requester_id, accept } = req.body;

            if (!requester_id || accept === undefined) {
                return res.status(400).json({ error: "requester_id and accept are required" });
            }

            db.get('SELECT * FROM deliveries WHERE id = ?', [id], (err, delivery) => {
                if (err) return res.status(400).json({ error: err.message });
                if (!delivery) return res.status(404).json({ error: "Delivery not found" });

                // Only requester can respond
                if (delivery.requester_id !== requester_id) {
                    return res.status(403).json({ error: "Only the requester can respond to renegotiation" });
                }

                // Must be in negotiating status
                if (delivery.status !== 'negotiating') {
                    return res.status(400).json({ error: "No active renegotiation to respond to" });
                }

                let updateSql, updateParams;

                if (accept) {
                    // Accept new price - update final price and proceed
                    updateSql = `UPDATE deliveries SET 
                        final_price = renegotiation_price,
                        status = 'moving',
                        items_verified = 1
                        WHERE id = ?`;
                    updateParams = [id];
                } else {
                    // Reject - cancel the order
                    updateSql = `UPDATE deliveries SET 
                        status = 'cancelled',
                        notes = COALESCE(notes || ' | ', '') || 'Cancelled: Requester rejected renegotiation'
                        WHERE id = ?`;
                    updateParams = [id];
                }

                db.run(updateSql, updateParams, function (err) {
                    if (err) return res.status(400).json({ error: err.message });

                    const action = accept ? 'accepted renegotiation' : 'rejected and cancelled';
                    console.log(`✓ Delivery #${id} ${action}`);

                    res.json({
                        message: "success",
                        data: { id, accepted: accept, status: accept ? 'moving' : 'cancelled' }
                    });
                });
            });
        });

        // Update delivery status
        app.put('/api/deliveries/:id/status', (req, res) => {
            const { id } = req.params;
            const { user_id, new_status } = req.body;

            const validStatuses = ['open', 'booked', 'moving', 'completed', 'cancelled', 'negotiating'];

            if (!user_id || !new_status) {
                return res.status(400).json({ error: "user_id and new_status are required" });
            }

            if (!validStatuses.includes(new_status)) {
                return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
            }

            db.get('SELECT * FROM deliveries WHERE id = ?', [id], (err, delivery) => {
                if (err) return res.status(400).json({ error: err.message });
                if (!delivery) return res.status(404).json({ error: "Delivery not found" });

                // Authorization check
                const isRequester = delivery.requester_id === user_id;
                const isProvider = delivery.provider_id === user_id;

                if (!isRequester && !isProvider) {
                    return res.status(403).json({ error: "Not authorized to update this delivery" });
                }

                // Status transition validation
                const allowedTransitions = {
                    'booked': ['moving'],
                    'moving': ['completed'],
                    'negotiating': ['moving', 'cancelled']
                };

                const currentStatus = delivery.status;
                const allowed = allowedTransitions[currentStatus];

                if (allowed && !allowed.includes(new_status)) {
                    return res.status(400).json({
                        error: `Cannot change status from '${currentStatus}' to '${new_status}'`
                    });
                }

                const updateSql = new_status === 'completed'
                    ? 'UPDATE deliveries SET status = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?'
                    : 'UPDATE deliveries SET status = ? WHERE id = ?';

                db.run(updateSql, [new_status, id], function (err) {
                    if (err) return res.status(400).json({ error: err.message });

                    console.log(`✓ Delivery #${id} status: ${currentStatus} → ${new_status}`);
                    res.json({ message: "success", data: { id, status: new_status } });
                });
            });
        });

        // Get my requests (orders I created)
        app.get('/api/deliveries/my-requests', (req, res) => {
            const { user_id } = req.query;

            if (!user_id) {
                return res.status(400).json({ error: "user_id is required" });
            }

            db.all(`
                SELECT d.*, 
                       u.name as provider_name, u.email as provider_email
                FROM deliveries d
                LEFT JOIN users u ON d.provider_id = u.id
                WHERE d.requester_id = ?
                ORDER BY d.created_at DESC
            `, [user_id], (err, rows) => {
                if (err) return res.status(400).json({ error: err.message });
                res.json({ message: "success", data: rows || [] });
            });
        });

        // Get my jobs (orders I accepted)
        app.get('/api/deliveries/my-jobs', (req, res) => {
            const { user_id } = req.query;

            if (!user_id) {
                return res.status(400).json({ error: "user_id is required" });
            }

            db.all(`
                SELECT d.*, 
                       u.name as requester_name, u.email as requester_email
                FROM deliveries d
                JOIN users u ON d.requester_id = u.id
                WHERE d.provider_id = ?
                ORDER BY d.accepted_at DESC
            `, [user_id], (err, rows) => {
                if (err) return res.status(400).json({ error: err.message });
                res.json({ message: "success", data: rows || [] });
            });
        });

        // ==========================================
        // Food Delivery APIs (Campus Food Errands)
        // ==========================================

        // Create a new group buy or wish (Type A or Type B)
        app.post('/api/group-buys', (req, res) => {
            const {
                runner_id,
                type,
                store_name,
                store_location,
                menu_photo_url,
                delivery_fee,
                max_orders,
                deadline,
                meet_location,
                notes
            } = req.body;

            // Validate required fields
            if (!store_name || !store_location || !delivery_fee || !deadline) {
                return res.status(400).json({ error: "缺少必填欄位" });
            }

            // For Type A (group), runner_id is required. For Type B (wish), it can be NULL
            if (type === 'group' && !runner_id) {
                return res.status(400).json({ error: "團購模式需要指定跑腿者" });
            }

            // Determine creator_id: for wishes it's the requester, for groups it's the runner
            const user_id = req.body.user_id || runner_id; // Frontend should send user_id
            const creator = user_id;
            const final_runner_id = type === 'wish' ? null : (runner_id || user_id);

            const sql = `INSERT INTO group_buys (
                runner_id, type, store_name, store_location, menu_photo_url,
                delivery_fee, max_orders, deadline, meet_location, notes, status, creator_id
            ) VALUES (?,?,?,?,?,?,?,?,?,?,'open',?)`;

            const params = [
                final_runner_id,
                type || 'group',
                store_name,
                store_location,
                menu_photo_url || null,
                delivery_fee,
                max_orders || 5,
                deadline,
                meet_location || null,
                notes || null,
                creator
            ];

            db.run(sql, params, function (err) {
                if (err) {
                    console.error('Error creating group buy:', err);
                    return res.status(400).json({ error: err.message });
                }

                // Fetch the created group buy with runner info
                db.get(`
                    SELECT gb.*, u.name as runner_name, u.rating as runner_rating
                    FROM group_buys gb
                    LEFT JOIN users u ON gb.runner_id = u.id
                    WHERE gb.id = ?
                `, [this.lastID], (err, row) => {
                    if (err) {
                        return res.status(400).json({ error: err.message });
                    }
                    res.json({
                        message: "success",
                        data: row
                    });
                });
            });
        });

        // Get all open group buys
        app.get('/api/group-buys', (req, res) => {
            const { type } = req.query;

            let query = `
                SELECT gb.*, u.name as runner_name, u.rating as runner_rating,
                    (SELECT COUNT(*) FROM food_orders WHERE group_id = gb.id) as order_count
                FROM group_buys gb
                LEFT JOIN users u ON gb.runner_id = u.id
                WHERE gb.status IN ('open', 'stopped')
            `;

            const params = [];

            if (type) {
                query += " AND gb.type = ?";
                params.push(type);
            }

            query += " ORDER BY gb.created_at DESC";

            db.all(query, params, (err, rows) => {
                if (err) {
                    return res.status(400).json({ error: err.message });
                }
                res.json({
                    message: "success",
                    data: rows
                });
            });
        });

        // Get group buy detail by ID
        app.get('/api/group-buys/:id', (req, res) => {
            const { id } = req.params;

            db.get(`
                SELECT gb.*, u.name as runner_name, u.rating as runner_rating, u.email as runner_email
                FROM group_buys gb
                LEFT JOIN users u ON gb.runner_id = u.id
                WHERE gb.id = ?
            `, [id], (err, groupBuy) => {
                if (err) {
                    return res.status(400).json({ error: err.message });
                }
                if (!groupBuy) {
                    return res.status(404).json({ error: "團購不存在" });
                }

                // Get all orders for this group buy
                db.all(`
                    SELECT fo.*, u.name as eater_name, u.email as eater_email
                    FROM food_orders fo
                    JOIN users u ON fo.eater_id = u.id
                    WHERE fo.group_id = ?
                    ORDER BY fo.created_at ASC
                `, [id], (err, orders) => {
                    if (err) {
                        return res.status(400).json({ error: err.message });
                    }

                    res.json({
                        message: "success",
                        data: {
                            ...groupBuy,
                            orders: orders || []
                        }
                    });
                });
            });
        });

        // Create a food order (join group buy)
        app.post('/api/food-orders', (req, res) => {
            const {
                group_id,
                eater_id,
                item_desc,
                estimated_cost
            } = req.body;

            if (!group_id || !eater_id || !item_desc) {
                return res.status(400).json({ error: "缺少必填欄位" });
            }

            // Check if group buy exists and is still open
            db.get("SELECT * FROM group_buys WHERE id = ?", [group_id], (err, groupBuy) => {
                if (err) {
                    return res.status(400).json({ error: err.message });
                }
                if (!groupBuy) {
                    return res.status(404).json({ error: "團購不存在" });
                }
                if (groupBuy.status !== 'open') {
                    return res.status(400).json({ error: "此團購已停止收單" });
                }

                // Check if max orders reached
                db.get("SELECT COUNT(*) as count FROM food_orders WHERE group_id = ?", [group_id], (err, result) => {
                    if (err) {
                        return res.status(400).json({ error: err.message });
                    }

                    if (result.count >= groupBuy.max_orders) {
                        return res.status(400).json({ error: "此團購已額滿" });
                    }

                    // Create the order
                    const sql = `INSERT INTO food_orders (
                        group_id, eater_id, item_desc, estimated_cost, delivery_fee
                    ) VALUES (?,?,?,?,?)`;

                    db.run(sql, [group_id, eater_id, item_desc, estimated_cost || 0, groupBuy.delivery_fee], function (err) {
                        if (err) {
                            console.error('Error creating food order:', err);
                            return res.status(400).json({ error: err.message });
                        }

                        // Fetch the created order with user info
                        db.get(`
                            SELECT fo.*, u.name as eater_name
                            FROM food_orders fo
                            JOIN users u ON fo.eater_id = u.id
                            WHERE fo.id = ?
                        `, [this.lastID], (err, row) => {
                            if (err) {
                                return res.status(400).json({ error: err.message });
                            }

                            // Send notification to runner
                            if (groupBuy.runner_id) {
                                const notificationSql = `INSERT INTO notifications (user_id, type, content, related_id) VALUES (?,?,?,?)`;
                                db.run(notificationSql, [
                                    groupBuy.runner_id,
                                    'food_new_order',
                                    `有新的跟團訂單：${item_desc}`,
                                    group_id
                                ]);
                            }

                            res.json({
                                message: "success",
                                data: row
                            });
                        });
                    });
                });
            });
        });

        // Get all orders for a group buy
        app.get('/api/food-orders/group/:groupId', (req, res) => {
            const { groupId } = req.params;

            db.all(`
                SELECT fo.*, u.name as eater_name, u.rating as eater_rating
                FROM food_orders fo
                JOIN users u ON fo.eater_id = u.id
                WHERE fo.group_id = ?
                ORDER BY fo.created_at ASC
            `, [groupId], (err, rows) => {
                if (err) {
                    return res.status(400).json({ error: err.message });
                }
                res.json({
                    message: "success",
                    data: rows
                });
            });
        });

        // Stop ordering (runner only)
        app.put('/api/group-buys/:id/stop', (req, res) => {
            const { id } = req.params;
            const { runner_id } = req.body;

            if (!runner_id) {
                return res.status(400).json({ error: "缺少 runner_id" });
            }

            // Verify runner ownership
            db.get("SELECT runner_id, status FROM group_buys WHERE id = ?", [id], (err, groupBuy) => {
                if (err) return res.status(400).json({ error: err.message });
                if (!groupBuy) return res.status(404).json({ error: "團購不存在" });

                if (groupBuy.runner_id !== runner_id) {
                    return res.status(403).json({ error: "只有跑腿者可以停止收單" });
                }

                if (groupBuy.status !== 'open') {
                    return res.status(400).json({ error: "團購已停止收單" });
                }

                // Stop ordering
                const now = new Date().toISOString();
                db.run(
                    "UPDATE group_buys SET status = 'stopped', stopped_at = ? WHERE id = ?",
                    [now, id],
                    function (err) {
                        if (err) return res.status(400).json({ error: err.message });

                        // Notify all eaters
                        db.all("SELECT DISTINCT eater_id FROM food_orders WHERE group_id = ?", [id], (err, eaters) => {
                            if (!err && eaters) {
                                eaters.forEach(eater => {
                                    db.run(
                                        "INSERT INTO notifications (user_id, type, content, related_id) VALUES (?,?,?,?)",
                                        [eater.eater_id, 'food_stopped', '團購已停止收單，跑腿者即將前往購買', id]
                                    );
                                });
                            }
                        });

                        res.json({
                            message: "success",
                            data: { id, status: 'stopped', stopped_at: now }
                        });
                    }
                );
            });
        });

        // Accept wish (Type B) - Runner accepts a wish and becomes the runner
        app.put('/api/group-buys/:id/accept', (req, res) => {
            const { id } = req.params;
            const { runner_id } = req.body;

            if (!runner_id) {
                return res.status(400).json({ error: "缺少 runner_id" });
            }

            // Verify this is a wish and hasn't been accepted yet
            db.get("SELECT * FROM group_buys WHERE id = ?", [id], (err, groupBuy) => {
                if (err) return res.status(400).json({ error: err.message });
                if (!groupBuy) return res.status(404).json({ error: "許願不存在" });

                // Check if this is a wish
                if (groupBuy.type !== 'wish') {
                    return res.status(400).json({ error: "此功能僅適用於許願模式" });
                }

                // Check if already accepted
                if (groupBuy.runner_id !== null) {
                    return res.status(400).json({ error: "此許願已被其他跑腿者接單" });
                }

                // CRITICAL: Get creator_id (the person who made the wish = the eater)
                const eater_id = groupBuy.creator_id;

                if (!eater_id) {
                    console.error('Cannot create order: creator_id not found in group_buys');
                    return res.status(400).json({
                        error: "此許願缺少創建者資訊，無法接單",
                        hint: "請確保資料庫 creator_id 欄位已設定"
                    });
                }

                // Update runner_id and status
                const now = new Date().toISOString();
                db.run(
                    "UPDATE group_buys SET runner_id = ?, status = 'buying', stopped_at = ? WHERE id = ?",
                    [runner_id, now, id],
                    function (err) {
                        if (err) return res.status(400).json({ error: err.message });

                        // Auto-create food order for the wish creator
                        const orderSql = `INSERT INTO food_orders (
                            group_id, eater_id, item_desc, estimated_cost, delivery_fee
                        ) VALUES (?,?,?,?,?)`;

                        const item_desc = groupBuy.notes || groupBuy.store_name || "許願餐點";
                        const estimated_cost = 0; // Will be updated by runner after purchase

                        db.run(orderSql, [id, eater_id, item_desc, estimated_cost, groupBuy.delivery_fee], function (orderErr) {
                            if (orderErr) {
                                console.error('Error creating auto order:', orderErr);
                                return res.status(500).json({
                                    error: "接單成功但創建訂單失敗",
                                    details: orderErr.message
                                });
                            }

                            // Notify the wish creator
                            db.run(
                                "INSERT INTO notifications (user_id, type, content, related_id) VALUES (?,?,?,?)",
                                [eater_id, 'wish_accepted', `你的許願已被接單！跑腿者即將前往購買`, id]
                            );

                            res.json({
                                message: "接單成功，已自動建立訂單",
                                data: {
                                    id,
                                    runner_id,
                                    eater_id,
                                    status: 'buying',
                                    stopped_at: now,
                                    order_id: this.lastID,
                                    order_created: true
                                }
                            });
                        });
                    }
                );
            });
        });

        // Update group buy status
        app.put('/api/group-buys/:id/status', (req, res) => {
            const { id } = req.params;
            const { status, runner_id } = req.body;

            if (!status) {
                return res.status(400).json({ error: "缺少 status" });
            }

            const validStatuses = ['open', 'stopped', 'buying', 'delivering', 'completed'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ error: "無效的狀態" });
            }

            // Verify runner ownership for non-open status changes
            if (status !== 'open' && runner_id) {
                db.get("SELECT runner_id FROM group_buys WHERE id = ?", [id], (err, groupBuy) => {
                    if (err) return res.status(400).json({ error: err.message });
                    if (!groupBuy) return res.status(404).json({ error: "團購不存在" });

                    if (groupBuy.runner_id !== runner_id) {
                        return res.status(403).json({ error: "只有跑腿者可以更新狀態" });
                    }

                    updateStatus();
                });
            } else {
                updateStatus();
            }

            function updateStatus() {
                const updateData = { status };
                if (status === 'completed') {
                    updateData.completed_at = new Date().toISOString();
                }

                const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
                const values = [...Object.values(updateData), id];

                db.run(
                    `UPDATE group_buys SET ${fields} WHERE id = ?`,
                    values,
                    function (err) {
                        if (err) return res.status(400).json({ error: err.message });

                        // Notify eaters about status change
                        const statusMessages = {
                            'buying': '跑腿者正在購買中',
                            'delivering': '跑腿者正在配送中',
                            'completed': '訂單已完成'
                        };

                        if (statusMessages[status]) {
                            db.all("SELECT DISTINCT eater_id FROM food_orders WHERE group_id = ?", [id], (err, eaters) => {
                                if (!err && eaters) {
                                    eaters.forEach(eater => {
                                        db.run(
                                            "INSERT INTO notifications (user_id, type, content, related_id) VALUES (?,?,?,?)",
                                            [eater.eater_id, 'food_status_update', statusMessages[status], id]
                                        );
                                    });
                                }
                            });
                        }

                        res.json({
                            message: "success",
                            data: { id, ...updateData }
                        });
                    }
                );
            }
        });

        // Update actual cost (runner only) with auto-calculation of final_price
        app.put('/api/food-orders/:id/actual-cost', (req, res) => {
            const { id } = req.params;
            const { actual_cost, runner_id } = req.body;

            if (!actual_cost || !runner_id) {
                return res.status(400).json({ error: "缺少必填欄位" });
            }

            // Get order and group buy info
            db.get(`
                SELECT fo.*, gb.runner_id as group_runner_id
                FROM food_orders fo
                JOIN group_buys gb ON fo.group_id = gb.id
                WHERE fo.id = ?
            `, [id], (err, order) => {
                if (err) return res.status(400).json({ error: err.message });
                if (!order) return res.status(404).json({ error: "訂單不存在" });

                // Verify runner ownership
                if (order.group_runner_id !== runner_id) {
                    return res.status(403).json({ error: "只有跑腿者可以更新實際費用" });
                }

                // Calculate final price: actual_cost + delivery_fee
                const final_price = parseInt(actual_cost) + parseInt(order.delivery_fee);

                db.run(
                    "UPDATE food_orders SET actual_cost = ?, final_price = ? WHERE id = ?",
                    [actual_cost, final_price, id],
                    function (err) {
                        if (err) return res.status(400).json({ error: err.message });

                        // Notify eater about updated cost
                        db.run(
                            "INSERT INTO notifications (user_id, type, content, related_id) VALUES (?,?,?,?)",
                            [order.eater_id, 'food_cost_updated', `實際金額已更新：$${final_price}（餐費 $${actual_cost} + 運費 $${order.delivery_fee}）`, order.group_id]
                        );

                        res.json({
                            message: "success",
                            data: {
                                id,
                                actual_cost: parseInt(actual_cost),
                                delivery_fee: order.delivery_fee,
                                final_price
                            }
                        });
                    }
                );
            });
        });

        // Get my food orders (both as runner and eater)
        app.get('/api/food-orders/my-orders', (req, res) => {
            const { user_id } = req.query;

            if (!user_id) {
                return res.status(400).json({ error: "缺少 user_id" });
            }

            // Get orders where user is eater
            const eaterQuery = `
                SELECT fo.*, gb.store_name, gb.store_location, gb.status as group_status,
                       gb.runner_id, u.name as runner_name, 'eater' as my_role
                FROM food_orders fo
                JOIN group_buys gb ON fo.group_id = gb.id
                LEFT JOIN users u ON gb.runner_id = u.id
                WHERE fo.eater_id = ?
                ORDER BY fo.created_at DESC
            `;

            // Get group buys where user is runner
            const runnerQuery = `
                SELECT gb.id as group_id, gb.store_name, gb.store_location, gb.status as group_status,
                       gb.runner_id, gb.type, gb.delivery_fee, gb.created_at,
                       COUNT(fo.id) as order_count, 'runner' as my_role
                FROM group_buys gb
                LEFT JOIN food_orders fo ON gb.id = fo.group_id
                WHERE gb.runner_id = ?
                GROUP BY gb.id
                ORDER BY gb.created_at DESC
            `;

            db.all(eaterQuery, [user_id], (err, eaterOrders) => {
                if (err) return res.status(400).json({ error: err.message });

                db.all(runnerQuery, [user_id], (err, runnerGroups) => {
                    if (err) return res.status(400).json({ error: err.message });

                    res.json({
                        message: "success",
                        data: {
                            as_eater: eaterOrders || [],
                            as_runner: runnerGroups || []
                        }
                    });
                });
            });
        });

        // ==========================================
        // Provider Profiles API (Campus Logistics)
        // ==========================================

        // Create or Update provider profile
        app.post('/api/provider-profiles', (req, res) => {
            const {
                user_id,
                has_vehicle,
                vehicle_type,
                vehicle_capacity_boxes,
                willing_to_carry,
                max_floor_no_elevator,
                provider_type
            } = req.body;

            if (!user_id) {
                return res.status(400).json({ error: "User ID is required" });
            }

            // Check if profile exists
            db.get("SELECT id FROM provider_profiles WHERE user_id = ?", [user_id], (err, existing) => {
                if (err) return res.status(500).json({ error: err.message });

                if (existing) {
                    // Update existing profile
                    const sql = `UPDATE provider_profiles SET 
                        has_vehicle = ?, 
                        vehicle_type = ?, 
                        vehicle_capacity_boxes = ?,
                        willing_to_carry = ?,
                        max_floor_no_elevator = ?,
                        provider_type = ?
                        WHERE user_id = ?`;

                    db.run(sql, [
                        has_vehicle,
                        vehicle_type,
                        vehicle_capacity_boxes,
                        willing_to_carry,
                        max_floor_no_elevator,
                        provider_type,
                        user_id
                    ], function (err) {
                        if (err) return res.status(400).json({ error: err.message });
                        res.json({ message: "success", data: { id: existing.id, user_id, updated: true } });
                    });
                } else {
                    // Create new profile
                    const sql = `INSERT INTO provider_profiles 
                        (user_id, has_vehicle, vehicle_type, vehicle_capacity_boxes, willing_to_carry, max_floor_no_elevator, provider_type)
                        VALUES (?,?,?,?,?,?,?)`;

                    db.run(sql, [
                        user_id,
                        has_vehicle,
                        vehicle_type,
                        vehicle_capacity_boxes,
                        willing_to_carry,
                        max_floor_no_elevator,
                        provider_type
                    ], function (err) {
                        if (err) return res.status(400).json({ error: err.message });
                        res.json({ message: "success", data: { id: this.lastID, user_id } });
                    });
                }
            });
        });

        // Get provider profile by user ID
        app.get('/api/provider-profiles/:userId', (req, res) => {
            db.get("SELECT * FROM provider_profiles WHERE user_id = ?", [req.params.userId], (err, row) => {
                if (err) return res.status(500).json({ error: err.message });
                if (!row) return res.status(404).json({ error: "Provider profile not found" });
                res.json({ message: "success", data: row });
            });
        });

        // Get matching providers for a delivery request
        app.get('/api/providers/matching', (req, res) => {
            const { needs_vehicle, needs_labor, destination_floor } = req.query;

            let sql = `
                SELECT pp.*, u.name, u.email, u.rating, u.rating_count
                FROM provider_profiles pp
                JOIN users u ON pp.user_id = u.id
                WHERE 1=1
            `;
            const params = [];

            if (needs_vehicle === 'true') {
                sql += " AND pp.has_vehicle = 1";
            }

            if (needs_labor === 'true') {
                sql += " AND pp.willing_to_carry = 1";
            }

            if (destination_floor) {
                sql += " AND pp.max_floor_no_elevator >= ?";
                params.push(destination_floor);
            }

            sql += " ORDER BY u.rating DESC, pp.total_deliveries DESC";

            db.all(sql, params, (err, rows) => {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ message: "success", data: rows });
            });
        });

        // Create a booking
        app.post('/api/bookings', (req, res) => {
            const { user_id, item_id, item_type } = req.body;
            // For now, just log it. In real app, save to DB.
            console.log(`User ${user_id} booked ${item_type} ${item_id} `);
            res.json({ "message": "success", "data": { user_id, item_id, item_type } });
        });

        // --- Errands API ---

        // Get errands for a specific user (as requester or runner)
        app.get('/api/users/:id/errands', (req, res) => {
            const { id } = req.params;
            const query = `
        SELECT e.*, u.name as requester_name, u.email as requester_email 
        FROM errands e 
        JOIN users u ON e.user_id = u.id 
        WHERE e.user_id = ? OR e.runner_id = ?
            ORDER BY e.createdAt DESC
            `;

            db.all(query, [id, id], (err, rows) => {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }
                res.json({
                    "message": "success",
                    "data": rows
                });
            });
        });

        // Get all errands
        app.get('/api/errands', (req, res) => {
            const query = `
        SELECT e.*, u.name as requester_name, u.email as requester_email 
        FROM errands e 
        JOIN users u ON e.user_id = u.id 
        WHERE e.status != 'completed'
        ORDER BY e.createdAt DESC
            `;

            db.all(query, [], (err, rows) => {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }
                res.json({
                    "message": "success",
                    "data": rows
                });
            });
        });

        // Create a new errand
        app.post('/api/errands', (req, res) => {
            const { user_id, item, shop_location, meet_location, price } = req.body;

            if (!user_id || !item || !shop_location || !meet_location || !price) {
                return res.status(400).json({ "error": "Missing required fields" });
            }

            const sql = 'INSERT INTO errands (user_id, item, shop_location, meet_location, price) VALUES (?,?,?,?,?)';
            const params = [user_id, item, shop_location, meet_location, price];

            db.run(sql, params, function (err) {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }
                res.json({
                    "message": "success",
                    "data": { id: this.lastID, ...req.body },
                    "id": this.lastID
                });
            });
        });

        // Update an errand
        app.put('/api/errands/:id', (req, res) => {
            const { id } = req.params;
            const { item, shop_location, meet_location, price } = req.body;

            const sql = 'UPDATE errands SET item = ?, shop_location = ?, meet_location = ?, price = ? WHERE id = ? AND status = "open"';
            const params = [item, shop_location, meet_location, price, id];

            db.run(sql, params, function (err) {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }
                if (this.changes === 0) {
                    return res.status(400).json({ "error": "Errand not found or cannot be edited (must be open)" });
                }
                res.json({
                    "message": "success",
                    "data": req.body
                });
            });
        });

        // Accept an errand
        app.put('/api/errands/:id/accept', (req, res) => {
            const { id } = req.params;
            const { runner_id } = req.body;

            if (!runner_id) {
                return res.status(400).json({ "error": "Runner ID is required" });
            }

            const sql = 'UPDATE errands SET status = ?, runner_id = ? WHERE id = ? AND status = ?';
            const params = ['accepted', runner_id, id, 'open'];

            db.run(sql, params, function (err) {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }
                if (this.changes === 0) {
                    return res.status(400).json({ "error": "Errand not found or already accepted" });
                }

                // Notify Requester
                db.get("SELECT user_id, item FROM errands WHERE id = ?", [id], (err, errand) => {
                    if (errand) {
                        const notification = {
                            user_id: errand.user_id,
                            type: 'errand_accept',
                            content: `有人接了您的跑腿任務: ${errand.item}`,
                            createdAt: new Date().toISOString()
                        };

                        // Save to DB
                        db.run("INSERT INTO notifications (user_id, type, content, related_id) VALUES (?,?,?,?)",
                            [notification.user_id, notification.type, notification.content, id]);

                        // Emit Socket
                        io.emit(`notification_${errand.user_id}`, notification);
                    }
                });

                res.json({
                    "message": "success",
                    "data": { id, status: 'accepted', runner_id }
                });
            });
        });

        // --- Chat & Completion API ---

        // Get messages for an errand
        app.get('/api/errands/:id/messages', (req, res) => {
            const { id } = req.params;
            const sql = `
        SELECT m.*, u.name as sender_name 
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.errand_id = ?
            ORDER BY m.createdAt ASC
            `;

            db.all(sql, [id], (err, rows) => {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }
                res.json({ "message": "success", "data": rows });
            });
        });

        // Send a message
        app.post('/api/errands/:id/messages', (req, res) => {
            const { id } = req.params;
            const { sender_id, content } = req.body;

            const sql = 'INSERT INTO messages (errand_id, sender_id, content) VALUES (?,?,?)';
            db.run(sql, [id, sender_id, content], function (err) {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }
                res.json({ "message": "success", "data": { id: this.lastID } });
            });
        });

        // Confirm completion
        app.post('/api/errands/:id/confirm', (req, res) => {
            const { id } = req.params;
            const { user_id } = req.body; // The user confirming (requester or runner)

            // First, find the errand to check who is confirming
            db.get("SELECT * FROM errands WHERE id = ?", [id], (err, errand) => {
                if (err || !errand) return res.status(400).json({ "error": "Errand not found" });

                let updateSql = "";
                if (user_id == errand.user_id) {
                    updateSql = "UPDATE errands SET requester_confirmed = 1 WHERE id = ?";
                } else if (user_id == errand.runner_id) {
                    updateSql = "UPDATE errands SET runner_confirmed = 1 WHERE id = ?";
                } else {
                    return res.status(403).json({ "error": "Not authorized" });
                }

                db.run(updateSql, [id], function (err) {
                    if (err) return res.status(400).json({ "error": err.message });

                    // Check if BOTH have confirmed
                    db.get("SELECT requester_confirmed, runner_confirmed FROM errands WHERE id = ?", [id], (err, row) => {
                        if (row.requester_confirmed && row.runner_confirmed) {
                            db.run("UPDATE errands SET status = 'completed' WHERE id = ?", [id]);
                            res.json({ "message": "confirmed", "status": "completed" });
                        } else {
                            res.json({ "message": "confirmed", "status": "waiting_other" });
                        }
                    });
                });
            });
        });

        // --- Generic Chat API (Rides & Movers) ---

        // Get messages for a generic chat room
        app.get('/api/chats/:type/:id', (req, res) => {
            const { type, id } = req.params;
            const sql = `
        SELECT c.*, u.name as sender_name 
        FROM chats c
        JOIN users u ON c.sender_id = u.id
        WHERE c.type = ? AND c.related_id = ?
            ORDER BY c.createdAt ASC
            `;

            db.all(sql, [type, id], (err, rows) => {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }
                res.json({ "message": "success", "data": rows });
            });
        });

        // Send a message to a generic chat room
        app.post('/api/chats/:type/:id', (req, res) => {
            const { type, id } = req.params;
            const { sender_id, content } = req.body;

            const sql = 'INSERT INTO chats (type, related_id, sender_id, content) VALUES (?,?,?,?)';
            db.run(sql, [type, id, sender_id, content], function (err) {
                if (err) {
                    res.status(400).json({ "error": err.message });
                    return;
                }
                res.json({ "message": "success", "data": { id: this.lastID } });
            });
        });

        // Join a ride
        app.post('/api/rides/:id/join', (req, res) => {
            const { id } = req.params;
            const { passenger_id } = req.body;

            db.run("UPDATE rides SET passenger_id = ?, status = 'booked' WHERE id = ? AND status = 'open'", [passenger_id, id], function (err) {
                if (err) return res.status(400).json({ error: err.message });
                if (this.changes === 0) return res.status(400).json({ error: "Ride full or not found" });

                // Notify Driver
                db.get("SELECT user_id, origin, destination FROM rides WHERE id = ?", [id], (err, ride) => {
                    if (ride) {
                        const notification = {
                            user_id: ride.user_id,
                            type: 'ride_join',
                            content: `有人加入了您的共乘: ${ride.origin} -> ${ride.destination}`,
                            createdAt: new Date().toISOString()
                        };
                        db.run("INSERT INTO notifications (user_id, type, content, related_id) VALUES (?,?,?,?)",
                            [notification.user_id, notification.type, notification.content, id]);
                        io.emit(`notification_${ride.user_id}`, notification);
                    }
                });

                res.json({ message: "success" });
            });
        });

        // Accept a delivery request
        app.put('/api/deliveries/:id/accept', (req, res) => {
            const { id } = req.params;
            const { driver_id } = req.body;

            if (!driver_id) {
                return res.status(400).json({ error: "Driver ID is required" });
            }

            db.run("UPDATE deliveries SET driver_id = ?, status = 'accepted' WHERE id = ? AND status = 'open'", [driver_id, id], function (err) {
                if (err) return res.status(400).json({ error: err.message });
                if (this.changes === 0) return res.status(400).json({ error: "Delivery unavailable or not found" });

                // Notify Requester
                db.get("SELECT user_id, origin, destination, item_type FROM deliveries WHERE id = ?", [id], (err, delivery) => {
                    if (delivery) {
                        const notification = {
                            user_id: delivery.user_id,
                            type: 'delivery_accept',
                            content: `有司機接受了您的配送請求: ${delivery.origin} → ${delivery.destination}`,
                            createdAt: new Date().toISOString()
                        };
                        db.run("INSERT INTO notifications (user_id, type, content, related_id) VALUES (?,?,?,?)",
                            [notification.user_id, notification.type, notification.content, id]);
                        io.emit(`notification_${delivery.user_id}`, notification);
                    }
                });

                res.json({ message: "success" });
            });
        });

        // Confirm Ride
        app.post('/api/rides/:id/confirm', (req, res) => {
            const { id } = req.params;
            const { user_id } = req.body;

            db.get("SELECT * FROM rides WHERE id = ?", [id], (err, ride) => {
                if (err || !ride) return res.status(400).json({ error: "Ride not found" });

                let sql = "";
                if (user_id == ride.user_id) sql = "UPDATE rides SET driver_confirmed = 1 WHERE id = ?";
                else if (user_id == ride.passenger_id) sql = "UPDATE rides SET passenger_confirmed = 1 WHERE id = ?";
                else return res.status(403).json({ error: "Not authorized" });

                db.run(sql, [id], function (err) {
                    if (err) return res.status(400).json({ error: err.message });

                    db.get("SELECT driver_confirmed, passenger_confirmed FROM rides WHERE id = ?", [id], (err, row) => {
                        if (row.driver_confirmed && row.passenger_confirmed) {
                            db.run("UPDATE rides SET status = 'completed' WHERE id = ?", [id]);
                            res.json({ message: "confirmed", status: "completed" });
                        } else {
                            res.json({ message: "confirmed", status: "waiting_other" });
                        }
                    });
                });
            });
        });

        // Confirm Delivery
        app.post('/api/deliveries/:id/confirm', (req, res) => {
            const { id } = req.params;
            const { user_id } = req.body;

            db.get("SELECT * FROM deliveries WHERE id = ?", [id], (err, delivery) => {
                if (err || !delivery) return res.status(400).json({ error: "Delivery not found" });

                let sql = "";
                if (user_id == delivery.user_id) sql = "UPDATE deliveries SET requester_confirmed = 1 WHERE id = ?";
                else if (user_id == delivery.driver_id) sql = "UPDATE deliveries SET driver_confirmed = 1 WHERE id = ?";
                else return res.status(403).json({ error: "Not authorized" });

                db.run(sql, [id], function (err) {
                    if (err) return res.status(400).json({ error: err.message });

                    db.get("SELECT requester_confirmed, driver_confirmed FROM deliveries WHERE id = ?", [id], (err, row) => {
                        if (row.requester_confirmed && row.driver_confirmed) {
                            db.run("UPDATE deliveries SET status = 'completed' WHERE id = ?", [id]);
                            res.json({ message: "confirmed", status: "completed" });
                        } else {
                            res.json({ message: "confirmed", status: "waiting_other" });
                        }
                    });
                });
            });
        });

        // Notifications API
        app.get('/api/notifications/:userId', (req, res) => {
            db.all("SELECT * FROM notifications WHERE user_id = ? ORDER BY createdAt DESC", [req.params.userId], (err, rows) => {
                if (err) return res.status(400).json({ error: err.message });
                res.json({ message: "success", data: rows });
            });
        });

        app.put('/api/notifications/:id/read', (req, res) => {
            db.run("UPDATE notifications SET is_read = 1 WHERE id = ?", [req.params.id], function (err) {
                if (err) return res.status(400).json({ error: err.message });
                res.json({ message: "success" });
            });
        });

        // Submit Rating
        app.post('/api/ratings', (req, res) => {
            const { from_user_id, to_user_id, service_type, service_id, score, comment } = req.body;

            if (score < 0.5 || score > 5.0) {
                return res.status(400).json({ error: "Score must be between 0.5 and 5.0" });
            }

            db.run(`INSERT INTO ratings(from_user_id, to_user_id, service_type, service_id, score, comment)
        VALUES(?,?,?,?,?,?)`,
                [from_user_id, to_user_id, service_type, service_id, score, comment],
                function (err) {
                    if (err) return res.status(400).json({ error: err.message });

                    // Recalculate Average Rating for to_user_id
                    db.get("SELECT rating, rating_count FROM users WHERE id = ?", [to_user_id], (err, user) => {
                        if (user) {
                            const currentAvg = user.rating || 0;
                            const currentCount = user.rating_count || 0;
                            const newCount = currentCount + 1;
                            const newAvg = ((currentAvg * currentCount) + score) / newCount;

                            db.run("UPDATE users SET rating = ?, rating_count = ? WHERE id = ?",
                                [newAvg, newCount, to_user_id],
                                (err) => {
                                    if (err) console.error("Error updating user rating:", err);
                                    res.json({ message: "success", new_rating: newAvg });
                                }
                            );
                        } else {
                            res.json({ message: "success" });
                        }
                    });
                }
            );
        });

        // ============================================
        // Socket.IO - Unified Connection Handler
        // ============================================

        io.on('connection', (socket) => {
            console.log(`User connected: ${socket.id}`);

            // User joins their own room for targeted notifications
            socket.on('join_user_room', (userId) => {
                socket.join(`user_${userId}`);
                console.log(`User ${userId} joined room user_${userId}`);
            });

            // === CHAT ROOM EVENTS ===

            /**
             * Join a specific chat room for errands/rides/deliveries
             */
            socket.on('join_room', (data) => {
                const { itemId, type } = data;
                const room = `${type}_${itemId}`;
                socket.join(room);
                console.log(`User ${socket.id} joined room: ${room}`);
            });

            /**
             * Send message to a chat room
             */
            socket.on('send_message', (data) => {
                const { itemId, type, message } = data;
                const room = `${type}_${itemId}`;
                // Broadcast to everyone in the room INCLUDING sender (simplifies frontend state)
                io.to(room).emit('receive_message', message);
            });

            // === PAYMENT SYSTEM EVENTS ===

            /**
             * Driver sends encrypted payment info to passenger
             * NOTE: Server NEVER stores this sensitive data, only forwards it
             */
            socket.on('send_payment_info', (data) => {
                const { rideId, recipientId, paymentData } = data;

                console.log(`[PAYMENT] Forwarding payment info for ride ${rideId} (data encrypted, not logged)`);

                // Forward to passenger's socket only (ephemeral transmission)
                io.to(`user_${recipientId}`).emit('receive_payment_info', {
                    rideId,
                    paymentData  // { bankCode, accountNumber, amount }
                });
            });

            /**
             * Passenger confirms they have sent payment
             */
            socket.on('payment_sent', (data) => {
                const { rideId, driverId, passengerId } = data;

                console.log(`[PAYMENT] Passenger ${passengerId} confirmed payment for ride ${rideId}`);

                // Update ride status to waiting for driver confirmation
                db.run(
                    'UPDATE rides SET payment_status = ? WHERE id = ?',
                    ['passenger_confirmed', rideId],
                    (err) => {
                        if (err) {
                            console.error('Error updating payment status:', err);
                            return;
                        }

                        // Notify driver
                        io.to(`user_${driverId}`).emit('payment_notification', {
                            rideId,
                            status: 'waiting_confirmation',
                            message: '乘客已付款，請確認收款'
                        });
                    }
                );
            });

            /**
             * Driver confirms they have received payment
             */
            socket.on('payment_received', (data) => {
                const { rideId, passengerId, driverId } = data;

                console.log(`[PAYMENT] Driver ${driverId} confirmed receipt for ride ${rideId}`);

                // Mark ride as completed
                db.run(
                    'UPDATE rides SET payment_status = ?, status = ? WHERE id = ?',
                    ['completed', 'completed', rideId],
                    (err) => {
                        if (err) {
                            console.error('Error completing ride:', err);
                            return;
                        }

                        // Notify passenger
                        io.to(`user_${passengerId}`).emit('payment_complete', {
                            rideId,
                            message: '交易完成，感謝使用 Dot to Dot！'
                        });

                        // Notify driver
                        io.to(`user_${driverId}`).emit('payment_complete', {
                            rideId,
                            message: '交易完成，感謝使用 Dot to Dot！'
                        });
                    }
                );
            });

            // ==========================================
            // Food Delivery Payment Socket Events
            // ==========================================

            /**
             * Runner sends payment info to eater(s)
             */
            socket.on('send_payment_info', (data) => {
                const { rideId, groupBuyId, recipientId, paymentData } = data;

                if (groupBuyId) {
                    // Food delivery: broadcast to all eaters
                    console.log(`[FOOD PAYMENT] Runner sending payment info for group ${groupBuyId}`);

                    // Get all eaters for this group buy
                    db.all(
                        'SELECT DISTINCT eater_id FROM food_orders WHERE group_id = ?',
                        [groupBuyId],
                        (err, eaters) => {
                            if (err) {
                                console.error('Error finding eaters:', err);
                                return;
                            }

                            eaters.forEach(eater => {
                                io.to(`user_${eater.eater_id}`).emit('receive_payment_info', {
                                    groupBuyId,
                                    paymentData
                                });
                            });
                        }
                    );
                } else {
                    // Ride: send to specific passenger
                    console.log(`[RIDE PAYMENT] Sending payment info to user ${recipientId} for ride ${rideId}`);
                    io.to(`user_${recipientId}`).emit('receive_payment_info', {
                        rideId,
                        paymentData
                    });
                }
            });

            /**
             * Eater/Passenger confirms payment sent
             */
            socket.on('payment_sent', (data) => {
                const { rideId, groupBuyId, driverId, runnerId, passengerId, eaterId } = data;

                if (groupBuyId) {
                    // Food delivery
                    const actualRunnerId = runnerId || driverId;
                    const actualEaterId = eaterId || passengerId;

                    console.log(`[FOOD PAYMENT] Eater ${actualEaterId} confirmed payment for group ${groupBuyId}`);

                    // Update order payment status
                    db.run(
                        'UPDATE food_orders SET is_paid = 1 WHERE group_id = ? AND eater_id = ?',
                        [groupBuyId, actualEaterId],
                        (err) => {
                            if (err) {
                                console.error('Error updating payment status:', err);
                                return;
                            }

                            // Notify runner
                            io.to(`user_${actualRunnerId}`).emit('payment_notification', {
                                groupBuyId,
                                status: 'eater_confirmed',
                                message: '飢餓者已確認付款'
                            });
                        }
                    );
                } else {
                    // Ride (existing logic)
                    console.log(`[RIDE PAYMENT] Passenger ${passengerId} confirmed payment for ride ${rideId}`);

                    db.run(
                        'UPDATE rides SET payment_status = ? WHERE id = ?',
                        ['passenger_confirmed', rideId],
                        (err) => {
                            if (err) {
                                console.error('Error updating payment status:', err);
                                return;
                            }

                            // Notify driver
                            io.to(`user_${driverId}`).emit('payment_notification', {
                                rideId,
                                status: 'waiting_confirmation',
                                message: '乘客已付款，請確認收款'
                            });
                        }
                    );
                }
            });

            /**
             * Runner/Driver confirms payment received
             */
            socket.on('payment_received', (data) => {
                const { rideId, groupBuyId, passengerId, eaterId, driverId, runnerId } = data;

                if (groupBuyId) {
                    // Food delivery
                    const actualRunnerId = runnerId || driverId;
                    const actualEaterId = eaterId || passengerId;

                    console.log(`[FOOD PAYMENT] Runner ${actualRunnerId} confirmed receipt for eater ${actualEaterId}`);

                    // Update order payment confirmation
                    db.run(
                        'UPDATE food_orders SET payment_confirmed = 1 WHERE group_id = ? AND eater_id = ?',
                        [groupBuyId, actualEaterId],
                        (err) => {
                            if (err) {
                                console.error('Error completing payment:', err);
                                return;
                            }

                            // Notify both parties
                            io.to(`user_${actualEaterId}`).emit('payment_complete', {
                                groupBuyId,
                                message: '跑腿者已確認收款，交易完成！'
                            });

                            io.to(`user_${actualRunnerId}`).emit('payment_complete', {
                                groupBuyId,
                                message: '交易完成'
                            });
                        }
                    );
                } else {
                    // Ride (existing logic)
                    console.log(`[RIDE PAYMENT] Driver ${driverId} confirmed receipt for ride ${rideId}`);

                    db.run(
                        'UPDATE rides SET payment_status = ?, status = ? WHERE id = ?',
                        ['completed', 'completed', rideId],
                        (err) => {
                            if (err) {
                                console.error('Error completing ride:', err);
                                return;
                            }

                            // Notify passenger
                            io.to(`user_${passengerId}`).emit('payment_complete', {
                                rideId,
                                message: '交易完成，感謝使用 Dot to Dot！'
                            });

                            // Notify driver
                            io.to(`user_${driverId}`).emit('payment_complete', {
                                rideId,
                                message: '交易完成，感謝使用 Dot to Dot！'
                            });
                        }
                    );
                }
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                console.log(`User disconnected: ${socket.id}`);
            });
        });

        httpServer.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    }
});
