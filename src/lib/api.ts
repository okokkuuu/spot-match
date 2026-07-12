import { supabase } from "./supabase";
import type { Match, Message, Profile } from "./types";

// ---- プロフィール ----------------------------------------------------------

export async function upsertProfile(params: {
  roomId: string;
  userId: string;
  name: string;
  bio: string;
  tags: string[];
}): Promise<Profile> {
  const { roomId, userId, name, bio, tags } = params;
  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        room_id: roomId,
        user_id: userId,
        name,
        bio,
        tags,
        last_active: new Date().toISOString(),
      },
      { onConflict: "room_id,user_id" }
    )
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function getMyProfile(
  roomId: string,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("room_id", roomId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile) ?? null;
}

// 任意ユーザーのプロフィールを取得（相手の表示名など）
export async function getProfile(
  roomId: string,
  userId: string
): Promise<Profile | null> {
  return getMyProfile(roomId, userId);
}

export async function listMembers(roomId: string): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("room_id", roomId)
    .order("last_active", { ascending: false });
  if (error) throw error;
  return (data as Profile[]) ?? [];
}

export async function heartbeat(roomId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ last_active: new Date().toISOString() })
    .eq("room_id", roomId)
    .eq("user_id", userId);
  if (error) throw error;
}

// ---- いいね / マッチ -------------------------------------------------------

export async function sendLike(
  roomId: string,
  fromUser: string,
  toUser: string
): Promise<{ matched: boolean; matchId: string | null }> {
  const { data, error } = await supabase.rpc("handle_like", {
    p_room: roomId,
    p_from: fromUser,
    p_to: toUser,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return {
    matched: Boolean(row?.matched),
    matchId: row?.match_id ?? null,
  };
}

// 自分が「いいね」した相手の user_id 一覧
export async function listMyLikes(
  roomId: string,
  userId: string
): Promise<string[]> {
  const { data, error } = await supabase
    .from("likes")
    .select("to_user")
    .eq("room_id", roomId)
    .eq("from_user", userId);
  if (error) throw error;
  return (data ?? []).map((r: { to_user: string }) => r.to_user);
}

export async function listMyMatches(
  roomId: string,
  userId: string
): Promise<Match[]> {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("room_id", roomId)
    .or(`user_a.eq.${userId},user_b.eq.${userId}`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as Match[]) ?? [];
}

export async function getMatch(matchId: string): Promise<Match | null> {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", matchId)
    .maybeSingle();
  if (error) throw error;
  return (data as Match) ?? null;
}

// ---- メッセージ ------------------------------------------------------------

export async function listMessages(matchId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as Message[]) ?? [];
}

export async function sendMessage(
  matchId: string,
  sender: string,
  content: string
): Promise<Message> {
  const { data, error } = await supabase
    .from("messages")
    .insert({ match_id: matchId, sender, content })
    .select()
    .single();
  if (error) throw error;
  return data as Message;
}
