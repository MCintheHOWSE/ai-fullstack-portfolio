import AuthStatus from "@/components/AuthStatus";
import TodoApp from "@/components/TodoApp";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white">
      <div className="mx-auto max-w-xl px-3 pt-6 sm:px-6">
        <AuthStatus />
      </div>
      <TodoApp />
    </main>
  );
}
