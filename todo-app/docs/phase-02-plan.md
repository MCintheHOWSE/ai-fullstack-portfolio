# Phase 2 — Todo SaaS（Supabase 版）✅ 已完成

目標：把 Phase 1 的 localStorage Todo，升級成 **登入後跨裝置同步** 的 mini SaaS。

**技術：** Next.js 16 + Supabase Auth + PostgreSQL + RLS

---

## 本週交付成果

- [x] Supabase 專案 + 環境變數
- [x] Email 註冊 / 登入 / 登出
- [x] `todos` 資料表 + RLS
- [x] Todo CRUD 改寫 Supabase
- [x] 錯誤處理 + 未登入 UX
- [ ] Vercel 部署 + live demo URL（你手動部署）

---

## 7 天計畫（完成狀態）

| Day | 主題 | 狀態 |
|-----|------|------|
| 1 | Supabase 設定 | ✅ |
| 2 | Auth | ✅ |
| 3 | DB CRUD | ✅ |
| 4 | RLS / 安全 | ✅（schema + 雙帳號可自測） |
| 5 | UX / 錯誤處理 | ✅ |
| 6 | Vercel 部署 | 待你做 |
| 7 | 複盤 | ✅（見 `todo-app/README.md`） |

---

## 專案位置

```
todo-app/
├── README.md
├── docs/
└── src/
```

```bash
cd todo-app
npm.cmd run dev
```

---

## 部署（Day 6）

1. `git add todo-app/ && git commit && git push`
2. Vercel → Root Directory：`todo-app`
3. 加 Supabase 環境變數
4. Supabase Auth URL 設定加入 Vercel domain

---

## Phase 1 vs Phase 2

| 面向 | Phase 1 | Phase 2 |
|------|---------|---------|
| 儲存 | localStorage | PostgreSQL |
| 登入 | 無 | Supabase Auth |
| 跨裝置 | ❌ | ✅ |
| 資料隔離 | 無 | RLS |
