"use client";

import Link from "next/link";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import {
  deleteCompletedTodos,
  deleteTodoById,
  fetchTodos,
  insertTodos,
  updateTodoCompleted,
} from "@/lib/todo-repository";
import {
  Todo,
  TodoFilter,
  filterTodos,
  parseBulkTodoLines,
} from "@/lib/todos";

const FILTERS: { value: TodoFilter; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "active", label: "未完成" },
  { value: "completed", label: "已完成" },
];

export default function TodoApp() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<TodoFilter>("all");
  const [busy, setBusy] = useState(false);

  const loadTodos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTodos();
      setTodos(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "讀取待辦失敗");
      setTodos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!user) {
      setTodos([]);
      setError(null);
      return;
    }
    loadTodos();
  }, [authReady, user, loadTodos]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setInput("");
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const visibleTodos = useMemo(
    () => filterTodos(todos, filter),
    [todos, filter],
  );

  const activeCount = todos.filter((todo) => !todo.completed).length;
  const completedCount = todos.length - activeCount;
  const lineCount = parseBulkTodoLines(input).length;
  const canEdit = Boolean(user) && !busy;

  async function runAction(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
    } catch (err) {
      setError(err instanceof Error ? err.message : "操作失敗");
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!user) return;

    const lines = parseBulkTodoLines(input);
    if (lines.length === 0) return;

    await runAction(async () => {
      const created = await insertTodos(lines, user.id);
      setTodos((current) => [...created, ...current]);
      setInput("");
    });
  }

  function handleInputKeyDown(event: ReactKeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  async function toggleTodo(id: string) {
    const target = todos.find((todo) => todo.id === id);
    if (!target) return;

    await runAction(async () => {
      await updateTodoCompleted(id, !target.completed);
      setTodos((current) =>
        current.map((todo) =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo,
        ),
      );
    });
  }

  async function deleteTodo(id: string) {
    await runAction(async () => {
      await deleteTodoById(id);
      setTodos((current) => current.filter((todo) => todo.id !== id));
    });
  }

  async function clearCompleted() {
    await runAction(async () => {
      await deleteCompletedTodos();
      setTodos((current) => current.filter((todo) => !todo.completed));
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-3 py-8 sm:px-6 sm:py-12">
      <header className="space-y-3 text-center sm:text-left">
        <p className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold tracking-wide text-indigo-700">
          Todo App · AI Engineer Prep
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
          我的 Todo List
        </h1>
        <p className="text-sm leading-6 text-zinc-600">
          登入後待辦同步至 Supabase PostgreSQL，跨裝置共用。
        </p>
      </header>

      {!user && authReady && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-800">
          請先{" "}
          <Link href="/auth/login" className="font-medium underline">
            登入
          </Link>{" "}
          或{" "}
          <Link href="/auth/signup" className="font-medium underline">
            註冊
          </Link>{" "}
          才能新增與同步待辦。
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-lg shadow-indigo-100/50 ring-1 ring-zinc-100">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 border-b border-zinc-100 bg-zinc-50/50 p-4"
        >
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleInputKeyDown}
            rows={2}
            placeholder={
              user
                ? "輸入一筆待辦，或每行一筆貼上多行…"
                : "請先登入再新增待辦"
            }
            disabled={!canEdit}
            aria-label="新增待辦事項"
            className="min-h-11 resize-y rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-zinc-100"
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-zinc-400">
              Enter 新增 · Shift+Enter 換行 · Esc 清空
              {lineCount > 1 ? ` · 將新增 ${lineCount} 筆` : ""}
              {busy ? " · 同步中..." : ""}
            </p>
            <button
              type="submit"
              disabled={!canEdit || lineCount === 0}
              className="min-h-11 shrink-0 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {lineCount > 1 ? `新增 ${lineCount} 筆` : "新增"}
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-2 border-b border-zinc-100 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                aria-pressed={filter === item.value}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                  filter === item.value
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={clearCompleted}
            disabled={!canEdit || completedCount === 0}
            aria-label="清除所有已完成的待辦事項"
            className="min-h-8 rounded-full border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 disabled:cursor-not-allowed disabled:border-zinc-200 disabled:text-zinc-400 disabled:hover:bg-transparent sm:ml-auto"
          >
            清除已完成
          </button>
        </div>

        <ul className="divide-y divide-zinc-100">
          {!authReady || (user && loading) ? (
            <li className="px-4 py-10 text-center text-sm text-zinc-500">
              <span className="inline-block h-5 w-5 animate-pulse rounded-full bg-indigo-200" />
              <p className="mt-3">載入中...</p>
            </li>
          ) : !user ? (
            <li className="px-4 py-12 text-center">
              <p className="text-sm font-medium text-zinc-700">尚未登入</p>
              <p className="mt-1 text-xs text-zinc-500">
                登入後即可在雲端建立待辦清單。
              </p>
            </li>
          ) : visibleTodos.length === 0 ? (
            <li className="px-4 py-12 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-2xl">
                ✎
              </div>
              <p className="text-sm font-medium text-zinc-700">
                {filter === "all"
                  ? "還沒有待辦事項"
                  : filter === "active"
                    ? "沒有未完成項目"
                    : "沒有已完成項目"}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {filter === "all"
                  ? "從上方輸入框新增第一筆吧。"
                  : "切換篩選或新增新的待辦。"}
              </p>
            </li>
          ) : (
            visibleTodos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-indigo-50/40"
              >
                <button
                  type="button"
                  onClick={() => toggleTodo(todo.id)}
                  disabled={busy}
                  aria-label={todo.completed ? "標記為未完成" : "標記為完成"}
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:opacity-50 ${
                    todo.completed
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-zinc-300 bg-white text-transparent hover:border-indigo-400"
                  }`}
                >
                  ✓
                </button>
                <span
                  className={`flex-1 break-words text-sm leading-relaxed ${
                    todo.completed
                      ? "text-zinc-400 line-through"
                      : "text-zinc-800"
                  }`}
                >
                  {todo.text}
                </span>
                <button
                  type="button"
                  onClick={() => deleteTodo(todo.id)}
                  disabled={busy}
                  aria-label={`刪除待辦：${todo.text}`}
                  className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400 disabled:opacity-50"
                >
                  刪除
                </button>
              </li>
            ))
          )}
        </ul>

        <footer className="flex flex-col gap-1 border-t border-zinc-100 bg-zinc-50/80 px-4 py-3 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <span>共 {todos.length} 項</span>
          <span>{activeCount} 項待完成</span>
        </footer>
      </section>
    </div>
  );
}
