export type Profile = {
  id: string;
  room_id: string;
  user_id: string;
  name: string;
  bio: string;
  tags: string[];
  last_active: string;
  created_at: string;
};

export type Match = {
  id: string;
  room_id: string;
  user_a: string;
  user_b: string;
  created_at: string;
};

export type Message = {
  id: string;
  match_id: string;
  sender: string;
  content: string;
  created_at: string;
};
