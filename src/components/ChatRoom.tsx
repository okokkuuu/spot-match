"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getMatch, getProfile, sendMessage } from "@/lib/api";
import { useMessages } from "@/hooks/useMessages";
import type { Match, Profile } from "@/lib/types";

type Access = "loading" | "ok" | "denied";

export default function ChatRoom({
  roomId,
  matchId,
  userId,
}: {
  roomId: string;
  matchId: string;
  userId: string;
}) {
  const [access, setAccess] = useState<Access>("loading");
  const [other, setOther] = useState<Profile | null>(null);
  const { messages } = useMessages(matchId);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // マッチの当事者かを検証し、相手プロフィールを取得
  useEffect(() => {
    if (!userId || !matchId) return;
    let cancelled = false;
    (async () => {
      try {
        const match: Match | null = await getMatch(matchId);
        if (!match || (match.user_a !== userId && match.user_b !== userId)) {
          if (!cancelled) setAccess("denied");
          return;
        }
        const otherId =
          match.user_a === userId ? match.user_b : match.user_a;
        const p = await getProfile(match.room_id, otherId);
        if (!cancelled) {
          setOther(p);
          setAccess("ok");
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) setAccess("denied");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [matchId, userId]);

  // 新着で最下部へスクロール
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    setText("");
    try {
      await sendMessage(matchId, userId, content);
    } catch (err) {
      console.error(err);
      setText(content); // 失敗したら復元
    } finally {
      setSending(false);
    }
  };

  if (access === "loading") {
    return (
      <main className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-brand" />
      </main>
    );
  }

  if (access === "denied") {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="text-4xl">🔒</div>
        <p className="mt-3 text-white/70">
          このDMにはアクセスできません。
        </p>
        <p className="mt-1 text-sm text-white/50">
          マッチが成立した相手とのみDMできます。
        </p>
        <Link
          href={`/room/${roomId}`}
          className="mt-4 text-brand-soft underline"
        >
          ルームに戻る
        </Link>
      </main>
    );
  }

  return (
    <main className="flex h-[100dvh] flex-col">
      {/* ヘッダー */}
      <header className="flex items-center gap-3 border-b border-base-border bg-base-bg/80 px-4 py-3 backdrop-blur">
        <Link href={`/room/${roomId}`} className="text-2xl text-white/50">
          ‹
        </Link>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent font-bold text-white">
          {other?.name?.slice(0, 1) ?? "?"}
        </div>
        <div>
          <h1 className="font-semibold leading-tight">
            {other?.name ?? "お相手"}
          </h1>
          <p className="text-xs text-emerald-400">マッチ成立済み</p>
        </div>
      </header>

      {/* メッセージ */}
      <div className="no-scrollbar flex-1 space-y-2 overflow-y-auto px-4 py-4">
        <p className="mb-2 text-center text-xs text-white/40">
          マッチ成立！ここから会話を始めましょう 🎉
        </p>
        {messages.map((m) => {
          const mine = m.sender === userId;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[78%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2 text-[15px] ${
                  mine
                    ? "rounded-br-sm bg-gradient-to-br from-brand to-accent text-white"
                    : "rounded-bl-sm bg-base-card text-white/90"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* 入力 */}
      <form
        onSubmit={handleSend}
        className="flex items-center gap-2 border-t border-base-border bg-base-bg px-3 py-3"
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="メッセージを入力"
          className="flex-1 rounded-full border border-base-border bg-base-card px-4 py-3 text-white outline-none focus:border-brand"
        />
        <button
          type="submit"
          disabled={!text.trim() || sending}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent text-white transition active:scale-90 disabled:opacity-40"
          aria-label="送信"
        >
          ➤
        </button>
      </form>
    </main>
  );
}
