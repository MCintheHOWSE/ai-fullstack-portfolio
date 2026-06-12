# Phase 1 — 給 Cursor 的 Prompt 範本

> 把下面範本貼給 Cursor，一次說清楚「要做什麼、改哪裡、不要動什麼、怎麼驗收」。

---

## 一次性完整 Prompt（推薦）

```
我在做 Todo App Phase 1（Next.js 16 + TypeScript + Tailwind + localStorage）。

專案路徑：todo-app/（Phase 1 紀錄，見 docs/phase-01-plan.md）
主要檔案：
- src/components/TodoApp.tsx（UI + 互動）
- src/lib/todos.ts（型別、localStorage、工具函式）

請一次完成以下需求，不要改 unrelated 檔案：

【功能】
1. 單筆新增（Enter / 按鈕）
2. 批量新增：貼多行文字，每行一筆 todo
3. 完成切換、單筆刪除、清除已完成（無已完成時 disabled）
4. 篩選：全部 / 未完成 / 已完成
5. localStorage 持久化

【限制】
- 不要改 STORAGE_KEY
- localStorage 只能在 client mount 後讀寫（避免 hydration mismatch）
- 批量解析抽到 todos.ts，要處理 \r\n、空行、同批次重複

【UI】
- 只改 Tailwind class，維持簡潔卡片風格
- 支援 375px 手機寬度
- Esc 清空輸入
- button 要有 aria-label

【交付】
- 更新 todo-app/README.md：列出 AI 生成 vs 人工修正
- npm run build 要通過
- 給我 commit message 建議
```

---

## 分段 Prompt（想一步一步練時）

### Day 3 — 小功能
```
在 TodoApp.tsx 加「清除已完成」按鈕：
- 只刪除 completed === true
- 沒有已完成時 disabled
- 維持現有 Tailwind 風格，不要改 localStorage key
```

### Day 4 — 只改 UI
```
請只調整 TodoApp.tsx 的 Tailwind class，不要改邏輯：
- 更現代卡片風格、更好空狀態
- 375px mobile 友善
- 加 Esc 清空輸入的提示
- 保持 aria-label
```

### Day 5 — AI Review 練習
```
為 TodoApp 加入「貼多行文字，一次新增多個 todo」。
完成後列出至少 5 個 edge case（空行、Windows 換行、重複、disabled 等）。
不要把解析邏輯全塞在 component——抽到 todos.ts。
```

---

## 好 Prompt 的 4 個要素

| 要素 | 範例 |
|------|------|
| **範圍** | 「只改 `TodoApp.tsx` 和 `todos.ts`」 |
| **行為** | 「每行一筆，空行略過，同批次去重」 |
| **限制** | 「不要改 STORAGE_KEY」「不要動 layout.tsx」 |
| **驗收** | 「build 要過」「README 要記 AI vs 人工修正」 |

---

## 你實際怎麼下 Prompt？

在下方補充你自己的寫法，面試或複盤時可以舉例：

```
（在這裡貼你給 Cursor 的 prompt）
```
