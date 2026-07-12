import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ソノバ | その場でつながる",
  description:
    "その場（イベント・クラブ・コワーキング）にいる人と、話しかけづらさを越えてつながるマッチングアプリ。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0b0b13",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="antialiased">
        <div className="mx-auto flex min-h-[100dvh] w-full max-w-md flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
