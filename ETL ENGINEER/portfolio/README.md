# ETL 作品集

公開 portfolio 主軸：Pentaho PDI + PostgreSQL 資料管線（E1–E5）＋治理文件（E6）。  
Repo：[MCintheHOWSE/data-engineering-portfolio](https://github.com/MCintheHOWSE/data-engineering-portfolio)

| 專案 | 說明 |
|------|------|
| [e1-data-quality](./e1-data-quality/) | Pentaho PDI — 多來源客戶資料合併、品質篩選、去重、Java Expression 稽核 hash |
| [e2-incremental-sales](./e2-incremental-sales/) | Pentaho PDI — 增量銷售 CSV、Merge Join 比對 ODS、PostgreSQL 冪等寫入 |
| [e3-stg-to-ods](./e3-stg-to-ods/) | Pentaho PDI — 客戶主檔 STG 落地、ODS Insert/Update、分層導入架構 |
| [e4-scd2-customer](./e4-scd2-customer/) | Pentaho PDI — SCD Type 2 客戶維度、Merge Join 比對、Update 關閉舊列 + Insert 新版 |
| [e5-enterprise-job](./e5-enterprise-job/) | Pentaho PDI — Job 串 E1→E3→E4、Failure Abort、`etl_audit_log` 稽核 |
| [e6-lineage-audit](./e6-lineage-audit/) | 血緣圖、PII 治理表、稽核 FAQ、集中日誌 — 對接 OpenMetadata 思維 |
