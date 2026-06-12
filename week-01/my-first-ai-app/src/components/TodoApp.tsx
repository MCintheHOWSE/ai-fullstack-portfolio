"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Todo,
  TodoFilter,
  createTodo,
  filterTodos,
  loadTodos,
  saveTodos,
} from "@/lib/todos";

const FILTERS: { value: TodoFilter; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "active", label: "未完成" },
  { value: "completed", label: "已完成" },
];

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<TodoFilter>("all");
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setTodos(loadTodos());
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;
    saveTodos(todos);
  }, [todos, isReady]);

  const visibleTodos = useMemo(
    () => filterTodos(todos, filter),
    [todos, filter],
  );

  const activeCount = todos.filter((todo) => !todo.completed).length;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = input.trim();
    if (!trimmed) return;

    setTodos((current) => [createTodo(trimmed), ...current]);
    setInput("");
  }

  function toggleTodo(id: string) {
    setTodos((current) =>
      current.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  }

  function deleteTodo(id: string) {
    setTodos((current) => current.filter((todo) => todo.id !== id));
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-10 sm:px-6">
      <header className="space-y-2 text-center sm:text-left">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">
          Week 01 · AI Engineer Prep
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          我的 Todo List
        </h1>
        <p className="text-sm leading-6 text-zinc-600">
          用 Cursor 快速生成，再手動調整 UI 與 localStorage 邏輯。
        </p>
      </header>

      <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 border-b border-zinc-200 p-4 sm:flex-row"
        >
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="輸入待辦事項，按 Enter 新增..."
            className="flex-1 rounded-xl border border-zinc-300 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            新增
          </button>
        </form>

        <div className="flex flex-wrap gap-2 border-b border-zinc-200 px-4 py-3">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                filter === item.value
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <ul className="divide-y divide-zinc-100">
          {!isReady ? (
            <li className="px-4 py-8 text-center text-sm text-zinc-500">
              載入中...
            </li>
          ) : visibleTodos.length === 0 ? (
            <li className="px-4 py-10 text-center">
              <p className="text-sm font-medium text-zinc-700">
                {filter === "all"
                  ? "還沒有待辦事項"
                  : filter === "active"
                    ? "沒有未完成項目"
                    : "沒有已完成項目"}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                從上方輸入框新增第一筆吧。
              </p>
            </li>
          ) : (
            visibleTodos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-3 px-4 py-3 transition hover:bg-zinc-50"
              >
                <button
                  type="button"
                  onClick={() => toggleTodo(todo.id)}
                  aria-label={todo.completed ? "標記為未完成" : "標記為完成"}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                    todo.completed
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-zinc-300 bg-white text-transparent hover:border-indigo-400"
                  }`}
                >
                  ✓
                </button>
                <span
                  className={`flex-1 text-sm ${
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
                  className="rounded-lg px-2 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-50"
                >
                  刪除
                </button>
              </li>
            ))
          )}
        </ul>

        <footer className="flex items-center justify-between border-t border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-500">
          <span>共 {todos.length} 項</span>
          <span>{activeCount} 項待完成</span>
        </footer>
      </section>
    </div>
  );
}
