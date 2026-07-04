# ==========================================
# R 實作：置中移動平均 CMA 與簡單移動平均 SMA 比較
# 課程：W04_時間序列與預測的統計基礎
# ==========================================

# 0. 環境清理：確保每次執行都是乾淨的
rm(list = ls())

# ==========================================
# Part 1：計算 SMA 與 CMA
# ==========================================
# 建立模擬資料
set.seed(123)
t <- 1:100
y <- 5 + 0.2 * t + rnorm(100, sd = 2)

# 設定參數
S <- 2             # 左右各取 S 筆資料
N <- 2 * S + 1     # 總跨度 N = 2S+1 = 5

# SMA (只使用過去資料)
# sides = 1 代表向後單向抓取 (Trailing)
y_sma <- stats::filter(y, rep(1/N, N), sides = 1)

# CMA (對稱使用前後資料)
# sides = 2 代表以前後對稱抓取 (Centered)
y_cma <- stats::filter(y, rep(1/N, N), sides = 2)

# 整合資料
df <- data.frame(t, y, y_sma, y_cma)

# ==========================================
# Part 2：視覺化比較
# ==========================================
# 如果沒有安裝 ggplot2，請拔掉註解安裝： # install.packages("ggplot2")
library(ggplot2)

# 移除 NA 資料以利繪圖
df_clean <- na.omit(df)

# 將 SMA 與 CMA 畫在同一張圖上比較
ggplot(df_clean, aes(x = t)) +
  geom_line(aes(y = y), color = "gray50", alpha = 0.4) +           # 原始資料
  geom_line(aes(y = y_sma), color = "red", linewidth = 0.8) +      # SMA (紅色)
  geom_line(aes(y = y_cma), color = "blue", linewidth = 1) +       # CMA (藍色)
  labs(title = "SMA vs. Centered Moving Average",
       subtitle = "Red: SMA (lagging) | Blue: CMA (centered)",
       x = "Time (t)", 
       y = "Value") +
  theme_minimal()

# 儲存圖表以供檢視
ggsave("sma_vs_cma.png", width = 8, height = 5, bg = "white")

# 觀察重點：
# 1. 藍線 (CMA) 更貼近原始資料趨勢的中心點。
# 2. 紅線 (SMA) 明顯落後於趨勢轉折 (lag 現象)。
