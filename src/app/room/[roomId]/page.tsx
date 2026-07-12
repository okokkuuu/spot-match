"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getMyProfile } from "@/lib/api";
import { getUserId } from "@/lib/session";
import type { Profile } from "@/lib/types";
import ProfileForm from "@/components/ProfileForm";
import RoomView from "@/components/RoomView";

export default function RoomPage() {
  const params = useParams<{ roomId: string }>();
  const roomId = params.roomId;

  const [userId, setUserId] = useState("");
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    setUserId(getUserId());
  }, []);

  useEffect(() => {
    if (!userId || !roomId) return;
    getMyProfile(roomId, userId)
      .then((p) => setProfile(p))
      .catch((e) => {
        console.error(e);
        setProfile(null);
      });
  }, [userId, roomId]);

  // 8桁チェック（不正なIDでの直アクセス対策）
  if (!/^\d{8}$/.test(roomId)) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="text-white/70">この場所IDは正しくありません。</p>
        <a href="/" className="mt-4 text-brand-soft underline">
          トップに戻る
        </a>
      </main>
    );
  }

  if (profile === undefined || !userId) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-brand" />
      </main>
    );
  }

  if (profile === null || editing) {
    return (
      <ProfileForm
        roomId={roomId}
        userId={userId}
        initial={editing ? profile : null}
        onDone={(p) => {
          setProfile(p);
          setEditing(false);
        }}
      />
    );
  }

  return (
    <RoomView
      roomId={roomId}
      userId={userId}
      myProfile={profile}
      onEditProfile={() => setEditing(true)}
    />
  );
}
