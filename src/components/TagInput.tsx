"use client";

import { useState } from "react";

const SUGGESTIONS = [
  "音楽",
  "デザイン",
  "エンジニア",
  "起業",
  "アート",
  "カメラ",
  "旅行",
  "コーヒー",
  "ゲーム",
  "映画",
  "読書",
  "筋トレ",
  "料理",
  "犬派",
  "猫派",
];

export default function TagInput({
  value,
  onChange,
  max = 8,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  max?: number;
}) {
  const [input, setInput] = useState("");

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/^#/, "");
    if (!tag) return;
    if (value.includes(tag)) return;
    if (value.length >= max) return;
    onChange([...value, tag]);
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  const remaining = SUGGESTIONS.filter((s) => !value.includes(s));

  return (
    <div>
      <div className="flex flex-wrap gap-2 rounded-2xl border border-base-border bg-base-card px-3 py-3">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-full bg-brand/20 px-3 py-1 text-sm text-brand-soft"
          >
            #{tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-brand-soft/70 hover:text-white"
              aria-label={`${tag} を削除`}
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag(input);
            } else if (e.key === "Backspace" && !input && value.length) {
              removeTag(value[value.length - 1]);
            }
          }}
          placeholder={value.length >= max ? "上限です" : "タグを追加"}
          disabled={value.length >= max}
          className="min-w-[6rem] flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
        />
      </div>

      {remaining.length > 0 && value.length < max && (
        <div className="mt-2 flex flex-wrap gap-2">
          {remaining.slice(0, 10).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="rounded-full border border-base-border bg-white/5 px-3 py-1 text-xs text-white/60 transition hover:border-brand hover:text-brand-soft"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
