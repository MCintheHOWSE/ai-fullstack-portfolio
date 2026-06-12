# Git + GitHub + Cursor 連線指南

## 目前狀態（2026-06-12）

| 項目 | 狀態 |
|------|------|
| Git 2.54 / gh 2.93 | 已安裝 |
| Git 身份 | 已設定（許鈞富 / mcconshell@gmail.com） |
| `git init` | 已完成 |
| **gh 登入** | **尚未完成** ← 目前卡關 |
| 本機 commit | **尚無**（檔案仍是 untracked） |
| git remote | **尚未設定** |

> 若你曾在其他終端機 push 過，本機這份資料夾狀態可能不同步。完成 `gh auth login` 後，用下方「登入後一次搞定」指令對齊即可。

---

本機已安裝：
- **Git** 2.54
- **GitHub CLI** (`gh`) 2.93

專案路徑：`week-01/my-first-ai-app`

---

## 第一步：設定 Git 身份（只需做一次）

在 Cursor 終端機（`` Ctrl+` ``）執行，**改成你自己的名字和 GitHub 信箱**：

```powershell
git config --global user.name "你的名字"
git config --global user.email "你的GitHub信箱@example.com"
```

---

## 第二步：登入 GitHub（只需做一次）

```powershell
gh auth login
```

依序選：
1. **GitHub.com**
2. **HTTPS**
3. **Login with a web browser**（會給一串 code，瀏覽器貼上即可）

完成後確認：

```powershell
gh auth status
```

應顯示 `Logged in to github.com`.

**重要：** 這一步必須在 **你自己的 Cursor 終端機**（`` Ctrl+` ``）執行，因為需要瀏覽器授權，我無法代你完成。

登入成功後，立刻執行（讓 git push 走 GitHub 憑證）：

```powershell
gh auth setup-git
```

---

## 登入後一次搞定（commit + remote + push）

`gh auth login` 完成後，在 Cursor 終端機貼上：

```powershell
cd "C:\Users\LG_14T90N\OneDrive\文件\AI engineer preparation\week-01\my-first-ai-app"

git add .
git commit -m "feat: add week01 todo app with localStorage"

# 若 GitHub 上還沒有這個 repo：
gh repo create week01-todo-app --public --source=. --remote=origin --push

# 若 repo 已存在、只差連 remote：
# git remote add origin https://github.com/你的帳號/week01-todo-app.git
# git push -u origin master
```

確認 repo URL：

```powershell
gh repo view week01-todo-app --web
```

---

## 第三步：第一次 commit + 推到 GitHub

```powershell
cd "C:\Users\LG_14T90N\OneDrive\文件\AI engineer preparation\week-01\my-first-ai-app"

git add .
git commit -m "feat: add week01 todo app with localStorage"

# 在 GitHub 建立 repo 並 push（公開、名稱 week01-todo-app）
gh repo create week01-todo-app --public --source=. --remote=origin --push
```

若 repo 名稱想自訂，把 `week01-todo-app` 改成你要的名字。

---

## 第四步：在 Cursor 裡用 Git

1. 左側 **Source Control** 圖示（或 `Ctrl+Shift+G`）
2. 會看到變更的檔案
3. 輸入 commit message → 按 **Commit**
4. 按 **Sync / Push** 推到 GitHub

之後你改 code，我可以幫你改；你在 Source Control 裡 commit + push 即可。

---

## 常見問題

**終端機找不到 `git`？**  
關掉 Cursor 再開一次（讓 PATH 更新），或重開電腦。

**push 要密碼？**  
用 `gh auth login` 登入後，HTTPS push 會走 GitHub CLI 憑證，不需手打密碼。

**之後 F1 Bot 也要上 GitHub？**  
另開一個 repo，例如 `f1-line-bot`，在該資料夾再 `git init` 一次即可。

---

## 連線成功後（Cursor 裡怎麼用）

1. 左側 **Source Control**（`Ctrl+Shift+G`）
2. 看到變更 → 輸入 message → **Commit**
3. 按 **Sync / Push** 推到 GitHub

Repo URL 格式：`https://github.com/<你的帳號>/week01-todo-app`

---

## 下一步（Week 1 Day 2）

- [x] 設定 Git 身份
- [ ] 完成 `gh auth login` + `gh auth setup-git`（**你手動**）
- [ ] 第一次 commit + push
- [ ] 把 GitHub repo URL 貼到 `my-first-ai-app/README.md`
- [ ] 到 [vercel.com](https://vercel.com) Import 這個 repo 部署
