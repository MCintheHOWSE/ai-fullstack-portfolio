# Week 02 Todo SaaS

Week 01 localStorage Todo 的升級版：**Supabase Auth + PostgreSQL + RLS**。

> **Live Demo：** *部署後填入*  
> **GitHub：** [MCintheHOWSE/ai-engineer-preparation](https://github.com/MCintheHOWSE/ai-engineer-preparation)（monorepo，`week-02/todo-saas`）

---

## 功能

- Email 註冊 / 登入 / 登出
- Todo CRUD 存 **Supabase PostgreSQL**（非 localStorage）
- 篩選、批量新增、清除已完成
- **RLS**：使用者只能看到自己的 todo
- 錯誤提示、Loading、未登入分流

---

## 技術棧

| 項目 | Week 01 | Week 02 |
|------|---------|---------|
| 框架 | Next.js 16 | Next.js 16 |
| 儲存 | localStorage | PostgreSQL（Supabase） |
| 認證 | 無 | Supabase Auth |
| 安全 | — | Row Level Security |

---

## 本地執行

```bash
copy .env.example .env.local   # 填入 Supabase URL + anon key
npm install
npm.cmd run dev                # Windows PowerShell 若 npm 被擋，用 npm.cmd
```

- 首頁：http://localhost:3000
- 註冊：http://localhost:3000/auth/signup

設定步驟：[`../SETUP-SUPABASE.md`](../SETUP-SUPABASE.md)

---

## 專案結構

```
supabase/schema.sql         # todos 表 + RLS
src/lib/supabase/           # client、server、middleware
src/lib/todo-repository.ts  # Supabase CRUD
src/lib/todos.ts            # 型別、filter、批量解析
src/components/TodoApp.tsx  # UI（需登入才能編輯）
src/app/auth/               # login、signup、callback
```

---

## AI Workflow 紀錄

### AI 生成

- Supabase Auth 頁面骨架
- `schema.sql` RLS policies 初稿
- Todo CRUD 透過 `supabase.from('todos')` 的基本寫法

### 人工修正

| # | 問題 | 修正 |
|---|------|------|
| 1 | 未登入仍可寫入 localStorage | 改 Supabase + 未登入 disable UI |
| 2 | 深色模式輸入框白字白底 | `text-zinc-900` + globals `input` 樣式 |
| 3 | CRUD 邏輯塞在 component | 抽到 `todo-repository.ts` |
| 4 | 操作失敗 silent fail | `error` state + 紅色提示 |
| 5 | `user_id` 只靠前端傳 | 依賴 RLS `auth.uid() = user_id` 驗證 |

---

## 部署 Vercel

1. Push 到 GitHub `main`
2. Vercel → Import `ai-engineer-preparation`
3. **Root Directory：** `week-02/todo-saas`
4. **Environment Variables：**
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Supabase → **Authentication** → **URL Configuration**
   - Site URL：`https://你的-app.vercel.app`
   - Redirect URLs：`https://你的-app.vercel.app/auth/callback`
6. Deploy 後把 URL 貼到本文件頂部

---

## Week 02 複盤

### 學到 3 件事

1. **Auth + DB**：登入狀態用 Supabase session；todo 帶 `user_id` 寫入 PostgreSQL。
2. **RLS**：即使前端帶錯 `user_id`，policy 仍擋掉越權存取。
3. **Repository 分層**：UI component 不直接塞 SQL/Supabase 細節，方便 review。

### 下週（Week 3 預告）

- Server Actions 或 API route 重構
- Supabase Realtime 即時同步

Prompt 範本：[`../PROMPTS.md`](../PROMPTS.md)
