-- E1–E5 結束狀態種子（對齊企業 Lab 驗收數字）
-- 用途：本機尚未重跑 Spoon 時，先有完整 STG/ODS/DWH 供 OpenMetadata ingestion / 面試 Demo
-- 執行：
--   psql -h localhost -p 5432 -U noir -d postgres -f setup_postgresql.sql
--   psql -h localhost -p 5432 -U noir -d postgres -f seed_e1_e5_endstate.sql

BEGIN;

-- 清空（保留表結構）
TRUNCATE TABLE
  dwh.etl_audit_log,
  dwh.fact_sales,
  dwh.dim_customer,
  ods.load_readings_clean,
  ods.sales_clean,
  ods.customers_clean,
  stg.load_readings_raw,
  stg.sales_raw,
  stg.customers_raw
RESTART IDENTITY CASCADE;

-- ---------------------------------------------------------------------------
-- E1 → E3：品質閘門後 6 筆客戶（read=13, rejected=4, written=6）
-- 合格：C001,C002,C003,C004,C005,C008（Unique 保留東區先到的 C004）
-- ---------------------------------------------------------------------------
INSERT INTO stg.customers_raw (
  batch_id, loaded_at, customer_id, customer_name, segment, age,
  country, city, state, postal_code, region, source_file
) VALUES
  ('20240118', '2024-01-18 02:00:00', 'C001', '王小明', 'Consumer', '35',
   'Taiwan', 'Taipei', 'Taipei', '100', 'East', 'customers_batch'),
  ('20240118', '2024-01-18 02:00:00', 'C002', '陳美玲', 'Corporate', '42',
   'Taiwan', 'Kaohsiung', 'Kaohsiung', '800', 'West', 'customers_batch'),
  ('20240118', '2024-01-18 02:00:00', 'C003', '林志豪', 'Home Office', '28',
   'Taiwan', 'Taichung', 'Taichung', '400', 'East', 'customers_batch'),
  ('20240118', '2024-01-18 02:00:00', 'C004', '張雅婷', 'Consumer', '31',
   'Taiwan', 'Hsinchu', 'Hsinchu', '300', 'East', 'customers_batch'),
  ('20240118', '2024-01-18 02:00:00', 'C005', '李國強', 'Corporate', '45',
   'Taiwan', 'Tainan', 'Tainan', '700', 'East', 'customers_batch'),
  ('20240118', '2024-01-18 02:00:00', 'C008', '趙心怡', 'Home Office', '33',
   'Taiwan', 'Taipei', 'Taipei', '103', 'East', 'customers_batch');

INSERT INTO ods.customers_clean (
  customer_id, customer_name, segment, age, city, region, updated_at
) VALUES
  ('C001', '王小明', 'Consumer', 35, 'Taipei', 'East', '2024-01-18 02:05:00'),
  ('C002', '陳美玲', 'Corporate', 42, 'Kaohsiung', 'West', '2024-01-18 02:05:00'),
  ('C003', '林志豪', 'Home Office', 28, 'Taichung', 'East', '2024-01-18 02:05:00'),
  ('C004', '張雅婷', 'Consumer', 31, 'Hsinchu', 'East', '2024-01-18 02:05:00'),
  ('C005', '李國強', 'Corporate', 45, 'Tainan', 'East', '2024-01-18 02:05:00'),
  ('C008', '趙心怡', 'Home Office', 33, 'Taipei', 'East', '2024-01-18 02:05:00');

-- ---------------------------------------------------------------------------
-- E2：增量銷售 6 筆 → ODS（冪等；含 C010 訂單列，客戶未必在 ODS 主檔）
-- ---------------------------------------------------------------------------
INSERT INTO stg.sales_raw (
  batch_id, loaded_at, order_line, order_id, customer_id, product_id,
  order_date, sales, quantity, source_file
) VALUES
  ('20240115', '2024-01-18 03:00:00', 1, 'ORD-2001', 'C001', 'P001', '2024-01-15', 320.50, 2, 'sales_20240115.csv'),
  ('20240115', '2024-01-18 03:00:00', 2, 'ORD-2001', 'C001', 'P003', '2024-01-15', 150.00, 1, 'sales_20240115.csv'),
  ('20240116', '2024-01-18 03:00:00', 1, 'ORD-2002', 'C002', 'P002', '2024-01-16', 890.00, 1, 'sales_20240116.csv'),
  ('20240116', '2024-01-18 03:00:00', 2, 'ORD-2003', 'C008', 'P001', '2024-01-16', 160.25, 1, 'sales_20240116.csv'),
  ('20240117', '2024-01-18 03:00:00', 1, 'ORD-2004', 'C001', 'P004', '2024-01-17', 540.00, 3, 'sales_20240117.csv'),
  ('20240117', '2024-01-18 03:00:00', 2, 'ORD-2005', 'C010', 'P002', '2024-01-17', 450.00, 1, 'sales_20240117.csv');

