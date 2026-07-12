"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { listMembers } from "@/lib/api";
import type { Profile } from "@/lib/types";

// ルーム内メンバー一覧を Realtime で購読する。
// profiles テーブルに変更があるたびに一覧を取り直す（MVP向けのシンプルな実装）。
export function useRoomMembers(roomId: string) {
  const [members, setMembers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const list = await listMembers(roomId);
      setMembers(list);
    } catch (e) {
      console.error("[useRoomMembers] refresh error", e);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    if (!roomId) return;
    refresh();

    const channel = supabase
      .channel(`room-members:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `room_id=eq.${roomId}`,
        },
        () => {
          refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId, refresh]);

  return { members, loading, refresh };
}
