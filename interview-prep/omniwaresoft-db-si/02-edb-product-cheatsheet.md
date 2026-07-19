# EDB 產品小抄（對齊歐立威 [edb-2](https://www.omniwaresoft.com.tw/edb-2/)）

## EDB 是誰

**EnterpriseDB（EDB）**＝以 **PostgreSQL** 為核心的企業級資料庫廠商。

> 社群版 PostgreSQL = 引擎本體  
> EDB = 企業版引擎 + 維運／遷移工具 + 原廠支援

客戶常見痛點：想用開源 Postgres，又要 **HA、備份、監控、從 Oracle 遷移、有人撐**。

## 頁面五個賣點（記大故事）

1. 成熟的 **OLTP**（交易型）資料庫  
2. **相容 Oracle**（含 PL/SQL）  
3. 開發工具生態好接  
4. 異質資料庫好 **連、遷、複製**  
5. **省錢**（相對主流商業 DB）

## 核心架構（口試用地圖）

```
EPAS（資料庫本體）
  ├─ PEM          → 看得到、管得了（監控）
  ├─ EFM          → 掛了接得住（HA）
  ├─ Barman       → 備得起來、還得回去
  ├─ xDB 複製     → 交易／報表分流
  └─ Migration    → 從舊庫搬過來
```

## 工具對照表

| 產品 | 一句話 | 客戶為什麼買 | 你進場可能做什麼 |
|------|--------|--------------|------------------|
| **EPAS**（EDB Postgres Advanced Server） | 企業版 Postgres；安全、效能、Oracle 相容 | 要企業級引擎＋支援，不只免費社群版 | 安裝、設定、帳號權限、驗證連線 |
| **PEM**（Postgres Enterprise Manager） | 多台 DB 集中監控、告警、儀表板 | 機房 DB 多，要一眼看健康、能預警 | MA／health check 常看這裡；確認 agent／告警有亮 |
| **EFM**（Failover Manager） | 主掛了自動切備援（輕量 HA） | 不能接受長時間掛死 | 跟資深一起架主備；檢查叢集狀態 |
| **Barman**（舊稱 BART） | 集中備份多台、壓縮、好找回 | 備份還原是合規與災難復原底線 | 確認備份成功；偶爾協助還原演練 |
| **xDB Replication** | 交易主庫 ↔ 報表庫複製分流 | 報表別拖垮交易系統；授權成本可控 | 設定／檢查複製是否落後 |
| **Migration Toolkit（MTK）** | 從 Oracle／SQL Server／MySQL…遷到 PG／EPAS | 降授權、脫離單一商業廠商 | 跑遷移、核對物件與資料、協助驗證 |

## FAQ 口述版（頁面有寫）

**Q：EDB 跟 PostgreSQL 差在哪？**

> 社群版 Postgres 是引擎；EPAS 以它為基礎，多了企業級 HA、災難復原、安全、效能與維運工具，以及跟 Oracle 的高相容與遷移能力。適合機房要長期顧、又想降商業授權成本的客戶。

**Q：30 秒講歐立威＋EDB？**

> EDB 是以 PostgreSQL 為基礎的企業級方案。客戶通常需要的不只是資料庫本身，還有高可用、備份還原、集中監控，以及從 Oracle 這類商業資料庫遷移。歐立威做的是依合約把這些環境架起來、上線，再做 MA 與定期 health check。

## 先不要深挖的

- 最新「AI／Agentic」行銷細節  
- 一次考完所有原廠證照（除非對方之後要求）  
- 把整套文件讀完  

新人優先：**產品名對得上、各解決什麼痛、怎麼串進架設→上線→MA**。

## 延伸：WarehousePG／Greenplum

面試有提、官網也有 WarehousePG 研討會 → 偏 **MPP 資料倉儲／大量分析**，跟「每天記帳的交易庫（EPAS）」不同場景。  
**先把 EPAS＋PEM＋EFM＋備份＋遷移講清楚，再碰倉儲。**

## 課程經驗怎麼對上（面試可講）

| 你有的 | 對哪個產品／場景 |
|--------|------------------|
| PostgreSQL 安裝／操作 | EPAS 本體 |
| 備份概念（如 `pg_dump`） | 對上 Barman／企業備份敘事 |
| Linux 起停服務、看 log | 全線架設與 MA |
| Elasticsearch（若有） | NoSQL／ELK 副線 |
| Docker | 部署標準化（兩線都可能碰到） |
