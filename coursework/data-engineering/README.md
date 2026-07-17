# Data Engineering Coursework

東吳大學資料科學系 — **資料工程**課程作業與期末專案精選。

在 Linux（Ubuntu VM）環境練習資料產生、清洗、視覺化資料流與排程，工具包含 **Python、pandas、Apache Airflow、Apache NiFi、Elasticsearch**。

> 這是**課程／作業與期末專案**，不是正式上線生產系統。重點在理解 ETL 流程與工具編排。

---

## 學習路徑總覽

| 階段 | 主題 | 學到什麼 |
|------|------|----------|
| **HW1** | Python 產資料 → Airflow / NiFi | 建立測試資料、DAG、視覺化 Processor 資料流 |
| **HW2** | Airflow 多 Task 清洗 CSV | pandas 清洗、日期篩選、BashOperator、Task 依賴 |
| **Final** | 公路 VD ETL | API／XML 抽取、合併轉換、ES bulk、Airflow 排程 |

```text
HW1（工具入門）
  → HW2（Airflow 編排清洗）
    → Final（完整 ETL：API → Transform → Elasticsearch）
```

---

## HW1 — 資料產生與工具基礎

**目標：** 在 Ubuntu 上熟悉 Python 產檔、Airflow UI、NiFi canvas。

### 做了什麼

1. **Python 寫 CSV**  
   用 `csv` 模組輸出學號／姓名測試檔（例如 `11173112.csv`）。
2. **Faker 產生 JSON**  
   產生約 15 筆假資料（姓名、年齡、地址、經緯度），寫成 JSON。
3. **Airflow**  
   建立 DAG（例如 CSV→JSON 轉換），在 UI 確認 Task 成功並產生輸出檔。
4. **NiFi**  
   用 Processor 串資料流，例如：
   - 讀檔：`GetFile`
   - 拆分：`SplitRecord` / `SplitJson`
   - 查詢／轉換：`QueryRecord`、`EvaluateJsonPath`、`JoltTransformJSON`
   - 寫出：`PutFile`（輸出到指定目錄）

### 面試一句話

> HW1 是熟悉資料工程工具的基礎操作：用 Python 產生 CSV／JSON 測試資料，再透過 Airflow 與 NiFi 完成讀取、拆分、轉換與輸出。

---

## HW2 — Airflow 編排 CSV 清理

**目標：** 用 Airflow 把「清洗 → 篩選 → 搬檔 → 清中間檔」編成一條 DAG。

### 資料與流程

來源：`scooter.csv`（共享機車相關開放／練習資料）

```text
scooter.csv
    ↓ cleanData      （pandas：刪欄、欄名小寫、時間轉型）
cleanscooter.csv
    ↓ selectData     （篩選日期區間）
may23-june3.csv
    ↓ moveFile       （BashOperator：搬到指定位置）
    ↓ deleteFile     （BashOperator：刪中間檔）
```

### Task 依賴（示意）

```python
cleanData >> selectData >> moveFile >> deleteFile
```

| Task | 類型 | 工作 |
|------|------|------|
| `cleanData` | PythonOperator | 讀 CSV；移除不需要欄位（如 `region_id`）；欄名轉小寫；`started_at` 轉 datetime |
| `selectData` | PythonOperator | 依日期篩選（約 2019-05-23～2019-06-03） |
| `moveFile` | BashOperator | 移動結果檔 |
| `deleteFile` | BashOperator | 清理中間檔 |

DAG 設定重點：排程、失敗重試（例如 retry 1 次、間隔數分鐘）。

### 面試一句話

> HW2 用 Airflow 編排共享機車 CSV 的清理流程：pandas 清洗與日期篩選後，用 BashOperator 搬檔並刪中間檔，練習 Task 依賴與排程。

---

## Final — 公路 VD ETL（Airflow + Elasticsearch）

**目標：** 從國道開放資料 API 抓 VD（車流偵測器）靜態／動態 XML，轉換後 bulk 寫入 Elasticsearch，並用 Airflow 排程。

### 執行順序

```text
① Extract
   ├─ VD 靜態 XML（位置、路名…）
   └─ VD 動態 XML（車速、佔有率、車種流量…）
② Parse
   └─ 解析成 dict（以 VDID 為 key）
③ Transform
   ├─ 以 VDID 合併靜態 + 動態
   ├─ 計算 Volume、整理座標
   └─ 唯一 id = UpdateTime + "|" + VDID
④ Load
   └─ Elasticsearch helpers.bulk
⑤ Schedule
   └─ Airflow PythonOperator（task: getVDtoDataWarehouse）
```

### 技術

- Python `requests`、`xml.dom.minidom`
- Apache Airflow DAG + `PythonOperator`
- Elasticsearch bulk insert

### 本目錄檔案

| 檔案 | 說明 |
|------|------|
| [`DE4VD_finalExam.py`](./DE4VD_finalExam.py) | 期末 DAG 與管道邏輯（含填空區的考題版骨架） |
| `113-2資料工程期末考考題.pdf` | 期末考題（本機／未必要上傳） |

### 執行注意

需本機已啟動 **Airflow** 與 **Elasticsearch**（例如 `http://localhost:9200`）才能完整跑通。公開 repo 以展示流程與邏輯為主。

### 面試一句話

> 期末專案是公路 VD：從國道 API 抓靜態與動態 XML，用 VDID 合併並算車流量，bulk 寫入 Elasticsearch，再用 Airflow 定期排程。這是課程專案，重點是 ETL 與排程思維。

---

## 與後續作品的關係

同一套「抽取 → 轉換 → 載入 → 排程／對帳」思維，後續延伸到：

- [ETL ENGINEER portfolio（Pentaho PDI）](../../ETL%20ENGINEER/portfolio/) — 品質閘門、增量冪等、SCD2、Job 稽核
- OpenMetadata — 目錄／血緣／PII（見 ETL 準備資料）

**工具名不同，資料工程邏輯相同：** Airflow Job 編排 ≈ Pentaho Job；NiFi Processor ≈ PDI Step。

---

## 誠實界線（面試／履歷）

- 說「課程作業／期末專案」，**不要說已上線生產**
- 語法細節可忘，但要講得出：**資料從哪來、怎麼轉、寫去哪、怎麼排程、怎麼驗證**
- 部分程式為考題填空版，完整可執行環境依當年度課程設定為準
