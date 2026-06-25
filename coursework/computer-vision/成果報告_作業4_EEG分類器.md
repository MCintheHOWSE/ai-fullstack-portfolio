# 計算神經網路 - 作業4：EEG 分類器成果報告

## 一、 作業目標
本作業旨在利用 Kaggle 上的 `eeg-dataset-for-adhd` (ADHD 腦波資料集)，透過 `tsfresh` 進行感測器的時間序列特徵工程，並結合 `sktime` 機器學習套件，建構出能夠自動分類「過動症 (ADHD)」與「健康對照組 (Control)」的模型。

## 二、 資料前處理與痛點解決
原始資料包含 121 位受試者（61位 ADHD、60位 Control），共計約 216 萬筆腦波數據（19個感測通道，取樣率 128Hz）。在直接訓練模型前，我們發現並解決了三個機器學習處理腦波訊號時常見的痛點：

1. **資料飢荒 (Data Starvation)**：
   若將每位病患視為單一樣本，僅有 121 筆資料無法有效訓練隨機森林模型。因此我們導入了 **Sliding Window (滑動窗口)** 技術，將每位受試者的腦波以 2 秒 (256 個數據點) 為單位進行切分 (Epoching)。最終成功將資料擴增至 **8,400 筆** 獨立的訓練樣本。

2. **頻域特徵缺失 (Frequency Domain)**：
   腦波 (EEG) 的時域波形非常混亂，臨床診斷（如 Theta/Beta Ratio）高度依賴頻譜特徵。我們特別自訂了 `tsfresh` 的參數字典 (`fc_parameters`)，指定計算 `fft_coefficient` (傅立葉轉換) 與 `spkt_welch_density` (功率譜密度)，成功將波形轉換為頻段能量特徵。

3. **維度災難 (Curse of Dimensionality)**：
   我們不盲目使用 `tsfresh` 的全面特徵萃取（可能產生上萬個雜訊特徵），而是僅針對頻域與基本統計特徵進行計算。最終從 19 個通道中精準提煉出 **437 個** 具備物理意義的特徵，有效避免模型過度擬合 (Overfitting)。

## 三、 模型設計與訓練方法
為了嚴格防止資料洩漏 (Data Leakage)，我們使用了 `GroupShuffleSplit` 來進行訓練集與測試集的切分 (80% / 20%)，確保同一位受試者的所有腦波片段，不會同時出現在訓練集與測試集中。

我們設計了兩種模型進行對比測試：
1. **sktime 時間序列分類模型**：
   因為原始 `sktime` 的 `TimeSeriesForestClassifier` 不支援多通道 (Multivariate) 腦波，我們使用了 `ColumnEnsembleClassifier` 將 19 個通道獨立包裝，讓模型能直接讀取切分好的 3D Array 進行訓練。
2. **tsfresh 特徵 + RandomForest 傳統機器學習模型**：
   將 `tsfresh` 萃取出的 437 個頻域特徵矩陣，直接餵入傳統的隨機森林分類器 (RandomForestClassifier)。

## 四、 實驗結果分析

兩種方法在測試集 (1,727 筆樣本) 上皆取得了非常優異且一致的表現，**準確率 (Accuracy) 皆高達 84.89%**。詳細比較如下：

### 1. sktime TimeSeriesForestClassifier (多通道包裝版)
* **Accuracy (準確率)**: 0.8489
* **ADHD 類別表現**: Precision (精確率) 0.81 / **Recall (召回率) 0.98** / F1-Score 0.89
* **分析**：此模型對於 ADHD 的召回率高達 98%，意味著**「只要患者真的有 ADHD，模型有 98% 的機率能成功揪出，極少漏診」**。這種特性非常適合用於醫學上的「第一線初步篩檢工具」，寧可錯殺也不放過。

### 2. tsfresh 頻域特徵 + RandomForest 模型
* **Accuracy (準確率)**: 0.8489
* **ADHD 類別表現**: Precision (精確率) 0.86 / Recall (召回率) 0.90 / F1-Score 0.88
* **分析**：此模型的 Precision 與 Recall 表現較為均衡。得益於 `tsfresh` 精準抽取的傅立葉頻譜能量，模型能穩定地根據各頻段（如 Theta、Beta 波）的能量差異做出精準判斷。

## 五、 結論
本作業成功結合了 `tsfresh` 的自動特徵工程與 `sktime` 的時間序列分類能力。實驗證實，透過 Sliding Window 擴增資料，加上傅立葉轉換捕捉腦波頻域能量，即使是面對充滿雜訊的 19 通道腦波訊號，也能輕易將分類準確率提升至近 85%。這套流程不僅符合課堂要求，更具備高度的臨床醫學應用潛力。
