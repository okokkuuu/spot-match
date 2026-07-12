"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { listMyMatches } from "@/lib/api";
import type { Match } from "@/lib/types";

// 自分が当事者のマッチを購読。新しくマッチが成立したら newMatch にセット（ポップアップ用）。
export function useMatches(roomId: string, userId: string) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [newMatch, setNewMatch] = useState<Match | null>(null);
  const knownIds = useRef<Set<string>>(new Set());
  const initialized = useRef(false);

  const refresh = useCallback(async () => {
    if (!roomId || !userId) return;
    try {
      const list = await listMyMatches(roomId, userId);
      list.forEach((m) => knownIds.current.add(m.id));
      setMatches(list);
      initialized.current = true;
    } catch (e) {
      console.error("[useMatches] refresh error", e);
    }
  }, [roomId, userId]);

  useEffect(() => {
    if (!roomId || !userId) return;
    refresh();

    const channel = supabase
      .channel(`room-matches:${roomId}:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "matches",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const m = payload.new as Match;
          // 自分が当事者のマッチのみ対象
          if (m.user_a !== userId && m.user_b !== userId) return;
          if (knownIds.current.has(m.id)) return;
          knownIds.current.add(m.id);
          setMatches((prev) => [m, ...prev]);
          // 初期ロード完了後のマッチだけポップアップ
          if (initialized.current) {
            setNewMatch(m);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, userId, refresh]);

  const clearNewMatch = useCallback(() => setNewMatch(null), []);

  return { matches, newMatch, clearNewMatch, refresh };
}
