"use client";

import { useState } from "react";
import type { Profile } from "@/lib/types";

const ONLINE_WINDOW_MS = 3 * 60 * 1000; // 3分以内なら「オンライン」

// 名前からアバターの色を決める
function avatarColor(seed: string): string {
  const colors = [
    "from-pink-500 to-rose-500",
    "from-violet-500 to-indigo-500",
    "from-sky-500 to-cyan-500",
    "from-amber-500 to-orange-500",
    "from-emerald-500 to-teal-500",
    "from-fuchsia-500 to-purple-500",
  ];
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return colors[h % colors.length];
}

export default function UserCard({
  profile,
  liked,
  onLike,
}: {
  profile: Profile;
  liked: boolean;
  onLike: (profile: Profile) => Promise<void> | void;
}) {
  const [busy, setBusy] = useState(false);
  const online =
    Date.now() - new Date(profile.last_active).getTime() < ONLINE_WINDOW_MS;

  const handleLike = async () => {
    if (liked || busy) return;
    setBusy(true);
    try {
      await onLike(profile);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="animate-slide-up rounded-2xl border border-base-border bg-base-card p-4">
      <div className="flex items-start gap-3">
        <div className="relative">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor(
              profile.name
            )} text-lg font-bold text-white`}
          >
            {profile.name.slice(0, 1)}
          </div>
          {online && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-base-card bg-emerald-400" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-semibold text-white">{profile.name}</h3>
            {online && (
              <span className="text-[10px] text-emerald-400">● オンライン</span>
            )}
          </div>
          {profile.bio && (
            <p className="mt-0.5 line-clamp-2 text-sm text-white/60">
              {profile.bio}
            </p>
          )}
        </div>

        <button
          onClick={handleLike}
          disabled={liked || busy}
          aria-label="いいね"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl transition active:scale-90 ${
            liked
              ? "bg-brand/20 text-brand"
              : "bg-white/5 text-white/50 hover:bg-brand/10 hover:text-brand"
          }`}
        >
          {liked ? "♥" : "♡"}
        </button>
      </div>

      {profile.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {profile.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-white/60"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
