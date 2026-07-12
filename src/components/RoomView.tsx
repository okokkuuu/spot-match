"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Match, Profile } from "@/lib/types";
import { useRoomMembers } from "@/hooks/useRoomMembers";
import { useMatches } from "@/hooks/useMatches";
import { heartbeat, listMyLikes, sendLike } from "@/lib/api";
import UserCard from "./UserCard";
import MatchesBar from "./MatchesBar";
import MatchModal from "./MatchModal";
import RoomQR from "./RoomQR";

const HEARTBEAT_MS = 25_000;

export default function RoomView({
  roomId,
  userId,
  myProfile,
  onEditProfile,
}: {
  roomId: string;
  userId: string;
  myProfile: Profile;
  onEditProfile: () => void;
}) {
  const router = useRouter();
  const { members, loading } = useRoomMembers(roomId);
  const { matches, newMatch, clearNewMatch, refresh: refreshMatches } =
    useMatches(roomId, userId);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [showQR, setShowQR] = useState(false);

  // 自分がいいね済みの相手を取得
  useEffect(() => {
    listMyLikes(roomId, userId)
      .then((ids) => setLikedIds(new Set(ids)))
      .catch((e) => console.error(e));
  }, [roomId, userId]);

  // 在室ハートビート
  useEffect(() => {
    heartbeat(roomId, userId).catch(() => {});
    const t = setInterval(() => {
      heartbeat(roomId, userId).catch(() => {});
    }, HEARTBEAT_MS);
    return () => clearInterval(t);
  }, [roomId, userId]);

  const membersMap = useMemo(() => {
    const map = new Map<string, Profile>();
    members.forEach((m) => map.set(m.user_id, m));
    return map;
  }, [members]);

  const others = useMemo(
    () => members.filter((m) => m.user_id !== userId),
    [members, userId]
  );

  const handleLike = useCallback(
    async (profile: Profile) => {
      // 楽観的に「いいね済み」表示
      setLikedIds((prev) => new Set(prev).add(profile.user_id));
      try {
        const res = await sendLike(roomId, userId, profile.user_id);
        if (res.matched) {
          // Realtimeが取りこぼしてもマッチ一覧を反映
          refreshMatches();
        }
      } catch (e) {
        console.error(e);
        // 失敗したら戻す
        setLikedIds((prev) => {
          const next = new Set(prev);
          next.delete(profile.user_id);
          return next;
        });
      }
    },
    [roomId, userId, refreshMatches]
  );

  const newMatchOtherName = useMemo(() => {
    if (!newMatch) return "";
    const otherId =
      newMatch.user_a === userId ? newMatch.user_b : newMatch.user_a;
    return membersMap.get(otherId)?.name ?? "お相手";
  }, [newMatch, userId, membersMap]);

  const openChatFor = (m: Match) => {
    clearNewMatch();
    router.push(`/room/${roomId}/chat/${m.id}`);
  };

  return (
    <main className="flex flex-1 flex-col px-5 py-6">
      {/* ヘッダー */}
      <header className="mb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/" className="text-white/40 hover:text-white">
              ‹
            </Link>
            <h1 className="text-xl font-bold">ルーム {roomId}</h1>
          </div>
          <p className="mt-0.5 text-xs text-white/50">
            この場所にいる {members.length} 人
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowQR(true)}
            className="rounded-full border border-base-border bg-white/5 px-3 py-2 text-xs text-white/70 transition hover:border-brand"
          >
            招待
          </button>
          <button
            onClick={onEditProfile}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-brand to-accent text-sm font-bold text-white"
            aria-label="プロフィール編集"
          >
            {myProfile.name.slice(0, 1)}
          </button>
        </div>
      </header>

      <MatchesBar
        matches={matches}
        membersMap={membersMap}
        myUserId={userId}
        roomId={roomId}
      />

      {/* ユーザー一覧 */}
      <div className="flex-1">
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl bg-base-card"
              />
            ))}
          </div>
        ) : others.length === 0 ? (
          <div className="mt-16 text-center text-white/50">
            <div className="text-4xl">👋</div>
            <p className="mt-3">まだあなただけです。</p>
            <p className="mt-1 text-sm">
              「招待」からこのルームをシェアして、
              <br />
              その場の人を誘ってみましょう。
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {others.map((p) => (
              <UserCard
                key={p.user_id}
                profile={p}
                liked={likedIds.has(p.user_id)}
                onLike={handleLike}
              />
            ))}
          </div>
        )}
      </div>

      {newMatch && (
        <MatchModal
          otherName={newMatchOtherName}
          onOpenChat={() => openChatFor(newMatch)}
          onClose={clearNewMatch}
        />
      )}

      {showQR && <RoomQR roomId={roomId} onClose={() => setShowQR(false)} />}
    </main>
  );
}
