# MBTI 人格文字分類

以 Reddit 貼文預測 MBTI 16 型人格（IE / NS / TF / JP 四維二元分類）。

## 技術

- **Baseline：** TF-IDF + LinearSVC + GridSearchCV
- **Upgrade：** DistilBERT fine-tuning（PyTorch, Transformers）

## 執行

```bash
pip install pandas numpy scikit-learn torch transformers
# 需準備 mbti_1.csv 資料集於同目錄
python mbti_advanced.py
```

## 檔案

- `mbti_advanced.py` — 完整 pipeline（前處理 → baseline → BERT）