INSERT INTO ods.sales_clean (
  order_line, order_id, customer_id, product_id, order_date, sales, quantity
) VALUES
  (1, 'ORD-2001', 'C001', 'P001', '2024-01-15', 320.50, 2),
  (2, 'ORD-2001', 'C001', 'P003', '2024-01-15', 150.00, 1),
  (1, 'ORD-2002', 'C002', 'P002', '2024-01-16', 890.00, 1),
  (2, 'ORD-2003', 'C008', 'P001', '2024-01-16', 160.25, 1),
  (1, 'ORD-2004', 'C001', 'P004', '2024-01-17', 540.00, 3),
  (2, 'ORD-2005', 'C010', 'P002', '2024-01-17', 450.00, 1);

-- ---------------------------------------------------------------------------
-- E4：SCD2 結束狀態
-- seed C001/C002/C004 → incoming：C001 Consumer→Corporate；C008 新客戶；C002 不變
-- 全表 5 列；is_current='Y' = 4；C001 歷史 2 筆
-- ---------------------------------------------------------------------------
INSERT INTO dwh.dim_customer (
  customer_id, customer_name, segment, age, city, region,
  effective_from, effective_to, is_current
) VALUES
  ('C001', '王小明', 'Consumer', 35, 'Taipei', 'East',
   '2024-01-01', '2024-01-17', 'N'),
  ('C001', '王小明', 'Corporate', 35, 'Taipei', 'East',
   '2024-01-18', '9999-12-31', 'Y'),
  ('C002', '陳美玲', 'Corporate', 42, 'Kaohsiung', 'West',
   '2024-01-01', '9999-12-31', 'Y'),
  ('C004', '張雅婷', 'Consumer', 31, 'Hsinchu', 'East',
   '2024-01-01', '9999-12-31', 'Y'),
  ('C008', '趙心怡', 'Home Office', 33, 'Taipei', 'East',
   '2024-01-18', '9999-12-31', 'Y');

-- 事實表：用現行 customer_sk 對上銷售（E2 ODS → DWH 示意）
INSERT INTO dwh.fact_sales (
  order_line, order_id, customer_sk, product_id, order_date, sales, quantity
)
SELECT
  s.order_line,
  s.order_id,
  d.customer_sk,
  s.product_id,
  s.order_date,
  s.sales,
  s.quantity
FROM ods.sales_clean s
JOIN dwh.dim_customer d
  ON d.customer_id = s.customer_id
 AND d.is_current = 'Y'
WHERE s.customer_id IN ('C001', 'C002', 'C008');
-- ORD-2005 / C010 無維度 → 不進 fact（可當面試講「孤兒訂單」）

-- ---------------------------------------------------------------------------
-- E5：稽核 log（失敗驗證 + 成功全鏈）
-- ---------------------------------------------------------------------------
INSERT INTO dwh.etl_audit_log (
  job_name, step_name, batch_id,
  rows_read, rows_written, rows_rejected,
  status, message, started_at, finished_at
) VALUES
  ('lab-e05_enterprise_job', 'full_chain', '20240118',
   13, 0, 0,
   'FAILED', 'Forced failure path for Abort demo',
   '2024-01-18 01:00:00', '2024-01-18 01:00:30'),
  ('lab-e05_enterprise_job', 'full_chain', '20240118',
   13, 6, 4,
   'SUCCESS', 'E1→E3→E4 completed',
   '2024-01-18 02:00:00', '2024-01-18 02:10:00');

COMMIT;

-- 驗收（應與 Lab README 一致）
SELECT 'stg.customers_raw' AS tbl, COUNT(*) AS n FROM stg.customers_raw
UNION ALL SELECT 'ods.customers_clean', COUNT(*) FROM ods.customers_clean
UNION ALL SELECT 'ods.sales_clean', COUNT(*) FROM ods.sales_clean
UNION ALL SELECT 'dwh.dim_customer', COUNT(*) FROM dwh.dim_customer
UNION ALL SELECT 'dwh.dim_customer current', COUNT(*) FROM dwh.dim_customer WHERE is_current = 'Y'
UNION ALL SELECT 'dwh.fact_sales', COUNT(*) FROM dwh.fact_sales
UNION ALL SELECT 'dwh.etl_audit_log', COUNT(*) FROM dwh.etl_audit_log;

SELECT customer_id, segment, effective_from, effective_to, is_current
FROM dwh.dim_customer
WHERE customer_id = 'C001'
ORDER BY effective_from;
