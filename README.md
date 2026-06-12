# AI Engineer Portfolio — 許鈞富

> Projects built with **AI-first workflow** (Cursor, Claude, GitHub Copilot) + human review & fixes.

**GitHub:** [MCintheHOWSE/ai-engineer-preparation](https://github.com/MCintheHOWSE/ai-engineer-preparation)

---

## Live Demos（可點開試玩）

| 專案 | Demo | 技術棧 | AI 工具 |
|------|------|--------|---------|
| Todo App | [Live Demo](https://ai-engineer-preparation.vercel.app) | Next.js 16, Supabase, PostgreSQL, RLS | Cursor |
| Dot to Dot 校園平台 | [GitHub 原始碼](./DOT%20to%20DOT/大四專題報告/) · [本地 Demo 指南](./DOT%20to%20DOT/大四專題報告/DEMO_GUIDE.md) | React, Node.js, SQLite, Socket.io | 傳統開發 + Cursor 輔助重構 |
| F1 LINE Bot | [GitHub 原始碼](./linebot專案/f1_bot/) | Python, Dialogflow, LINE API | Cursor |

---

## 專案說明

### 1. Todo App — AI 輔助全端（Week 1 → Week 2 單一專案）

一個 Todo 作品集，內含兩階段演進，不再拆成兩個 repo 資料夾：

| 階段 | 內容 |
|------|------|
| **Week 1** | localStorage、AI review、Vercel 部署 |
| **Week 2** | Supabase 登入、PostgreSQL、RLS 雲端同步 |

📁 [`todo-app`](./todo-app) · Week 1 計畫 [`week-01/README.md`](./week-01/README.md) · Week 2 計畫 [`week-02/README.md`](./week-02/README.md)

### 2. Dot to Dot (SCU Connect) — 校園共享經濟平台

大四專題：共乘媒合、校園物流、跑腿服務、美食團購。

- React + Express + SQLite + Socket.io 即時通知
- 零知識支付、能力過濾、實報實銷議價

📁 [`DOT to DOT/大四專題報告`](./DOT%20to%20DOT/大四專題報告)

**本地試玩：**

```bash
cd "DOT to DOT/大四專題報告"
npm install
node server/index.js          # 終端 1 → http://localhost:3000
npm run dev                   # 終端 2 → http://localhost:5173
```

測試帳號：`admin@scu.edu.tw` / `admin123`

### 3. F1 LINE Bot — 聊天機器人

F1 賽事資訊 LINE Bot，整合 Dialogflow NLU。

📁 [`linebot專案/f1_bot`](./linebot專案/f1_bot)

---

## AI Development Workflow

```
需求描述 → Cursor/Claude 生成初稿 → 人工 code review → 修正邊界案例 → commit → deploy
```

**Review 時我會檢查：**

- Client/Server boundary、型別完整性
- 空輸入、錯誤處理、安全性（不 commit `.env`）
- UI 在行動裝置是否正常
- AI 常見陷阱：hydration mismatch、硬編碼 localhost、缺少資料驗證

---

## 技能對照

| 職缺要求 | 對應作品 |
|----------|----------|
| AI 開發工具實戰 | Todo App（Cursor 全流程，見 `todo-app/docs/`） |
| React / Next.js | Todo App、Dot to Dot 前端 |
| Node.js / Python | Dot to Dot 後端、F1 LINE Bot |
| 能讀懂並修正 AI code | Todo App README 的 Week 1/2 紀錄 |
| LINE Bot / API 整合 | F1 LINE Bot |
| Portfolio + Demo | 本 repo + Vercel Live Demo |

---

## 聯絡

- GitHub: [@MCintheHOWSE](https://github.com/MCintheHOWSE)
- Email: mcconshell@gmail.com
