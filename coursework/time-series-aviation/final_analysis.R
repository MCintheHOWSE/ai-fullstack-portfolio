# ============================================================
# 第八組期末報告：台灣航空客運量時間序列分析
# 資料來源：交通部民用航空局《民航統計月報》（download_caa_data.py）
# ============================================================
rm(list = ls())

required_pkgs <- c("ggplot2", "forecast", "tseries", "readr")
for (pkg in required_pkgs) {
  if (!requireNamespace(pkg, quietly = TRUE)) {
    install.packages(pkg, repos = "https://cloud.r-project.org")
  }
}

library(ggplot2)
library(forecast)
library(tseries)
library(readr)

args <- commandArgs(trailingOnly = FALSE)
file_arg <- grep("^--file=", args, value = TRUE)
if (length(file_arg) > 0) {
  setwd(dirname(normalizePath(sub("^--file=", "", file_arg))))
} else {
  setwd("c:/Users/LG_14T90N/OneDrive/文件/大四下/時間序列")
}
out_dir <- "report_output"
if (!dir.exists(out_dir)) dir.create(out_dir)

# ---- 1. 資料準備 -----------------------------------------------------------
if (!file.exists("taiwan_air_passengers.csv")) {
  stop("找不到 taiwan_air_passengers.csv，請先執行 download_caa_data.py")
}

raw_df <- read_csv("taiwan_air_passengers.csv", show_col_types = FALSE)
if (nrow(raw_df) < 24) {
  stop("資料筆數不足，請重新執行 download_caa_data.py")
}

raw_df <- raw_df[order(raw_df$date), ]
start_year <- min(raw_df$year)
start_month <- min(raw_df$month[raw_df$year == start_year])
y_full <- ts(raw_df$passengers, start = c(start_year, start_month), frequency = 12)
n <- length(y_full)
h_test <- 12
y_test  <- window(y_full, start = time(y_full)[n - h_test + 1])
y_train <- window(y_full, end = time(y_full)[n - h_test])

metrics <- function(actual, pred) {
  err <- actual - pred
  data.frame(
    RMSE = sqrt(mean(err^2)),
    MAE  = mean(abs(err)),
    MAPE = mean(abs(err / actual)) * 100
  )
}

save_metrics <- function(df, path) {
  write_csv(df, path)
  print(df)
}

theme_set(theme_minimal())

# ---- 2. 探索性分析 ---------------------------------------------------------
p_ts <- autoplot(y_full) +
  labs(
    title = sprintf("Taiwan Monthly Air Passengers (%d-%02d to %d-%02d)",
                    start(y_full)[1], start(y_full)[2], end(y_full)[1], end(y_full)[2]),
    x = "Time", y = "Passengers"
  ) +
  geom_vline(xintercept = time(y_train)[length(y_train)], linetype = "dashed", color = "red")
ggsave(file.path(out_dir, "01_timeseries.png"), p_ts, width = 9, height = 4.5, dpi = 150)

# ---- 3. ADF 平穩性檢定 -----------------------------------------------------
adf_level <- adf.test(as.numeric(y_train))
adf_diff  <- adf.test(diff(as.numeric(y_train)))

adf_results <- data.frame(
  序列 = c("原始序列（訓練集）", "一階差分（訓練集）"),
  ADF統計量 = c(adf_level$statistic, adf_diff$statistic),
  p值 = c(adf_level$p.value, adf_diff$p.value),
  是否平穩 = c(adf_level$p.value < 0.05, adf_diff$p.value < 0.05)
)
write_csv(adf_results, file.path(out_dir, "adf_results.csv"))

# ---- 4. 季節分解（乘法 vs 加法）-------------------------------------------
decomp_add <- decompose(y_train, type = "additive")
decomp_mul <- decompose(y_train, type = "multiplicative")

p_decomp <- autoplot(decomp_mul) +
  labs(title = "乘法季節分解（訓練集）")
ggsave(file.path(out_dir, "02_decomposition_multiplicative.png"), p_decomp, width = 9, height = 7, dpi = 150)

season_idx <- tapply(decomp_mul$seasonal, cycle(decomp_mul$seasonal), mean)
season_df <- data.frame(month = as.integer(names(season_idx)), index = as.numeric(season_idx))
write_csv(season_df, file.path(out_dir, "seasonal_index.csv"))

