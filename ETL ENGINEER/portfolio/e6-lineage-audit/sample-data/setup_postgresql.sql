-- 企業 Lab 用：在本機 PostgreSQL 建立 staging / ODS / DWH 表
-- 執行：psql -U postgres -f setup_postgresql.sql
-- 或在 pgAdmin 貼上執行

CREATE SCHEMA IF NOT EXISTS stg;
CREATE SCHEMA IF NOT EXISTS ods;
CREATE SCHEMA IF NOT EXISTS dwh;

-- Staging：接近源頭，允許髒資料落地
DROP TABLE IF EXISTS stg.customers_raw;
CREATE TABLE stg.customers_raw (
    batch_id        VARCHAR(20),
    loaded_at       TIMESTAMP DEFAULT NOW(),
    customer_id     VARCHAR(20),
    customer_name   VARCHAR(100),
    segment         VARCHAR(50),
    age             VARCHAR(20),
    country         VARCHAR(50),
    city            VARCHAR(50),
    state           VARCHAR(50),
    postal_code     VARCHAR(20),
    region          VARCHAR(20),
    source_file     VARCHAR(255)
);

DROP TABLE IF EXISTS stg.sales_raw;
CREATE TABLE stg.sales_raw (
    batch_id        VARCHAR(20),
    loaded_at       TIMESTAMP DEFAULT NOW(),
    order_line      INT,
    order_id        VARCHAR(20),
    customer_id     VARCHAR(20),
    product_id      VARCHAR(20),
    order_date      DATE,
    sales           NUMERIC(12,2),
    quantity        INT,
    source_file     VARCHAR(255)
);

-- 台電負載感測批次（Lab E2b 選修）
DROP TABLE IF EXISTS stg.load_readings_raw;
CREATE TABLE stg.load_readings_raw (
    batch_id        VARCHAR(20),
    loaded_at       TIMESTAMP DEFAULT NOW(),
    reading_ts      TIMESTAMP,
    device_id       VARCHAR(20),
    load_kw         VARCHAR(20),
    status          VARCHAR(20),
    source_file     VARCHAR(255)
);

-- ODS：清洗後
DROP TABLE IF EXISTS ods.customers_clean;
CREATE TABLE ods.customers_clean (
    customer_id     VARCHAR(20) PRIMARY KEY,
    customer_name   VARCHAR(100),
    segment         VARCHAR(50),
    age             INT,
    city            VARCHAR(50),
    region          VARCHAR(20),
    updated_at      TIMESTAMP DEFAULT NOW()
);

DROP TABLE IF EXISTS ods.sales_clean;
CREATE TABLE ods.sales_clean (
    order_line      INT,
    order_id        VARCHAR(20),
    customer_id     VARCHAR(20),
    product_id      VARCHAR(20),
    order_date      DATE,
    sales           NUMERIC(12,2),
    quantity        INT,
    PRIMARY KEY (order_id, order_line)
);

DROP TABLE IF EXISTS ods.load_readings_clean;
CREATE TABLE ods.load_readings_clean (
    reading_ts      TIMESTAMP NOT NULL,
    device_id       VARCHAR(20) NOT NULL,
    load_kw         NUMERIC(10,2),
    status          VARCHAR(20),
    batch_id        VARCHAR(20),
    updated_at      TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (reading_ts, device_id)
);

-- DWH：SCD2 維度 + 事實
DROP TABLE IF EXISTS dwh.dim_customer;
CREATE TABLE dwh.dim_customer (
    customer_sk     SERIAL PRIMARY KEY,
    customer_id     VARCHAR(20) NOT NULL,
    customer_name   VARCHAR(100),
    segment         VARCHAR(50),
    age             INT,
    city            VARCHAR(50),
    region          VARCHAR(20),
    effective_from  DATE NOT NULL,
    effective_to    DATE NOT NULL DEFAULT '9999-12-31',
    is_current      CHAR(1) NOT NULL DEFAULT 'Y'
);

DROP TABLE IF EXISTS dwh.fact_sales;
CREATE TABLE dwh.fact_sales (
    order_line      INT,
    order_id        VARCHAR(20),
    customer_sk     INT REFERENCES dwh.dim_customer(customer_sk),
    product_id      VARCHAR(20),
    order_date      DATE,
    sales           NUMERIC(12,2),
    quantity        INT,
    PRIMARY KEY (order_id, order_line)
);

-- ETL 稽核日誌（金融/公部門常要）
DROP TABLE IF EXISTS dwh.etl_audit_log;
CREATE TABLE dwh.etl_audit_log (
    audit_id        SERIAL PRIMARY KEY,
    job_name        VARCHAR(100),
    step_name       VARCHAR(100),
    batch_id        VARCHAR(20),
    rows_read       INT,
    rows_written    INT,
    rows_rejected   INT,
    status          VARCHAR(20),
    message         TEXT,
    started_at      TIMESTAMP,
    finished_at     TIMESTAMP DEFAULT NOW()
);
