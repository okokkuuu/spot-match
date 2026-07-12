-- =============================================================
--  オフラインマッチングMVP  スキーマ定義（Supabase / Postgres）
--  Supabase ダッシュボード → SQL Editor に貼り付けて「Run」してください。
--  何度実行しても安全なように、極力冪等（idempotent）に書いています。
-- =============================================================

-- gen_random_uuid() 用（Supabaseでは既定で有効なことが多いが念のため）
create extension if not exists pgcrypto;

-- -------------------------------------------------------------
-- テーブル
-- -------------------------------------------------------------

-- ルーム内のプロフィール兼「在室情報」
create table if not exists public.profiles (
  id          uuid primary key default gen_random_uuid(),
  room_id     text not null,
  user_id     uuid not null,
  name        text not null,
  bio         text not null default '',
  tags        text[] not null default '{}',
  last_active timestamptz not null default now(),
  created_at  timestamptz not null default now(),
  unique (room_id, user_id)
);
create index if not exists profiles_room_idx on public.profiles (room_id);

-- いいね
create table if not exists public.likes (
  id         uuid primary key default gen_random_uuid(),
  room_id    text not null,
  from_user  uuid not null,
  to_user    uuid not null,
  created_at timestamptz not null default now(),
  unique (room_id, from_user, to_user)
);
create index if not exists likes_room_idx on public.likes (room_id);

-- マッチ（相互いいね成立）。user_a < user_b になるよう常にソートして格納
create table if not exists public.matches (
  id         uuid primary key default gen_random_uuid(),
  room_id    text not null,
  user_a     uuid not null,
  user_b     uuid not null,
  created_at timestamptz not null default now(),
  unique (room_id, user_a, user_b)
);
create index if not exists matches_room_idx on public.matches (room_id);
create index if not exists matches_users_idx on public.matches (user_a, user_b);

-- DMメッセージ
create table if not exists public.messages (
  id         uuid primary key default gen_random_uuid(),
  match_id   uuid not null references public.matches (id) on delete cascade,
  sender     uuid not null,
  content    text not null,
  created_at timestamptz not null default now()
);
create index if not exists messages_match_idx on public.messages (match_id, created_at);

-- -------------------------------------------------------------
-- いいね送信＋マッチ判定を原子的に行う RPC
--   戻り値: matched(相互成立したか), match_id
-- -------------------------------------------------------------
create or replace function public.handle_like(
  p_room text,
  p_from uuid,
  p_to   uuid
)
returns table (matched boolean, match_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_reciprocal boolean;
  v_a uuid;
  v_b uuid;
  v_match_id uuid;
begin
  -- 自分自身へのいいねは無視
  if p_from = p_to then
    return query select false, null::uuid;
    return;
  end if;

  -- いいねを記録（重複は無視）
  insert into public.likes (room_id, from_user, to_user)
  values (p_room, p_from, p_to)
  on conflict (room_id, from_user, to_user) do nothing;

  -- 相手からの相互いいねがあるか
  select exists (
    select 1 from public.likes
    where room_id = p_room and from_user = p_to and to_user = p_from
  ) into v_reciprocal;

  if not v_reciprocal then
    return query select false, null::uuid;
    return;
  end if;

  -- 相互成立 → マッチ生成（ペアを常にソートして一意化）
  if p_from < p_to then
    v_a := p_from; v_b := p_to;
  else
    v_a := p_to; v_b := p_from;
  end if;

  insert into public.matches (room_id, user_a, user_b)
  values (p_room, v_a, v_b)
  on conflict (room_id, user_a, user_b) do nothing;

  select id into v_match_id
  from public.matches
  where room_id = p_room and user_a = v_a and user_b = v_b;

  return query select true, v_match_id;
end;
$$;

-- -------------------------------------------------------------
-- RLS（テスト版のため anon に寛容なポリシー）
--   ※ ログイン不要のMVP用。本番化時は Supabase Auth + auth.uid() で要厳格化。
-- -------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.likes    enable row level security;
alter table public.matches  enable row level security;
alter table public.messages enable row level security;

-- profiles: 読み取り/追加/更新を許可（削除は不要）
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select using (true);
drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert" on public.profiles for insert with check (true);
drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles for update using (true) with check (true);

-- likes: 読み取り/追加を許可
drop policy if exists "likes_select" on public.likes;
create policy "likes_select" on public.likes for select using (true);
drop policy if exists "likes_insert" on public.likes;
create policy "likes_insert" on public.likes for insert with check (true);

-- matches: 読み取り/追加を許可
drop policy if exists "matches_select" on public.matches;
create policy "matches_select" on public.matches for select using (true);
drop policy if exists "matches_insert" on public.matches;
create policy "matches_insert" on public.matches for insert with check (true);

-- messages: 読み取り/追加を許可
drop policy if exists "messages_select" on public.messages;
create policy "messages_select" on public.messages for select using (true);
drop policy if exists "messages_insert" on public.messages;
create policy "messages_insert" on public.messages for insert with check (true);

-- 匿名(anon) / ログイン(authenticated) 両ロールに実行権限を付与
grant usage on schema public to anon, authenticated;
grant select, insert, update on public.profiles to anon, authenticated;
grant select, insert on public.likes to anon, authenticated;
grant select, insert on public.matches to anon, authenticated;
grant select, insert on public.messages to anon, authenticated;
grant execute on function public.handle_like(text, uuid, uuid) to anon, authenticated;

-- -------------------------------------------------------------
-- Realtime（postgres_changes）を有効化
-- -------------------------------------------------------------
-- DELETE/UPDATE でも room_id 等を受け取れるように replica identity を full に
alter table public.profiles replica identity full;
alter table public.messages replica identity full;
alter table public.matches  replica identity full;

-- publication へ追加（既に含まれる場合はスキップ）
do $$
begin
  begin
    alter publication supabase_realtime add table public.profiles;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.matches;
  exception when duplicate_object then null;
  end;
  begin
    alter publication supabase_realtime add table public.messages;
  exception when duplicate_object then null;
  end;
end $$;

-- 完了メッセージ
do $$ begin raise notice 'offline-match schema installed successfully'; end $$;
