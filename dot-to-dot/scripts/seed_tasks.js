import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, 'server/rides.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error(err.message);
        process.exit(1);
    }
});

const ADMIN_ID = 5;
const ADMIN_NAME = 'Admin';

const errands = [
    { item: '買麥當勞', shop_location: '士林麥當勞', meet_location: 'R棟一樓', price: 50 },
    { item: '領包裹', shop_location: '7-11 東吳門市', meet_location: '第二教研大樓', price: 30 },
    { item: '買講義', shop_location: '影印店', meet_location: '圖書館', price: 40 },
    { item: '買星巴克', shop_location: '士林星巴克', meet_location: 'B棟', price: 60 },
    { item: '借行動電源', shop_location: '全家', meet_location: '操場', price: 20 }
];

const rides = [
    { driver: ADMIN_NAME, origin: '東吳大學', destination: '士林捷運站', departureTime: '2025-12-06T17:00', seats: 3, price: 30, notes: '準時出發', type: 'car' },
    { driver: ADMIN_NAME, origin: '東吳大學', destination: '台北車站', departureTime: '2025-12-06T18:00', seats: 1, price: 50, notes: '限女生', type: 'scooter' },
    { driver: ADMIN_NAME, origin: '劍潭捷運站', destination: '東吳大學', departureTime: '2025-12-07T08:00', seats: 4, price: 25, notes: '上班順路', type: 'car' },
    { driver: ADMIN_NAME, origin: '東吳大學', destination: '內湖科學園區', departureTime: '2025-12-07T17:30', seats: 2, price: 60, notes: '歡迎聊天', type: 'car' },
    { driver: ADMIN_NAME, origin: '士林夜市', destination: '東吳大學', departureTime: '2025-12-07T20:00', seats: 1, price: 40, notes: '逛完夜市回學校', type: 'scooter' }
];

const deliveries = [
    { origin: 'R棟宿舍', destination: 'D棟宿舍', item_type: 'moving', item_description: '兩箱書和一些雜物', required_vehicle: 'car', price: 200, pickup_time: '2025-12-08T10:00', notes: '有電梯' },
    { origin: '校門口', destination: '圖書館', item_type: 'package', item_description: '一箱A4紙', required_vehicle: 'motorcycle', price: 50, pickup_time: '2025-12-08T14:00', notes: '到了打電話' },
    { origin: '士林好市多', destination: '東吳大學', item_type: 'food', item_description: '大披薩三盒', required_vehicle: 'scooter', price: 100, pickup_time: '2025-12-08T18:00', notes: '派對要用' },
    { origin: 'IKEA', destination: '校外租屋處', item_type: 'furniture', item_description: '一張書桌', required_vehicle: 'van', price: 500, pickup_time: '2025-12-09T11:00', notes: '需要幫忙搬上樓' },
    { origin: '系辦公室', destination: '郵局', item_type: 'package', item_description: '重要文件', required_vehicle: 'scooter', price: 80, pickup_time: '2025-12-09T09:00', notes: '急件' }
];

db.serialize(() => {
    const errandStmt = db.prepare("INSERT INTO errands (user_id, item, shop_location, meet_location, price) VALUES (?, ?, ?, ?, ?)");
    errands.forEach(e => {
        errandStmt.run(ADMIN_ID, e.item, e.shop_location, e.meet_location, e.price);
    });
    errandStmt.finalize();

    const rideStmt = db.prepare("INSERT INTO rides (user_id, driver, origin, destination, departureTime, seats, price, notes, type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    rides.forEach(r => {
        rideStmt.run(ADMIN_ID, r.driver, r.origin, r.destination, r.departureTime, r.seats, r.price, r.notes, r.type);
    });
    rideStmt.finalize();

    const deliveryStmt = db.prepare("INSERT INTO deliveries (user_id, origin, destination, item_type, item_description, required_vehicle, price, pickup_time, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    deliveries.forEach(d => {
        deliveryStmt.run(ADMIN_ID, d.origin, d.destination, d.item_type, d.item_description, d.required_vehicle, d.price, d.pickup_time, d.notes);
    });
    deliveryStmt.finalize();

    console.log("Seeding completed successfully.");
});

db.close();
