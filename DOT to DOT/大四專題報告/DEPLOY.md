# Dot to Dot — 線上 Live Demo 部署指南

Dot to Dot 是全端專案（React + Node.js + SQLite + Socket.io）。已設定為 **單一服務部署**：Express 同時提供 API、Socket.io 與前端靜態檔。

## 一鍵部署（Render，推薦）

1. 將本 repo push 到 GitHub
2. 前往 [Render Dashboard](https://dashboard.render.com/) → **New** → **Blueprint**
3. 連接 `MCintheHOWSE/ai-engineer-preparation`
4. Render 會讀取 `DOT to DOT/大四專題報告/render.yaml` 並建立服務
5. 部署完成後，網址類似：`https://dot-to-dot-xxxx.onrender.com`

### 環境變數（通常自動設定即可）

| Key | 說明 |
|-----|------|
| `NODE_ENV` | `production`（render.yaml 已設定） |
| `JWT_SECRET` | 隨機字串（render.yaml 自動產生） |
| `CLIENT_URL` | 選填；未設定時會用 `RENDER_EXTERNAL_URL` |

### 測試帳號

- Email：`admin@scu.edu.tw`
- 密碼：`admin123`
- 首次啟動會自動建立 demo 管理員帳號

> **注意：** Render 免費方案會休眠，首次開啟需等待約 30–60 秒。SQLite 資料在重新部署後會重置，但 demo 帳號會自動重建。

---

## 部署後更新作品集 README

在根目錄 `README.md` 的 Live Demos 表格，把 Dot to Dot 的 Demo 欄改成你的 Render 網址，例如：

```markdown
| Dot to Dot 校園平台 | [Live Demo](https://dot-to-dot-xxxx.onrender.com) · [原始碼](./DOT%20to%20DOT/大四專題報告/) | ...
```

---

## 本地開發

```bash
cd "DOT to DOT/大四專題報告"
npm install
node server/index.js    # 終端 1 → http://localhost:3000
npm run dev             # 終端 2 → http://localhost:5173
```

本地開發時前端走 Vite proxy（`/api` → `:3000`），Socket.io 連到 `localhost:3000`。

## 本地模擬正式環境

```bash
npm run build
set NODE_ENV=production   # PowerShell: $env:NODE_ENV="production"
npm start
# → http://localhost:3000（前後端同一 port）
```

---

## 備選：螢幕錄影 Demo

若暫時不部署，可提供：

1. **GitHub 原始碼**（本 repo）
2. **2–3 分鐘錄影**展示物流議價、Socket.io 即時通知
3. **[DEMO_GUIDE.md](./DEMO_GUIDE.md)** 給面試官本地跑的起始步驟
