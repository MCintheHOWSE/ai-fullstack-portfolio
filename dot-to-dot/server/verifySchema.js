// Database Schema Verification Script for Logistics System
// Run this to verify all required tables and columns exist

import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new sqlite3.Database(join(__dirname, '../rides.db'));

console.log('🔍 驗證資料庫結構...\n');

// Required schema definitions
const REQUIRED_SCHEMA = {
    deliveries: {
        required_columns: [
            'id', 'requester_id', 'provider_id',
            'origin_poi', 'dest_poi',
            'floor_origin', 'floor_dest',
            'has_elevator_origin', 'has_elevator_dest',
            'items_json', 'req_vehicle', 'req_labor',
            'vehicle_type', 'estimated_price', 'quoted_price',
            'final_price', 'status', 'items_verified',
            'verification_note', 'renegotiation_price', 'renegotiation_reason',
            'created_at', 'accepted_at', 'completed_at'
        ]
    },
    provider_profiles: {
        required_columns: [
            'id', 'user_id',
            'has_vehicle', 'vehicle_type', 'vehicle_capacity_boxes',
            'willing_to_carry', 'max_floor_no_elevator',
            'provider_type', 'avg_rating', 'total_deliveries',
            'created_at'
        ]
    }
};

function verifyTable(tableName, requiredColumns) {
    return new Promise((resolve, reject) => {
        db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
            if (err) {
                reject(err);
                return;
            }

            if (!columns || columns.length === 0) {
                console.log(`❌ 表 "${tableName}" 不存在`);
                resolve({ table: tableName, exists: false, missing: requiredColumns });
                return;
            }

            const existingColumns = columns.map(col => col.name);
            const missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));

            if (missingColumns.length === 0) {
                console.log(`✅ 表 "${tableName}" 完整 (${existingColumns.length} 欄位)`);
                resolve({ table: tableName, exists: true, missing: [] });
            } else {
                console.log(`⚠️  表 "${tableName}" 缺少欄位:`, missingColumns.join(', '));
                resolve({ table: tableName, exists: true, missing: missingColumns });
            }
        });
    });
}

async function verifyDatabase() {
    try {
        const results = [];

        for (const [tableName, schema] of Object.entries(REQUIRED_SCHEMA)) {
            const result = await verifyTable(tableName, schema.required_columns);
            results.push(result);
        }

        console.log('\n📊 驗證結果摘要:');
        console.log('─'.repeat(50));

        const allValid = results.every(r => r.exists && r.missing.length === 0);

        if (allValid) {
            console.log('✅ 所有表結構完整！物流系統資料庫準備就緒。\n');
        } else {
            console.log('❌ 發現問題，請檢查缺少的欄位。\n');
            process.exit(1);
        }

        // Test data integrity
        console.log('🔍 檢查資料完整性...');

        db.get('SELECT COUNT(*) as count FROM deliveries', (err, row) => {
            if (!err) {
                console.log(`📦 deliveries 表: ${row.count} 筆訂單`);
            }
        });

        db.get('SELECT COUNT(*) as count FROM provider_profiles', (err, row) => {
            if (!err) {
                console.log(`👤 provider_profiles 表: ${row.count} 筆司機資料`);
            }
        });

        db.get(`SELECT COUNT(*) as count FROM deliveries WHERE status = 'open'`, (err, row) => {
            if (!err) {
                console.log(`🟢 開放訂單: ${row.count} 筆`);
            }
        });

        db.get(`SELECT COUNT(*) as count FROM deliveries WHERE status = 'booked'`, (err, row) => {
            if (!err) {
                console.log(`🟡 已接訂單: ${row.count} 筆`);
            }
        });

        setTimeout(() => {
            db.close();
            console.log('\n✅ 資料庫驗證完成！\n');
        }, 500);

    } catch (error) {
        console.error('驗證過程發生錯誤:', error);
        db.close();
        process.exit(1);
    }
}

verifyDatabase();
