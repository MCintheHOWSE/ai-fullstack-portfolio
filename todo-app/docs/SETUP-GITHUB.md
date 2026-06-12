# Git + GitHub + Vercel — Todo App

> Todo App 相關設定**都在 `todo-app/` 這個資料夾**。本文件放 Git / GitHub / Vercel 步驟。

## 目前狀態

| 項目 | 狀態 |
|------|------|
| GitHub repo | `MCintheHOWSE/ai-engineer-preparation` |
| 專案路徑 | `todo-app/` |
| Vercel Root Directory | `todo-app` |
| Live Demo | https://ai-engineer-preparation.vercel.app |

---

## 本機開發

```powershell
cd todo-app
copy .env.example .env.local
npm install
npm.cmd run dev
```

---

## Push 到 GitHub

```powershell
cd "C:\Users\LG_14T90N\OneDrive\文件\AI engineer preparation"
git add todo-app/
git commit -m "你的訊息"
git push
```

---

## Vercel 部署

1. Import repo `ai-engineer-preparation`
2. **Root Directory：** `todo-app`
3. 環境變數：`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Supabase Auth Redirect：`https://你的網域.vercel.app/auth/callback`

Supabase 設定見 [`SETUP-SUPABASE.md`](./SETUP-SUPABASE.md)

---

## Phase 1 / Phase 2 學習紀錄

| 階段 | 文件 |
|------|------|
| Phase 1 | [`phase-01-plan.md`](./phase-01-plan.md) |
| Phase 2 | [`phase-02-plan.md`](./phase-02-plan.md) |
| Cursor Prompt | [`PROMPTS.md`](./PROMPTS.md)、[`PROMPTS-phase02.md`](./PROMPTS-phase02.md) |
