"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase";

export default function HomePage() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [error, setError] = useState("");

  const handleEnter = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = roomId.trim();
    if (!/^\d{8}$/.test(trimmed)) {
      setError("8桁の数字を入力してください");
      return;
    }
    setError("");
    router.push(`/room/${trimmed}`);
  };

  return (
    <main className="flex flex-1 flex-col justify-center px-6 py-10">
      <div className="animate-fade-in">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-base-border bg-base-card/60 px-3 py-1 text-xs text-white/60">
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand" />
          その場で、つながる
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight">
          ソノバ
        </h1>
        <p className="mt-3 leading-relaxed text-white/70">
          いま同じ場所にいる人と、話しかけづらさを越えて出会う。
          会場の<span className="font-semibold text-brand-soft">8桁の場所ID</span>
          を入れて入場しよう。
        </p>
      </div>

      <form onSubmit={handleEnter} className="mt-8 animate-slide-up">
        <label className="mb-2 block text-sm font-medium text-white/70">
          場所ID（8桁）
        </label>
        <input
          inputMode="numeric"
          pattern="\d*"
          maxLength={8}
          value={roomId}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "").slice(0, 8);
            setRoomId(v);
            if (error) setError("");
          }}
          placeholder="12345678"
          className="w-full rounded-2xl border border-base-border bg-base-card px-4 py-4 text-center text-2xl font-semibold tracking-[0.3em] text-white outline-none transition focus:border-brand"
        />
        {error && (
          <p className="mt-2 text-sm text-brand-soft">{error}</p>
        )}
        <button
          type="submit"
          className="mt-4 w-full rounded-2xl bg-gradient-to-r from-brand to-accent py-4 text-center text-lg font-bold text-white shadow-lg shadow-brand/20 transition active:scale-[0.98]"
        >
          このルームに入場する
        </button>
      </form>

      <div className="mt-8 space-y-3 text-sm text-white/50">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs">
            1
          </span>
          <p>会場のQRコードを読み取ると、自動でそのルームに入れます。</p>
        </div>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs">
            2
          </span>
          <p>登録は名前・ひとこと・タグだけ。ログイン不要ですぐ始められます。</p>
        </div>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs">
            3
          </span>
          <p>お互いに「いいね」でマッチ成立 → その場でDMできます。</p>
        </div>
      </div>

      {!isSupabaseConfigured && (
        <p className="mt-8 rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-xs text-yellow-200/80">
          ⚠️ Supabase が未接続です。<code>.env.local</code> に
          NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。
        </p>
      )}
    </main>
  );
}
