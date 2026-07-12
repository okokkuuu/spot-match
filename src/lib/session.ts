// ログイン不要のセッション識別子。初回訪問時に UUID を発行し localStorage に保存する。
const STORAGE_KEY = "offline-match:user-id";

export function getUserId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : fallbackUuid();
    window.localStorage.setItem(STORAGE_KEY, id);
  }
  return id;
}

// 古い環境向けフォールバック
function fallbackUuid(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
