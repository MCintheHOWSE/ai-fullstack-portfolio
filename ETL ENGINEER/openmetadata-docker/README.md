# OpenMetadata 本機 Docker（E6 實作）

對齊歐立威 JD：能安裝／啟動 OpenMetadata，並用 UI 做 catalog／PII tag。  
官方文件：https://docs.open-metadata.org/latest/quick-start/local-docker-deployment

**版本：** OpenMetadata `1.12.6`（PostgreSQL compose，與作品集 PG 技術棧一致）

---

## 前置

1. **Docker Desktop** 已安裝且引擎在跑（選單列鯨魚圖示穩定）
2. 建議 Docker 記憶體 ≥ **6 GiB**、CPU ≥ **4**（Preferences → Resources）
3. 本機 PostgreSQL（E2–E5）已佔 **5432** → compose 已改為主機 **5433→容器 5432**，一般不必再改

---

## 啟動

```bash
cd "ETL ENGINEER/openmetadata-docker"
docker compose -f docker-compose-postgres.yml up --detach
docker ps
```

首次會拉多個 image，可能要數分鐘。

| 服務 | URL | 帳密 |
|------|-----|------|
| OpenMetadata UI | http://localhost:8585 | `admin@open-metadata.org` / `admin` |
| Airflow（ingestion） | http://localhost:8080 | `admin` / `admin` |

---

## 埠說明

- 本機 E2–E5 PostgreSQL：`localhost:5432`
- OpenMetadata 內建 PG（對外）：`localhost:5433`（compose 已改 `5433:5432`）
- 容器彼此仍用內部 `5432`，不必改 `DB_PORT` 環境變數

---

## E6 最小驗收（裝完後做）

**本機 DWH（E1–E5 結束狀態）已可用：**

```bash
# 若需重灌：
psql -h localhost -p 5432 -U noir -d postgres \
  -f "../pentaho-course/sample-data/dwh/setup_postgresql.sql"
psql -h localhost -p 5432 -U noir -d postgres \
  -f "../pentaho-course/sample-data/dwh/seed_e1_e5_endstate.sql"
```

驗收數字：`stg/ods.customers=6`、`ods.sales=6`、`dim_customer=5`（current=4，C001 歷史 2）、`etl_audit_log=2`。

1. 登入 http://localhost:8585
2. 新增 **Postgres** 服務連本機 DWH：
   - Host：`host.docker.internal`　Port：`5432`
   - User：`noir`　Password：可空　Database：`postgres`
3. 跑 Metadata Ingestion（勾 `stg` / `ods` / `dwh`）
4. 幫 `ods.customers_clean.customer_name`（與 `dwh.dim_customer.customer_name`）加 **PII** tag
5. 截圖放 `../portfolio/e6-lineage-audit/screenshots/`（可選）
6. 能口述：OM = catalog + lineage + tag；**不取代** Pentaho ETL

---

## 常用指令

```bash
# 停止（保留 volume 資料）
docker compose -f docker-compose-postgres.yml stop

# 再啟動
docker compose -f docker-compose-postgres.yml start

# 關閉容器（保留 named volumes）
docker compose -f docker-compose-postgres.yml down

# 連 volume 一併清掉（會丟 OM 資料）
docker compose -f docker-compose-postgres.yml down --volumes
```

---

## 與文件版 E6 的關係

| | 文件版 | Docker 實作 |
|--|--------|-------------|
| 路徑 | `portfolio/e6-lineage-audit/` | 本目錄 |
| 內容 | 血緣圖、PII 表、稽核 FAQ | 真的跑起 OM UI |
| 面試 | 數字與路徑 | 「我本機 Docker 裝過、加過 PII tag」 |

兩者都要：文件證明治理思維，Docker 證明你會裝產品。