p_season <- ggplot(season_df, aes(x = factor(month), y = index)) +
  geom_col(fill = "steelblue") +
  geom_hline(yintercept = 1, linetype = "dashed") +
  labs(title = "Monthly Seasonal Index (Multiplicative)", x = "Month", y = "Index")
ggsave(file.path(out_dir, "03_seasonal_index.png"), p_season, width = 8, height = 4, dpi = 150)

# ---- 5. ACF / PACF ---------------------------------------------------------
png(file.path(out_dir, "04_acf_pacf.png"), width = 900, height = 450)
par(mfrow = c(1, 2))
acf(y_train, main = "ACF (Training Set)", lag.max = 36)
pacf(y_train, main = "PACF (Training Set)", lag.max = 36)
dev.off()

# ---- 6. Holt-Winters（stats 內建）------------------------------------------
hw_add <- HoltWinters(y_train, seasonal = "additive")
hw_mul <- HoltWinters(y_train, seasonal = "multiplicative")

fc_hw_add <- predict(hw_add, n.ahead = h_test)
fc_hw_mul <- predict(hw_mul, n.ahead = h_test)

fit_add <- as.numeric(hw_add$fitted[, "xhat"])
fit_mul <- as.numeric(hw_mul$fitted[, "xhat"])

hw_metrics <- rbind(
  cbind(模型 = "Holt-Winters 加法", metrics(as.numeric(y_test), as.numeric(fc_hw_add))),
  cbind(模型 = "Holt-Winters 乘法", metrics(as.numeric(y_test), as.numeric(fc_hw_mul)))
)
save_metrics(hw_metrics, file.path(out_dir, "hw_test_metrics.csv"))

p_hw <- autoplot(y_full) +
  autolayer(ts(c(fit_mul, fc_hw_mul), start = start(y_train)), series = "HW乘法配適+預測", color = "tomato") +
  labs(title = "HW Multiplicative: Fit and Hold-out Forecast", x = "Time", y = "Passengers")
ggsave(file.path(out_dir, "05_hw_multiplicative_forecast.png"), p_hw, width = 9, height = 4.5, dpi = 150)

# ---- 7. SARIMA -------------------------------------------------------------
fit_sarima <- auto.arima(
  y_train,
  seasonal = TRUE,
  stepwise = TRUE,
  approximation = FALSE
)
fc_sarima <- forecast(fit_sarima, h = h_test)
sarima_metrics <- cbind(模型 = "SARIMA", metrics(as.numeric(y_test), as.numeric(fc_sarima$mean)))
save_metrics(sarima_metrics, file.path(out_dir, "sarima_test_metrics.csv"))

capture.output(summary(fit_sarima), file = file.path(out_dir, "sarima_summary.txt"))

png(file.path(out_dir, "06_sarima_forecast.png"), width = 900, height = 450)
plot(fc_sarima, main = "SARIMA Out-of-Sample Forecast", xlab = "Time", ylab = "Passengers")
dev.off()

# ---- 8. 殘差診斷 -----------------------------------------------------------
resid_sarima <- residuals(fit_sarima)
lb_test <- Box.test(resid_sarima, lag = 12, type = "Ljung-Box")

lb_results <- data.frame(
  檢定 = "Ljung-Box（lag=12）",
  統計量 = lb_test$statistic,
  p值 = lb_test$p.value,
  殘差是否白噪音 = lb_test$p.value > 0.05
)
write_csv(lb_results, file.path(out_dir, "ljung_box_results.csv"))

png(file.path(out_dir, "07_residual_diagnostics.png"), width = 900, height = 450)
par(mfrow = c(1, 2))
plot(resid_sarima, main = "SARIMA Residuals", ylab = "Residual")
acf(resid_sarima, main = "Residual ACF")
dev.off()

# ---- 9. 模型綜合比較 -------------------------------------------------------
all_metrics <- rbind(hw_metrics, sarima_metrics)
write_csv(all_metrics, file.path(out_dir, "model_comparison.csv"))

cat("\n=== 分析完成，輸出目錄：", normalizePath(out_dir), "===\n")
