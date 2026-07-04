# ============================================================
# 回家作業：Holt-Winters 季節性模型
# 資料集：AirPassengers（月度航空旅客數）
# ============================================================
rm(list = ls())
library(ggplot2)

data("AirPassengers")
y <- as.numeric(AirPassengers)
n <- length(y)
s <- 12 # 季節週期長度

# 初始值（題1、題2共用，不需修改）
n_init <- 2 * s
init_fit <- lm(y[1:n_init] ~ I(1:n_init))
L0     <- coef(init_fit)[1]
T0     <- coef(init_fit)[2]
trend_init <- L0 + T0 * (1:n_init)

# 加法初始季節指數
detrended <- y[1:n_init] - trend_init
S_init <- numeric(s)
for (j in 1:s) S_init[j] <- mean(detrended[seq(j, n_init, by = s)])
S_init <- S_init - mean(S_init) # 正規化：總和為 0

# 乘法初始季節指數
ratio_init <- y[1:n_init] / trend_init
S_mult_init <- numeric(s)
for (j in 1:s) S_mult_init[j] <- mean(ratio_init[seq(j, n_init, by = s)])
S_mult_init <- S_mult_init / mean(S_mult_init) # 正規化：平均值為 1

# ============================================================
# 題1：Holt-Winters 加法模型
# ============================================================
hw_additive <- function(y, alpha, beta, gamma, L0, T0, S_init) {
  n <- length(y)
  s <- length(S_init)
  L <- numeric(n)
  Tr <- numeric(n)
  S <- c(S_init, numeric(n))
  
  # 第一期（順序：先 L，再 T，再 S）
  L[1]  <- alpha * (y[1] - S_init[1]) + (1 - alpha) * (L0 + T0)
  Tr[1] <- beta * (L[1] - L0)       + (1 - beta) * T0
  S[s + 1] <- gamma * (y[1] - L[1])   + (1 - gamma) * S_init[1]
  
  # 遞迴更新
  for (i in 2:n) {
    L[i]  <- alpha * (y[i] - S[i])   + (1 - alpha) * (L[i-1] + Tr[i-1])
    Tr[i] <- beta * (L[i] - L[i-1])  + (1 - beta) * Tr[i-1]
    S[s + i] <- gamma * (y[i] - L[i])   + (1 - gamma) * S[i]
  }
  
  yhat  <- numeric(n)
  yhat[1] <- L0 + T0 + S_init[1]
  for (i in 2:n) yhat[i] <- L[i-1] + Tr[i-1] + S[i]
  
  mse  <- mean((y - yhat)^2)
  mape <- mean(abs((y - yhat) / y)) * 100
  list(L = L, Trend = Tr, S = S[(s+1):(s+n)],
       yhat = yhat, mse = mse, mape = mape)
}

# 配適加法模型
hw_add <- hw_additive(y, 
                      alpha = 0.3, beta = 0.1, gamma = 0.2, 
                      L0 = L0, T0 = T0, S_init = S_init)

cat("=== 題1：加法模型 ===\n")
cat("MSE :", round(hw_add$mse, 2), "\n")
cat("MAPE:", round(hw_add$mape, 4), "%\n")

# 外推預測未來 12 期
hw_forecast_add <- function(hw_result, y, h, s) {
  n  <- length(y)
  L_T <- hw_result$L[n]
  T_T <- hw_result$Trend[n]
  S  <- hw_result$S
  fc <- numeric(h)
  for (tau in 1:h) {
    idx <- n - s + ((tau - 1) %% s) + 1
    fc[tau] <- L_T + tau * T_T + S[idx]
  }
  return(fc)
}

fc_add <- hw_forecast_add(hw_add, y, h = 12, s = s)
cat("\n未來 12 期預測值：\n")
print(round(fc_add, 2))

# 視覺化
df_add    <- data.frame(t = 1:n, y = y, yhat = hw_add$yhat)
df_fc_add <- data.frame(t = (n+1):(n+12), yhat = fc_add)

p1 <- ggplot() +
  geom_line(data = df_add, 
            aes(x = t, y = y, color = "實際值"), linewidth = 0.8) +
  geom_line(data = df_add, 
            aes(x = t, y = yhat, color = "加法配適"), linewidth = 1) +
  geom_line(data = df_fc_add, 
            aes(x = t, y = yhat, color = "未來預測"), 
            linewidth = 1, linetype = "dashed") +
  scale_color_manual(
    values = c("實際值"   = "gray50",
               "加法配適" = "steelblue",
               "未來預測" = "tomato")
  ) +
  labs(title = "題1：加法模型配適與預測",
       x = "時間", y = "旅客人數", color = "") +
  theme_minimal()
ggsave("HW_additive.png", p1, width=8, height=4, bg="white")


