"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createTodo,
  filterTodos,
  loadTodos,
  saveTodos,
  type Todo,
  type TodoFilter,
} from "@/lib/todos";

const FILTERS: { id: TodoFilter; label: string }[] = [
  { id: "all", label: "全部" },
  { id: "active", label: "未完成" },
  { id: "completed", label: "已完成" },
];

const EMPTY_MESSAGES: Record<TodoFilter, string> = {
  all: "還沒有待辦事項，新增第一個吧。",
  active: "太棒了，目前沒有未完成項目。",
  completed: "還沒有已完成的待辦。",
};

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

  const activeCount = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos],
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = input.trim();
    if (!text) return;

    setTodos((current) => [createTodo(text), ...current]);
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

  function clearCompleted() {
    setTodos((current) => current.filter((todo) => !todo.completed));
  }

  const completedCount = todos.length - activeCount;

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <header className="mb-6">
          <p className="text-sm font-medium text-indigo-600">Week 01</p>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">
            AI Todo App
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Cursor 練習專案 · localStorage 持久化
          </p>
        </header>

        <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="新增待辦事項..."
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none ring-indigo-500 transition focus:border-indigo-400 focus:ring-2"
            aria-label="待辦事項內容"
          />
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            新增
          </button>
        </form>

        <div className="mb-4 flex gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                filter === item.id
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <ul className="space-y-2">
          {!isReady ? (
            <li className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
              載入中...
            </li>
          ) : visibleTodos.length === 0 ? (
            <li className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
              {EMPTY_MESSAGES[filter]}
            </li>
          ) : (
            visibleTodos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  aria-label={`標記「${todo.text}」為${todo.completed ? "未完成" : "已完成"}`}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span
                  className={`flex-1 text-sm ${
                    todo.completed
                      ? "text-slate-400 line-through"
                      : "text-slate-800"
                  }`}
                >
                  {todo.text}
                </span>
                <button
                  type="button"
                  onClick={() => deleteTodo(todo.id)}
                  className="rounded-lg px-2 py-1 text-xs text-slate-500 transition hover:bg-white hover:text-red-600"
                  aria-label={`刪除「${todo.text}」`}
                >
                  刪除
                </button>
              </li>
            ))
          )}
        </ul>

        <footer className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <span>
            共 {todos.length} 項 · 待完成 {activeCount} 項
          </span>
          <button
            type="button"
            onClick={clearCompleted}
            disabled={completedCount === 0}
            className="rounded-lg px-2 py-1 transition enabled:hover:bg-slate-100 enabled:hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            清除已完成
          </button>
        </footer>
      </div>
    </main>
  );
}
