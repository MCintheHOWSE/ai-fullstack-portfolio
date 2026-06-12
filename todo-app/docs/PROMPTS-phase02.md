# Phase 2 — 給 Cursor 的 Prompt 範本

---

## 一次性完整 Prompt（Phase 2）

```
我在做 Todo App Phase 2（Next.js 16 + Supabase Auth + PostgreSQL + RLS）。

專案路徑：todo-app/
Phase 1 紀錄：docs/phase-01-plan.md（同一專案迭代）

請一次完成（或指定 Day 範圍）：

【Auth】
- Email 註冊 / 登入 / 登出
- middleware session 刷新
- 首頁顯示登入狀態

【資料】
- todos 存 Supabase，不用 localStorage
- 新增時帶 auth.uid() 為 user_id
- CRUD + 篩選 + 批量新增 + 清除已完成（保留 Phase 1 功能）

【安全】
- 依賴 RLS，不要在前端暴露 service_role key
- 不要關閉 RLS

【限制】
- 只改 todo-app 內必要檔案
- 維持現有 Tailwind 風格
- npm run build 要通過

【交付】
- 更新 todo-app/README.md（Phase 1 vs 2 差異、AI review 紀錄）
- 給 commit message 建議
```

---

## 分段 Prompt

### Day 2 — Auth
```
檢查 todo-app 的 login / signup / logout：
列出 bug、session 是否正確、未登入時 UX 是否清楚。
```

### Day 3 — 遷移 Supabase
```
把 TodoApp 從 localStorage 改成 Supabase CRUD。
保留篩選、批量新增、清除已完成。錯誤要顯示給使用者。
```

### Day 4 — 安全 Review
```
Review todo-app 的 RLS 與 auth：
- 使用者 A 能否讀到 B 的 todo？
- 有沒有把 secret 放在 client？
- 列出至少 3 個風險與修正建議。
```

---

## 你的 Prompt 風格（可補充）

```
例：「進 week 2」「一次做完整」「D3 done」
→ 簡短指令 + 信任 agent 補完細節
```
