# ソノバ（Sonoba）— その場でつながるオフラインマッチングMVP

「その場（イベント・クラブ・コワーキングなど）にいるのに話しかけづらい」という機会損失をなくすためのWebアプリのMVPです。8桁の場所ID（ルーム）に入場した人同士が、簡易プロフィール＆タグで互いを知り、**いいね → 相互マッチ → リアルタイムDM**まで完結できます。ログイン不要（セッション保存）で、すぐにテストできます。

## 主な機能

- **ルーム入場**: トップで8桁の場所IDを入力、またはQRコード（`/room/{8桁ID}` 形式のURL）から自動入場。
- **簡易プロフィール＆タグ**: 名前・ひとこと・好きなものタグを登録（ユーザー登録／ログイン不要。ブラウザに保存したセッションIDで識別）。
- **ルーム内ユーザー一覧**: 同じルームの参加者をカード表示。オンライン表示付き（Realtime反映）。
- **いいね／マッチング**: 気になる人に「いいね」。相互いいねで「マッチング成立！」ポップアップ。
- **リアルタイムDM**: マッチした相手とだけ1対1チャット。メッセージは即時反映。

## 技術スタック

- **フロント**: Next.js 15 (App Router) / TypeScript / Tailwind CSS（モバイルファースト）
- **バックエンド/DB/リアルタイム**: Supabase（Postgres + Realtime）。追加サーバ不要でブラウザから直接アクセス。
- **ホスティング**: Vercel（無料）

---

## セットアップ手順

### 1. Supabase プロジェクトを作成

1. <https://supabase.com> でアカウント作成 → 「New project」で無料プロジェクトを作成（リージョンは `Northeast Asia (Tokyo)` 推奨）。
2. プロジェクトができたら、左メニューの **SQL Editor** を開く。
3. 本リポジトリの [`supabase/schema.sql`](./supabase/schema.sql) の中身を全部貼り付けて **Run**。テーブル・RPC・RLS・Realtime設定が一括で入ります。
4. 左メニュー **Project Settings → API** から次の2つをコピー:
   - **Project URL**（例: `https://xxxx.supabase.co`）
   - **anon public** キー
   > この2つは「ブラウザに公開される前提」の公開値です。**service_role キーは絶対に使わない／共有しないでください。**

### 2. 環境変数を設定

`.env.local.example` をコピーして `.env.local` を作成し、上でコピーした値を貼り付けます。

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

### 3. ローカルで起動

```bash
npm install
npm run dev
```

ブラウザで <http://localhost:3000> を開き、適当な8桁ID（例: `12345678`）で入場 → プロフィール登録。
2人でのマッチングを試すには、**別のブラウザ or シークレットウィンドウ**でもう1人分を開いて、同じIDに入場し、お互いに「いいね」してください。

---

## デプロイ（Vercel・無料）

1. 本プロジェクトをGitHubリポジトリにpush。
2. <https://vercel.com> でGitHubアカウント連携 → 「Add New… → Project」→ 当該リポジトリを **Import**。
3. **Environment Variables** に以下を追加:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy** を押す。数分でライブURL（例: `https://your-app.vercel.app`）が発行されます。
5. 発行されたURLにスマホ／PCからアクセスして動作確認。QRコードで配布する場合は、会場ごとに `https://your-app.vercel.app/room/12345678` のようなURLをQR化してください（アプリ内「招待」ボタンからも各ルームのQRを表示できます）。

---

## ディレクトリ構成

```
offline-match/
├─ supabase/schema.sql        # DBスキーマ / RPC / RLS / Realtime 設定
├─ src/
│  ├─ app/
│  │  ├─ page.tsx             # トップ（8桁ID入力）
│  │  ├─ room/[roomId]/page.tsx           # プロフィール登録 or ユーザー一覧
│  │  └─ room/[roomId]/chat/[matchId]/page.tsx  # 1対1 DM
│  ├─ components/             # UI（ProfileForm, UserCard, MatchModal, ChatRoom ほか）
│  ├─ hooks/                  # Realtime購読（useRoomMembers / useMatches / useMessages）
│  └─ lib/                    # supabase client / session / api ヘルパー / types
```

---

## セキュリティに関する注意（重要）

このMVPは **テストを素早く回すため**、ログイン不要かつ Supabase の RLS を寛容な（誰でも読み書きできる）ポリシーにしています。そのため、DMの厳密なアクセス制御はクライアント側チェックのみで、匿名キーを知っていれば理論上データにアクセスできます。**一般公開の本番運用には向きません。**

本番化する場合は、少なくとも次を推奨します:

- Supabase Auth（匿名認証やマジックリンク等）を導入し、`auth.uid()` を使った厳格なRLSに変更（自分が当事者のマッチ／メッセージのみ read/write 可能に）。
- レート制限・不適切利用対策・ブロック／通報機能の追加。

---

## ライセンス / 補足

MVP・検証用途のサンプル実装です。自由に改変してご利用ください。
