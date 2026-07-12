"use client";

import { useState } from "react";
import TagInput from "./TagInput";
import { upsertProfile } from "@/lib/api";
import type { Profile } from "@/lib/types";

export default function ProfileForm({
  roomId,
  userId,
  initial,
  onDone,
}: {
  roomId: string;
  userId: string;
  initial?: Profile | null;
  onDone: (profile: Profile) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("名前（ニックネーム）を入力してください");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const profile = await upsertProfile({
        roomId,
        userId,
        name: name.trim(),
        bio: bio.trim(),
        tags,
      });
      onDone(profile);
    } catch (err) {
      console.error(err);
      setError("保存に失敗しました。通信環境を確認して再度お試しください。");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="flex flex-1 flex-col px-6 py-8">
      <div className="animate-fade-in">
        <p className="text-xs text-white/50">ルーム {roomId}</p>
        <h1 className="mt-1 text-2xl font-bold">
          {initial ? "プロフィールを編集" : "プロフィールを作成"}
        </h1>
        <p className="mt-2 text-sm text-white/60">
          この会場の中でだけ表示されます。気軽にどうぞ。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-1 flex-col gap-5">
        <div>
          <label className="mb-2 block text-sm font-medium text-white/70">
            名前 / ニックネーム
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            placeholder="おっくー"
            className="w-full rounded-2xl border border-base-border bg-base-card px-4 py-3 text-white outline-none transition focus:border-brand"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white/70">
            ひとこと自己紹介
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={120}
            rows={3}
            placeholder="はじめまして！音楽とコーヒーが好きです☕"
            className="w-full resize-none rounded-2xl border border-base-border bg-base-card px-4 py-3 text-white outline-none transition focus:border-brand"
          />
          <p className="mt-1 text-right text-xs text-white/40">
            {bio.length}/120
          </p>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-white/70">
            好きなもの・タグ
          </label>
          <TagInput value={tags} onChange={setTags} />
        </div>

        {error && <p className="text-sm text-brand-soft">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="mt-auto w-full rounded-2xl bg-gradient-to-r from-brand to-accent py-4 text-lg font-bold text-white shadow-lg shadow-brand/20 transition active:scale-[0.98] disabled:opacity-60"
        >
          {saving ? "保存中…" : initial ? "更新する" : "この内容で入場する"}
        </button>
      </form>
    </main>
  );
}
