# Week 01 Todo App

第一個 AI 輔助開發練習專案：用 **Next.js + TypeScript + Tailwind** 做的 Todo List，資料存在 **localStorage**。

> Live Demo：[https://ai-engineer-preparation.vercel.app](https://ai-engineer-preparation.vercel.app)

---

## 功能

- 新增待辦事項（Enter 或按鈕）
- 標記完成 / 取消完成
- 刪除單筆待辦
- 篩選：全部 / 未完成 / 已完成
- 重新整理後資料保留（localStorage）
- 統計：總數與待完成數量

---

## 技術棧

| 項目 | 選擇 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 語言 | TypeScript |
| 樣式 | Tailwind CSS 4 |
| 狀態 | React useState + useEffect |
| 持久化 | localStorage |
| 部署 | Vercel（建議） |

---

## 本地執行

```bash
npm install
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)

建置驗證：

```bash
npm run build
npm start
```

---

## 專案結構

```
src/
├── app/
│   ├── layout.tsx      # 全站 layout、metadata
│   ├── page.tsx        # 首頁，渲染 TodoApp
│   └── globals.css
├── components/
│   └── TodoApp.tsx     # Todo UI 與互動邏輯（Client Component）
└── lib/
    └── todos.ts        # 型別、localStorage、filter 工具
```

---

## AI Workflow 紀錄

這個專案刻意練習 **「AI 生成 → 人工 review → 修正」** 流程，對齊 SourceCode Intelligence 的 AI-native 開發方式。

### AI 生成部分（Cursor / Agent 協助）

- Next.js 專案 scaffold（`create-next-app`）
- Todo 基本 CRUD 結構（state、form submit、list render）
- Tailwind 卡片式 UI 初稿
- `todos.ts` 基本型別與 localStorage 讀寫函式

### 人工調整部分（至少 3 處）

| # | 調整內容 | 為什麼要改 |
|---|----------|------------|
| 1 | **Hydration 安全載入**：用 `isReady` flag，等 client mount 後才讀寫 localStorage | 避免 SSR/CSR 不一致，AI 常直接在 render 讀 storage |
| 2 | **篩選 tabs**（全部 / 未完成 / 已完成）+ 對應空狀態文案 | 超越基本 todo，展示產品思維與 UX |
| 3 | **`loadTodos` 資料驗證**：parse 後 filter 非法項目 | 防止 localStorage 被手動改壞導致 crash |
| 4 | **統計 footer** + checkbox aria-label | 可交付感與無障礙細節 |

### Review AI Code 時我會檢查

- [ ] 空輸入、重複提交
- [ ] Client/Server boundary（`"use client"` 是否必要）
- [ ] localStorage 是否在正確時機讀寫
- [ ] 型別是否完整
- [ ] UI 在 mobile 是否正常

---

## 部署到 Vercel

1. Push 此專案到 GitHub
2. [vercel.com](https://vercel.com) → New Project → Import repo
3. 若 monorepo，Root Directory 設 `week-01/my-first-ai-app`
4. Deploy 後把 URL 貼到本文件頂部 Live Demo

---

## 下一步（Week 2）

- 將 localStorage 換成 **Supabase + PostgreSQL**
- 加入 **登入 / 註冊**
- 做成 mini SaaS 作品集

---

## 授權

個人學習與作品集用途。
