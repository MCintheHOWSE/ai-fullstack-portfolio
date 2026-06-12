# Supabase 設定指南 — Week 02

## 目前狀態

| 項目 | 狀態 |
|------|------|
| Todo App 專案 | 已完成（`todo-app`） |
| Supabase schema SQL | 已準備（`todo-app/supabase/schema.sql`） |
| Auth 頁面骨架 | 已準備（`/auth/login`、`/auth/signup`） |
| **Supabase 雲端專案** | **你要手動建立** |
| **`.env.local`** | **你要填入金鑰** |

---

## 第一步：建立 Supabase 專案

1. 到 [supabase.com](https://supabase.com) 註冊 / 登入
2. **New Project**
   - Name：`todo-saas`（或自訂）
   - Database Password：記下來（之後很少用到）
   - Region：選離你最近的（例如 Northeast Asia）
3. 等專案建立完成（約 1–2 分鐘）

---

## 第二步：取得 API 金鑰

Supabase Dashboard → **Project Settings** → **API**

複製：
- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> 不要複製 `service_role` key 到前端或 commit 進 git。

---

## 第三步：建立資料表（執行 SQL）

Dashboard → **SQL Editor** → **New query**

貼上 `todo-app/supabase/schema.sql` 的全部內容 → **Run**

應建立：
- `todos` 資料表
- RLS policies（使用者只能 CRUD 自己的 todo）

---

## 第四步：本機環境變數

在 `todo-app/`：

```powershell
cd todo-app
copy .env.example .env.local
```

編輯 `.env.local`，填入你的 URL 和 anon key：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

---

## 第五步：啟動專案

```powershell
npm install
npm run dev
```

開啟 [http://localhost:3000](http://localhost:3000)

1. 到 `/auth/signup` 註冊測試帳號
2. 登入後回首頁
3. （Day 3 後）確認 todo 寫進 Supabase

---

## 第六步：Email 確認設定（開發用）

預設 Supabase 會寄確認信。開發階段可暫時關閉：

**Authentication** → **Providers** → **Email** → 關閉 **Confirm email**

上線前再依需求打開。

---

## 第七步：Vercel 部署時

Vercel 專案 → **Settings** → **Environment Variables**：

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | 你的 Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 你的 anon key |

Supabase → **Authentication** → **URL Configuration**：

- **Site URL**：`https://你的-vercel-app.vercel.app`
- **Redirect URLs**：加上 `https://你的-vercel-app.vercel.app/auth/callback`

---

## 常見問題

**`Invalid API key`？**  
檢查 `.env.local` 是否貼對、重開 `npm run dev`。

**註冊後無法登入？**  
確認是否關閉 Confirm email，或去信箱點確認連結。

**todo 存不進去？**  
確認 `schema.sql` 已執行、RLS 已啟用、使用者已登入。

**push 時要 commit `.env.local` 嗎？**  
不要。只 commit `.env.example`。

---

## Week 2 程式已完成

Todo 已改為 Supabase CRUD。本地測試：

1. `npm.cmd run dev`
2. 登入 → 新增 todo → 重新整理 → 資料還在
3. Supabase **Table Editor** → `todos` 應看到資料列

## 部署到 Vercel

1. Push `todo-app/` 到 GitHub
2. Vercel 專案 **Root Directory** 設 `todo-app`
3. 環境變數同上（`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`）
4. Supabase Auth **Redirect URLs** 加入 `https://你的網域.vercel.app/auth/callback`
