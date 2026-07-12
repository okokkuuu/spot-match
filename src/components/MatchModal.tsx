"use client";

export default function MatchModal({
  otherName,
  onOpenChat,
  onClose,
}: {
  otherName: string;
  onOpenChat: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-sm animate-pop-in rounded-3xl border border-base-border bg-gradient-to-b from-base-card to-[#1c1424] p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 text-5xl">💞</div>
        <h2 className="bg-gradient-to-r from-brand to-accent bg-clip-text text-3xl font-extrabold text-transparent">
          マッチング成立！
        </h2>
        <p className="mt-3 text-white/70">
          <span className="font-semibold text-white">{otherName}</span> さんと
          お互いに「いいね」しました。
        </p>
        <p className="mt-1 text-sm text-white/50">
          さっそくDMで話しかけてみましょう。
        </p>

        <button
          onClick={onOpenChat}
          className="mt-6 w-full rounded-2xl bg-gradient-to-r from-brand to-accent py-4 text-lg font-bold text-white shadow-lg shadow-brand/20 transition active:scale-[0.98]"
        >
          DMを送る
        </button>
        <button
          onClick={onClose}
          className="mt-2 w-full rounded-2xl py-3 text-sm text-white/50 transition hover:text-white"
        >
          あとで
        </button>
      </div>
    </div>
  );
}
