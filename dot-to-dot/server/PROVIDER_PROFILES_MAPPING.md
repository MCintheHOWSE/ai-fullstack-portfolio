# Provider Profiles 欄位對應 - 物流系統

## 現有欄位完整對應

`provider_profiles` 表已包含物流系統所需的所有欄位，無需新增：

### 核心能力欄位

| 現有欄位 | 類型 | 用途 | 對應功能 |
|---------|------|------|---------|
| `has_vehicle` | BOOLEAN | 是否擁有車輛 | ✅ 對應 `can_transport`（可運送） |
| `vehicle_type` | TEXT | 車輛類型 | ✅ motorcycle/car/van/truck |
| `vehicle_capacity_boxes` | INTEGER | 車輛容量（箱數） | ✅ 用於智能過濾 |
| `willing_to_carry` | BOOLEAN | 願意搬運 | ✅ 對應 `can_labor`（可搬運） |
| `max_floor_no_elevator` | INTEGER | 無電梯最高樓層 | ✅ 用於樓層過濾 |

### 統計欄位

| 欄位 | 類型 | 用途 |
|-----|------|------|
| `provider_type` | TEXT | 供給者類型（driver/mover/both） |
| `avg_rating` | REAL | 平均評分 |
| `total_deliveries` | INTEGER | 總訂單數 |

### 元資料

| 欄位 | 類型 | 用途 |
|-----|------|------|
| `id` | INTEGER PK | 主鍵 |
| `user_id` | INTEGER UNIQUE | 用戶ID（外鍵） |
| `created_at` | TEXT | 創建時間 |

## 智能過濾邏輯說明

### 車輛需求過濾
```javascript
if (!profile.has_vehicle) {
    // 無車者只看「不需車輛」的訂單
    conditions.push('d.req_vehicle = 0');
}
```

### 搬運需求過濾
```javascript
if (!profile.willing_to_carry) {
    // 不願搬運者只看「不需搬運」的訂單
    conditions.push('d.req_labor = 0');
}
```

### 車型層級過濾
```javascript
const vehicleHierarchy = {
    'motorcycle': ['motorcycle'],           // 機車只能接機車訂單
    'car': ['motorcycle', 'car'],          // 轎車可接機車+轎車訂單
    'van': ['motorcycle', 'car', 'van'],   // 廂型車可接以上三種
    'truck': ['motorcycle', 'car', 'van', 'truck'] // 貨車可接所有
};
```

### 樓層限制過濾
```javascript
// 用於未來實施（P1）
if (delivery.floor_origin > profile.max_floor_no_elevator && !delivery.has_elevator_origin) {
    // 超過司機願意爬的樓層 → 過濾掉
}
```

## 使用示例

### 創建司機資料
```sql
INSERT INTO provider_profiles 
    (user_id, has_vehicle, vehicle_type, vehicle_capacity_boxes, willing_to_carry, max_floor_no_elevator)
VALUES 
    (1, 1, 'van', 30, 1, 5);
```

### 查詢司機能力
```javascript
db.get('SELECT * FROM provider_profiles WHERE user_id = ?', [userId], (err, profile) => {
    if (profile.has_vehicle) {
        console.log(`車型: ${profile.vehicle_type}, 容量: ${profile.vehicle_capacity_boxes} 箱`);
    }
    if (profile.willing_to_carry) {
        console.log(`可搬運至 ${profile.max_floor_no_elevator} 樓（無電梯）`);
    }
});
```

## ✅ 結論

**provider_profiles 表無需擴展**，現有欄位設計已完美支援物流系統所有核心功能：

1. ✅ 車輛運送能力判斷
2. ✅ 搬運服務能力判斷  
3. ✅ 車型層級匹配
4. ✅ 容量限制
5. ✅ 樓層限制
6. ✅ 統計與評分

---

**文件創建時間:** 2025-12-08  
**狀態:** ✅ 已驗證完整
