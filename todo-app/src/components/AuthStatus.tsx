"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function AuthStatus() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  }

  if (loading) {
    return (
      <p className="text-center text-xs text-zinc-500 sm:text-left">
        檢查登入狀態...
      </p>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-2 text-sm sm:flex-row sm:items-center">
        <p className="text-zinc-600">
          登入後 todo 將同步到 Supabase（跨裝置）
        </p>
        <div className="flex gap-2">
          <Link
            href="/auth/login"
            className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-indigo-500"
          >
            登入
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-full border border-indigo-200 px-4 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-50"
          >
            註冊
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-zinc-600">
        已登入：<span className="font-medium text-zinc-800">{user.email}</span>
      </p>
      <button
        type="button"
        onClick={handleLogout}
        className="rounded-full border border-zinc-300 px-4 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100"
      >
        登出
      </button>
    </div>
  );
}
