# Data Engineering & Full-Stack Portfolio — 許鈞富

> **主軸：** Pentaho PDI + PostgreSQL 資料管線（品質閘門、增量、分層、SCD2、Job 編排、血緣／PII 治理）  
> **第二軌：** 全端／API 實作（校園平台、Todo、LINE Bot、感測後端）

**GitHub:** [MCintheHOWSE/data-engineering-portfolio](https://github.com/MCintheHOWSE/data-engineering-portfolio)

---

## 資料工程 Labs（E1–E6）

面試主砲：企業常見 ETL 場景（E1–E5 以 Pentaho Spoon 9.3 CE + PostgreSQL 實作）＋ E6 治理文件（對接 OpenMetadata 思維）。

| Lab | 主題 | 路徑 |
|-----|------|------|
| **E1** | 多來源客戶資料品質閘門（合併、驗證、去重、稽核 hash） | [`e1-data-quality`](./ETL%20ENGINEER/portfolio/e1-data-quality/) |
| **E2** | 銷售增量載入（CSV → ODS，冪等） | [`e2-incremental-sales`](./ETL%20ENGINEER/portfolio/e2-incremental-sales/) |
| **E3** | STG → ODS 分層導入（batch_id、Upsert） | [`e3-stg-to-ods`](./ETL%20ENGINEER/portfolio/e3-stg-to-ods/) |
| **E4** | SCD Type 2 客戶維度（關閉舊列 + Insert 新版） | [`e4-scd2-customer`](./ETL%20ENGINEER/portfolio/e4-scd2-customer/) |
| **E5** | 企業夜間 Job（E1→E3→E4 + Audit / Abort） | [`e5-enterprise-job`](./ETL%20ENGINEER/portfolio/e5-enterprise-job/) |
| **E6** | 血緣圖、PII 治理、稽核 FAQ、集中日誌 | [`e6-lineage-audit`](./ETL%20ENGINEER/portfolio/e6-lineage-audit/) |

📁 總覽：[`ETL ENGINEER/portfolio/`](./ETL%20ENGINEER/portfolio/)

### E1 — 多來源客戶資料品質閘門

合併兩區客戶檔、品質篩選、去重，並產出稽核用 hash（Pentaho PDI）。

### E2 — 銷售增量載入（CSV → PostgreSQL）

增量 CSV 與 ODS 比對，只插新訂單；重跑 `COUNT(*)` 維持不變（冪等）。

### E3 — STG → ODS 分層導入（客戶主檔）

E1 清洗後先落地 `stg.customers_raw`，再 Upsert 至 `ods.customers_clean`。

### E4 — SCD Type 2 客戶維度

手動 SCD2：Merge Join 比對 → 關閉舊列（`is_current`）→ Insert 新版，保留客戶屬性歷史。

### E5 — 企業夜間 Job + Audit

Job 串接 E1→E3→E4；成功寫入 `dwh.etl_audit_log`，失敗則 FAILED + Abort。

### E6 — 血緣、PII 與稽核文件

以 E1–E5 為底交出 lineage、PII 分類、稽核 FAQ 與集中 log 驗收（ERROR=2／WARN=2）；對接 OpenMetadata catalog 思維。

---

## 全端／應用（第二軌）

| 專案 | Demo / 連結 | 技術棧 |
|------|-------------|--------|
| Todo App | [Live Demo](https://ai-engineer-preparation.vercel.app) | Next.js, Supabase, PostgreSQL, RLS |
| Dot to Dot 校園平台 | [Live Demo](https://dot-to-dot-1mn5.onrender.com) · [原始碼](./dot-to-dot/) | React, Node.js, SQLite, Socket.io |
| F1 LINE Bot | [原始碼](./linebot專案/f1_bot/) | Python, Dialogflow, LINE API |
| Equipment Monitor AI | [專案 README](./equipment-monitor-ai/) | FastAPI, statsmodels, sklearn |

### Todo App — 全端演進（Phase 1 → Phase 2）

| 階段 | 內容 |
|------|------|
| **Phase 1** | localStorage、code review、Vercel 部署 |
| **Phase 2** | Supabase 登入、PostgreSQL、RLS 雲端同步 |

📁 [`todo-app`](./todo-app)

### Dot to Dot (SCU Connect) — 校園共享經濟平台

大四專題：共乘媒合、校園物流、跑腿服務、美食團購。

- React + Express + SQLite + Socket.io 即時通知
- 零知識支付、能力過濾、實報實銷議價

📁 [`dot-to-dot`](./dot-to-dot)

**Live Demo：** https://dot-to-dot-1mn5.onrender.com（Render 免費方案，首次開啟可能需等 30–60 秒喚醒）

### F1 LINE Bot — 聊天機器人

F1 賽事資訊 LINE Bot，整合 Dialogflow NLU。

📁 [`linebot專案/f1_bot`](./linebot專案/f1_bot)

### Equipment Monitor AI — 工業感測後端（進行中）

感測資料 ingest、Holt-Winters 時序預測、Isolation Forest 異常偵測；FastAPI + Docker。

📁 [`equipment-monitor-ai`](./equipment-monitor-ai)

### Coursework — 大學作業精選

MBTI NLP、時間序列、ML、CV、資料工程等。

📁 [`coursework`](./coursework)

---

## 技能對照（ETL 職缺優先）

| 職缺能力 | 對應作品 |
|----------|----------|
| ETL / Pentaho PDI | [E1](./ETL%20ENGINEER/portfolio/e1-data-quality/)–[E5](./ETL%20ENGINEER/portfolio/e5-enterprise-job/) |
| 資料品質 / 去重 / 稽核 | E1、E5 audit log、E6 FAQ |
| 增量載入 / 冪等 | E2 |
| STG / ODS 分層 | E3 |
| SCD Type 2 / 維度歷史 | E4 |
| Job 編排 / 失敗處理 | E5 |
| 血緣 / PII / OpenMetadata 思維 | [E6](./ETL%20ENGINEER/portfolio/e6-lineage-audit/) |
| SQL / PostgreSQL | E2–E5、Todo App |
| React / Node.js / API | Dot to Dot、Todo App、LINE Bot、Equipment Monitor |

開發時會使用 Cursor 等 AI 輔助工具，並以人工 review 修正邊界案例與安全性問題。

---

## 聯絡

- GitHub: [@MCintheHOWSE](https://github.com/MCintheHOWSE)
- Email: mcconshell@gmail.com
