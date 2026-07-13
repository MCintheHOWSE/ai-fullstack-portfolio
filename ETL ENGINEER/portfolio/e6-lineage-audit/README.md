# Data Governance — 血緣、PII 與稽核文件（E6）

對齊 OpenMetadata／金融稽核思維的治理交付：以 E1–E5 管線為底，交出**血緣圖、欄位分類（含 PII）、稽核 FAQ、集中日誌驗收**。不取代 Catalog 產品，但證明「每一列去向可交代、敏感欄位有標、稽核能用數字與路徑答」。

**技術棧：** 資料血緣文件 · PII / 分類分級 · 稽核 FAQ · 集中 log 分析 · OpenMetadata（Docker 本機）

**本機安裝：** 見 [`../../openmetadata-docker/README.md`](../../openmetadata-docker/README.md)  
UI：http://localhost:8585（`admin@open-metadata.org` / `admin`）

---

## 交付結果

| 項目 | 結果 |
|------|------|
| 血緣圖 | 覆蓋 E1→STG→ODS→SCD2；標 E2 銷售線、E5 audit、rejected 去向 |
| 欄位治理 | ≥5 欄；`customer_name`=**PII**，`customer_id`=業務鍵 |
| 稽核 FAQ | ≥5 題；rejected=**4**、read=**13**、written=**6** 與 E1 一致 |
| 應用日誌 | `app_20240118.log`：ERROR=**2**、WARN=**2**（共 10 行） |
| OM 分工 | Catalog／lineage／tag ≠ 取代 ETL |

完整稿：[`artifacts/lab-e06_lineage_audit.md`](./artifacts/lab-e06_lineage_audit.md)

---

## 資料血緣（摘要）

```mermaid
flowchart LR
  east[east_CSV] --> e1[E1_quality]
  west[west_TXT] --> e1
  e1 -->|pass| stg[stg.customers_raw]
  e1 -->|fail| rej[rejected_file]
  stg --> ods[ods.customers_clean]
  ods --> dim[dwh.dim_customer]
  sales[sales_CSV] --> e2[E2]
  e2 --> ods_s[ods.sales_clean]
  job[E5_Job] --> audit[etl_audit_log]
  log[app_log] --> doc[E6_doc]
```

---

## 欄位治理（摘要）

| 欄位 | 分類 | 說明 |
|------|------|------|
| `customer_name` | **PII** | 對外報表遮罩 |
| `customer_id` | 業務鍵 | 跨系統對帳 |
| `segment` | 業務屬性 | SCD2 追蹤變更 |
| `sales` / `load_kw` | 業務指標 | KPI／對帳 |
| `device_id` | 設備識別 | 非自然人 PII |
| `record_hash` | 稽核指紋 | E1 MD5 |

---

## 稽核 FAQ（精選）

| 問題 | 答法 |
|------|------|
| 今日 rejected？ | **4** 筆 → `output/rejected_customers_YYYYMMDD.txt` |
| C001 歷史？ | `dwh.dim_customer` 依 `effective_from`；Consumer 關閉 + Corporate 現行 |
| 增量重跑？ | ODS PK／業務鍵冪等；第二次 written 可為 0 |
| `customer_name`？ | PII；RBAC + 遮罩；非正式環境用假資料 |
| ETL 失敗？ | `dwh.etl_audit_log` 或 `app_20240118.log` 的 ERROR |

---

## 日誌驗收

範例：[`sample-data/app_20240118.log`](./sample-data/app_20240118.log)

| level | 筆數 |
|-------|------|
| ERROR | **2** |
| WARN | **2** |
| INFO | 6 |

集中日誌讓稽核不必登每台 ETL 主機翻檔，並可與 `etl_audit_log` 交叉驗證。

---

## 目錄結構

```
e6-lineage-audit/
├── README.md
├── artifacts/
│   └── lab-e06_lineage_audit.md
└── sample-data/
    └── app_20240118.log
```

---

## OpenMetadata 一句話

> OpenMetadata 不是取代 ETL，是讓資產可發現、可治理。我會交血緣圖標 PII、稽核 log 填 read/written/rejected。客戶問 C001 歷史或今日 rejected，能用 SQL 和檔案路徑直接答出 4 筆。

口述細節：[`ETL ENGINEER/08-openmetadata-notes.md`](../../08-openmetadata-notes.md)

---

## 涵蓋技能

Data lineage · PII / classification · Audit FAQ · Centralized logging · OpenMetadata catalog 思維 · 金融治理溝通
