import { createClient } from "@/lib/supabase/client";
import { mapDbTodo, type DbTodoRow, type Todo } from "@/lib/todos";

function getClient() {
  return createClient();
}

export async function fetchTodos(): Promise<Todo[]> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("todos")
    .select("id, user_id, text, completed, created_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as DbTodoRow[]).map(mapDbTodo);
}

export async function insertTodo(text: string, userId: string): Promise<Todo> {
  const supabase = getClient();
  const { data, error } = await supabase
    .from("todos")
    .insert({ text: text.trim(), user_id: userId, completed: false })
    .select("id, user_id, text, completed, created_at")
    .single();

  if (error) throw new Error(error.message);
  return mapDbTodo(data as DbTodoRow);
}

export async function insertTodos(
  texts: string[],
  userId: string,
): Promise<Todo[]> {
  const supabase = getClient();
  const rows = texts.map((text) => ({
    text,
    user_id: userId,
    completed: false,
  }));

  const { data, error } = await supabase
    .from("todos")
    .insert(rows)
    .select("id, user_id, text, completed, created_at");

  if (error) throw new Error(error.message);
  return (data as DbTodoRow[]).map(mapDbTodo);
}

export async function updateTodoCompleted(
  id: string,
  completed: boolean,
): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase
    .from("todos")
    .update({ completed })
    .eq("id", id);

  if (error) throw new Error(error.message);
}

export async function deleteTodoById(id: string): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase.from("todos").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteCompletedTodos(): Promise<void> {
  const supabase = getClient();
  const { error } = await supabase
    .from("todos")
    .delete()
    .eq("completed", true);

  if (error) throw new Error(error.message);
}
