# Todo App

單一作品集專案，內含 **Week 1 → Week 2** 的完整演進：從 localStorage 入門，升級到 Supabase 登入 + 雲端同步。

> **Live Demo：** [https://ai-engineer-preparation.vercel.app](https://ai-engineer-preparation.vercel.app) *(Vercel Root 改為 `todo-app` 後更新)*  
> **GitHub：** [MCintheHOWSE/ai-engineer-preparation](https://github.com/MCintheHOWSE/ai-engineer-preparation)

![Mobile preview](./docs/screenshot.svg)

---

## 目前功能（最新版 = Week 2）

- Email 註冊 / 登入 / 登出
- Todo CRUD → **Supabase PostgreSQL**
- 篩選、批量新增、清除已完成
- **RLS** 資料隔離（只能看到自己的 todo）
- Loading、錯誤提示、未登入分流

---

## 專案演進（在同一個 repo 裡區分）

| 階段 | 重點 | 技術 | 學習紀錄 |
|------|------|------|----------|
| **Week 1** | AI 輔助入門、localStorage | Next.js, Tailwind, localStorage | [`docs/week-01-plan.md`](./docs/week-01-plan.md) |
| **Week 2** | 升級 mini SaaS、雲端同步 | Supabase Auth, PostgreSQL, RLS | [`docs/week-02-plan.md`](./docs/week-02-plan.md) |

程式碼是**同一條線迭代**：Week 2 在 Week 1 功能上加上 Auth + Supabase，不再維護兩份獨立 app。

---

## 技術棧

| 項目 | 選擇 |
|------|------|
| 框架 | Next.js 16 (App Router) |
| 語言 | TypeScript |
| 樣式 | Tailwind CSS 4 |
| 認證 | Supabase Auth |
| 資料庫 | PostgreSQL（Supabase） |
| 安全 | Row Level Security |
| 部署 | Vercel |

---

## 本地執行

```bash
cd todo-app
copy .env.example .env.local   # 填入 Supabase 金鑰
npm install
npm.cmd run dev                # Windows PowerShell 用 npm.cmd
```

- 首頁：http://localhost:3000
- 註冊：http://localhost:3000/auth/signup

Supabase 設定：[`docs/SETUP-SUPABASE.md`](./docs/SETUP-SUPABASE.md)

---

## 專案結構

```
todo-app/
├── README.md                 ← 本文件（專案總覽）
├── docs/
│   ├── week-01-plan.md       ← Week 1 學習計畫與交付
│   ├── week-02-plan.md       ← Week 2 學習計畫與交付
│   ├── SETUP-SUPABASE.md     ← Supabase 設定
│   ├── PROMPTS.md            ← Week 1 Cursor prompt
│   ├── PROMPTS-week02.md     ← Week 2 Cursor prompt
│   └── screenshot.svg
├── supabase/schema.sql
└── src/
    ├── app/auth/
    ├── components/
    └── lib/
```

---

## AI Workflow 紀錄

### Week 1 重點修正

- Hydration 安全（`isReady` + `useEffect` 讀寫 storage）
- 篩選 tabs、空狀態、資料驗證
- 批量新增 AI review（`\r\n`、空行、去重）

### Week 2 重點修正

- localStorage → Supabase CRUD
- 未登入 disable UI
- CRUD 抽到 `todo-repository.ts`
- RLS 依賴 `auth.uid()`，不靠前端信任

詳見各週文件與 git commit 歷史。

---

## 部署 Vercel

1. Push 到 GitHub
2. Vercel → Import repo
3. **Root Directory：** `todo-app`
4. 環境變數：`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Supabase Auth Redirect：`https://你的網域.vercel.app/auth/callback`

---

## Cursor Prompt 範本

- Week 1：[`docs/PROMPTS.md`](./docs/PROMPTS.md)
- Week 2：[`docs/PROMPTS-week02.md`](./docs/PROMPTS-week02.md)
