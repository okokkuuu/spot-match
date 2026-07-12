"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getUserId } from "@/lib/session";
import ChatRoom from "@/components/ChatRoom";

export default function ChatPage() {
  const params = useParams<{ roomId: string; matchId: string }>();
  const [userId, setUserId] = useState("");

  useEffect(() => {
    setUserId(getUserId());
  }, []);

  if (!userId) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-brand" />
      </main>
    );
  }

  return (
    <ChatRoom
      roomId={params.roomId}
      matchId={params.matchId}
      userId={userId}
    />
  );
}
