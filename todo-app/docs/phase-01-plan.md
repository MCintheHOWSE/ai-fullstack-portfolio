# Phase 1 — AI 工程師準備計畫 ✅ 已完成

目標：熟悉 **Cursor + Git + Next.js + Tailwind + Vercel**，完成第一個可部署的 Todo App，建立「AI 生成 → 人工 review → 修正 → 上線」的工作流。

對齊職缺：[SourceCode Intelligence — AI 應用開發工程師](https://www.104.com.tw/job/903xc)

**Live Demo：** [https://ai-engineer-preparation.vercel.app](https://ai-engineer-preparation.vercel.app)

---

## 本週交付成果

- [x] Next.js 專案 scaffold（`todo-app/`）
- [x] 可運作的 Todo App（新增、刪除、完成切換、localStorage、批量新增、清除已完成）
- [x] GitHub repo + 至少 3 次有意義的 commit
- [x] Vercel 部署 + live demo URL
- [x] 能清楚說明：哪些 code 是 AI 寫的、你改了什麼

---

## 7 天每日計畫（完成狀態）

### Day 1 — 環境與 Cursor 初體驗 ✅

- [x] 安裝 Node.js、Git、Cursor
- [x] `npm run dev` 跑起來
- [x] 理解 `page.tsx`、`TodoApp.tsx` 結構
- [x] 用 Cursor 問資料流、改小地方確認 hot reload

### Day 2 — Git / GitHub 工作流 ✅

- [x] 推到 GitHub（monorepo `ai-engineer-preparation`）
- [x] 多次有意義 commit
- [x] README 補本地執行方式

### Day 3 — React 狀態與 localStorage ✅

- [x] 讀懂 `todos.ts` load / save / filter
- [x] 理解 `isReady` hydration
- [x] 「清除已完成」按鈕
- [x] 重新整理資料保留

### Day 4 — Tailwind UI 打磨 ✅

- [x] 配色、間距、hover、陰影卡片
- [x] 375px mobile 版面
- [x] Esc 清空輸入 + 提示文字
- [x] 截圖 → `docs/screenshot.svg`

### Day 5 — AI Code Review 練習 ✅

- [x] 批量新增 todo 功能
- [x] 找出 5 個 AI 初稿問題並修正
- [x] README 記錄 AI vs 人工修正

### Day 6 — 部署到 Vercel ✅

- [x] `npm run build` 成功
- [x] Vercel 部署（Root: `todo-app`）
- [x] Live URL 寫進 README
- [x] 手機實測

### Day 7 — 複盤 ✅

- [x] README 補齊技術棧、AI workflow、live demo
- [x] 3 分鐘自我 demo
- [x] 複盤寫入 `README.md`
- [ ] （可選）放進履歷 / Notion

---

## 給 Cursor 的 Prompt 範本

見 [`PROMPTS.md`](./PROMPTS.md) — 含**一次性完整 prompt**，適合「一次做完整」的工作方式。

---

## 本週完成後，你應該能回答

1. **page.tsx vs Client Component？** — `page.tsx` 預設 Server Component；需要 state / 事件要 `"use client"`。
2. **為什麼 localStorage 在 useEffect？** — SSR 沒有 `window`，過早讀寫會 hydration mismatch。
3. **如何 review AI code？** — 查空輸入、換行、disabled、型別、是否該抽到 `lib/`。
4. **Live demo URL？** — [https://ai-engineer-preparation.vercel.app](https://ai-engineer-preparation.vercel.app)

---

## 專案位置

```
todo-app/
├── README.md                 ← 專案總覽
├── docs/phase-01-plan.md     ← 本文件
└── src/
```

本地執行：

```bash
cd todo-app
npm install
npm run dev
```

---

## Phase 2 預告

- Next.js + **Supabase Auth**
- localStorage → **PostgreSQL**
- 第一個「像 SaaS」的 mini 產品
