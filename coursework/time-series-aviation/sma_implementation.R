# ==========================================
# R 實作：簡單移動平均與變異數驗證 (SMA Implementation & Variance Reduction)
# 課程：W04_時間序列與預測的統計基礎
# ==========================================

# 0. 環境清理：確保每次執行都是乾淨的
rm(list = ls())

# ==========================================
# Part 1：計算 SMA
# ==========================================
# 建立模擬資料
set.seed(123)
t <- 1:100
y <- 5 + 0.2 * t + rnorm(100, sd = 2)

# 設定移動平均跨度 (Span)
N <- 20

# 計算簡單移動平均 (使用 filter 函數)
# sides = 1 代表只使用過去資料 (SMA/Trailing)
y_sma <- stats::filter(y, rep(1/N, N), sides = 1)

# 合併資料
df <- data.frame(t, y, y_sma)

# ==========================================
# Part 2：變異數比較 (Variance Reduction)
# ==========================================
# 移除 NA (因為前 N-1 筆資料無法計算 SMA 會產生 NA)
df_clean <- na.omit(df)

# 計算原始資料與平滑後資料的變異數
var_original <- var(df_clean$y)
var_sma <- var(df_clean$y_sma)

cat("原始資料變異數:", var_original, "\n")
cat("SMA 後變異數:", var_sma, "\n")
cat(sprintf("理論平滑後變異數約為: %.2f (原始變異數/N)\n", var_original / N))

# ==========================================
# Part 3：視覺化比較
# ==========================================
# 如果沒有安裝 ggplot2，請拔掉註解安裝： # install.packages("ggplot2")
library(ggplot2)

ggplot(df_clean, aes(x = t)) +
  geom_line(aes(y = y), alpha = 0.5) + # 原始資料(半透明)
  geom_line(aes(y = y_sma), color = "blue", linewidth = 1) + # SMA 平滑線(藍色)
  labs(title = "Original Series vs. SMA",
       subtitle = paste("Var Original:", round(var_original, 2),
                        "| Var SMA:", round(var_sma, 2)),
       x = "Time (t)",
       y = "Value") +
  theme_minimal()

# 儲存圖表以供檢視
ggsave("sma_implementation_N20.png", width = 8, height = 5, bg = "white")
