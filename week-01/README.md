# Week 01 — AI 工程師準備計畫

目標：熟悉 **Cursor + Git + Next.js + Tailwind + Vercel**，完成第一個可部署的 Todo App，建立「AI 生成 → 人工 review → 修正 → 上線」的工作流。

對齊職缺：[SourceCode Intelligence — AI 應用開發工程師](https://www.104.com.tw/job/903xc)

---

## 本週交付成果

- [x] Next.js 專案 scaffold（`my-first-ai-app/`）
- [x] 可運作的 Todo App（新增、刪除、完成切換、localStorage）
- [x] GitHub repo + 至少 3 次有意義的 commit（進行中：第 2 次 commit）
- [ ] Vercel 部署 + live demo URL
- [ ] 能清楚說明：哪些 code 是 AI 寫的、你改了什麼

---

## 7 天每日計畫

### Day 1 — 環境與 Cursor 初體驗

**目標**：專案能在本機跑起來，理解 Next.js App Router 基本結構。

**Checklist**
- [ ] 安裝 Node.js（建議 LTS）、Git、Cursor
- [ ] 進入 `my-first-ai-app`，執行 `npm run dev`
- [ ] 瀏覽 `src/app/page.tsx`、`src/components/TodoApp.tsx`
- [ ] 用 Cursor 問：「這個 Todo App 的資料流是怎麼運作的？」
- [ ] 改一個小地方（例如標題文字），確認 hot reload 正常

**Cursor 練習 Prompt**
```
請解釋這個 Next.js 專案中 page.tsx、TodoApp.tsx、todos.ts 各自負責什麼。
用繁體中文，並指出哪些是 Client Component、為什麼需要 "use client"。
```

---

### Day 2 — Git / GitHub 工作流

**目標**：把專案推到 GitHub，養成 commit 習慣。

**Checklist**
- [ ] 在 GitHub 建立新 repo（例如 `week01-todo-app`）
- [ ] `git init` → `git add .` → 第一次 commit
- [ ] 至少再做 2 次 commit（例如：調整 UI、修正 bug）
- [ ] README 補上本地執行方式

**Commit 訊息範例**
```
feat: add todo app with localStorage persistence
style: improve empty state and filter tabs
docs: document AI vs hand-edited changes
```

**Cursor 練習 Prompt**
```
幫我 review 這次改動，列出：
1. 可能的 bug
2. 命名或結構可以更好的地方
3. 是否適合拆成更小的 commit
```

---

### Day 3 — React 狀態與 localStorage

**目標**：理解 Todo App 核心邏輯，能獨立修改功能。

**Checklist**
- [ ] 讀懂 `src/lib/todos.ts` 的 load / save / filter
- [ ] 理解 hydration：為什麼要等 `isReady` 才寫入 localStorage
- [ ] 自己加一個小功能（例如：清除所有已完成）
- [ ] 重新整理頁面，確認資料還在

**Cursor 練習 Prompt**
```
在 TodoApp 加一個「清除已完成」按鈕：
- 只刪除 completed === true 的項目
- 按鈕在沒有已完成項目時 disabled
- 維持現有 Tailwind 風格
```

**驗收標準**
- 新增、刪除、切換完成狀態都正常
- 篩選（全部 / 未完成 / 已完成）正確
- 重新整理後資料不消失

---

### Day 4 — Tailwind UI 打磨

**目標**：讓作品看起來像「能交付的 MVP」，不是教學範例。

**Checklist**
- [ ] 調整配色、間距、hover 狀態
- [ ] 優化 mobile 版面（375px 寬度測試）
- [ ] 加 keyboard 體驗（Enter 新增已有，可再加 Esc 清空輸入）
- [ ] 截圖存到 README 或 `docs/screenshot.png`

**Cursor 練習 Prompt**
```
請只調整 TodoApp 的 Tailwind class，不要改邏輯：
- 更現代、乾淨的卡片風格
- 更好的空狀態視覺
- 保持無障礙（button 有 aria-label）
```

---

### Day 5 — AI Code Review 練習

**目標**：模擬 SourceCode Intelligence 最看重的能力——**review AI 生成的 code**。

**Checklist**
- [ ] 請 Cursor 生成一個「批量新增 todo」功能
- [ ] **不要直接 accept**，自己找出至少 3 個問題並修正
- [ ] 在 README 記錄：AI 原本寫什麼、你改了什麼、為什麼

**常見 AI code 問題（刻意找這些）**
- 沒處理空字串 / 重複項目
- hydration mismatch（在 render 時讀 localStorage）
- 缺少 key、型別不完整
- 過度抽象（不需要的 helper）

**Cursor 練習 Prompt**
```
請為 TodoApp 加入「貼上多行文字，一次新增多個 todo」功能。
完成後，請列出這段 code 可能的 edge case，不要只給 happy path。
```

---

### Day 6 — 部署到 Vercel

**目標**：取得 live demo URL，這是作品集的第一個公開連結。

**Checklist**
- [ ] 確認 `npm run build` 成功
- [ ] 到 [vercel.com](https://vercel.com) 用 GitHub 登入
- [ ] Import 你的 repo → Framework 選 Next.js → Deploy
- [ ] 把 live URL 填進 `my-first-ai-app/README.md`
- [ ] 用手機開啟 demo，實際操作一遍

**Vercel 部署步驟**
1. Push 最新 code 到 GitHub `main` 分支
2. Vercel → **Add New Project** → 選你的 repo
3. Root Directory 設為 `week-01/my-first-ai-app`（若 repo 根目錄就是專案則留空）
4. Build Command: `npm run build`（預設即可）
5. Deploy 完成後複製 `*.vercel.app` URL

---

### Day 7 — 複盤與 Week 2 預告

**目標**：整理本週成果，準備進入 Supabase 階段。

**Checklist**
- [ ] README 補齊：技術棧、AI workflow、live demo
- [ ] 用 3 分鐘向自己 demo：從新增 todo 到重新整理仍保留
- [ ] 寫下本週學到的 3 件事 + 下週要學的 1 件事
- [ ] （可選）把 repo 連結放進履歷或 Notion 作品集

**Week 2 預告**
- Next.js + Supabase Auth
- 資料從 localStorage 升級到 PostgreSQL
- 第一個「像 SaaS」的 mini 產品

---

## Cursor 工作流（本週必練）

```
1. 描述需求（要具體：檔案、行為、限制）
2. 讓 AI 生成 / 修改 code
3. 自己讀一遍，跑 npm run dev 測試
4. 找 bug、改命名、刪多餘抽象
5. commit → push → deploy
```

**好的 Prompt 特徵**
- 指定檔案（例如「只改 TodoApp.tsx」）
- 說明不要動什麼（例如「不要改 localStorage key」）
- 要求解釋 edge case，不是只要 code

---

## 本週完成後，你應該能回答

1. Next.js App Router 的 `page.tsx` 和 Client Component 差在哪？
2. 為什麼 localStorage 要在 `useEffect` 讀寫？
3. 你如何用 Cursor 生成 code，又如何 review 它？
4. 你的 live demo URL 是什麼？

---

## 專案位置

```
week-01/
├── README.md                 ← 本文件（7 天計畫）
└── my-first-ai-app/          ← Next.js Todo App
    ├── README.md             ← 專案說明 + AI workflow 紀錄
    └── src/
        ├── app/
        ├── components/
        └── lib/
```

本地執行：

```bash
cd week-01/my-first-ai-app
npm install
npm run dev
```

瀏覽 [http://localhost:3000](http://localhost:3000)