# ============================================================
# 題2：Holt-Winters 乘法模型
# ============================================================
hw_multiplicative <- function(y, alpha, beta, gamma, L0, T0, S_init) {
  n <- length(y)
  s <- length(S_init)
  L <- numeric(n)
  Tr <- numeric(n)
  S <- c(S_init, numeric(n))
  
  # 第一期
  L[1]  <- alpha * (y[1] / S_init[1]) + (1 - alpha) * (L0 + T0)
  Tr[1] <- beta * (L[1] - L0)       + (1 - beta) * T0
  S[s + 1] <- gamma * (y[1] / L[1])   + (1 - gamma) * S_init[1]
  
  # 遞迴更新
  for (i in 2:n) {
    L[i]  <- alpha * (y[i] / S[i])   + (1 - alpha) * (L[i-1] + Tr[i-1])
    Tr[i] <- beta * (L[i] - L[i-1])  + (1 - beta) * Tr[i-1]
    S[s + i] <- gamma * (y[i] / L[i])   + (1 - gamma) * S[i]
  }
  
  yhat  <- numeric(n)
  yhat[1] <- (L0 + T0) * S_init[1]
  for (i in 2:n) yhat[i] <- (L[i-1] + Tr[i-1]) * S[i]
  
  mse  <- mean((y - yhat)^2)
  mape <- mean(abs((y - yhat) / y)) * 100
  list(L = L, Trend = Tr, S = S[(s+1):(s+n)],
       yhat = yhat, mse = mse, mape = mape)
}

# 配適乘法模型
hw_mult <- hw_multiplicative(y, 
                             alpha = 0.3, beta = 0.1, gamma = 0.2, 
                             L0 = L0, T0 = T0, S_init = S_mult_init)

cat("\n=== 題2：乘法模型 ===\n")
cat("MSE :", round(hw_mult$mse, 2), "\n")
cat("MAPE:", round(hw_mult$mape, 4), "%\n")

# 外推預測未來 12 期
hw_forecast_mult <- function(hw_result, y, h, s) {
  n  <- length(y)
  L_T <- hw_result$L[n]
  T_T <- hw_result$Trend[n]
  S  <- hw_result$S
  fc <- numeric(h)
  for (tau in 1:h) {
    idx <- n - s + ((tau - 1) %% s) + 1
    fc[tau] <- (L_T + tau * T_T) * S[idx]
  }
  return(fc)
}

fc_mult <- hw_forecast_mult(hw_mult, y, h = 12, s = s)
cat("\n未來 12 期預測值：\n")
print(round(fc_mult, 2))

# 視覺化
df_mult    <- data.frame(t = 1:n, y = y, yhat = hw_mult$yhat)
df_fc_mult <- data.frame(t = (n+1):(n+12), yhat = fc_mult)

p2 <- ggplot() +
  geom_line(data = df_mult, 
            aes(x = t, y = y, color = "實際值"), linewidth = 0.8) +
  geom_line(data = df_mult, 
            aes(x = t, y = yhat, color = "乘法配適"), linewidth = 1) +
  geom_line(data = df_fc_mult, 
            aes(x = t, y = yhat, color = "未來預測"), 
            linewidth = 1, linetype = "dashed") +
  scale_color_manual(
    values = c("實際值"   = "gray50",
               "乘法配適" = "tomato",
               "未來預測" = "steelblue")
  ) +
  labs(title = "題2：乘法模型配適與預測",
       x = "時間", y = "旅客人數", color = "") +
  theme_minimal()
ggsave("HW_multiplicative.png", p2, width=8, height=4, bg="white")


# ============================================================
# 題3：加法 vs. 乘法模型績效比較
# ============================================================
cat("\n=== 題3：模型績效比較 ===\n")
cat(sprintf("%-12s %10s %12s\n", "模型", "MAPE (%)", "MSE"))
cat(sprintf("%-12s %10.4f %12.2f\n", "加法模型", 
            hw_add$mape, hw_add$mse))
cat(sprintf("%-12s %10.4f %12.2f\n", "乘法模型", 
            hw_mult$mape, hw_mult$mse))

# 視覺化對比
df_comp <- data.frame(
  t = 1:n,
  y = y,
  additive = hw_add$yhat,
  multi    = hw_mult$yhat
)

p3 <- ggplot(df_comp, aes(x = t)) +
  geom_line(aes(y = y, color = "實際值"), linewidth = 0.8) +
  geom_line(aes(y = additive, color = "加法模型"), linewidth = 1) +
  geom_line(aes(y = multi, color = "乘法模型"), linewidth = 1) +
  scale_color_manual(
    values = c("實際值"   = "gray50",
               "加法模型" = "steelblue",
               "乘法模型" = "tomato")
  ) +
  labs(title = "題3：加法 vs. 乘法模型比較",
       x = "時間", y = "旅客人數", color = "") +
  theme_minimal()
ggsave("HW_comparison.png", p3, width=8, height=4, bg="white")

