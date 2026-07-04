# 公路 VD 資料工程（Airflow）

從 freeway API 下載 XML、解析後寫入 Elasticsearch 的 Airflow DAG 範例。

## 技術

- Python requests、XML 解析
- Apache Airflow DAG
- Elasticsearch bulk insert

## 檔案

- `DE4VD_finalExam.py` — 期末考 DAG 與資料管道邏輯

## 備註

需本地 Airflow + Elasticsearch 環境方可完整執行。
