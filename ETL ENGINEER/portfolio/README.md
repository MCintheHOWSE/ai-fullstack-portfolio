# 作品集故事卡 — 面試必講

> 每個故事用 **STAR**：情境 → 任務 → 行動 → 結果 → 接到歐立威

---

## 故事 1：公路 VD 即時 ETL（主砲 ⭐）

**檔案：** [`coursework/data-engineering/DE4VD_finalExam.py`](../../coursework/data-engineering/DE4VD_finalExam.py)

| STAR | 內容 |
|------|------|
| **S** | 交通部 freeway API 每分鐘提供 VD 車流 XML，需自動化擷取與查詢 |
| **T** | 建立 ETL 管道，整合靜態/動態資料並寫入 Elasticsearch |
| **A** | Python `requests` 下載 → `minidom` 解析 → `VDID` join 靜態與動態 → 彙總車種流量 → ES `bulk` 寫入 → Airflow DAG 排程 |
| **R** | 可重複執行的自動化管道；`UpdateTime\|VDID` 作 idempotent key |

**90 秒口語版：**

> 這是我資料工程課的期末專案。資料來源是高速公路 VD，每分鐘更新 XML。  
> Extract 用 Python 打兩支 API，靜態是 VD 位置，動態是車速和流量。  
> Transform 用 VDID 做 join，過濾對不上的資料，加總各車種 Volume。  
> Load 用 Elasticsearch bulk，比逐筆寫入適合高頻小文件。  
> 最後用 Airflow 排程整條 pipeline。  
> 若換成 Pentaho，邏輯一樣，只是變成 PDI 的 XML Input、Lookup、Calculator 和 Table Output。

**可接的追問：** 例外處理、增量載入、高頻寫入 → 見 [04-interview-qa.md](../04-interview-qa.md)

**⚠️ 注意：** 說「課程期末專案」，不說「已上線生產環境」。

---

## 故事 2：311 / NiFi + Airflow 開放資料管道

**課程：** DE Week 6–17（NiFi CSV/JSON、Airflow 清洗、Kibana dashboard）

| STAR | 內容 |
|------|------|
| **S** | 政府開放資料（311 類型）需從檔案進到可查詢、可視覺化的平台 |
| **T** | 在 Linux 上建端到端 data pipeline |
| **A** | NiFi 處理 CSV/JSON → Python/Pandas 清洗 → PostgreSQL 或 ES → Kibana 儀表板；Airflow 編排批次任務 |
| **R** | 完成擷取、轉換、載入、視覺化全流程 |

**90 秒口語版：**

> 課程後半做 311 資料管道，環境全是 Linux Ubuntu。  
> 用 NiFi 拖拉處理 CSV 和 JSON，再用 Airflow 做排程和資料清洗。  
> 清洗後進 PostgreSQL 或 Elasticsearch，最後用 Kibana 做 dashboard。  
> 這讓我熟悉的不只是寫 script，而是 **在 Linux 上安裝、設定、除錯** 整個資料平台。

---

## 故事 3：Equipment Monitor — 感測資料 ingest

**檔案：** [`equipment-monitor-ai/`](../../equipment-monitor-ai/)

| STAR | 內容 |
|------|------|
| **S** | 模擬工廠設備感測（電流、溫度、振動）需持續寫入與分析 |
| **T** | 設計可擴充的 ingest API 與資料模型 |
| **A** | FastAPI batch ingest → `equipment`（維度）+ `sensor_readings`（事實）→ index on `(equipment_id, recorded_at)` → 預測/異常偵測 |
| **R** | 分層架構清楚；可類比台電負載、榮總串流場景 |

**連結大客戶題：** 「台電級感測寫入我會加 message queue、批次寫入、分區與預聚合——概念上從這個專案延伸。」

---

## 故事 4：Todo App — PostgreSQL + RLS

**檔案：** [`todo-app/`](../../todo-app/)

| 亮點 | 面試用法 |
|------|----------|
| PostgreSQL 雲端同步 | SQL、RDBMS 實務 |
| Row Level Security | 金融客戶「權限管控」題 |
| Supabase | 理解託管 DB 與 policy |

**一句話：** 「權限不只在應用層，資料庫 RLS 是最後防線——這和金融資料治理同一個思維。」

---

## 故事 5：Dot to Dot — 顧問溝通力

**檔案：** [`dot-to-dot/專題技術白皮書.md`](../../dot-to-dot/專題技術白皮書.md)

| 亮點 | 面試用法 |
|------|----------|
| 需求與 MVP 取捨 | 客戶預期 vs 可行性 |
| 技術白皮書 | 安裝手冊 / 文件撰寫 |
| 雙向媒合非全自動 | 需求訪談、Phase 1/2 拆分 |

**用在主軸三**（溝通、簡報、快速學習），不要當 ETL 主故事。

---

## 故事 6：Pentaho E1 客戶主檔品質閘門（歐立威主砲 ⭐）

**檔案：** [`portfolio/e1-data-quality/`](./e1-data-quality/)

| STAR | 內容 |
|------|------|
| **S** | 模擬土銀導入：東區 CSV、西區 pipe 客戶主檔，品質參差不齊 |
| **T** | 合併後分流：合格進 ODS、不合格留 rejected 證據，可交代列數 |
| **A** | Append(13) → Filter(9+4) → HashSet 去重(6) → MD5 record_hash；rejected 寫檔 |
| **R** | read=13, rejected=4, written=6；金融稽核可追蹤每列去向 |

**90 秒口語版：**

> 我用 Pentaho 做企業級髒資料 Lab：兩區客戶檔 Append 後 Filter，空 ID 和非法 age 共 4 筆寫進 rejected 檔，合格 9 筆用 HashSet 依 customer_id 去重得 6 筆，再加 MD5 稽核 hash。這跟我在 VD 高頻 ETL 做異常分流是同一套思維，只是工具換成 PDI。

**GitHub：** [e1-data-quality/README.md](./e1-data-quality/README.md)

---

## 面試時怎麼選故事

| 問題類型 | 優先故事 |
|----------|----------|
| Pentaho / ETL / 歐立威 | **故事 6** → 故事 1 |
| ETL / Python / 自動化 | 故事 1 → 故事 2 |
| 大量資料 / 感測 | 故事 1 → 故事 3 |
| SQL / 資料庫 | 故事 4 → 故事 3 |
| 溝通 / 文件 / 客戶 | 故事 5 |
| Linux 部署 | 故事 2 |

---

## GitHub / Demo 連結（面試可主動提供）

- Portfolio README: [github.com/MCintheHOWSE/ai-engineer-preparation](https://github.com/MCintheHOWSE/ai-engineer-preparation)
- Todo Live Demo: https://ai-engineer-preparation.vercel.app
- Dot to Dot Demo: https://dot-to-dot-1mn5.onrender.com
