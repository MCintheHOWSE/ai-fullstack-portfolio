# 台灣航空客運量時間序列預測

以交通部民用航空局《民航統計月報》真實資料，進行趨勢與季節性預測。

## 技術

- **Python：** `download_caa_data.py` 爬取並整理月度資料
- **R：** Holt-Winters、SARIMA、`forecast`、`ggplot2`
- **產出：** R Markdown 期末報告（`final_report.Rmd`）

## 執行

```bash
# 1. 更新資料（若無 CSV）
python download_caa_data.py

# 2. R 分析
Rscript final_analysis.R
```

## 檔案

| 檔案 | 說明 |
|------|------|
| `download_caa_data.py` | 民航局資料下載 |
| `final_analysis.R` | 主分析腳本 |
| `final_report.Rmd` | 期末報告 |
| `holt_winters_hw.R` | Holt-Winters 手刻作業 |
| `taiwan_air_passengers.csv` | 整理後資料 |
