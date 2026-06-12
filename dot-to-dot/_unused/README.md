# 未使用的檔案 (_unused)

此資料夾包含專案中已不再使用的舊檔案，保留僅供參考。

## 檔案清單

### 📁 legacy_scripts/
舊的資料庫遷移腳本（8 個檔案）：
- `add_gender_column.js` - 新增性別欄位（已整合到主資料庫）
- `add_type_column.js` - 新增類型欄位（已整合到主資料庫）
- `cleanup_rides.js` - 清理共乘資料（不再需要）
- `clear_users.js` - 清空使用者資料（測試用）
- `debug_db.js` - 資料庫除錯工具（不再需要）
- `debug_movers.js` - 搬家服務除錯工具（不再需要）
- `fix_rides.js` - 修復共乘資料（不再需要）
- `update_ownership.js` - 更新擁有權（已整合到主資料庫）

### 📄 create_test_user.js
建立測試用戶的腳本（開發階段使用，現已不需要）

### 📄 update_admin_schema.js
更新管理員資料表結構的腳本（已執行完畢，不再需要）

### 📁 dist/
Build 輸出資料夾（由 `npm run build` 自動生成，可刪除）

---

## 注意事項

✅ **可以安全刪除此資料夾**  
這些檔案都不會影響專案的正常運作。

⚠️ **建議保留**  
如果未來需要參考舊的遷移邏輯或測試腳本，可以保留此資料夾。

---

*整理日期：2025-12-03*
