# Todo App

**所有與此專案相關的內容都在這個資料夾** — 程式碼、Phase 1/2 學習紀錄、Supabase / Git / Vercel 設定、Cursor Prompt。

> **Live Demo：** [https://ai-engineer-preparation.vercel.app](https://ai-engineer-preparation.vercel.app)  
> **GitHub：** [MCintheHOWSE/ai-engineer-preparation](https://github.com/MCintheHOWSE/ai-engineer-preparation)

![Mobile preview](./docs/screenshot.svg)

---

## 專案演進

| 階段 | 重點 | 學習紀錄 |
|------|------|----------|
| **Phase 1** | localStorage、AI review、Vercel | [`docs/phase-01-plan.md`](./docs/phase-01-plan.md) |
| **Phase 2** | Supabase Auth、PostgreSQL、RLS | [`docs/phase-02-plan.md`](./docs/phase-02-plan.md) |

---

## 目前功能（Phase 2）

- 註冊 / 登入 / 登出
- Todo CRUD（Supabase PostgreSQL）
- 篩選、批量新增、清除已完成
- RLS 資料隔離、錯誤提示

---

## 快速開始

```bash
cd todo-app
copy .env.example .env.local
npm install
npm.cmd run dev
```

---

## 文件索引（全在 `docs/`）

| 文件 | 用途 |
|------|------|
| [`phase-01-plan.md`](./docs/phase-01-plan.md) | Phase 1 學習計畫與交付 |
| [`phase-02-plan.md`](./docs/phase-02-plan.md) | Phase 2 學習計畫與交付 |
| [`SETUP-SUPABASE.md`](./docs/SETUP-SUPABASE.md) | Supabase 專案與金鑰設定 |
| [`SETUP-GITHUB.md`](./docs/SETUP-GITHUB.md) | Git、GitHub、Vercel 部署 |
| [`PROMPTS.md`](./docs/PROMPTS.md) | Phase 1 Cursor prompt |
| [`PROMPTS-phase02.md`](./docs/PROMPTS-phase02.md) | Phase 2 Cursor prompt |

---

## 專案結構

```
todo-app/
├── README.md              ← 你在這（專案總覽）
├── docs/                  ← 所有文件
├── supabase/schema.sql
└── src/
    ├── app/auth/
    ├── components/
    └── lib/
```

---

## AI Workflow 摘要

**Phase 1：** hydration 安全、篩選 UX、批量新增 AI review  
**Phase 2：** localStorage → Supabase、`todo-repository.ts` 分層、RLS

詳見各 phase 文件與 git history。
