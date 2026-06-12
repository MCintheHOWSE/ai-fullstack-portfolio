# Dot to Dot — 線上 Demo 部署指南

Dot to Dot 是全端專案（React + Node.js + SQLite + Socket.io），要上線需要 **前端 + 後端** 各部署一個服務。

## 方案 A：Render（推薦，免費方案可試）

### 1. 後端（Web Service）

1. [render.com](https://render.com) → New → Web Service
2. 連接 GitHub repo，Root Directory 設：`DOT to DOT/大四專題報告`
3. Build Command：`npm install`
4. Start Command：`node server/index.js`
5. 環境變數：

| Key | Value |
|-----|-------|
| `PORT` | `3000` |
| `CLIENT_URL` | `https://你的前端網址.onrender.com` |
| `JWT_SECRET` | 隨機長字串 |
| `GMAIL_USER` | （選填，驗證信功能） |
| `GMAIL_PASS` | （選填） |

### 2. 前端（Static Site）

1. New → Static Site，同一個 repo
2. Root Directory：`DOT to DOT/大四專題報告`
3. Build Command：`npm install && npm run build`
4. Publish Directory：`dist`
5. 環境變數：

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://你的後端網址.onrender.com` |

### 3. 更新前端 API 呼叫

部署前需將 `src/` 內的 `http://localhost:3000` 改為使用 `src/config.js` 的 `api()` 函式（已建立基礎設定檔）。

---

## 方案 B：求職 Demo — 本地試玩 + 錄影

若來不及部署，可提供：

1. **GitHub 原始碼**（本 repo）
2. **2–3 分鐘螢幕錄影**（Loom / OBS）展示物流議價、Socket.io 即時通知
3. **DEMO_GUIDE.md** 給面試官本地跑的起始步驟

測試帳號：`admin@scu.edu.tw` / `admin123`

---

## 本地快速啟動

```bash
npm install
node server/index.js    # 終端 1
npm run dev             # 終端 2 → http://localhost:5173
```
