"use client";

import Link from "next/link";
import type { Match, Profile } from "@/lib/types";

export default function MatchesBar({
  matches,
  membersMap,
  myUserId,
  roomId,
}: {
  matches: Match[];
  membersMap: Map<string, Profile>;
  myUserId: string;
  roomId: string;
}) {
  if (matches.length === 0) return null;

  return (
    <div className="mb-5">
      <p className="mb-2 text-sm font-semibold text-white/70">
        マッチ中 <span className="text-brand-soft">{matches.length}</span>
      </p>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
        {matches.map((m) => {
          const otherId = m.user_a === myUserId ? m.user_b : m.user_a;
          const other = membersMap.get(otherId);
          const name = other?.name ?? "お相手";
          return (
            <Link
              key={m.id}
              href={`/room/${roomId}/chat/${m.id}`}
              className="flex w-16 shrink-0 flex-col items-center gap-1"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent text-lg font-bold text-white ring-2 ring-brand/40">
                {name.slice(0, 1)}
              </div>
              <span className="w-full truncate text-center text-xs text-white/60">
                {name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
