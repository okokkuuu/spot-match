"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function RoomQR({
  roomId,
  onClose,
}: {
  roomId: string;
  onClose: () => void;
}) {
  const [dataUrl, setDataUrl] = useState("");
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const roomUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/room/${roomId}`
        : "";
    setUrl(roomUrl);
    QRCode.toDataURL(roomUrl, {
      width: 480,
      margin: 2,
      color: { dark: "#0b0b13", light: "#ffffff" },
    })
      .then(setDataUrl)
      .catch((e) => console.error("[RoomQR]", e));
  }, [roomId]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm animate-pop-in rounded-3xl border border-base-border bg-base-card p-6 text-center shadow-2xl">
        <h2 className="text-lg font-bold">このルームに招待</h2>
        <p className="mt-1 text-sm text-white/50">
          QRを読み取るか、リンクを共有すると同じルームに入れます。
        </p>
        <div className="mx-auto mt-4 w-fit rounded-2xl bg-white p-3">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt="ルームQRコード" className="h-52 w-52" />
          ) : (
            <div className="h-52 w-52 animate-pulse rounded bg-black/10" />
          )}
        </div>
        <p className="mt-3 text-2xl font-bold tracking-[0.3em] text-brand-soft">
          {roomId}
        </p>
        <button
          onClick={copy}
          className="mt-4 w-full rounded-2xl border border-base-border bg-white/5 py-3 text-sm font-medium text-white transition hover:border-brand"
        >
          {copied ? "コピーしました ✓" : "リンクをコピー"}
        </button>
        <button
          onClick={onClose}
          className="mt-2 w-full rounded-2xl py-2 text-sm text-white/50 hover:text-white"
        >
          閉じる
        </button>
      </div>
    </div>
  );
}
