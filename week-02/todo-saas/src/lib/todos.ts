export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
};

export type TodoFilter = "all" | "active" | "completed";

export type DbTodoRow = {
  id: string;
  user_id: string;
  text: string;
  completed: boolean;
  created_at: string;
};

export function mapDbTodo(row: DbTodoRow): Todo {
  return {
    id: row.id,
    text: row.text,
    completed: row.completed,
    createdAt: new Date(row.created_at).getTime(),
  };
}

export function filterTodos(todos: Todo[], filter: TodoFilter): Todo[] {
  switch (filter) {
    case "active":
      return todos.filter((todo) => !todo.completed);
    case "completed":
      return todos.filter((todo) => todo.completed);
    default:
      return todos;
  }
}

/** Parse pasted multi-line text into unique, non-empty todo lines. */
export function parseBulkTodoLines(text: string): string[] {
  const seen = new Set<string>();

  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => {
      if (!line || seen.has(line)) return false;
      seen.add(line);
      return true;
    });
}
